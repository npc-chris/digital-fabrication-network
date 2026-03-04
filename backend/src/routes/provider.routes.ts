import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { db } from '../config/database';
import { components, services, orders } from '../models/schema';
import { eq, and, sql } from 'drizzle-orm';

const router = Router();

/**
 * @route GET /api/providers/stats
 * @desc Get provider dashboard statistics
 * @access Private (Provider only)
 */
router.get('/stats', authenticate, async (req: Request, res: Response) => {
    try {
        // Check if user is a provider
        if (req.user?.role !== 'provider') {
            return res.status(403).json({ error: 'Access denied. Provider role required.' });
        }

        const providerId = req.user.id;

        // Parallelize queries for performance
        const [componentsCount, servicesCount, pendingOrdersCount, revenueResult] = await Promise.all([
            // Count components
            db.select({ count: sql<number>`count(*)` })
                .from(components)
                .where(eq(components.providerId, providerId)),

            // Count services
            db.select({ count: sql<number>`count(*)` })
                .from(services)
                .where(eq(services.providerId, providerId)),

            // Count pending orders
            db.select({ count: sql<number>`count(*)` })
                .from(orders)
                .where(and(
                    eq(orders.providerId, providerId),
                    eq(orders.status, 'pending')
                )),

            // Calculate revenue (completed orders)
            db.select({ total: sql<number>`sum(${orders.totalPrice})` })
                .from(orders)
                .where(and(
                    eq(orders.providerId, providerId),
                    eq(orders.status, 'completed')
                ))
        ]);

        res.json({
            totalComponents: Number(componentsCount[0]?.count || 0),
            totalServices: Number(servicesCount[0]?.count || 0),
            pendingOrders: Number(pendingOrdersCount[0]?.count || 0),
            revenue: Number(revenueResult[0]?.total || 0)
        });

    } catch (error) {
        console.error('Error fetching provider stats:', error);
        res.status(500).json({ error: 'Failed to fetch provider stats' });
    }
});

export default router;
