import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { waitlist } from '../models/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// Helper to format priority code in hex (e.g. 1 -> DFN-0x0001, 15 -> DFN-0x000F)
export function formatHexPriorityCode(num: number): string {
  const safeNum = Math.max(1, Number(num) || 1);
  return `DFN-0x${safeNum.toString(16).toUpperCase().padStart(4, '0')}`;
}

// In-memory cache for fallback when DB is connecting or offline
const memoryWaitlist = new Map<
  string,
  {
    queueNumber: number;
    hexCode: string;
    role: string;
    fullName?: string | null;
    organization?: string | null;
    notes?: string | null;
    createdAt: string;
  }
>();

// Ensure table exists on first operation to prevent runtime failures if migration was not run yet
let tableEnsured = false;
async function ensureWaitlistTable() {
  if (tableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'explorer',
        organization VARCHAR(255),
        notes TEXT,
        queue_number INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    tableEnsured = true;
  } catch (error) {
    console.warn('Could not auto-ensure waitlist table:', error);
  }
}

// GET /api/waitlist/check?email=... - Check if an email is already registered
router.get('/check', async (req: Request, res: Response) => {
  try {
    await ensureWaitlistTable();
    const queryEmail = String(req.query.email || '').trim().toLowerCase();
    if (!queryEmail) {
      return res.status(400).json({ error: 'Email query parameter is required' });
    }

    try {
      const existing = await db
        .select()
        .from(waitlist)
        .where(eq(waitlist.email, queryEmail))
        .limit(1);

      if (existing && existing.length > 0) {
        const userEntry = existing[0];
        const qNum = userEntry.queueNumber || userEntry.id;
        const hexCode = formatHexPriorityCode(qNum);
        return res.status(200).json({
          success: true,
          alreadyRegistered: true,
          message: 'Existing waitlist reservation found.',
          queueNumber: qNum,
          hexCode,
          role: userEntry.role,
          fullName: userEntry.fullName,
          organization: userEntry.organization,
          notes: userEntry.notes,
          createdAt: userEntry.createdAt,
          entry: userEntry,
        });
      }
    } catch {
      if (memoryWaitlist.has(queryEmail)) {
        const cached = memoryWaitlist.get(queryEmail)!;
        return res.status(200).json({
          success: true,
          alreadyRegistered: true,
          message: 'Existing waitlist reservation found.',
          queueNumber: cached.queueNumber,
          hexCode: cached.hexCode,
          role: cached.role,
          fullName: cached.fullName,
          organization: cached.organization,
          notes: cached.notes,
          createdAt: cached.createdAt,
          entry: cached,
        });
      }
    }

    return res.status(200).json({
      success: true,
      alreadyRegistered: false,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error checking waitlist' });
  }
});

// POST /api/waitlist - Submit early access waitlist application
router.post('/', async (req: Request, res: Response) => {
  try {
    await ensureWaitlistTable();

    const { email, fullName, role, organization, notes } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const validRoles = ['explorer', 'provider', 'researcher', 'enterprise'];
    const sanitizedRole = validRoles.includes(role) ? role : 'explorer';

    // 1. Check if user already registered in DB - if so, retrieve data already stored
    try {
      const existing = await db
        .select()
        .from(waitlist)
        .where(eq(waitlist.email, normalizedEmail))
        .limit(1);

      if (existing && existing.length > 0) {
        const userEntry = existing[0];
        const qNum = userEntry.queueNumber || userEntry.id;
        const hexCode = formatHexPriorityCode(qNum);
        return res.status(200).json({
          success: true,
          alreadyRegistered: true,
          message: 'You are already registered on the waitlist. Your original priority spot has been retrieved.',
          queueNumber: qNum,
          hexCode,
          role: userEntry.role,
          fullName: userEntry.fullName,
          organization: userEntry.organization,
          notes: userEntry.notes,
          createdAt: userEntry.createdAt,
          entry: userEntry,
        });
      }
    } catch (dbErr) {
      console.warn('DB check fallback to memory check:', dbErr);
      if (memoryWaitlist.has(normalizedEmail)) {
        const cached = memoryWaitlist.get(normalizedEmail)!;
        return res.status(200).json({
          success: true,
          alreadyRegistered: true,
          message: 'You are already registered on the waitlist. Your original priority spot has been retrieved.',
          queueNumber: cached.queueNumber,
          hexCode: cached.hexCode,
          role: cached.role,
          fullName: cached.fullName,
          organization: cached.organization,
          notes: cached.notes,
          createdAt: cached.createdAt,
          entry: cached,
        });
      }
    }

    // 2. Determine current total count to assign sequential queue number (starts from 1)
    let currentDbCount = 0;
    try {
      const countResult = await db.execute(sql`SELECT count(*)::int as count FROM waitlist;`);
      currentDbCount = Number(countResult.rows[0]?.count || 0);
    } catch {
      currentDbCount = memoryWaitlist.size;
    }

    const assignedQueueNumber = currentDbCount + 1;
    const hexCode = formatHexPriorityCode(assignedQueueNumber);

    // 3. Insert new waitlist applicant
    try {
      const inserted = await db
        .insert(waitlist)
        .values({
          email: normalizedEmail,
          fullName: fullName ? String(fullName).trim() : null,
          role: sanitizedRole,
          organization: organization ? String(organization).trim() : null,
          notes: notes ? String(notes).trim() : null,
          queueNumber: assignedQueueNumber,
        })
        .returning();

      return res.status(201).json({
        success: true,
        alreadyRegistered: false,
        message: 'Successfully reserved your priority access on the waitlist.',
        queueNumber: assignedQueueNumber,
        hexCode,
        totalCount: assignedQueueNumber,
        role: sanitizedRole,
        entry: inserted[0],
      });
    } catch (insertErr: any) {
      // If unique constraint error fired in race condition
      if (insertErr?.code === '23505') {
        const existing = await db
          .select()
          .from(waitlist)
          .where(eq(waitlist.email, normalizedEmail))
          .limit(1);
        const userEntry = existing[0];
        const qNum = userEntry?.queueNumber || assignedQueueNumber;
        return res.status(200).json({
          success: true,
          alreadyRegistered: true,
          message: 'You are already registered on the waitlist. Your original priority spot has been retrieved.',
          queueNumber: qNum,
          hexCode: formatHexPriorityCode(qNum),
          role: userEntry?.role || sanitizedRole,
          fullName: userEntry?.fullName || fullName,
          organization: userEntry?.organization || organization,
          notes: userEntry?.notes || notes,
          createdAt: userEntry?.createdAt,
          entry: userEntry,
        });
      }
      throw insertErr;
    }
  } catch (error: any) {
    console.error('Waitlist submission error:', error);
    // Offline/memory fallback (starts from 1)
    const fallbackQueue = memoryWaitlist.size + 1;
    const hexCode = formatHexPriorityCode(fallbackQueue);
    const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();
    if (normalizedEmail) {
      memoryWaitlist.set(normalizedEmail, {
        queueNumber: fallbackQueue,
        hexCode,
        role: req.body?.role || 'explorer',
        fullName: req.body?.fullName || null,
        organization: req.body?.organization || null,
        notes: req.body?.notes || null,
        createdAt: new Date().toISOString(),
      });
    }
    return res.status(201).json({
      success: true,
      alreadyRegistered: false,
      message: 'Successfully reserved your priority access on the waitlist.',
      queueNumber: fallbackQueue,
      hexCode,
      totalCount: fallbackQueue,
      role: req.body?.role || 'explorer',
    });
  }
});

// GET /api/waitlist/count - Get current waitlist tally (starts from 1, no padding)
router.get('/count', async (req: Request, res: Response) => {
  try {
    await ensureWaitlistTable();
    const countResult = await db.execute(sql`SELECT count(*)::int as count FROM waitlist;`);
    const currentCount = Number(countResult.rows[0]?.count || 0);
    return res.json({
      success: true,
      dbCount: currentCount,
      totalCount: currentCount,
    });
  } catch (error) {
    return res.json({
      success: true,
      dbCount: memoryWaitlist.size,
      totalCount: memoryWaitlist.size,
    });
  }
});


export default router;
