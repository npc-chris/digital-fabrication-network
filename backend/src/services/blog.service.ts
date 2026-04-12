import { db } from '../config/database';
import { sql, eq, desc, and } from 'drizzle-orm';
import {
  blogPosts,
  blogFiles,
  blogPostLikes,
  blogComments,
  blogCommentLikes,
  users,
} from '../models/schema';

export interface BlogPostData {
  id: number;
  authorId: number;
  title: string;
  content: string;
  htmlContent: string;
  status: 'draft' | 'published' | 'archived';
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  authorEmail?: string;
  viewerHasLiked?: boolean;
  files?: BlogFileData[];
}

export interface BlogFileData {
  id: number;
  postId: number;
  filename: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string | Date | null;
}

export interface BlogCommentData {
  id: number;
  postId: number;
  authorId: number;
  parentCommentId?: number | null;
  content: string;
  likeCount: number;
  replyCount: number;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
  authorEmail?: string;
  viewerHasLiked?: boolean;
}

class BlogService {
  async createBlogPost(
    userId: number,
    title: string,
    content: string,
    htmlContent: string,
    files: Express.Multer.File[],
    status: 'draft' | 'published' | 'archived' = 'draft'
  ): Promise<BlogPostData> {
    const [post] = await db
      .insert(blogPosts)
      .values({
        authorId: userId,
        title,
        content,
        htmlContent,
        status,
      })
      .returning();

    if (files.length > 0) {
      for (const file of files) {
        await this.uploadBlogFile(file, userId, post.id);
      }
    }

    const hydrated = await this.getBlogPostById(post.id, userId);
    if (!hydrated) {
      throw new Error('Failed to load created post');
    }
    return hydrated;
  }

  async getBlogPosts(
    page: number = 1,
    limit: number = 20,
    status: 'all' | 'draft' | 'published' | 'archived' = 'published',
    viewerId?: number
  ): Promise<{ data: BlogPostData[]; total: number }> {
    const offset = Math.max(0, (page - 1) * limit);

    const baseSelect = db
      .select({
        id: blogPosts.id,
        authorId: blogPosts.authorId,
        title: blogPosts.title,
        content: blogPosts.content,
        htmlContent: blogPosts.htmlContent,
        status: blogPosts.status,
        likeCount: blogPosts.likeCount,
        commentCount: blogPosts.commentCount,
        shareCount: blogPosts.shareCount,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        authorEmail: users.email,
      })
      .from(blogPosts)
      .leftJoin(users, eq(users.id, blogPosts.authorId));

    const rows = status === 'all'
      ? await baseSelect.orderBy(desc(blogPosts.createdAt)).limit(limit).offset(offset)
      : await baseSelect.where(eq(blogPosts.status, status)).orderBy(desc(blogPosts.createdAt)).limit(limit).offset(offset);

    const countRows = status === 'all'
      ? await db.select({ count: sql<number>`count(*)` }).from(blogPosts)
      : await db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(eq(blogPosts.status, status));

    const total = Number(countRows[0]?.count ?? 0);

    const postIds = rows.map((row) => row.id);
    const likedPostIds = viewerId && postIds.length > 0
      ? await db
          .select({ postId: blogPostLikes.postId })
          .from(blogPostLikes)
          .where(and(eq(blogPostLikes.userId, viewerId), sql`${blogPostLikes.postId} = ANY(${postIds})`))
      : [];

    const likedSet = new Set(likedPostIds.map((item) => item.postId));

    const data: BlogPostData[] = rows.map((row) => ({
      id: row.id,
      authorId: row.authorId,
      title: row.title,
      content: row.content,
      htmlContent: row.htmlContent,
      status: row.status as BlogPostData['status'],
      likeCount: row.likeCount,
      commentCount: row.commentCount,
      shareCount: row.shareCount,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
      authorEmail: row.authorEmail ?? undefined,
      viewerHasLiked: viewerId ? likedSet.has(row.id) : false,
    }));

    return { data, total };
  }

  async getBlogPostById(postId: number, viewerId?: number): Promise<BlogPostData | null> {
    const rows = await db
      .select({
        id: blogPosts.id,
        authorId: blogPosts.authorId,
        title: blogPosts.title,
        content: blogPosts.content,
        htmlContent: blogPosts.htmlContent,
        status: blogPosts.status,
        likeCount: blogPosts.likeCount,
        commentCount: blogPosts.commentCount,
        shareCount: blogPosts.shareCount,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        authorEmail: users.email,
      })
      .from(blogPosts)
      .leftJoin(users, eq(users.id, blogPosts.authorId))
      .where(eq(blogPosts.id, postId));

    if (rows.length === 0) {
      return null;
    }

    const post = rows[0];
    const files = await this.getBlogPostFiles(postId);
    const liked = viewerId
      ? await db
          .select({ id: blogPostLikes.id })
          .from(blogPostLikes)
          .where(and(eq(blogPostLikes.postId, postId), eq(blogPostLikes.userId, viewerId)))
      : [];

    return {
      id: post.id,
      authorId: post.authorId,
      title: post.title,
      content: post.content,
      htmlContent: post.htmlContent,
      status: post.status as BlogPostData['status'],
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      shareCount: post.shareCount,
      createdAt: post.createdAt ?? new Date(),
      updatedAt: post.updatedAt ?? new Date(),
      authorEmail: post.authorEmail ?? undefined,
      viewerHasLiked: liked.length > 0,
      files,
    };
  }

  async updateBlogPost(
    postId: number,
    userId: number,
    title?: string,
    content?: string,
    htmlContent?: string,
    status?: string,
    files?: Express.Multer.File[]
  ): Promise<BlogPostData> {
    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateValues.title = title;
    if (content !== undefined) updateValues.content = content;
    if (htmlContent !== undefined) updateValues.htmlContent = htmlContent;
    if (status !== undefined) updateValues.status = status;

    await db
      .update(blogPosts)
      .set(updateValues)
      .where(and(eq(blogPosts.id, postId), eq(blogPosts.authorId, userId)));

    if (files && files.length > 0) {
      for (const file of files) {
        await this.uploadBlogFile(file, userId, postId);
      }
    }

    const post = await this.getBlogPostById(postId, userId);
    if (!post) throw new Error('Post not found after update');

    return post;
  }

  async deleteBlogPost(postId: number, userId: number): Promise<void> {
    await db.delete(blogFiles).where(eq(blogFiles.postId, postId));
    await db.delete(blogCommentLikes).where(sql`${blogCommentLikes.commentId} IN (select id from blog_comments where post_id = ${postId})`);
    await db.delete(blogComments).where(eq(blogComments.postId, postId));
    await db.delete(blogPostLikes).where(eq(blogPostLikes.postId, postId));
    await db
      .delete(blogPosts)
      .where(and(eq(blogPosts.id, postId), eq(blogPosts.authorId, userId)));
  }

  async uploadBlogFile(
    file: Express.Multer.File,
    _userId: number,
    postId?: number
  ): Promise<string> {
    const fileId = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
    const fileUrl = `/api/blog/files/${fileId}`;

    if (postId) {
      await db.insert(blogFiles).values({
        postId,
        filename: file.originalname,
        fileUrl,
        fileType: file.mimetype,
      });
    }

    return fileUrl;
  }

  async getBlogPostFiles(postId: number): Promise<BlogFileData[]> {
    const result = await db
      .select()
      .from(blogFiles)
      .where(eq(blogFiles.postId, postId))
      .orderBy(desc(blogFiles.uploadedAt));

    return result.map((row) => ({
      id: row.id,
      postId: row.postId,
      filename: row.filename,
      fileUrl: row.fileUrl,
      fileType: row.fileType,
      uploadedAt: row.uploadedAt,
    }));
  }

  async deleteBlogFile(fileId: number, _userId: number): Promise<void> {
    await db.delete(blogFiles).where(eq(blogFiles.id, fileId));
  }

  async togglePostLike(postId: number, userId: number): Promise<{ liked: boolean; likeCount: number }> {
    const existing = await db
      .select({ id: blogPostLikes.id })
      .from(blogPostLikes)
      .where(and(eq(blogPostLikes.postId, postId), eq(blogPostLikes.userId, userId)));

    let liked = false;
    if (existing.length > 0) {
      await db.delete(blogPostLikes).where(eq(blogPostLikes.id, existing[0].id));
      await db
        .update(blogPosts)
        .set({ likeCount: sql`GREATEST(${blogPosts.likeCount} - 1, 0)` })
        .where(eq(blogPosts.id, postId));
    } else {
      await db.insert(blogPostLikes).values({ postId, userId });
      await db
        .update(blogPosts)
        .set({ likeCount: sql`${blogPosts.likeCount} + 1` })
        .where(eq(blogPosts.id, postId));
      liked = true;
    }

    const post = await db
      .select({ likeCount: blogPosts.likeCount })
      .from(blogPosts)
      .where(eq(blogPosts.id, postId));

    return { liked, likeCount: post[0]?.likeCount ?? 0 };
  }

  async incrementShareCount(postId: number): Promise<{ shareCount: number }> {
    await db
      .update(blogPosts)
      .set({ shareCount: sql`${blogPosts.shareCount} + 1` })
      .where(eq(blogPosts.id, postId));

    const post = await db
      .select({ shareCount: blogPosts.shareCount })
      .from(blogPosts)
      .where(eq(blogPosts.id, postId));

    return { shareCount: post[0]?.shareCount ?? 0 };
  }

  async getComments(postId: number, viewerId?: number): Promise<BlogCommentData[]> {
    const rows = await db
      .select({
        id: blogComments.id,
        postId: blogComments.postId,
        authorId: blogComments.authorId,
        parentCommentId: blogComments.parentCommentId,
        content: blogComments.content,
        likeCount: blogComments.likeCount,
        replyCount: blogComments.replyCount,
        createdAt: blogComments.createdAt,
        updatedAt: blogComments.updatedAt,
        authorEmail: users.email,
      })
      .from(blogComments)
      .leftJoin(users, eq(users.id, blogComments.authorId))
      .where(eq(blogComments.postId, postId))
      .orderBy(desc(blogComments.createdAt));

    if (!viewerId || rows.length === 0) {
      return rows.map((row) => ({
        ...row,
        createdAt: row.createdAt ?? new Date(),
        updatedAt: row.updatedAt ?? new Date(),
        authorEmail: row.authorEmail ?? undefined,
        viewerHasLiked: false,
      }));
    }

    const commentIds = rows.map((row) => row.id);
    const likedRows = await db
      .select({ commentId: blogCommentLikes.commentId })
      .from(blogCommentLikes)
      .where(and(eq(blogCommentLikes.userId, viewerId), sql`${blogCommentLikes.commentId} = ANY(${commentIds})`));

    const likedSet = new Set(likedRows.map((row) => row.commentId));
    return rows.map((row) => ({
      ...row,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
      authorEmail: row.authorEmail ?? undefined,
      viewerHasLiked: likedSet.has(row.id),
    }));
  }

  async addComment(postId: number, authorId: number, content: string, parentCommentId?: number): Promise<BlogCommentData> {
    const [comment] = await db
      .insert(blogComments)
      .values({
        postId,
        authorId,
        content,
        parentCommentId: parentCommentId ?? null,
      })
      .returning();

    await db
      .update(blogPosts)
      .set({ commentCount: sql`${blogPosts.commentCount} + 1` })
      .where(eq(blogPosts.id, postId));

    if (parentCommentId) {
      await db
        .update(blogComments)
        .set({ replyCount: sql`${blogComments.replyCount} + 1` })
        .where(eq(blogComments.id, parentCommentId));
    }

    const author = await db.select({ email: users.email }).from(users).where(eq(users.id, authorId));

    return {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      parentCommentId: comment.parentCommentId,
      content: comment.content,
      likeCount: comment.likeCount ?? 0,
      replyCount: comment.replyCount ?? 0,
      createdAt: comment.createdAt ?? new Date(),
      updatedAt: comment.updatedAt ?? new Date(),
      authorEmail: author[0]?.email,
      viewerHasLiked: false,
    };
  }

  async toggleCommentLike(commentId: number, userId: number): Promise<{ liked: boolean; likeCount: number }> {
    const existing = await db
      .select({ id: blogCommentLikes.id })
      .from(blogCommentLikes)
      .where(and(eq(blogCommentLikes.commentId, commentId), eq(blogCommentLikes.userId, userId)));

    let liked = false;
    if (existing.length > 0) {
      await db.delete(blogCommentLikes).where(eq(blogCommentLikes.id, existing[0].id));
      await db
        .update(blogComments)
        .set({ likeCount: sql`GREATEST(${blogComments.likeCount} - 1, 0)` })
        .where(eq(blogComments.id, commentId));
    } else {
      await db.insert(blogCommentLikes).values({ commentId, userId });
      await db
        .update(blogComments)
        .set({ likeCount: sql`${blogComments.likeCount} + 1` })
        .where(eq(blogComments.id, commentId));
      liked = true;
    }

    const row = await db
      .select({ likeCount: blogComments.likeCount })
      .from(blogComments)
      .where(eq(blogComments.id, commentId));

    return { liked, likeCount: row[0]?.likeCount ?? 0 };
  }
}

export const blogService = new BlogService();
