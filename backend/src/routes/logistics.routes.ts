import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { orders, orderTracking, notifications, users, profiles } from '../models/schema';
import { authenticate } from '../middleware/auth';
import { eq, and, desc, or } from 'drizzle-orm';

const router = Router();

// Get tracking history for an order
router.get('/:orderId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const orderId = parseInt(req.params.orderId);

        // Verify user is either explorer or provider for this order
        const [order] = await db.select().from(orders).where(
            and(
                eq(orders.id, orderId),
                or(eq(orders.explorerId, userId), eq(orders.providerId, userId))
            )
        ).limit(1);

        if (!order) {
            return res.status(404).json({ error: 'Order not found or unauthorized' });
        }

        const tracking = await db.select()
            .from(orderTracking)
            .where(eq(orderTracking.orderId, orderId))
            .orderBy(desc(orderTracking.createdAt));

        res.json({
            order,
            tracking
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Add tracking entry (Provider or Platform Manager only)
/**
 * @body { status, location, description, waybillId, proofImage, estimatedDelivery }
 */
router.post('/:orderId/track', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;
        const orderId = parseInt(req.params.orderId);
        const { status, location, description, waybillId, proofImage, estimatedDelivery } = req.body;

        // Verify order exists
        const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Permission Check: Provider or Admin/Manager
        if (order.providerId !== userId && userRole !== 'admin' && userRole !== 'platform_manager') {
            return res.status(403).json({ error: 'Unauthorized to update tracking for this order' });
        }

        // Create tracking entry
        const [newStep] = await db.insert(orderTracking).values({
            orderId,
            status,
            location,
            description,
            waybillId,
            proofImage,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        }).returning();

        // Automatically update order status if applicable
        const logisticsToOrderStatus: Record<string, string> = {
            'in_production': 'in_production',
            'quality_check': 'quality_check',
            'out_for_delivery': 'out_for_delivery',
            'delivered': 'completed'
        };

        if (logisticsToOrderStatus[status]) {
            await db.update(orders)
                .set({ status: logisticsToOrderStatus[status] as any, updatedAt: new Date() })
                .where(eq(orders.id, orderId));
        }

        // Notify Explorer via DB
        const [notif] = await db.insert(notifications).values({
            userId: order.explorerId,
            type: 'order',
            title: 'Order Tracking Update',
            message: `Your order #${orderId} is now: ${status.replace('_', ' ')}. ${description || ''}`,
            relatedType: 'order',
            relatedId: orderId,
        }).returning();

        // Real-time WebSocket Alert
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${order.explorerId}`).emit('new_notification', {
                ...notif,
                status: 'unread'
            });
        }

        res.status(201).json(newStep);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get active shipments for a provider
router.get('/provider/active', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        // Orders that are paid (status 'ordered' or later) but not yet completed
        const activeOrders = await db.select().from(orders).where(
            and(
                eq(orders.providerId, userId),
                or(
                    eq(orders.status, 'ordered'),
                    eq(orders.status, 'in_production'),
                    eq(orders.status, 'quality_check'),
                    eq(orders.status, 'out_for_delivery')
                )
            )
        );

        res.json(activeOrders);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
