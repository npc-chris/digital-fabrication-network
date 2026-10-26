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
import { blogArticles, blogPreviews, type BlogArticle } from '../blog-data';

type BlogArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ResolvedPostResult = {
  post: HygraphPost;
  localArticle?: BlogArticle;
};

async function resolvePost(slug: string): Promise<ResolvedPostResult | null> {
  const remotePost = await getHygraphPostBySlug(slug);
  if (remotePost) return { post: remotePost };

  // Match local article by slug
  const localArticle = blogArticles.find((a) => a.slug === slug);
  if (localArticle) {
    const post: HygraphPost = {
      id: localArticle.slug,
      slug: localArticle.slug,
      title: localArticle.title,
      excerpt: localArticle.subtitle || localArticle.intro || '',
      htmlContent: '',
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
    return { post, localArticle };
  }

  return null;
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await resolvePost(slug);

  if (!result || !result.post) {
    return {
      title: 'Article Not Found • Digital Fabrication Network',
    };
  }

  const { post } = result;

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
  const result = await resolvePost(slug);

  if (!result || !result.post) {
    notFound();
  }

  const { post, localArticle } = result;

  // Get other recent posts for recommendations
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

              {/* Clean meta without pill container */}
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
              {localArticle ? (
                <div className="space-y-6 text-[#191c1e]">
                  {localArticle.intro ? (
                    <p className="text-base sm:text-lg font-medium leading-relaxed text-slate-700">
                      {localArticle.intro}
                    </p>
                  ) : null}

                  {localArticle.sectionTitle ? (
                    <h2 className="pt-4 text-xl sm:text-2xl font-bold tracking-tight text-[#191c1e]">
                      {localArticle.sectionTitle}
                    </h2>
                  ) : null}

                  {localArticle.paragraphs?.map((p, idx) => (
                    <p key={idx} className="text-sm sm:text-base leading-relaxed text-slate-600">
                      {p}
                    </p>
                  ))}

                  {localArticle.figure ? (
                    <figure className="my-8">
                      <img
                        src={localArticle.figure.imageUrl}
                        alt={localArticle.figure.imageAlt}
                        className="w-full rounded-xl object-cover shadow-xs border border-slate-200"
                        loading="lazy"
                      />
                      {localArticle.figure.caption ? (
                        <figcaption className="mt-2.5 text-center text-xs text-slate-500">
                          {localArticle.figure.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ) : null}

                  {localArticle.quote ? (
                    <blockquote className="my-8 rounded-xl border-l-4 border-[#006098] bg-[#f0f7ff] p-5 sm:p-6">
                      <p className="text-sm sm:text-base font-medium italic text-[#004873]">
                        &ldquo;{localArticle.quote.text}&rdquo;
                      </p>
                      {localArticle.quote.attribution ? (
                        <cite className="mt-2 block text-xs font-semibold text-slate-500 not-italic">
                          — {localArticle.quote.attribution}
                        </cite>
                      ) : null}
                    </blockquote>
                  ) : null}

                  {localArticle.highlights && localArticle.highlights.length > 0 ? (
                    <div className="my-8 grid gap-4 sm:grid-cols-2">
                      {localArticle.highlights.map((h, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-200 bg-[#f7f9fb] p-4 text-xs sm:text-sm"
                        >
                          <h4 className="font-bold text-[#191c1e]">{h.title}</h4>
                          <p className="mt-1 text-slate-600 leading-relaxed">{h.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {localArticle.metrics && localArticle.metrics.length > 0 ? (
                    <div className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {localArticle.metrics.map((m, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-center"
                        >
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            {m.label}
                          </span>
                          <span className="mt-1 block font-mono text-base font-bold text-[#004873]">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : post.htmlContent ? (
                <div
                  className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-600 prose-headings:font-bold prose-headings:text-[#191c1e] prose-a:text-[#006098] prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: post.htmlContent }}
                />
              ) : null}

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

        {/* Related Posts Recommendation */}
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
