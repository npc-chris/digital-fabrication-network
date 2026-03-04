import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { orders, transactions, notifications } from '../models/schema';
import { authenticate } from '../middleware/auth';
import { eq, or, and } from 'drizzle-orm';

const router = Router();

// Get user orders (as either explorer or provider)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userOrders = await db.select().from(orders).where(
      or(
        eq(orders.explorerId, userId),
        eq(orders.providerId, userId)
      )
    );
    res.json(userOrders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const orderId = parseInt(req.params.id);

    const [order] = await db.select().from(orders).where(
      and(
        eq(orders.id, orderId),
        or(eq(orders.explorerId, userId), eq(orders.providerId, userId))
      )
    ).limit(1);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (Lifecycle management)
/**
 * Workflow: ordered -> in_production -> quality_check -> out_for_delivery -> completed
 */
router.patch('/:id/status', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Permission Check
    // Providers can move through production stages
    // Explorers can mark as completed (Release Escrow)
    if (order.providerId !== userId && order.explorerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this order' });
    }

    // Validation for status transitions
    const validStatuses = ['ordered', 'in_production', 'quality_check', 'out_for_delivery', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Provider can only set these
    const providerOnlyStatuses = ['in_production', 'quality_check', 'out_for_delivery'];
    if (providerOnlyStatuses.includes(status) && order.providerId !== userId) {
      return res.status(403).json({ error: 'Only the provider can update to this status' });
    }

    // Explorer can only set 'completed' or 'cancelled' (before it's too late)
    if (status === 'completed' && order.explorerId !== userId) {
      return res.status(403).json({ error: 'Only the buyer can mark an order as completed to release funds' });
    }

    // If marking as completed, handle escrow release
    if (status === 'completed' && order.status !== 'completed') {
      // Release funds in transactions
      await db.update(transactions)
        .set({ status: 'released', updatedAt: new Date() })
        .where(eq(transactions.orderId, orderId));

      await db.update(orders)
        .set({ paymentStatus: 'released' })
        .where(eq(orders.id, orderId));
    }

    const [updatedOrder] = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    // Create Notification
    const recipientId = userId === order.explorerId ? order.providerId : order.explorerId;
    await db.insert(notifications).values({
      userId: recipientId,
      type: 'order',
      title: 'Order Status Updated',
      message: `Order #${orderId} status has been updated to ${status.replace('_', ' ')}`,
      relatedType: 'order',
      relatedId: orderId,
    });

    res.json(updatedOrder);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
