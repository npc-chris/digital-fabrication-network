import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Calendar, Clock, PaperPlaneRight } from '@phosphor-icons/react/dist/ssr';

import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';
import { getHygraphPosts, type HygraphPost } from '@/lib/hygraph';
import { blogPreviews } from './blog-data';

export const metadata: Metadata = {
  title: 'Blog & Field Notes • Digital Fabrication Network',
  description: 'Technical reports, case studies, and manufacturing protocols from the Digital Fabrication Network.',
};

function VisualCard({
  post,
  variant = 'compact',
  className = '',
}: {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    coverImageUrl: string;
    publishedAt: string;
    readTime: string;
    category: string;
    badge?: string;
  };
  variant?: 'feature' | 'secondary' | 'compact';
  className?: string;
}) {
  const isFeature = variant === 'feature';
  const isSecondary = variant === 'secondary';

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl ${className}`}
    >
      <div
        className={`relative overflow-hidden bg-slate-100 ${
          isFeature ? 'h-72 sm:h-96 lg:h-[420px]' : isSecondary ? 'h-60' : 'h-48'
        }`}
      >
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {isFeature ? (
          <div className="absolute inset-0 bg-gradient-to-t from-[#004873]/90 via-[#004873]/30 to-transparent" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-[#004873]/40 via-transparent to-transparent opacity-60" />
        )}

        {isFeature ? (
          <div className="absolute bottom-0 p-6 sm:p-8 lg:p-10">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
              {post.category || 'Featured Dispatch'}
            </span>
            <h2 className="mt-2 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              {post.title}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-[#cee5ff]">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={16} weight="duotone" />
                {post.readTime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={16} weight="duotone" />
                {post.publishedAt}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className={`flex flex-1 flex-col ${isFeature ? 'p-0' : 'p-6'}`}>
        {!isFeature ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold">
              <span className="uppercase tracking-wider text-[#006098]">
                {post.category}
              </span>
              <span className="text-slate-400">
                {post.readTime}
              </span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-[#191c1e] transition-colors group-hover:text-[#006098]">
              {post.title}
            </h3>
            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 line-clamp-3">
              {post.excerpt}
            </p>
          </>
        ) : null}

        {!isFeature ? (
          <div className="mt-auto flex items-center justify-between pt-5 text-xs font-semibold text-slate-400">
            <span>{post.publishedAt}</span>
            <span className="inline-flex items-center gap-1 font-bold text-[#006098] transition-all group-hover:gap-1.5">
              <span>Read Article</span>
              <ArrowUpRight
                size={14}
                weight="bold"
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export default async function BlogPage() {
  const hygraphPosts = await getHygraphPosts();

  // If no posts from Hygraph, use rich static articles from blog-data.ts
  const posts =
    hygraphPosts.length > 0
      ? hygraphPosts
      : blogPreviews.map((p) => ({
          id: p.slug,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          htmlContent: '',
          coverImageUrl: p.imageUrl,
          publishedAt: p.publishedAt,
          readTime: p.readTime,
          category: p.category,
          badge: p.badge,
          author: { name: 'DFN Research Desk' },
          tags: [p.category],
        }));

  const featured = posts[0];
  const secondary = posts[1];
  const gridPosts = posts.slice(2);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      <LandingNavbar active="blog" />

      <main className="pt-14 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-12 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -left-40 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-sky-400/15 to-blue-600/10 blur-[120px] opacity-70" />
            <div className="absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-sky-300/15 via-blue-500/10 to-indigo-500/5 blur-[140px] opacity-80" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-black tracking-tight text-[#191c1e] sm:text-5xl lg:text-6xl">
                Field Notes &amp; Dispatches
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
                Technical reports, case studies, and manufacturing protocols from the Digital Fabrication Network.
              </p>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:px-8 md:grid-cols-12">
            {featured ? (
              <div className={secondary ? 'md:col-span-8' : 'md:col-span-12'}>
                <VisualCard post={featured} variant="feature" />
              </div>
            ) : null}

            {secondary ? (
              <div className="md:col-span-4">
                <VisualCard post={secondary} variant="secondary" />
              </div>
            ) : null}

            {gridPosts.map((post) => (
              <div key={post.slug} className="md:col-span-4">
                <VisualCard post={post} variant="compact" />
              </div>
            ))}
          </section>
        ) : (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm md:p-16">
              <h2 className="text-xl font-bold tracking-tight text-[#191c1e] sm:text-2xl">
                No dispatches published yet
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                Our research team and fabrication engineers are currently preparing initial field notes. Check back soon for new articles.
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5"
                >
                  <span>Return to Home</span>
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Newsletter / Stay Synchronized Section */}
        <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[#004873] p-8 text-white shadow-xl sm:p-12 lg:p-14 md:flex md:items-center md:justify-between md:gap-12">
            <div className="relative z-10 max-w-xl">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                Stay Synchronized
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-sky-100">
                Join engineers receiving bi-weekly deep dives into digital fabrication, decentralized manufacturing, and local hardware development.
              </p>
            </div>

            <div className="relative z-10 mt-6 flex w-full flex-col gap-3 sm:flex-row md:mt-0 md:w-auto">
              <input
                type="email"
                placeholder="work@engineering.com"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm text-white shadow-sm outline-none placeholder:text-white/50 focus:border-white focus:bg-white/20 sm:w-72"
              />
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#004873] shadow-md transition-all hover:bg-slate-100 active:scale-95"
              >
                <PaperPlaneRight size={16} weight="bold" />
                <span>Subscribe</span>
              </button>
            </div>

            <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
