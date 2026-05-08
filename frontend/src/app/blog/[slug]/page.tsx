import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Bookmark,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Menu,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Inter } from 'next/font/google';

import { articleBySlug, blogArticles } from '../blog-data';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

type BlogArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug.get(slug);

  if (!article) {
    return {
      title: 'Blog Article | DFN Lab',
    };
  }

  return {
    title: `${article.title} | DFN Lab`,
    description: article.subtitle,
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const article = articleBySlug.get(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className={`${inter.className} min-h-screen bg-[#f7f9fb] text-[#191c1e]`}>
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-[#f7f9fb]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/blog" className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-[#191c1e]">DFN Lab</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/blog" className="border-b-2 border-[#006098] pb-1 text-sm font-semibold text-[#006098]">
              Field Notes
            </Link>
            <Link href="/blog" className="text-sm font-medium text-[#414750] transition-colors hover:text-[#006098]">
              Fabrication Logs
            </Link>
            <Link href="/blog" className="text-sm font-medium text-[#414750] transition-colors hover:text-[#006098]">
              Research
            </Link>
            <Link href="/blog" className="text-sm font-medium text-[#414750] transition-colors hover:text-[#006098]">
              Archives
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[0.99] active:scale-95 lg:inline-flex"
            >
              <Sparkles className="size-4" />
              Subscribe
            </Link>
            <button type="button" className="rounded-lg p-2 text-[#414750] transition-colors hover:bg-white md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative flex min-h-[819px] items-center overflow-hidden bg-[#191c1e]">
          <div className="absolute inset-0 opacity-60">
            <img src={article.heroImageUrl} alt={article.heroImageAlt} className="h-full w-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f7f9fb] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
            <div className="max-w-4xl">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-[#cee5ff] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-[#004a77]">
                {article.category} • {article.readTime}
              </div>
              <h1 className="mb-8 text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl">{article.title}</h1>
              <p className="max-w-3xl text-2xl font-light leading-relaxed text-white/85">{article.subtitle}</p>

              <div className="mt-8 flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-[#006098] bg-white/10 text-xl font-bold text-white">
                  {article.authorName
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </div>
                <div className="text-white">
                  <p className="text-xl font-semibold">{article.authorName}</p>
                  <p className="text-sm text-white/60">{article.authorRole}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <article className="relative mx-auto grid max-w-7xl grid-cols-12 gap-12 px-6 py-24">
          <aside className="sticky top-32 hidden h-fit lg:col-span-1 lg:block">
            <div className="flex flex-col gap-6 text-[#414750]">
              <button type="button" className="rounded-full p-3 transition-colors hover:bg-[#f2f4f6] hover:text-[#004873]" aria-label="Share">
                <Share2 className="size-5" />
              </button>
              <button type="button" className="rounded-full p-3 transition-colors hover:bg-[#f2f4f6] hover:text-[#004873]" aria-label="Bookmark">
                <Bookmark className="size-5" />
              </button>
              <button type="button" className="rounded-full p-3 transition-colors hover:bg-[#f2f4f6] hover:text-[#004873]" aria-label="Discuss">
                <MessageCircle className="size-5" />
              </button>
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-8 lg:col-start-3">
            <div className="max-w-3xl">
              <p className="mb-12 text-2xl font-light leading-relaxed text-[#414750]">{article.intro}</p>

              <section>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-[#191c1e]">{article.sectionTitle}</h2>

                <div className="mb-8">
                  <div className="float-right mb-4 ml-8 h-48 w-72 overflow-hidden rounded-[1rem] shadow-[0_20px_40px_rgba(0,96,152,0.06)]">
                    <img src={article.figure.imageUrl} alt={article.figure.imageAlt} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  {article.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="mb-6 text-lg leading-relaxed text-[#191c1e]/80">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>

              <figure className="my-16 -mx-6 lg:-mx-24">
                <div className="aspect-[21/9] w-full overflow-hidden rounded-[1rem] bg-[#191c1e] shadow-[0_20px_40px_rgba(0,96,152,0.06)] md:rounded-[1.75rem]">
                  <img src={article.figure.imageUrl} alt={article.figure.imageAlt} className="h-full w-full object-cover opacity-90" loading="lazy" />
                </div>
                <figcaption className="mt-4 flex items-center gap-2 px-6 text-sm text-[#414750] lg:px-24">
                  <ChevronRight className="size-4" />
                  {article.figure.caption}
                </figcaption>
              </figure>

              <blockquote className="relative rounded-[1rem] border-l-4 border-[#004873] bg-[#f2f4f6] px-12 py-12 shadow-[0_20px_40px_rgba(0,96,152,0.06)]">
                <span className="absolute -top-4 left-6 text-5xl font-bold text-[#004873]/20">“</span>
                <p className="text-2xl font-semibold italic leading-snug text-[#004873]">{article.quote.text}</p>
              </blockquote>

              <section className="mt-16">
                <h3 className="mb-8 text-2xl font-bold text-[#191c1e]">Systems worth keeping</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {article.highlights.map((item) => (
                    <div key={item.title} className="flex items-start gap-4 rounded-[1rem] border border-[#e0e3e5]/40 bg-white p-6 shadow-[0_20px_40px_rgba(0,96,152,0.06)]">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#cee5ff] text-[#004873]">
                        <Sparkles className="size-5" />
                      </div>
                      <div>
                        <h4 className="mb-1 text-xl font-bold text-[#191c1e]">{item.title}</h4>
                        <p className="text-[#414750]">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="py-12">
                <h3 className="mb-8 text-2xl font-bold text-[#191c1e]">System Architecture</h3>
                <div className="overflow-hidden rounded-[1.5rem] border border-[#e0e3e5]/40 bg-white p-8 shadow-[0_20px_40px_rgba(0,96,152,0.06)]">
                  <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-[#f2f4f6]">
                    <div className="pointer-events-none absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-5">
                      {Array.from({ length: 18 }).map((_, index) => (
                        <div key={index} className="border border-[#191c1e]" />
                      ))}
                    </div>
                    <div className="z-10 text-center">
                      <div className="mb-4 text-6xl text-[#004873]/30">⌁</div>
                      <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#414750]">Engineering Schematic: Micro-Grid Integration v4.2</p>
                    </div>
                    <img src={article.figure.imageUrl} alt={article.figure.imageAlt} className="absolute inset-0 h-full w-full object-contain p-4" loading="lazy" />
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {article.metrics.map((metric) => (
                      <div key={metric.label} className="rounded-xl bg-[#eceef0] p-3">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-[#004873]">{metric.label}</span>
                        <span className="text-sm font-semibold text-[#191c1e]">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <p className="text-lg leading-relaxed text-[#191c1e]/80">
                  In conclusion, the problem of innovating here is not a lack of talent or ambition. It is the systemic friction that turns every technical step into an uphill battle. The long-term answer is to design for that reality instead of pretending it will disappear.
                </p>
              </section>

              <div className="mt-12 flex flex-col gap-6 border-t border-[#e0e3e5]/60 pt-12 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[#e6e8ea] px-4 py-1.5 text-sm font-medium text-[#191c1e]">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[#414750]">SOURCE:</span>
                  <Link
                    href={article.notionUrl}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e0e3e5] px-4 py-2 text-sm font-medium text-[#004873] transition-colors hover:bg-[#f2f4f6]"
                  >
                    Notion draft placeholder
                    <ExternalLink className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </article>

        <section className="bg-[#f2f4f6] py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#191c1e] p-12 text-center shadow-[0_20px_40px_rgba(0,96,152,0.06)] md:p-20">
              <div className="absolute inset-0 opacity-10">
                <img src={article.heroImageUrl} alt={article.heroImageAlt} className="h-full w-full object-cover" loading="lazy" />
              </div>

              <div className="relative z-10">
                <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Join the Hardware Revolution</h2>
                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/70">
                  Subscribe to our weekly Field Notes for deep dives into the mechanics of building hardware in emerging markets.
                </p>
                <form className="mx-auto flex max-w-md flex-col gap-4 md:flex-row">
                  <input
                    type="email"
                    placeholder="Enter your lab email"
                    className="flex-1 rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-[#006098]"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-8 py-4 font-bold text-white transition-transform hover:scale-[0.99] active:scale-95"
                  >
                    <ArrowLeft className="size-4 rotate-180" />
                    Access Lab Logs
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
            <Link href="/blog" className="underline-offset-4 transition-colors hover:text-[#006098] hover:underline">
              Privacy Policy
            </Link>
            <Link href="/blog" className="underline-offset-4 transition-colors hover:text-[#006098] hover:underline">
              Terms of Service
            </Link>
            <Link href="/blog" className="underline-offset-4 transition-colors hover:text-[#006098] hover:underline">
              Laboratory Access
            </Link>
            <Link href="/blog" className="underline-offset-4 transition-colors hover:text-[#006098] hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
