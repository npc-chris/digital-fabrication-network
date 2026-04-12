import { Router, Request, Response } from 'express';
import multer from 'multer';

import { blogService } from '../services/blog.service';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
  },
});

const parseNumber = (value: string): number | null => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

router.post(
  '/posts',
  authenticate,
  authorize('admin', 'platform_manager'),
  upload.array('files', 5),
  async (req: Request, res: Response) => {
    try {
      const { title, content, htmlContent, status } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const files = (req.files as Express.Multer.File[]) || [];
      const normalizedStatus = status === 'published' || status === 'archived' ? status : 'draft';

      const post = await blogService.createBlogPost(
        userId,
        String(title),
        String(content),
        String(htmlContent || content),
        files,
        normalizedStatus
      );

      return res.status(201).json(post);
    } catch (error) {
      console.error('Error creating blog post:', error);
      return res.status(500).json({ error: 'Failed to create blog post' });
    }
  }
);

router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;
    const viewerId = parseNumber(String(req.query.viewerId || '')) ?? undefined;

    const posts = await blogService.getBlogPosts(
      Number.parseInt(String(page), 10),
      Number.parseInt(String(limit), 10),
      (String(status || 'all') as 'all' | 'draft' | 'published' | 'archived'),
      viewerId
    );

    return res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

router.get('/posts/:id', async (req: Request, res: Response) => {
  try {
    const postId = parseNumber(req.params.id);
    if (!postId) {
      return res.status(400).json({ error: 'Invalid post id' });
    }

    const viewerId = parseNumber(String(req.query.viewerId || '')) ?? undefined;
    const post = await blogService.getBlogPostById(postId, viewerId);

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    return res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

router.put(
  '/posts/:id',
  authenticate,
  authorize('admin', 'platform_manager'),
  upload.array('files', 5),
  async (req: Request, res: Response) => {
    try {
      const postId = parseNumber(req.params.id);
      if (!postId) {
        return res.status(400).json({ error: 'Invalid post id' });
      }

      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { title, content, htmlContent, status } = req.body;
      const files = (req.files as Express.Multer.File[]) || [];

      const post = await blogService.updateBlogPost(
        postId,
        userId,
        title,
        content,
        htmlContent || content,
        status,
        files
      );

      return res.json(post);
    } catch (error) {
      console.error('Error updating blog post:', error);
      return res.status(500).json({ error: 'Failed to update blog post' });
    }
  }
);

router.delete('/posts/:id', authenticate, authorize('admin', 'platform_manager'), async (req: Request, res: Response) => {
  try {
    const postId = parseNumber(req.params.id);
    if (!postId) {
      return res.status(400).json({ error: 'Invalid post id' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await blogService.deleteBlogPost(postId, userId);
    return res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

router.post('/upload', authenticate, authorize('admin', 'platform_manager'), upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileUrl = await blogService.uploadBlogFile(req.file, userId);
    return res.json({ url: fileUrl, filename: req.file.originalname });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.post('/posts/:id/like', authenticate, async (req: Request, res: Response) => {
  try {
    const postId = parseNumber(req.params.id);
    if (!postId) {
      return res.status(400).json({ error: 'Invalid post id' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await blogService.togglePostLike(postId, userId);
    return res.json(result);
  } catch (error) {
    console.error('Error toggling blog like:', error);
    return res.status(500).json({ error: 'Failed to toggle like' });
  }
});

router.post('/posts/:id/share', async (req: Request, res: Response) => {
  try {
    const postId = parseNumber(req.params.id);
    if (!postId) {
      return res.status(400).json({ error: 'Invalid post id' });
    }

    const result = await blogService.incrementShareCount(postId);
    return res.json(result);
  } catch (error) {
    console.error('Error tracking blog share:', error);
    return res.status(500).json({ error: 'Failed to track share' });
  }
});

router.get('/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const postId = parseNumber(req.params.id);
    if (!postId) {
      return res.status(400).json({ error: 'Invalid post id' });
    }

    const viewerId = parseNumber(String(req.query.viewerId || '')) ?? undefined;
    const comments = await blogService.getComments(postId, viewerId);
    return res.json(comments);
  } catch (error) {
    console.error('Error loading comments:', error);
    return res.status(500).json({ error: 'Failed to load comments' });
  }
});

router.post('/posts/:id/comments', authenticate, async (req: Request, res: Response) => {
  try {
    const postId = parseNumber(req.params.id);
    if (!postId) {
      return res.status(400).json({ error: 'Invalid post id' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const content = String(req.body?.content || '').trim();
    const parentCommentId = req.body?.parentCommentId
      ? parseNumber(String(req.body.parentCommentId))
      : undefined;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const comment = await blogService.addComment(postId, userId, content, parentCommentId ?? undefined);
    return res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({ error: 'Failed to create comment' });
  }
});

router.post('/comments/:commentId/like', authenticate, async (req: Request, res: Response) => {
  try {
    const commentId = parseNumber(req.params.commentId);
    if (!commentId) {
      return res.status(400).json({ error: 'Invalid comment id' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await blogService.toggleCommentLike(commentId, userId);
    return res.json(result);
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return res.status(500).json({ error: 'Failed to toggle comment like' });
  }
});

export default router;
