import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Bell, CalendarDays, Clock3, Menu, Send, Sparkles } from 'lucide-react';
import { Inter } from 'next/font/google';

import { blogPreviews } from './blog-data';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Field Notes & Dispatches | DFN Lab',
  description: 'A Stitch-faithful placeholder blog home for DFN, ready for Notion-backed articles.',
};

const labelStyle = 'inline-flex items-center rounded-full px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.24em]';

function VisualCard({ preview, className = '' }: { preview: (typeof blogPreviews)[number]; className?: string }) {
  const isFeature = preview.variant === 'feature';
  const isQuote = preview.variant === 'quote';
  const isSecondary = preview.variant === 'secondary';

  return (
    <Link
      href={`/blog/${preview.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_20px_40px_rgba(0,96,152,0.06)] transition-transform duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className={`relative overflow-hidden ${isFeature ? 'h-[480px]' : isSecondary ? 'h-64' : 'h-48'}`}>
        <img
          src={preview.imageUrl}
          alt={preview.imageAlt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {isFeature ? <div className="absolute inset-0 bg-gradient-to-t from-[#004873]/85 via-[#004873]/30 to-transparent" /> : null}
        {!isFeature ? <div className="absolute inset-0 bg-gradient-to-t from-[#004873]/50 via-transparent to-transparent opacity-70" /> : null}

        {isFeature ? (
          <div className="absolute bottom-0 p-10">
            <span className={`${labelStyle} bg-[#cee5ff] text-[#004a77]`}>{preview.badge}</span>
            <h2 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white">{preview.title}</h2>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-medium text-[#cee5ff]">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-4" />
                {preview.readTime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {preview.publishedAt}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className={`flex flex-1 flex-col ${isFeature ? 'p-0' : 'p-6 lg:p-8'}`}>
        {!isFeature ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className={`${labelStyle} bg-[#cee5ff] text-[#004a77]`}>{preview.category}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#717881]">{preview.readTime}</span>
            </div>
            <h3 className={`font-bold tracking-tight text-[#191c1e] ${isQuote ? 'text-2xl italic' : 'text-xl'}`}>{preview.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#414750]">{preview.excerpt}</p>
          </>
        ) : null}

        {!isFeature ? (
          <div className="mt-auto flex items-center justify-between pt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#717881]">
            <span>{preview.publishedAt}</span>
            <ArrowUpRight className="size-4 text-[#004873] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const [featured, secondary, firstGrid, secondGrid, thirdGrid] = blogPreviews;

  return (
    <div className={`${inter.className} min-h-screen bg-[#f7f9fb] text-[#191c1e]`}>
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-[#f7f9fb]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xl font-extrabold tracking-tight text-[#191c1e]">DFN Lab</p>
            </div>
            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/blog" className="border-b-2 border-[#006098] pb-1 text-sm font-bold text-[#006098]">
                Field Notes
              </Link>
              <Link href="/blog" className="text-sm font-medium text-[#414750] transition-colors hover:text-[#006098]">
                Fabrication Logs
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="rounded-full p-2 text-[#414750] transition-colors hover:bg-white hover:text-[#006098]" aria-label="Notifications">
              <Bell className="size-5" />
            </button>
            <Link
              href={featured.notionUrl}
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[0.99] active:scale-95 sm:inline-flex"
            >
              <Sparkles className="size-4" />
              Write Post
            </Link>
            <button type="button" className="rounded-full p-2 text-[#414750] transition-colors hover:bg-white md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="pb-20 pt-24">
        <section className="mx-auto mb-16 max-w-7xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className={`${labelStyle} mb-4 bg-[#cee5ff] text-[#004a77]`}>Engineering Journal</span>
              <h1 className="max-w-xl text-5xl font-extrabold leading-[0.95] tracking-tight text-[#191c1e] sm:text-6xl lg:text-7xl">
                Field Notes &amp;
                <br />
                Dispatches
              </h1>
            </div>

            <div className="flex gap-2 overflow-x-auto rounded-2xl bg-[#f2f4f6] p-1.5">
              {['All Disciplines', 'Mechanical', 'Electronics', 'Robotics', 'Software'].map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={[
                    'whitespace-nowrap rounded-xl px-5 py-2 text-sm transition-colors',
                    index === 0
                      ? 'bg-white font-bold text-[#004873] shadow-sm'
                      : 'font-medium text-[#414750] hover:bg-[#e6e8ea]',
                  ].join(' ')}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <VisualCard preview={featured} />
          </div>
          <div className="md:col-span-4">
            <VisualCard preview={secondary} />
          </div>

          <div className="md:col-span-4">
            <VisualCard preview={firstGrid} />
          </div>
          <div className="md:col-span-4 border-b-4 border-[#004873]">
            <VisualCard preview={secondGrid} />
          </div>
          <div className="md:col-span-4">
            <VisualCard preview={thirdGrid} />
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#f2f4f6] p-12 shadow-[0_20px_40px_rgba(0,96,152,0.06)] md:flex md:items-center md:justify-between md:gap-12">
            <div className="relative z-10 max-w-xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">Stay Synchronized.</h2>
              <p className="mt-4 text-lg leading-relaxed text-[#414750]">
                Join 15,000+ engineers receiving bi-weekly deep dives into the future of digital fabrication.
              </p>
            </div>

            <div className="relative z-10 mt-8 flex w-full flex-col gap-3 sm:flex-row md:mt-0 md:w-auto">
              <input
                type="email"
                placeholder="work@engineering.com"
                className="w-full rounded-xl border border-[#e6e8ea] bg-white px-6 py-4 text-sm text-[#191c1e] shadow-sm outline-none transition-shadow placeholder:text-[#64748b] focus:shadow-[0_0_0_2px_rgba(0,122,191,0.25)] sm:w-80"
              />
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-8 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[0.99] active:scale-95"
              >
                <Send className="size-4" />
                Subscribe
              </button>
            </div>

            <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-[#006098]/5 blur-3xl" />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-12 md:flex-row">
          <div>
            <p className="text-lg font-black tracking-tight text-[#191c1e]">DFN LAB</p>
            <p className="text-xs uppercase tracking-[0.24em] text-[#717881]">© 2024 DFN Lab. Precision Engineered Content.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-xs font-medium uppercase tracking-[0.24em] text-[#717881]">
            <Link href="/blog" className="transition-colors hover:text-[#006098]">
              Privacy
            </Link>
            <Link href="/blog" className="transition-colors hover:text-[#006098]">
              Terms
            </Link>
            <Link href="/blog" className="transition-colors hover:text-[#006098]">
              Archive
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

