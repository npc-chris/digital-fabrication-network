import { Router } from 'express';
import { db } from '../config/database';
import { orders } from '../models/schema';
import { authenticate, AuthRequest } from '../middleware/auth';
import { eq, or } from 'drizzle-orm';

const router = Router();

// Get user orders
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userOrders = await db.select().from(orders).where(
      or(
        eq(orders.buyerId, req.user!.id),
        eq(orders.sellerId, req.user!.id)
      )
    );
    res.json(userOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const [order] = await db.insert(orders).values({
      buyerId: req.user!.id,
      ...req.body,
    }).returning();
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update order status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const [order] = await db.update(orders)
      .set({ status: req.body.status, updatedAt: new Date() })
      .where(eq(orders.id, parseInt(req.params.id)))
      .returning();
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
