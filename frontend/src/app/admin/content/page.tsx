'use client';

import { useEffect, useMemo, useState } from 'react';
import { BellRing, FileText, MessageSquare, Search, ShieldAlert, BookOpen, Trash2 } from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Separator,
} from '@/components/ui';
import BlogEditorModal from '@/app/admin/components/BlogEditorModal';
import type { BlogPostData } from '@/app/admin/components/BlogEditorModal';
import { adminClient, type CommunityPostItem, type AdminBlogPostItem } from '../_lib/admin-client';

export default function AdminContentPage() {
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | null>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyPostId, setBusyPostId] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<CommunityPostItem | null>(null);
  const [error, setError] = useState('');
  const [blogEditorOpen, setBlogEditorOpen] = useState(false);
  const [blogPosts, setBlogPosts] = useState<AdminBlogPostItem[]>([]);
  const [loadingBlogPosts, setLoadingBlogPosts] = useState(true);
  const [blogStatusFilter, setBlogStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [busyBlogId, setBusyBlogId] = useState<number | null>(null);

  const loadPosts = async (runAsRefresh = false) => {
    if (runAsRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');
    try {
      const response = await adminClient.getCommunityPosts({
        search,
        status: status ?? 'all',
        page: 1,
        limit: 20,
      });
      setPosts(response.data || []);
    } catch {
      setError('Unable to load moderation queue right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const loadBlogPosts = async () => {
    setLoadingBlogPosts(true);
    try {
      const response = await adminClient.getBlogPosts({
        status: blogStatusFilter,
        page: 1,
        limit: 20,
      });
      setBlogPosts(response.data || []);
    } catch {
      setError('Unable to load blog posts right now.');
    } finally {
      setLoadingBlogPosts(false);
    }
  };

  useEffect(() => {
    loadBlogPosts();
  }, [blogStatusFilter]);

  const updatePostStatus = async (postId: number, nextStatus: 'open' | 'in_progress' | 'closed') => {
    setBusyPostId(postId);
    try {
      await adminClient.updateCommunityPostStatus(postId, nextStatus);
      await loadPosts(true);
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) => (prev ? { ...prev, status: nextStatus } : prev));
      }
    } finally {
      setBusyPostId(null);
    }
  };

  const queueMetrics = useMemo(() => {
    const open = posts.filter((post) => post.status === 'open').length;
    const active = posts.filter((post) => post.status === 'in_progress').length;
    const closed = posts.filter((post) => post.status === 'closed').length;
    return { open, active, closed };
  }, [posts]);

  const blogMetrics = useMemo(() => {
    const draft = blogPosts.filter((post) => post.status === 'draft').length;
    const published = blogPosts.filter((post) => post.status === 'published').length;
    const archived = blogPosts.filter((post) => post.status === 'archived').length;
    return { draft, published, archived };
  }, [blogPosts]);

  const removeBlogPost = async (postId: number) => {
    setBusyBlogId(postId);
    try {
      await adminClient.deleteBlogPost(postId);
      await loadBlogPosts();
    } finally {
      setBusyBlogId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Badge variant="secondary" className="font-semibold">Content Ops</Badge>
        <h1 className="text-3xl font-black tracking-tight">Content and Moderation Control</h1>
        <p className="text-sm text-muted-foreground">
          Manage forums, blog editorial controls, notifications, and moderation workflows across interactive channels.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Forums and Blogs</CardDescription>
              <CardTitle className="text-3xl font-black">{posts.length}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-muted-foreground">
              <FileText className="size-4" />
              <span className="text-sm">Published and draft editorial discussions</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Moderation Queue</CardDescription>
              <CardTitle className="text-3xl font-black">{queueMetrics.open + queueMetrics.active}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-muted-foreground">
              <ShieldAlert className="size-4" />
              <span className="text-sm">{queueMetrics.open} open / {queueMetrics.active} in progress</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Notifications Scope</CardDescription>
              <CardTitle className="text-3xl font-black">{queueMetrics.closed}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-muted-foreground">
              <BellRing className="size-4" />
              <span className="text-sm">Resolved items available for archival review</span>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Editorial Moderation Queue</CardTitle>
          <CardDescription>Filter posts, open review detail, and execute lifecycle actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end">
            <div className="grid gap-2">
              <Label htmlFor="post-search">Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="post-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title or content"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status ?? 'all'} onValueChange={(value) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => loadPosts(true)} disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Apply'}
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thread</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Replies</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{post.title}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{post.content}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{post.status ?? 'open'}</Badge>
                    </TableCell>
                    <TableCell>{post.category || '-'}</TableCell>
                    <TableCell>{post.replyCount ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedPost(post)}>Review</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyPostId === post.id}
                          onClick={() => updatePostStatus(post.id, 'in_progress')}
                        >
                          Escalate
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busyPostId === post.id}
                          onClick={() => updatePostStatus(post.id, 'closed')}
                        >
                          Resolve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {posts.map((post) => (
              <div key={post.id} className="rounded-xl border border-border p-3">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="font-semibold leading-tight">{post.title}</p>
                  <Badge variant="outline" className="capitalize">{post.status ?? 'open'}</Badge>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{post.content}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedPost(post)}>Review</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyPostId === post.id}
                    onClick={() => updatePostStatus(post.id, 'in_progress')}
                  >
                    Escalate
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busyPostId === post.id}
                    onClick={() => updatePostStatus(post.id, 'closed')}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Moderation and Editorial Policy</CardTitle>
          <CardDescription>Operational rules for all platform interactions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>- Forums require thread-level moderation with traceable reason codes.</p>
          <p>- Blog editorial controls must separate draft, pending review, and published states.</p>
          <p>- Notifications must support global broadcast, role-targeted sends, and sender-level whitelist/blacklist enforcement.</p>
          <p>- Chat rooms are governed under end-to-end encryption policy and moderation metadata only.</p>
          <p>- High-risk moderation actions must always occur in explicit confirmation dialogs.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interaction Surfaces</CardTitle>
          <CardDescription>All channels included in content operations governance.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <button
            onClick={() => setBlogEditorOpen(true)}
            className="flex items-start justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-left transition-all hover:bg-muted hover:border-foreground"
          >
            <div className="space-y-1 flex-1">
              <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                <BookOpen className="size-4" />
                Blog Controls
              </div>
              <span className="text-xs">Create and manage blog posts with HTML authoring, live preview, and structured media blocks.</span>
            </div>
          </button>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
              <MessageSquare className="size-4" />
              Forums and Discussion Threads
            </div>
            Apply moderation, escalation, and author actions with audit trails.
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
              <BellRing className="size-4" />
              Notifications and Broadcasts
            </div>
            Configure global sends, role channels, and trust-bound delivery controls.
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 md:col-span-2">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
              <ShieldAlert className="size-4" />
              Encrypted Chat Room Governance
            </div>
            Enforce policy over metadata and abuse signals while preserving end-to-end encrypted message content boundaries.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Blog Editorial Console</CardTitle>
              <CardDescription>Manage blog publishing pipeline and article lifecycle in one place.</CardDescription>
            </div>
            <Button onClick={() => setBlogEditorOpen(true)}>
              <BookOpen className="size-4" data-icon="inline-start" /> New Post
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
              <p className="text-2xl font-black">{blogPosts.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Draft</p>
              <p className="text-2xl font-black">{blogMetrics.draft}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Published</p>
              <p className="text-2xl font-black">{blogMetrics.published}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Archived</p>
              <p className="text-2xl font-black">{blogMetrics.archived}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="blog-status">Status Filter</Label>
            <Select value={blogStatusFilter} onValueChange={(value) => setBlogStatusFilter(value as 'all' | 'draft' | 'published' | 'archived')}>
              <SelectTrigger id="blog-status" className="w-[220px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {loadingBlogPosts ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              No blog posts match the current filter.
            </div>
          ) : (
            <div className="space-y-2">
              {blogPosts.map((post) => (
                <div key={post.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold leading-tight">{post.title}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="capitalize">{post.status}</Badge>
                        <span>{post.authorEmail || 'Unknown author'}</span>
                        <span>{post.likeCount} likes</span>
                        <span>{post.commentCount} comments</span>
                        <span>{post.shareCount} shares</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyBlogId === post.id}
                        onClick={() => removeBlogPost(post.id)}
                      >
                        <Trash2 className="size-4" data-icon="inline-start" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedPost)} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title || 'Post Review'}</DialogTitle>
            <DialogDescription>
              Execute moderation decisions with explicit lifecycle controls.
            </DialogDescription>
          </DialogHeader>

          {selectedPost ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="capitalize">{selectedPost.status ?? 'open'}</Badge>
                <Badge variant="secondary">{selectedPost.category || 'general'}</Badge>
              </div>
              <p className="max-h-52 overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                {selectedPost.content}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busyPostId === selectedPost.id}
                  onClick={() => updatePostStatus(selectedPost.id, 'open')}
                >
                  Mark Open
                </Button>
                <Button
                  variant="outline"
                  disabled={busyPostId === selectedPost.id}
                  onClick={() => updatePostStatus(selectedPost.id, 'in_progress')}
                >
                  Mark In Progress
                </Button>
                <Button
                  variant="secondary"
                  disabled={busyPostId === selectedPost.id}
                  onClick={() => updatePostStatus(selectedPost.id, 'closed')}
                >
                  Mark Closed
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <BlogEditorModal
        open={blogEditorOpen}
        onOpenChange={setBlogEditorOpen}
        onPublish={async (data: BlogPostData) => {
          await adminClient.createBlogPost({
            title: data.title,
            content: data.content,
            htmlContent: data.htmlContent,
            status: data.status,
            files: data.files,
          });
          await loadBlogPosts();
        }}
      />
    </div>
  );
}
