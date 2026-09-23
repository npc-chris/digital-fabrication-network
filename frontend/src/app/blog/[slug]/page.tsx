import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Sparkle,
  List,
  ShareNetwork,
  BookmarkSimple,
  ChatCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
} from '@phosphor-icons/react/dist/ssr';
import { Inter } from 'next/font/google';

import { getHygraphPostBySlug, getHygraphPosts } from '@/lib/hygraph';
import BlogContentFrame from '@/components/blog/BlogContentFrame';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

type BlogArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getHygraphPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | DFN Lab',
    };
  }

  return {
    title: `${post.title} | DFN Lab`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : [],
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await getHygraphPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get other recent posts for the recommendations section
  const allPosts = await getHygraphPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className={`${inter.className} min-h-screen bg-[#f7f9fb] text-[#191c1e]`}>
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-[#f7f9fb]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/blog" className="flex items-center gap-3">
            <ArrowLeft size={18} weight="bold" className="text-[#004873]" />
            <span className="text-xl font-bold tracking-tight text-[#191c1e]">DFN Lab</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/blog"
              className="border-b-2 border-[#006098] pb-1 text-sm font-semibold text-[#006098]"
            >
              Field Notes
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-[#414750] transition-colors hover:text-[#006098]"
            >
              Fabrication Logs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[0.99] active:scale-95 lg:inline-flex"
            >
              <Sparkle size={16} weight="fill" />
              Subscribe
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-[#414750] transition-colors hover:bg-white md:hidden"
              aria-label="Open menu"
            >
              <List size={20} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative flex min-h-[520px] items-center overflow-hidden bg-[#191c1e]">
          <div className="absolute inset-0 opacity-40">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#191c1e] via-[#191c1e]/60 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-[#cee5ff] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-[#004a77]">
                {post.category} • {post.readTime}
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl md:text-6xl">
                {post.title}
              </h1>
              {post.excerpt ? (
                <p className="max-w-3xl text-xl font-light leading-relaxed text-white/85 sm:text-2xl">
                  {post.excerpt}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-[#006098] bg-white/10 text-lg font-bold text-white">
                  {post.author.avatarUrl ? (
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    post.author.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)
                  )}
                </div>
                <div className="text-white">
                  <p className="text-lg font-semibold">{post.author.name}</p>
                  <p className="text-sm text-white/70">
                    {post.author.role} • {post.publishedAt}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <article className="relative mx-auto grid max-w-7xl grid-cols-12 gap-12 px-6 py-16 sm:py-20">
          <aside className="sticky top-32 hidden h-fit lg:col-span-1 lg:block">
            <div className="flex flex-col gap-6 text-[#414750]">
              <button
                type="button"
                className="rounded-full p-3 transition-colors hover:bg-[#f2f4f6] hover:text-[#004873]"
                aria-label="Share"
              >
                <ShareNetwork size={20} weight="duotone" />
              </button>
              <button
                type="button"
                className="rounded-full p-3 transition-colors hover:bg-[#f2f4f6] hover:text-[#004873]"
                aria-label="Bookmark"
              >
                <BookmarkSimple size={20} weight="duotone" />
              </button>
              <button
                type="button"
                className="rounded-full p-3 transition-colors hover:bg-[#f2f4f6] hover:text-[#004873]"
                aria-label="Discuss"
              >
                <ChatCircle size={20} weight="duotone" />
              </button>
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-10 lg:col-start-3">
            <div className="max-w-3xl">
              {/* Main Content Body */}
              {post.htmlContent ? (
                <div className="w-full">
                  <BlogContentFrame
                    html={post.htmlContent}
                    className="w-full min-h-[400px] border-0 bg-transparent"
                  />
                </div>
              ) : (
                <p className="text-lg leading-relaxed text-[#191c1e]/80">
                  {post.excerpt}
                </p>
              )}

              {/* Tags Section */}
              {post.tags.length > 0 ? (
                <div className="mt-12 flex flex-wrap gap-2 border-t border-[#e0e3e5]/60 pt-8">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#e6e8ea] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#191c1e]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </article>

        {/* Related Posts Recommendation */}
        {relatedPosts.length > 0 ? (
          <section className="border-t border-slate-200/80 bg-white py-16">
            <div className="mx-auto max-w-7xl px-6">
              <h3 className="mb-8 text-2xl font-bold tracking-tight text-[#191c1e]">
                More from DFN Lab
              </h3>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-[#f7f9fb] p-6 shadow-sm transition-transform hover:-translate-y-1"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#006098]">
                        {related.category}
                      </span>
                      <span className="text-xs text-[#717881]">{related.readTime}</span>
                    </div>
                    <h4 className="text-xl font-bold text-[#191c1e] group-hover:text-[#006098]">
                      {related.title}
                    </h4>
                    <p className="mt-2 text-sm text-[#414750] line-clamp-2">
                      {related.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Newsletter CTA */}
        <section className="bg-[#f2f4f6] py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#191c1e] p-10 text-center shadow-[0_20px_40px_rgba(0,96,152,0.06)] md:p-16">
              <div className="relative z-10">
                <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                  Stay Synchronized
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/70">
                  Subscribe to our weekly Field Notes for deep dives into hardware innovation,
                  fabrication logs, and engineering dispatches.
                </p>
                <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-[#006098]"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-6 py-3.5 font-bold text-white transition-transform hover:scale-[0.99] active:scale-95"
                  >
                    <ArrowRight size={16} weight="bold" />
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-[#f7f9fb]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-12 md:flex-row">
          <div className="text-lg font-black tracking-tight text-[#191c1e]">DFN LAB</div>
          <div className="flex flex-wrap gap-8 text-sm font-medium text-[#414750]">
            <Link
              href="/blog"
              className="underline-offset-4 transition-colors hover:text-[#006098] hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/blog"
              className="underline-offset-4 transition-colors hover:text-[#006098] hover:underline"
            >
              Terms of Service
            </Link>
            <Link
              href="/blog"
              className="underline-offset-4 transition-colors hover:text-[#006098] hover:underline"
            >
              Archives
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
