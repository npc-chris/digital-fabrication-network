import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { users, profiles, services, verificationDocuments } from '../models/schema';
import { authenticate, authorize } from '../middleware/auth';
import { eq, like, or, desc, and, count } from 'drizzle-orm';

const router = Router();

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const adminRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id || req.ip;
  const key = `admin:${userId}`;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 100;

  const record = rateLimitStore.get(key);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    });
  }

  record.count++;
  return next();
};

router.use(adminRateLimiter);
router.use(authenticate);
router.use(authorize('admin', 'platform_manager'));

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [serviceCount] = await db.select({ count: count() }).from(services);

    const explorerCount = await db.select({ count: count() }).from(users).where(eq(users.role, 'explorer'));
    const providerCount = await db.select({ count: count() }).from(users).where(eq(users.role, 'provider'));

    const pendingVerifications = await db
      .select({ count: count() })
      .from(verificationDocuments)
      .where(eq(verificationDocuments.status, 'pending'));

    res.json({
      users: {
        total: userCount.count,
        explorers: explorerCount[0]?.count || 0,
        providers: providerCount[0]?.count || 0,
      },
      content: {
        components: 0,
        services: serviceCount.count,
        posts: 0,
      },
      pending: {
        providerRequests: 0,
        verifications: pendingVerifications[0]?.count || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req: Request, res: Response) => {
  try {
    const { search, role, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        isVerified: users.isVerified,
        onboardingCompleted: users.onboardingCompleted,
        createdAt: users.createdAt,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        company: profiles.company,
        location: profiles.location,
        phone: profiles.phone,
        verificationStatus: profiles.verificationStatus,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .orderBy(desc(users.createdAt));

    const conditions: any[] = [];

    if (search) {
      const searchStr = search as string;
      const searchId = parseInt(searchStr, 10);
      if (!isNaN(searchId)) {
        conditions.push(eq(users.id, searchId));
      } else {
        conditions.push(
          or(
            like(users.email, `%${searchStr}%`),
            like(profiles.firstName, `%${searchStr}%`),
            like(profiles.lastName, `%${searchStr}%`),
            like(profiles.company, `%${searchStr}%`)
          )
        );
      }
    }

    if (role && role !== 'all') {
      conditions.push(eq(users.role, role as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const usersList = await (query as any).limit(limitNum).offset(offset);

    let countQuery = db.select({ count: count() }).from(users);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any;
    }
    const [totalCount] = await countQuery;

    res.json({
      users: usersList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/users/:id/role', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    const validRoles = ['explorer', 'provider'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "explorer" or "provider"' });
    }

    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/users/:id/ban', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { banned } = req.body;

    const [updated] = await db
      .update(users)
      .set({ isVerified: !banned, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/provider-requests', async (_req: Request, res: Response) => {
  res.json([]);
});

router.patch('/provider-requests/:id', async (_req: Request, res: Response) => {
  res.status(410).json({ error: 'Provider approval flow was removed with providerApproved.' });
});

router.get('/affiliate-requests', async (_req: Request, res: Response) => {
  res.json([]);
});

router.delete('/components/:id', async (_req: Request, res: Response) => {
  res.status(410).json({ error: 'Components were removed from the data model.' });
});

router.delete('/posts/:id', async (_req: Request, res: Response) => {
  res.status(410).json({ error: 'Community posts were removed from the data model.' });
});

router.delete('/services/:id', async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    await db.delete(services).where(eq(services.id, serviceId));
    res.json({ message: 'Service removed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
