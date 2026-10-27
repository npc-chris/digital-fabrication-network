import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
} from '@phosphor-icons/react/dist/ssr';
import DOMPurify from 'isomorphic-dompurify';

import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';
import { getHygraphPostBySlug, getHygraphPosts, type HygraphPost } from '@/lib/hygraph';

type BlogArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function resolvePost(slug: string): Promise<HygraphPost | null> {
  return await getHygraphPostBySlug(slug);
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

  // Get other authentic published posts for recommendations
  const allPosts = await getHygraphPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  // Sanitize CMS HTML to prevent XSS vulnerabilities
  const sanitizedHtml = DOMPurify.sanitize(post.htmlContent, {
    USE_PROFILES: { html: true },
  });

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      <LandingNavbar active="blog" />

      <main className="pt-14">
        {/* Article Hero Banner */}
        <section className="relative flex min-h-[380px] sm:min-h-[420px] items-center overflow-hidden bg-[#191c1e]">
          <div className="absolute inset-0 opacity-40">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#191c1e] via-[#191c1e]/60 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="max-w-4xl">
              <div className="mb-4">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-300 transition-colors hover:text-white"
                >
                  <ArrowLeft size={14} weight="bold" />
                  <span>Back to Dispatches</span>
                </Link>
              </div>

              {/* Editorial metadata - clean text without pill container */}
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-200">
                <span>{post.category}</span>
                <span className="text-sky-400">•</span>
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
        <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 md:p-12 shadow-xs">
              {sanitizedHtml ? (
                <div
                  className="article-content prose prose-slate max-w-none text-[#191c1e]"
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              ) : (
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Tags Section */}
              {post.tags && post.tags.length > 0 ? (
                <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
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

        {/* Related Posts Recommendation - only authentic Hygraph posts */}
        {relatedPosts.length > 0 ? (
          <section className="border-t border-slate-200 bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#191c1e]">
                    Related Dispatches
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

        {/* Unified Bottom CTA */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[#004873] p-7 text-white shadow-sm md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Follow the Engineering Dispatches
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-sky-100">
                Technical articles on distributed manufacturing, CNC protocols, and hardware case studies.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-[#004873] shadow-sm transition-all hover:bg-slate-100 shrink-0"
            >
              <span>Explore All Articles</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
