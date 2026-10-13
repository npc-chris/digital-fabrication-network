import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
} from '@phosphor-icons/react/dist/ssr';

import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';
import { getHygraphPostBySlug, getHygraphPosts, type HygraphPost } from '@/lib/hygraph';
import BlogContentFrame from '@/components/blog/BlogContentFrame';
import { blogArticles, blogPreviews } from '../blog-data';

type BlogArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function resolvePost(slug: string): Promise<HygraphPost | null> {
  const remotePost = await getHygraphPostBySlug(slug);
  if (remotePost) return remotePost;

  // Fallback to static articles from blog-data
  const localArticle = blogArticles[slug];
  if (localArticle) {
    return {
      id: localArticle.slug,
      slug: localArticle.slug,
      title: localArticle.title,
      excerpt: localArticle.subtitle || localArticle.intro || '',
      htmlContent: `<p>${localArticle.intro}</p>` + localArticle.paragraphs.map((p) => `<p>${p}</p>`).join(''),
      coverImageUrl: localArticle.heroImageUrl,
      publishedAt: localArticle.publishedAt,
      readTime: localArticle.readTime,
      category: localArticle.category,
      badge: localArticle.badge,
      author: {
        name: localArticle.authorName,
        role: localArticle.authorRole,
      },
      tags: localArticle.tags,
    };
  }

  // Fallback to blogPreviews if available
  const preview = blogPreviews.find((p) => p.slug === slug);
  if (preview) {
    return {
      id: preview.slug,
      slug: preview.slug,
      title: preview.title,
      excerpt: preview.excerpt,
      htmlContent: `<p>${preview.excerpt}</p>`,
      coverImageUrl: preview.imageUrl,
      publishedAt: preview.publishedAt,
      readTime: preview.readTime,
      category: preview.category,
      badge: preview.badge,
      author: {
        name: 'DFN Research Desk',
      },
      tags: [preview.category],
    };
  }

  return null;
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await resolvePost(slug);

  if (!post) {
    return {
      title: 'Article Not Found • Digital Fabrication Network',
    };
  }

  return {
    title: `${post.title} • Digital Fabrication Network`,
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
  const post = await resolvePost(slug);

  if (!post) {
    notFound();
  }

  // Get other recent posts for the recommendations section
  const remotePosts = await getHygraphPosts();
  const allPosts =
    remotePosts.length > 0
      ? remotePosts
      : blogPreviews.map((p) => ({
          id: p.slug,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          coverImageUrl: p.imageUrl,
          publishedAt: p.publishedAt,
          readTime: p.readTime,
          category: p.category,
        }));

  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      <LandingNavbar active="blog" />

      <main className="pt-14">
        {/* Article Hero Banner */}
        <section className="relative flex min-h-[440px] items-center overflow-hidden bg-[#191c1e]">
          <div className="absolute inset-0 opacity-40">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#191c1e] via-[#191c1e]/60 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="mb-4">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-300 transition-colors hover:text-white"
                >
                  <ArrowLeft size={14} weight="bold" />
                  <span>Back to Field Notes</span>
                </Link>
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-[#cee5ff] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#004a77]">
                <span>{post.category}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>

              <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                {post.title}
              </h1>

              {post.excerpt ? (
                <p className="max-w-3xl text-base sm:text-lg font-normal leading-relaxed text-slate-200">
                  {post.excerpt}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-white/10 pt-4 text-xs font-medium text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={16} weight="duotone" />
                  {post.publishedAt}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={16} weight="duotone" />
                  {post.readTime}
                </span>
                {post.author?.name ? (
                  <span>
                    By <strong className="text-white">{post.author.name}</strong>
                    {post.author.role ? ` (${post.author.role})` : ''}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <article className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 md:p-12">
              <BlogContentFrame html={post.htmlContent} />

              {/* Tags Section */}
              {post.tags && post.tags.length > 0 ? (
                <div className="mt-12 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
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
          <section className="border-t border-slate-200 bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#006098]">
                    Continue Reading
                  </span>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#191c1e]">
                    Related Field Notes
                  </h3>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#006098] hover:underline"
                >
                  <span>View All</span>
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#f7f9fb] p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                  >
                    <div>
                      <div className="mb-2.5 flex items-center justify-between text-xs font-semibold">
                        <span className="uppercase tracking-wider text-[#006098]">
                          {related.category}
                        </span>
                        <span className="text-slate-400">{related.readTime}</span>
                      </div>
                      <h4 className="text-lg font-bold text-[#191c1e] transition-colors group-hover:text-[#006098]">
                        {related.title}
                      </h4>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2">
                        {related.excerpt}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-200/70 text-xs font-bold text-[#006098]">
                      <span>Read Dispatch</span>
                      <ArrowRight size={13} weight="bold" className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Newsletter CTA */}
        <section className="bg-[#f2f4f6] py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-[#004873] p-8 text-center text-white shadow-xl sm:p-12">
              <div className="relative z-10 max-w-xl mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
                  Stay Synchronized
                </span>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  Engineering Dispatches in Your Inbox
                </h2>
                <p className="mt-3 text-sm sm:text-base text-sky-100 leading-relaxed">
                  Subscribe to our weekly Field Notes for deep dives into hardware innovation, fabrication protocols, and regional manufacturing.
                </p>
                <form className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    placeholder="work@engineering.com"
                    className="flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-white focus:bg-white/20"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#004873] shadow-md transition-all hover:bg-slate-100"
                  >
                    <span>Subscribe</span>
                    <ArrowRight size={14} weight="bold" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
