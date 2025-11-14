import { Request, Response } from 'express';
import { Router } from 'express';
import { db } from '../config/database';
import { communityPosts, postReplies } from '../models/schema';
import { authenticate } from '../middleware/auth';
import { eq, like, or } from 'drizzle-orm';

const router = Router();

// Get all community posts with filters
router.get('/', async (req, res) => {
  try {
    const { category, search, status } = req.query;
    
    let query = db.select().from(communityPosts);
    const conditions = [];

    if (category) {
      conditions.push(eq(communityPosts.category, category as string));
    }
    if (status) {
      conditions.push(eq(communityPosts.status, status as string));
    }
    if (search) {
      conditions.push(
        or(
          like(communityPosts.title, `%${search}%`),
          like(communityPosts.content, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(or(...conditions)) as any;
    }

    const result = await query;
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single post with replies
router.get('/:id', async (req, res) => {
  try {
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, parseInt(req.params.id)));
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const replies = await db.select().from(postReplies).where(eq(postReplies.postId, parseInt(req.params.id)));
    
    // Increment view count
    await db.update(communityPosts)
      .set({ viewCount: (post.viewCount || 0) + 1 })
      .where(eq(communityPosts.id, parseInt(req.params.id)));

    res.json({ ...post, replies });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create post
router.post('/', authenticate, async (req: Request, res) => {
  try {
    const [post] = await db.insert(communityPosts).values({
      authorId: ((req as any).user).id,
      ...req.body,
    }).returning();
    res.status(201).json(post);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Create reply
router.post('/:id/replies', authenticate, async (req: Request, res) => {
  try {
    const [reply] = await db.insert(postReplies).values({
      postId: parseInt(req.params.id),
      userId: ((req as any).user).id,
      content: req.body.content,
    }).returning();
    res.status(201).json(reply);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update post status
router.patch('/:id/status', authenticate, async (req: Request, res) => {
  try {
    const [post] = await db.update(communityPosts)
      .set({ status: req.body.status, updatedAt: new Date() })
      .where(eq(communityPosts.id, parseInt(req.params.id)))
      .returning();
    res.json(post);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
