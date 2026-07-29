import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-block">
              <Logo variant="responsive" className="h-9 w-auto" />
            </Link>
          </div>
          <p className="max-w-xs text-sm font-medium leading-relaxed text-slate-500">
            © {new Date().getFullYear()} Digital Fabrication Network. All rights reserved. Precision Engineering and Design.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-slate-500 sm:gap-8">
          <Link href="/manifesto" className="transition-colors hover:text-sky-700">
            About DFN
          </Link>
          <Link href="/prototyping" className="transition-colors hover:text-sky-700">
            Technical Specs
          </Link>
          <Link href="/research" className="transition-colors hover:text-sky-700">
            Research
          </Link>
          <Link href="/auth/register" className="transition-colors hover:text-sky-700">
            Contact Support
          </Link>
        </nav>

        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 transition-opacity hover:opacity-100">
            <span className="material-symbols-outlined">language</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 transition-opacity hover:opacity-100">
            <span className="material-symbols-outlined">share</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
