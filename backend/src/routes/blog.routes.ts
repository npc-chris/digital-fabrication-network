import { Router, Request, Response } from 'express';
import multer from 'multer';
import { eq, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { blogPosts } from '../models/schema';
import { authenticate, authorize } from '../middleware/auth';
import { canUseMemoryFallback } from '../utils/persistence';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export interface BlogPostRecord {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  htmlContent: string;
  coverImageUrl: string;
  category: string;
  badge: string;
  status: 'draft' | 'published' | 'archived';
  authorId?: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const memoryPosts: BlogPostRecord[] = [];
let memorySeq = 1;

export function resetBlogMemoryForTests(): void {
  memoryPosts.length = 0;
  memorySeq = 1;
}

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${base || 'post'}-${Date.now().toString(36)}`;
}

function mapRowToBlogPost(row: any): BlogPostRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    content: row.content || '',
    htmlContent: row.htmlContent,
    coverImageUrl: row.coverImageUrl || '',
    category: row.category || 'Engineering',
    badge: row.badge || 'Field Note',
    status: row.status,
    authorId: row.authorId ?? undefined,
    publishedAt: row.publishedAt ? new Date(row.publishedAt).toISOString() : null,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
  };
}

router.get('/posts', async (req: Request, res: Response) => {
  try {
    const statusFilter = String(req.query.status || 'all');
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));

    let allRows: BlogPostRecord[];
    try {
      const dbRows =
        statusFilter !== 'all'
          ? await db
              .select()
              .from(blogPosts)
              .where(eq(blogPosts.status, statusFilter))
              .orderBy(desc(blogPosts.createdAt))
          : await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));

      allRows = dbRows.map(mapRowToBlogPost);
    } catch (error) {
      if (!canUseMemoryFallback(error)) throw error;
      allRows = memoryPosts
        .filter((p) => statusFilter === 'all' || p.status === statusFilter)
        .slice()
        .reverse();
    }

    const total = allRows.length;
    const offset = (page - 1) * limit;
    const data = allRows.slice(offset, offset + limit);

    return res.status(200).json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch blog posts' });
  }
});

router.get('/posts/:slug', async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug || '');
    try {
      const [row] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
      if (!row) return res.status(404).json({ error: 'Post not found' });
      return res.status(200).json({ post: mapRowToBlogPost(row) });
    } catch (error) {
      if (!canUseMemoryFallback(error)) throw error;
      const found = memoryPosts.find((p) => p.slug === slug);
      if (!found) return res.status(404).json({ error: 'Post not found' });
      return res.status(200).json({ post: found });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to load blog post' });
  }
});

router.post(
  '/posts',
  authenticate,
  authorize('admin', 'platform_manager'),
  upload.array('files', 5),
  async (req: Request, res: Response) => {
    try {
      const { title, content, htmlContent, excerpt, status, category, badge, coverImageUrl } =
        req.body;

      if (!title || (!htmlContent && !content)) {
        return res.status(400).json({ error: 'title and content/htmlContent are required' });
      }

      const normalizedStatus = ['draft', 'published', 'archived'].includes(status)
        ? (status as 'draft' | 'published' | 'archived')
        : 'draft';
      const slug = slugifyTitle(String(title));
      const now = new Date();
      const publishedAt = normalizedStatus === 'published' ? now : null;
      const bodyHtml = String(htmlContent || `<p>${String(content)}</p>`);
      const bodyExcerpt =
        excerpt ||
        bodyHtml
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 180);

      try {
        const [inserted] = await db
          .insert(blogPosts)
          .values({
            slug,
            title: String(title).trim(),
            excerpt: String(bodyExcerpt),
            content: String(content || bodyExcerpt),
            htmlContent: bodyHtml,
            coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
            category: category ? String(category) : 'Engineering',
            badge: badge ? String(badge) : 'Field Note',
            status: normalizedStatus,
            authorId: req.user?.id || null,
            publishedAt,
          })
          .returning();

        return res.status(201).json({ post: mapRowToBlogPost(inserted) });
      } catch (error) {
        if (!canUseMemoryFallback(error)) throw error;
        const created: BlogPostRecord = {
          id: memorySeq++,
          slug,
          title: String(title).trim(),
          excerpt: String(bodyExcerpt),
          content: String(content || bodyExcerpt),
          htmlContent: bodyHtml,
          coverImageUrl: coverImageUrl ? String(coverImageUrl) : '',
          category: category ? String(category) : 'Engineering',
          badge: badge ? String(badge) : 'Field Note',
          status: normalizedStatus,
          authorId: req.user?.id,
          publishedAt: publishedAt ? publishedAt.toISOString() : null,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
        memoryPosts.push(created);
        return res.status(201).json({ post: created });
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to create blog post' });
    }
  }
);

router.patch(
  '/posts/:id/status',
  authenticate,
  authorize('admin', 'platform_manager'),
  async (req: Request, res: Response) => {
    try {
      const postId = parseInt(String(req.params.id), 10);
      const { status } = req.body;
      if (!['draft', 'published', 'archived'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const now = new Date();
      try {
        const [updated] = await db
          .update(blogPosts)
          .set({
            status,
            publishedAt: status === 'published' ? now : null,
            updatedAt: now,
          })
          .where(eq(blogPosts.id, postId))
          .returning();

        if (!updated) return res.status(404).json({ error: 'Post not found' });
        return res.status(200).json({ post: mapRowToBlogPost(updated) });
      } catch (error) {
        if (!canUseMemoryFallback(error)) throw error;
        const idx = memoryPosts.findIndex((p) => p.id === postId);
        if (idx === -1) return res.status(404).json({ error: 'Post not found' });
        memoryPosts[idx] = {
          ...memoryPosts[idx],
          status,
          publishedAt: status === 'published' ? now.toISOString() : null,
          updatedAt: now.toISOString(),
        };
        return res.status(200).json({ post: memoryPosts[idx] });
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to update post status' });
    }
  }
);

router.delete(
  '/posts/:id',
  authenticate,
  authorize('admin', 'platform_manager'),
  async (req: Request, res: Response) => {
    try {
      const postId = parseInt(String(req.params.id), 10);
      try {
        await db.delete(blogPosts).where(eq(blogPosts.id, postId));
        return res.status(200).json({ deleted: true, id: postId });
      } catch (error) {
        if (!canUseMemoryFallback(error)) throw error;
        const idx = memoryPosts.findIndex((p) => p.id === postId);
        if (idx === -1) return res.status(404).json({ error: 'Post not found' });
        memoryPosts.splice(idx, 1);
        return res.status(200).json({ deleted: true, id: postId });
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to delete blog post' });
    }
  }
);

export default router;
