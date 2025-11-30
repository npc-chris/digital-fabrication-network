import { Request } from 'express';
import { Router } from 'express';
import { db } from '../config/database';
import { bookings } from '../models/schema';
import { authenticate } from '../middleware/auth';
import { eq, or } from 'drizzle-orm';

const router = Router();

// Get user bookings
router.get('/', authenticate, async (req: Request, res) => {
  try {
    const userBookings = await db.select().from(bookings).where(
      or(
        eq(bookings.userId, ((req as any).user).id),
        eq(bookings.providerId, ((req as any).user).id)
      )
    );
    res.json(userBookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create booking
router.post('/', authenticate, async (req: Request, res) => {
  try {
    const [booking] = await db.insert(bookings).values({
      userId: ((req as any).user).id,
      ...req.body,
    }).returning();
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update booking status
router.patch('/:id/status', authenticate, async (req: Request, res) => {
  try {
    const [booking] = await db.update(bookings)
      .set({ status: req.body.status, updatedAt: new Date() })
      .where(eq(bookings.id, parseInt(req.params.id)))
      .returning();
    res.json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
