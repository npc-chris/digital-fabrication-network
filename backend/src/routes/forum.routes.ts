import { Router, Response } from 'express';
import { db } from '../config/database';
import { forumThreads, forumCategories, forumReplies, users, profiles } from '../models/schema';
import { authenticate } from '../middleware/auth';
import { eq, desc, and, like, or, sql } from 'drizzle-orm';

const router = Router();

// Get all forum categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db
      .select()
      .from(forumCategories)
      .orderBy(forumCategories.sortOrder);

    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create forum category (admin only - TODO: add admin check)
router.post('/categories', authenticate, async (req: any, res: Response) => {
  try {
    const { name, description, icon, sortOrder } = req.body;

    const [category] = await db
      .insert(forumCategories)
      .values({
        name,
        description: description || null,
        icon: icon || null,
        sortOrder: sortOrder || 0,
      })
      .returning();

    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all threads with filters
router.get('/threads', async (req, res) => {
  try {
    const { categoryId, search, authorId } = req.query;

    const conditions = [];

    if (categoryId && typeof categoryId === 'string') {
      conditions.push(eq(forumThreads.categoryId, parseInt(categoryId)));
    }

    if (authorId && typeof authorId === 'string') {
      conditions.push(eq(forumThreads.authorId, parseInt(authorId)));
    }

    if (search) {
      conditions.push(
        or(
          like(forumThreads.title, `%${search}%`),
          like(forumThreads.content, `%${search}%`)
        )
      );
    }

    const threads = await db
      .select({
        thread: forumThreads,
        author: {
          id: users.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          avatar: profiles.avatar,
        },
        category: forumCategories,
      })
      .from(forumThreads)
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(forumCategories, eq(forumThreads.categoryId, forumCategories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        desc(forumThreads.isPinned),
        desc(forumThreads.lastReplyAt),
        desc(forumThreads.createdAt)
      );

    res.json(threads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single thread with replies
router.get('/threads/:id', async (req, res) => {
  try {
    const threadId = parseInt(req.params.id);

    const [thread] = await db
      .select({
        thread: forumThreads,
        author: {
          id: users.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          avatar: profiles.avatar,
          bio: profiles.bio,
        },
        category: forumCategories,
      })
      .from(forumThreads)
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(forumCategories, eq(forumThreads.categoryId, forumCategories.id))
      .where(eq(forumThreads.id, threadId));

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Get replies
    const replies = await db
      .select({
        reply: forumReplies,
        author: {
          id: users.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          avatar: profiles.avatar,
        }
      })
      .from(forumReplies)
      .leftJoin(users, eq(forumReplies.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(forumReplies.threadId, threadId))
      .orderBy(forumReplies.createdAt);

    // Increment view count
    await db
      .update(forumThreads)
      .set({ viewCount: sql`${forumThreads.viewCount} + 1` })
      .where(eq(forumThreads.id, threadId));

    res.json({
      ...thread,
      replies,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create thread
router.post('/threads', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { categoryId, title, content, tags } = req.body;

    const [newThread] = await db
      .insert(forumThreads)
      .values({
        authorId: userId,
        categoryId: categoryId || null,
        title,
        content,
        tags: tags ? JSON.stringify(tags) : null,
      })
      .returning();

    res.status(201).json(newThread);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update thread
router.put('/threads/:id', authenticate, async (req: any, res: Response) => {
  try {
    const threadId = parseInt(req.params.id);
    const userId = req.user.id;

    const [existing] = await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.id, threadId));

    if (!existing) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (existing.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updateData: any = {};
    ['title', 'content', 'tags', 'categoryId'].forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'tags') {
          updateData[field] = JSON.stringify(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    const [updated] = await db
      .update(forumThreads)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(forumThreads.id, threadId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete thread
router.delete('/threads/:id', authenticate, async (req: any, res: Response) => {
  try {
    const threadId = parseInt(req.params.id);
    const userId = req.user.id;

    const [existing] = await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.id, threadId));

    if (!existing) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (existing.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete replies first
    await db.delete(forumReplies).where(eq(forumReplies.threadId, threadId));
    await db.delete(forumThreads).where(eq(forumThreads.id, threadId));

    res.json({ message: 'Thread deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reply to thread
router.post('/threads/:id/replies', authenticate, async (req: any, res: Response) => {
  try {
    const threadId = parseInt(req.params.id);
    const userId = req.user.id;
    const { content, parentReplyId } = req.body;

    const replyResult = await db
      .insert(forumReplies)
      .values({
        threadId,
        authorId: userId,
        content,
        parentReplyId: parentReplyId || null,
      })
      .returning();
    
    const newReply = replyResult[0];

    // Update thread reply count and last reply time
    await db
      .update(forumThreads)
      .set({
        replyCount: sql`${forumThreads.replyCount} + 1`,
        lastReplyAt: new Date(),
      })
      .where(eq(forumThreads.id, threadId));

    res.status(201).json(newReply);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update reply
router.put('/replies/:id', authenticate, async (req: any, res: Response) => {
  try {
    const replyId = parseInt(req.params.id);
    const userId = req.user.id;
    const { content } = req.body;

    const [existing] = await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.id, replyId));

    if (!existing) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    if (existing.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedResult = await db
      .update(forumReplies)
      .set({ content, updatedAt: new Date() })
      .where(eq(forumReplies.id, replyId))
      .returning();

    res.json(updatedResult[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete reply
router.delete('/replies/:id', authenticate, async (req: any, res: Response) => {
  try {
    const replyId = parseInt(req.params.id);
    const userId = req.user.id;

    const [existing] = await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.id, replyId));

    if (!existing) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    if (existing.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.delete(forumReplies).where(eq(forumReplies.id, replyId));

    // Update thread reply count
    await db
      .update(forumThreads)
      .set({ replyCount: sql`${forumThreads.replyCount} - 1` })
      .where(eq(forumThreads.id, existing.threadId));

    res.json({ message: 'Reply deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark reply as accepted answer (thread author only)
router.post('/replies/:id/accept', authenticate, async (req: any, res: Response) => {
  try {
    const replyId = parseInt(req.params.id);
    const userId = req.user.id;

    const [reply] = await db
      .select({
        reply: forumReplies,
        thread: forumThreads,
      })
      .from(forumReplies)
      .innerJoin(forumThreads, eq(forumReplies.threadId, forumThreads.id))
      .where(eq(forumReplies.id, replyId));

    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    if (reply.thread.authorId !== userId) {
      return res.status(403).json({ error: 'Only thread author can accept answers' });
    }

    // Unmark any previous accepted answer
    await db
      .update(forumReplies)
      .set({ isAcceptedAnswer: false })
      .where(eq(forumReplies.threadId, reply.thread.id));

    // Mark this reply as accepted
    const updatedResult = await db
      .update(forumReplies)
      .set({ isAcceptedAnswer: true, updatedAt: new Date() })
      .where(eq(forumReplies.id, replyId))
      .returning();

    res.json(updatedResult[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
