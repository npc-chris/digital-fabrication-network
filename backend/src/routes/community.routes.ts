import { Request, Response } from 'express';
import { Router } from 'express';
import { db } from '../config/database';
import { communityPosts, postReplies, users, profiles } from '../models/schema';
import { authenticate } from '../middleware/auth';
import { eq, like, or, desc, and } from 'drizzle-orm';

const router = Router();

// Get all community posts with filters
router.get('/', async (req, res) => {
  try {
    const { category, search, status } = req.query;
    
    let query = db.select({
      id: communityPosts.id,
      authorId: communityPosts.authorId,
      title: communityPosts.title,
      content: communityPosts.content,
      category: communityPosts.category,
      tags: communityPosts.tags,
      images: communityPosts.images,
      status: communityPosts.status,
      viewCount: communityPosts.viewCount,
      createdAt: communityPosts.createdAt,
      updatedAt: communityPosts.updatedAt,
      authorName: profiles.firstName,
      authorLastName: profiles.lastName,
      authorCompany: profiles.company,
      authorAvatar: profiles.avatar,
    })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.authorId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(communityPosts.createdAt));

    const conditions = [];

    if (category && category !== 'all') {
      conditions.push(eq(communityPosts.category, category as string));
    }
    if (status && status !== 'all') {
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
      query = query.where(and(...conditions)) as any;
    }

    const posts = await query;

    // Get reply counts for each post
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const replies = await db
          .select()
          .from(postReplies)
          .where(eq(postReplies.postId, post.id));
        
        return {
          ...post,
          replyCount: replies.length,
        };
      })
    );

    res.json(postsWithCounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single post with replies (includes user info for replies)
router.get('/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const incrementView = req.query.incrementView !== 'false'; // Default to true for backwards compat
    
    // Get post with author info
    const [post] = await db.select({
      id: communityPosts.id,
      authorId: communityPosts.authorId,
      title: communityPosts.title,
      content: communityPosts.content,
      category: communityPosts.category,
      tags: communityPosts.tags,
      images: communityPosts.images,
      status: communityPosts.status,
      viewCount: communityPosts.viewCount,
      createdAt: communityPosts.createdAt,
      updatedAt: communityPosts.updatedAt,
      authorName: profiles.firstName,
      authorLastName: profiles.lastName,
      authorCompany: profiles.company,
      authorAvatar: profiles.avatar,
    })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.authorId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(communityPosts.id, postId));
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get replies with user info
    const repliesRaw = await db.select({
      id: postReplies.id,
      postId: postReplies.postId,
      userId: postReplies.userId,
      content: postReplies.content,
      createdAt: postReplies.createdAt,
      updatedAt: postReplies.updatedAt,
      userName: profiles.firstName,
      userLastName: profiles.lastName,
      userAvatar: profiles.avatar,
    })
    .from(postReplies)
    .leftJoin(users, eq(postReplies.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(postReplies.postId, postId));

    // Format replies to include full user name
    const replies = repliesRaw.map(reply => ({
      ...reply,
      userName: reply.userName && reply.userLastName 
        ? `${reply.userName} ${reply.userLastName}`
        : reply.userName || `User #${reply.userId}`,
    }));
    
    // Only increment view count if explicitly requested (prevents double counting)
    if (incrementView) {
      await db.update(communityPosts)
        .set({ viewCount: (post.viewCount || 0) + 1 })
        .where(eq(communityPosts.id, postId));
    }

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
    const postId = parseInt(req.params.id);
    const userId = ((req as any).user).id;
    
    const [reply] = await db.insert(postReplies).values({
      postId,
      userId,
      content: req.body.content,
    }).returning();
    
    // Fetch user info to return with the reply
    const [userProfile] = await db.select({
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      avatar: profiles.avatar,
    })
    .from(profiles)
    .where(eq(profiles.userId, userId));
    
    const replyWithUser = {
      ...reply,
      userName: userProfile 
        ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || `User #${userId}`
        : `User #${userId}`,
      userAvatar: userProfile?.avatar || null,
    };
    
    res.status(201).json(replyWithUser);
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
