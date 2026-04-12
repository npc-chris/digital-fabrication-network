'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Code, Eye, Sparkles, LayoutPanelTop, ImagePlus, Link2 } from 'lucide-react';

import {
  Badge,
  Button,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/components/ui';
import BlogContentFrame from '@/components/blog/BlogContentFrame';

type EditorMode = 'code' | 'preview' | 'split';
type MediaLayout = 'compact' | 'regular' | 'wide' | 'full';

interface BlogEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish?: (data: BlogPostData) => Promise<void>;
}

export interface BlogPostData {
  title: string;
  content: string;
  htmlContent: string;
  status: 'draft' | 'published' | 'archived';
  files: File[];
}

const templates: Record<string, { title: string; html: string }> = {
  welcome: {
    title: 'Welcome to the Digital Fabrication Network',
    html: '<section><h2>Welcome Builders</h2><p>Digital Fabrication Network exists to help teams move from ideas to production with confidence.</p><p>Use this article to welcome new users, explain platform value, and point them to where they can start immediately.</p></section>',
  },
  update: {
    title: 'DFN Platform Update',
    html: '<section><h2>What Is New</h2><p>Summarize major updates and why they matter.</p><ul><li>Feature one and value</li><li>Feature two and value</li><li>Feature three and value</li></ul></section>',
  },
  story: {
    title: 'Builder Story Spotlight',
    html: '<section><h2>From Prototype to Impact</h2><p>Tell a real story in three acts: challenge, action, and measurable outcome.</p><blockquote>Add specific numbers and hard lessons to make this useful for other builders.</blockquote></section>',
  },
};

const stripHtml = (value: string): string => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

export default function BlogEditorModal({ open, onOpenChange, onPublish }: BlogEditorModalProps) {
  const [mode, setMode] = useState<EditorMode>('split');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [htmlContent, setHtmlContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaAlt, setMediaAlt] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaTargetUrl, setMediaTargetUrl] = useState('');
  const [mediaLayout, setMediaLayout] = useState<MediaLayout>('regular');
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');

  const clearForm = useCallback(() => {
    setMode('split');
    setTitle('');
    setStatus('draft');
    setHtmlContent('');
    setMediaUrl('');
    setMediaAlt('');
    setMediaCaption('');
    setMediaTargetUrl('');
    setMediaLayout('regular');
    setError('');
  }, []);

  useEffect(() => {
    if (!open) {
      clearForm();
    }
  }, [open, clearForm]);

  const previewContent = useMemo(() => htmlContent, [htmlContent]);

  const handleApplyTemplate = (key: keyof typeof templates) => {
    const template = templates[key];
    setTitle(template.title);
    setHtmlContent(template.html);
    setMode('code');
  };

  const appendMediaBlock = () => {
    if (!mediaUrl.trim()) {
      setError('Image URL is required to insert a media block.');
      return;
    }

    const safeImageUrl = escapeHtml(mediaUrl.trim());
    const safeAlt = escapeHtml(mediaAlt.trim() || 'Blog image');
    const safeCaption = mediaCaption.trim() ? `<figcaption>${escapeHtml(mediaCaption.trim())}</figcaption>` : '';
    const figureImage = `<img src="${safeImageUrl}" alt="${safeAlt}" loading="lazy" />`;
    const linkedImage = mediaTargetUrl.trim()
      ? `<a href="${escapeHtml(mediaTargetUrl.trim())}" target="_blank" rel="noopener noreferrer">${figureImage}</a>`
      : figureImage;

    const block = `\n<figure data-layout="${mediaLayout}">\n  ${linkedImage}\n  ${safeCaption}\n</figure>\n`;

    setHtmlContent((prev) => `${prev.trim()}${block}`.trim());
    setError('');
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setError('Blog title is required');
      return;
    }

    const selectedContent = htmlContent;
    if (!selectedContent.trim()) {
      setError('Blog content is required');
      return;
    }

    const normalizedHtml = htmlContent;

    setError('');
    setIsPublishing(true);

    try {
      if (onPublish) {
        await onPublish({
          title,
          content: stripHtml(normalizedHtml),
          htmlContent: normalizedHtml,
          status,
          files: [],
        });
      }
      clearForm();
      onOpenChange(false);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to save blog post');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-x-hidden overflow-y-auto sm:w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] lg:w-[min(96vw,1240px)] lg:max-w-[min(96vw,1240px)] 2xl:w-[min(96vw,1680px)] 2xl:max-w-[min(96vw,1680px)]">
        <DialogHeader className="space-y-2">
          <DialogTitle>Blog Controls</DialogTitle>
          <DialogDescription>
            Create practical editorial posts with direct HTML control, live rendering, and structured media layout blocks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-medium">Quick Templates</Badge>
            <Button type="button" variant="outline" size="sm" onClick={() => handleApplyTemplate('welcome')} disabled={isPublishing}>
              <Sparkles className="size-4" data-icon="inline-start" /> Welcome
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => handleApplyTemplate('update')} disabled={isPublishing}>
              Platform Update
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => handleApplyTemplate('story')} disabled={isPublishing}>
              Builder Story
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="grid gap-2">
              <Label htmlFor="blog-title">Title</Label>
              <Input
                id="blog-title"
                placeholder="Write a clear and specific title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isPublishing}
              />
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'published' | 'archived')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={mode} onValueChange={(value) => setMode(value as EditorMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="code" className="gap-2">
                <Code className="size-4" />
                <span className="hidden sm:inline">HTML</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="size-4" />
                <span className="hidden sm:inline">Preview</span>
              </TabsTrigger>
              <TabsTrigger value="split" className="gap-2">
                <LayoutPanelTop className="size-4" />
                <span className="hidden sm:inline">Split</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="space-y-2 pt-2">
              <Label htmlFor="blog-html-content">HTML Content</Label>
              <Textarea
                id="blog-html-content"
                placeholder="Write semantic HTML, inline CSS, and optional web-font imports in <style> blocks"
                value={htmlContent}
                onChange={(event) => setHtmlContent(event.target.value)}
                className="min-h-[420px] font-mono text-xs"
                disabled={isPublishing}
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">Use this mode for full control. Preview and public blog now use the same renderer.</p>
            </TabsContent>

            <TabsContent value="preview" className="space-y-2 pt-2">
              <Label>Reader Preview</Label>
              <BlogContentFrame html={previewContent} className="w-full rounded-xl border border-border bg-white" />
              <p className="text-xs text-muted-foreground">Preview updates from your HTML and supports imported fonts in content styles.</p>
            </TabsContent>

            <TabsContent value="split" className="space-y-2 pt-2">
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="blog-html-content-split">HTML Content</Label>
                  <Textarea
                    id="blog-html-content-split"
                    placeholder="Write semantic HTML and styles"
                    value={htmlContent}
                    onChange={(event) => setHtmlContent(event.target.value)}
                    className="min-h-[500px] font-mono text-xs"
                    disabled={isPublishing}
                    spellCheck={false}
                  />
                </div>
                <div className="min-w-0 space-y-2">
                  <Label>Live Preview</Label>
                  <BlogContentFrame html={previewContent} className="w-full rounded-xl border border-border bg-white" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label>Media Block Composer</Label>
            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="media-url">Image URL</Label>
                  <Input
                    id="media-url"
                    value={mediaUrl}
                    onChange={(event) => setMediaUrl(event.target.value)}
                    placeholder="https://cdn.example.com/image.webp"
                    disabled={isPublishing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="media-target-url">Click-through URL (optional)</Label>
                  <Input
                    id="media-target-url"
                    value={mediaTargetUrl}
                    onChange={(event) => setMediaTargetUrl(event.target.value)}
                    placeholder="https://example.com/case-study"
                    disabled={isPublishing}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="media-alt">Alt Text</Label>
                  <Input
                    id="media-alt"
                    value={mediaAlt}
                    onChange={(event) => setMediaAlt(event.target.value)}
                    placeholder="Describe the image for accessibility"
                    disabled={isPublishing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Layout Width</Label>
                  <Select value={mediaLayout} onValueChange={(value) => setMediaLayout(value as MediaLayout)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select layout width" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="wide">Wide</SelectItem>
                      <SelectItem value="full">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="media-caption">Caption</Label>
                <Textarea
                  id="media-caption"
                  value={mediaCaption}
                  onChange={(event) => setMediaCaption(event.target.value)}
                  placeholder="Add a meaningful caption"
                  className="min-h-[90px]"
                  disabled={isPublishing}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={appendMediaBlock} disabled={isPublishing || !mediaUrl.trim()}>
                  <ImagePlus className="size-4" data-icon="inline-start" /> Insert Figure Block
                </Button>
                <Badge variant="secondary" className="text-xs">
                  <Link2 className="size-3.5" data-icon="inline-start" /> URL-driven media keeps placement and captioning deterministic.
                </Badge>
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPublishing}>
              Cancel
            </Button>
            <Button type="button" onClick={handlePublish} disabled={isPublishing || !title.trim()}>
              {isPublishing ? 'Saving...' : status === 'published' ? 'Publish Post' : 'Save Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
