import { Router, Request as Request, Response } from 'express';
import { db } from '../config/database';
import { notifications } from '../models/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/notifications
 * @desc Get user notifications
 * @access Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = ((req as any).user).id;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const conditions = unreadOnly
      ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      : eq(notifications.userId, userId);

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(conditions)
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    const unreadCount = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    res.json({
      notifications: userNotifications,
      unreadCount: unreadCount.length,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * @route PATCH /api/notifications/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = ((req as any).user).id;
    const notificationId = parseInt(req.params.id);

    const [notification] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .limit(1);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * @route PATCH /api/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.patch('/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = ((req as any).user).id;

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a notification
 * @access Private
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = ((req as any).user).id;
    const notificationId = parseInt(req.params.id);

    const [notification] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .limit(1);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await db.delete(notifications).where(eq(notifications.id, notificationId));

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
