'use client';

import Link from 'next/link';
import { EnvelopeSimple, GithubLogo, ArrowUpRight } from '@phosphor-icons/react';
import Logo from '@/components/Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-[#f7f9fb] text-[#191c1e]">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12">
          {/* Brand and Mission Column */}
          <div className="space-y-4 md:col-span-5 lg:col-span-5">
            <Link href="/" className="inline-block">
              <Logo variant="responsive" className="h-9 w-auto" />
            </Link>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-600">
              Digital infrastructure and manufacturing intelligence for local production and hardware innovation across Nigeria and West Africa.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="mailto:support@digitalfabricationnetwork.com"
                aria-label="Email Support"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-[#006098] hover:text-[#006098] hover:-translate-y-0.5"
              >
                <EnvelopeSimple size={18} weight="duotone" />
              </a>
              <a
                href="https://github.com/npc-chris/digital-fabrication-network"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-[#006098] hover:text-[#006098] hover:-translate-y-0.5"
              >
                <GithubLogo size={18} weight="duotone" />
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7 lg:col-span-7">
            {/* Column 1: Platform */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Platform
              </div>
              <ul className="space-y-2.5 text-sm font-medium text-slate-600">
                <li>
                  <Link href="/" className="transition-colors hover:text-[#006098]">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/prototyping" className="transition-colors hover:text-[#006098]">
                    Prototyping
                  </Link>
                </li>
                <li>
                  <Link href="/research" className="transition-colors hover:text-[#006098]">
                    Research
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="inline-flex items-center gap-1 transition-colors hover:text-[#006098]">
                    <span>Field Notes</span>
                    <ArrowUpRight size={12} weight="bold" className="text-slate-400" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Ecosystem */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ecosystem
              </div>
              <ul className="space-y-2.5 text-sm font-medium text-slate-600">
                <li>
                  <Link href="/manifesto" className="transition-colors hover:text-[#006098]">
                    Manifesto
                  </Link>
                </li>
                <li>
                  <Link href="/stakeholders" className="transition-colors hover:text-[#006098]">
                    Stakeholders
                  </Link>
                </li>
                <li>
                  <Link href="/coming-soon" className="transition-colors hover:text-[#006098]">
                    Pioneer Cohort
                  </Link>
                </li>
                <li>
                  <Link href="/coming-soon" className="transition-colors hover:text-[#006098]">
                    Priority Waitlist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Connect & Support */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Support
              </div>
              <ul className="space-y-2.5 text-sm font-medium text-slate-600">
                <li>
                  <a
                    href="mailto:support@digitalfabricationnetwork.com"
                    className="transition-colors hover:text-[#006098]"
                  >
                    Contact Support
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/npc-chris/digital-fabrication-network"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 transition-colors hover:text-[#006098]"
                  >
                    <span>Open Source</span>
                    <ArrowUpRight size={12} weight="bold" className="text-slate-400" />
                  </a>
                </li>
                <li>
                  <Link href="/manifesto" className="transition-colors hover:text-[#006098]">
                    Terms & Vision
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 text-xs font-medium text-slate-500 sm:flex-row">
          <p>© {currentYear} Digital Fabrication Network. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Nigeria & Pan-African Initiative</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Beta Version 1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
