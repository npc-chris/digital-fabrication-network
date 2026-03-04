import { Router, Request } from 'express';
import { db } from '../config/database';
import { wishlists } from '../models/schema';
import { authenticate } from '../middleware/auth';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Get user wishlist
router.get('/', authenticate, async (req: Request, res) => {
  try {
    const items = await db.select().from(wishlists).where(eq(wishlists.userId, ((req as any).user).id));
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add to wishlist
router.post('/', authenticate, async (req: Request, res) => {
  try {
    const [item] = await db.insert(wishlists).values({
      userId: ((req as any).user).id,
      ...req.body,
    }).returning();
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Remove from wishlist
router.delete('/:id', authenticate, async (req: Request, res) => {
  try {
    await db.delete(wishlists).where(
      and(
        eq(wishlists.id, parseInt(req.params.id)),
        eq(wishlists.userId, ((req as any).user).id)
      )
    );
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
