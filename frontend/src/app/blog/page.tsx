"use client";

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, Heart, MessageCircle, Link2, Reply } from 'lucide-react';

import LandingNavbar from '@/components/LandingNavbar';
import BlogContentFrame from '@/components/blog/BlogContentFrame';
import { verifySession, type AuthUser } from '@/lib/auth';
import { blogAPI } from '@/lib/api-services';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Separator,
  Textarea,
} from '@/components/ui';

type BlogPost = {
  id: number;
  authorId: number;
  title: string;
  content: string;
  htmlContent: string;
  status: 'draft' | 'published' | 'archived';
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt?: string;
  updatedAt?: string;
  authorEmail?: string;
  viewerHasLiked?: boolean;
};

type BlogComment = {
  id: number;
  postId: number;
  authorId: number;
  parentCommentId?: number | null;
  content: string;
  likeCount: number;
  replyCount: number;
  createdAt?: string;
  authorEmail?: string;
  viewerHasLiked?: boolean;
};

export default function BlogPage() {
  const [viewer, setViewer] = useState<AuthUser | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [search, setSearch] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState('');
  const [busyPostActionId, setBusyPostActionId] = useState<number | null>(null);
  const [busyCommentActionId, setBusyCommentActionId] = useState<number | null>(null);

  const activePost = useMemo(
    () => posts.find((post) => post.id === activePostId) ?? null,
    [posts, activePostId]
  );

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return posts;
    }

    return posts.filter((post) => {
      const text = [post.title, post.content, post.authorEmail || ''].join(' ').toLowerCase();
      return text.includes(query);
    });
  }, [posts, search]);

  const groupedComments = useMemo(() => {
    const root: BlogComment[] = [];
    const repliesByParent = new Map<number, BlogComment[]>();

    comments.forEach((comment) => {
      if (!comment.parentCommentId) {
        root.push(comment);
      } else {
        const existing = repliesByParent.get(comment.parentCommentId) || [];
        existing.push(comment);
        repliesByParent.set(comment.parentCommentId, existing);
      }
    });

    return { root, repliesByParent };
  }, [comments]);

  const loadPosts = async (viewerId?: number) => {
    setLoadingPosts(true);
    setError('');

    try {
      const response = await blogAPI.getPosts({
        page: 1,
        limit: 30,
        status: 'published',
        viewerId,
      });

      const data = Array.isArray(response?.data) ? response.data : [];
      setPosts(data);

      if (data.length > 0 && !activePostId) {
        setActivePostId(data[0].id);
      }
    } catch {
      setError('Unable to load blog posts right now.');
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadComments = async (postId: number, viewerId?: number) => {
    setLoadingComments(true);
    try {
      const data = await blogAPI.getComments(postId, viewerId);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const session = await verifySession();
      setViewer(session.user);
      await loadPosts(session.user?.id);
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!activePostId) {
      setComments([]);
      return;
    }

    loadComments(activePostId, viewer?.id);
  }, [activePostId, viewer?.id]);

  const handleLikePost = async (postId: number) => {
    if (!viewer) {
      setError('Sign in to like blog posts.');
      return;
    }

    setBusyPostActionId(postId);
    try {
      const result = await blogAPI.toggleLike(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likeCount: result.likeCount, viewerHasLiked: result.liked }
            : post
        )
      );
    } finally {
      setBusyPostActionId(null);
    }
  };

  const handleShare = async (postId: number) => {
    const shareUrl = `${window.location.origin}/blog?post=${postId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      const result = await blogAPI.trackShare(postId);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, shareCount: result.shareCount } : post))
      );
    } catch {
      setError('Could not copy share link.');
    }
  };

  const handleCommentSubmit = async () => {
    if (!viewer) {
      setError('Sign in to comment.');
      return;
    }
    if (!activePostId || !newComment.trim()) {
      return;
    }

    setBusyPostActionId(activePostId);
    try {
      await blogAPI.addComment(activePostId, newComment.trim());
      setNewComment('');
      await loadComments(activePostId, viewer.id);
      await loadPosts(viewer.id);
    } finally {
      setBusyPostActionId(null);
    }
  };

  const handleReply = async (parentCommentId: number) => {
    if (!viewer || !activePostId) {
      setError('Sign in to reply to comments.');
      return;
    }

    const draft = (replyDrafts[parentCommentId] || '').trim();
    if (!draft) {
      return;
    }

    setBusyCommentActionId(parentCommentId);
    try {
      await blogAPI.addComment(activePostId, draft, parentCommentId);
      setReplyDrafts((prev) => ({ ...prev, [parentCommentId]: '' }));
      await loadComments(activePostId, viewer.id);
      await loadPosts(viewer.id);
    } finally {
      setBusyCommentActionId(null);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!viewer || !activePostId) {
      setError('Sign in to like comments.');
      return;
    }

    setBusyCommentActionId(commentId);
    try {
      const result = await blogAPI.toggleCommentLike(commentId);
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, likeCount: result.likeCount, viewerHasLiked: result.liked }
            : comment
        )
      );
    } finally {
      setBusyCommentActionId(null);
    }
  };

  const readTime = (html: string) => {
    const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.ceil(words / 220))} min read`;
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <LandingNavbar fixed active={null} />

      <main className="mx-auto w-full max-w-[1400px] space-y-8 px-4 py-28 lg:px-8">
        <section className="rounded-[2rem] border border-[#e6e8ea] bg-white p-8 shadow-[0_10px_26px_rgba(0,72,115,0.09)] lg:p-12">
          <Badge variant="secondary" className="mb-4 font-semibold">DFN Blog</Badge>
          <h1 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
            Fabrication Stories,
            <span className="block text-[#006098]">Builder Insights, and Platform Updates.</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            Read published DFN articles, discuss ideas in context, and collaborate through practical comment threads.
          </p>
        </section>

        <section className="grid gap-4 rounded-2xl border border-[#e6e8ea] bg-white p-4 md:p-6">
          <div className="grid gap-2">
            <label htmlFor="blog-search" className="text-sm font-medium">Search articles</label>
            <Input
              id="blog-search"
              placeholder="Search by title or content"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card className="h-fit border-[#e6e8ea]">
            <CardHeader>
              <CardTitle className="text-lg">Published Posts</CardTitle>
              <CardDescription>Select an article to read and interact.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingPosts ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))
              ) : filteredPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No published blog posts match your search.</p>
              ) : (
                filteredPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    className={[
                      'w-full rounded-xl border px-3 py-3 text-left transition-colors',
                      activePostId === post.id
                        ? 'border-[#006098] bg-[#eff7ff]'
                        : 'border-border bg-white hover:bg-muted/30',
                    ].join(' ')}
                    onClick={() => setActivePostId(post.id)}
                  >
                    <p className="font-semibold leading-tight">{post.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{post.content}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      <span>{post.likeCount} likes</span>
                      <span>{post.commentCount} comments</span>
                      <span>{post.shareCount} shares</span>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-[#e6e8ea]">
            {!activePost ? (
              <CardHeader>
                <CardTitle>Select a post</CardTitle>
                <CardDescription>Choose an article from the left column to read it.</CardDescription>
              </CardHeader>
            ) : (
              <>
                <CardHeader className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">{activePost.status}</Badge>
                    {activePost.authorEmail ? <Badge variant="secondary">{activePost.authorEmail}</Badge> : null}
                  </div>

                  <CardTitle className="text-3xl leading-tight tracking-tight">{activePost.title}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-4 text-xs">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {activePost.createdAt ? new Date(activePost.createdAt).toLocaleDateString() : 'Date unavailable'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      {readTime(activePost.htmlContent || activePost.content)}
                    </span>
                  </CardDescription>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={activePost.viewerHasLiked ? 'secondary' : 'outline'}
                      size="sm"
                      disabled={busyPostActionId === activePost.id}
                      onClick={() => handleLikePost(activePost.id)}
                    >
                      <Heart className="size-4" data-icon="inline-start" /> {activePost.likeCount}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyPostActionId === activePost.id}
                      onClick={() => handleShare(activePost.id)}
                    >
                      <Link2 className="size-4" data-icon="inline-start" /> Share ({activePost.shareCount})
                    </Button>
                    <Badge variant="outline" className="text-xs">
                      <MessageCircle className="size-3.5" data-icon="inline-start" /> {activePost.commentCount} comments
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <BlogContentFrame
                    html={activePost.htmlContent || `<p>${activePost.content}</p>`}
                    className="w-full rounded-xl border border-border bg-white"
                  />

                  <Separator />

                  <div className="space-y-3">
                    <h2 className="text-xl font-bold tracking-tight">Comments</h2>
                    <Textarea
                      value={newComment}
                      onChange={(event) => setNewComment(event.target.value)}
                      placeholder={viewer ? 'Share your thoughts with the community' : 'Sign in to add comments'}
                      disabled={!viewer || busyPostActionId === activePost.id}
                      className="min-h-[96px]"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleCommentSubmit} disabled={!viewer || !newComment.trim() || busyPostActionId === activePost.id}>
                        Post Comment
                      </Button>
                    </div>
                  </div>

                  {loadingComments ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />
                      ))}
                    </div>
                  ) : groupedComments.root.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comments yet. Be the first to start the discussion.</p>
                  ) : (
                    <div className="space-y-4">
                      {groupedComments.root.map((comment) => {
                        const replies = groupedComments.repliesByParent.get(comment.id) || [];
                        return (
                          <div key={comment.id} className="rounded-xl border border-border bg-muted/20 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground">
                                {comment.authorEmail || `User #${comment.authorId}`}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant={comment.viewerHasLiked ? 'secondary' : 'outline'}
                                  size="sm"
                                  disabled={busyCommentActionId === comment.id}
                                  onClick={() => handleLikeComment(comment.id)}
                                >
                                  <Heart className="size-4" data-icon="inline-start" /> {comment.likeCount}
                                </Button>
                              </div>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed">{comment.content}</p>

                            <div className="mt-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <Reply className="size-3.5 text-muted-foreground" />
                                <Input
                                  value={replyDrafts[comment.id] || ''}
                                  onChange={(event) =>
                                    setReplyDrafts((prev) => ({ ...prev, [comment.id]: event.target.value }))
                                  }
                                  disabled={!viewer || busyCommentActionId === comment.id}
                                  placeholder={viewer ? 'Write a reply' : 'Sign in to reply'}
                                />
                                <Button
                                  size="sm"
                                  disabled={!viewer || !(replyDrafts[comment.id] || '').trim() || busyCommentActionId === comment.id}
                                  onClick={() => handleReply(comment.id)}
                                >
                                  Reply
                                </Button>
                              </div>

                              {replies.length > 0 ? (
                                <div className="space-y-2 border-l-2 border-border pl-3">
                                  {replies.map((reply) => (
                                    <div key={reply.id} className="rounded-lg border border-border bg-white p-2">
                                      <p className="text-xs text-muted-foreground">{reply.authorEmail || `User #${reply.authorId}`}</p>
                                      <p className="mt-1 text-sm">{reply.content}</p>
                                      <div className="mt-2">
                                        <Button
                                          variant={reply.viewerHasLiked ? 'secondary' : 'outline'}
                                          size="sm"
                                          disabled={busyCommentActionId === reply.id}
                                          onClick={() => handleLikeComment(reply.id)}
                                        >
                                          <Heart className="size-4" data-icon="inline-start" /> {reply.likeCount}
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}
