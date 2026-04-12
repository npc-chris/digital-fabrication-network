'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { verifySession } from '@/lib/auth';

export default function StakeholdersPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    verifySession().then(({ isAuthenticated }) => {
      setIsCheckingAuth(false);
    });
  }, [router]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-sky-700"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#191c1e] antialiased">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        body {
          font-family: 'Inter', sans-serif;
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
        }

        .material-symbols-filled {
          font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
        }

        @keyframes navEnter {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .nav-enter {
          animation: navEnter 700ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .reveal-up {
          opacity: 0;
          animation: revealUp 800ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .delay-1 {
          animation-delay: 120ms;
        }

        .delay-2 {
          animation-delay: 220ms;
        }

        .delay-3 {
          animation-delay: 320ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .nav-enter,
          .reveal-up {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <header className="nav-enter fixed top-0 z-50 w-full border-b border-slate-200 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/favicon.png"
              alt="DFN logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg ring-1 ring-slate-200"
            />
            <span className="text-base font-black tracking-tight text-sky-900 sm:text-lg">DFN</span>
            <span className="hidden text-sm font-semibold text-slate-600 lg:inline">Digital Fabrication Network</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-slate-600 transition-colors hover:text-sky-900">
              Home
            </Link>
            <Link href="/forum" className="text-sm font-medium text-slate-600 transition-colors hover:text-sky-900">
              Research
            </Link>
            <Link href="/services" className="text-sm font-medium text-slate-600 transition-colors hover:text-sky-900">
              Prototyping
            </Link>
            <Link href="/stakeholders" className="border-b-2 border-sky-700 pb-1 text-sm font-bold text-sky-700">
              Stakeholders
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-sky-800">
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
            >
              Join Network
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#f7f9fb] py-24 md:py-32">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="z-10">
              <span className="inline-block rounded-full bg-[#cee5ff] px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-[#004a77]">
                Ecosystem Synergy
              </span>
              <h1 className="reveal-up mb-8 text-5xl font-black leading-[0.9] tracking-tight text-[#191c1e] md:text-7xl">
                Building the <br />
                <span className="text-[#006098]">Future Together</span>
              </h1>
              <p className="reveal-up delay-1 mb-10 max-w-lg text-lg leading-relaxed text-slate-600 sm:text-xl">
                The Digital Fabrication Network connects industry leaders, policy architects, and capital to catalyze the next era of West African hardware manufacturing.
              </p>
              <div className="reveal-up delay-2 flex flex-wrap gap-4">
                <Link
                  href="/auth/register"
                  className="rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-sky-500/30"
                >
                  Partner With Us
                </Link>
                <Link
                  href="/about"
                  className="rounded-xl border border-slate-300 bg-white px-8 py-4 font-bold text-[#004873] transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  View Our Manifesto
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3o8LHCSKiC7ROSihdECsGD1UB8mwehbxscZn_vkXEUKh6tzU-4b2RN0UQ_j3ke_znZSSUUK_wDQvvuztMJkvIMP--1_GTqj5K8Mjjh44OC7jkFBxjG3fQTODibYhnUiIBt2vQyRgxQLnNhETX8I4xjYyLsCBowGSvSAgJKBSgV19NkUyp75P8-uOXxdVmbIGc-4HmyvZxdnW3tSHcEeExZKKMlWmMgy43BZZAgFDpHiIh9JLPgYkCkjNPxMZOIizoUwvclhTwwxU"
                  alt="Close up of high precision industrial robotic arm in a clean lab setting"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 max-w-xs rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-4">
                  <div className="rounded-xl bg-sky-100 p-3">
                    <span className="material-symbols-outlined text-[#006098]">hub</span>
                  </div>
                  <div className="text-sm font-bold">About 100 Active Lab Nodes*</div>
                </div>
                <p className="text-xs text-slate-600">Connecting regional fabrication centers with global standard protocols by the end of the year.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stakeholder Bento Grid */}
        <section className="bg-[#f2f4f6] py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-20 text-center">
              <h2 className="mb-4 text-4xl font-black tracking-tight text-[#191c1e]">Core Stakeholder Pillars</h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Our network thrives through specialized engagement with three critical sectors of the industrial value chain.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-12">
              {/* Manufacturers */}
              <div className="group relative overflow-hidden rounded-[2rem] bg-white p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl md:col-span-8">
                <div className="flex flex-col">
                  <div className="mb-8 flex items-start justify-between">
                    <div className="rounded-2xl bg-sky-100 p-4">
                      <span className="material-symbols-outlined text-3xl text-[#006098]">precision_manufacturing</span>
                    </div>
                    <span className="text-sm font-medium text-slate-600">Industrial Efficiency</span>
                  </div>
                  <h3 className="mb-4 text-3xl font-bold">Manufacturers</h3>
                  <p className="mb-8 max-w-md text-lg text-slate-600">
                    Optimizing factory throughput through decentralized digital tooling and standardized fabrication protocols.
                  </p>
                  <div className="mt-auto grid grid-cols-2 gap-6">
                    <div className="rounded-xl bg-[#f2f4f6] p-4">
                      <div className="mb-1 text-2xl font-black text-[#006098]">24%</div>
                      <div className="text-xs font-bold uppercase text-slate-600">Lead Time Reduction</div>
                    </div>
                    <div className="rounded-xl bg-[#f2f4f6] p-4">
                      <div className="mb-1 text-2xl font-black text-[#006098]">Local</div>
                      <div className="text-xs font-bold uppercase text-slate-600">Supply Resiliency</div>
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-10">
                  <img
                    src="https://www.thecable.ng/wp-content/uploads/2026/02/Shettima-at-NIP-launch.jpeg"
                    alt="Abstract blueprint and technical lines"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Policy Makers */}
              <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#006098] to-[#007abf] p-10 text-white md:col-span-4">
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="mb-8 w-fit rounded-2xl bg-white/10 p-4">
                      <span className="material-symbols-outlined text-3xl text-white">gavel</span>
                    </div>
                    <h3 className="mb-4 text-3xl font-bold">Policy Makers</h3>
                    <p className="mb-8 text-lg opacity-90">
                      Informing industrial strategy with real-time manufacturing data and economic mobility insights.
                    </p>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Regulatory Sandboxes
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Standard Harmonization
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Workforce Analytics
                    </li>
                  </ul>
                </div>
              </div>

              {/* Investors */}
              <div className="group flex flex-col gap-12 rounded-[2rem] border border-slate-200 bg-white p-12 shadow-sm lg:flex-row lg:items-center md:col-span-12">
                <div className="lg:w-1/2">
                  <div className="mb-8 w-fit rounded-2xl bg-slate-100 p-4">
                    <span className="material-symbols-outlined text-3xl text-[#006098]">monetization_on</span>
                  </div>
                  <h3 className="mb-6 text-4xl font-black">Investors</h3>
                  <p className="mb-8 text-xl leading-relaxed text-slate-600">
                    Supporting West African hardware innovation through de-risked venture pathways and shared infrastructure models.
                  </p>
                  <Link href="/about" className="inline-flex items-center gap-2 font-bold text-[#006098] transition-all hover:gap-4">
                    Invest in the Hardware Stack
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:w-1/2">
                  <div className="aspect-video overflow-hidden rounded-2xl">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGKgcQu53JmKE6E_szURcOIC0SoL8ll5JjjdTO2eiquCtkX9CZgvWwvLNe_OSgOzZWSX_9VUibKgxsvS8gky2W2lojYQ5A9OHez-9fLisKg_Plv9BMOxkUEEsruzSqwt-sBzsO6PD4WvyRINA3_Wc14zXrIUBJDqj1gVWd0yiGiHHxx5K8x40rQsWeed3MI5Su9q402ii93_KsGAfuTYywlQTVE_-8wEzvvOnFw0HVaC6IB3qapEiFKR4GV-sTQkZrVtaTyj0kBGA"
                      alt="Financial data dashboard"
                      className="h-full w-full object-cover grayscale transition-all hover:grayscale-0"
                    />
                  </div>
                  <div className="mt-8 aspect-video overflow-hidden rounded-2xl">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXSp8RMt3-Z-fN9ZOSHaTy96ZLxrKaX4Oaj65QJe4l82mB2vDiXTZgyU5WR_ZSTMnVLepiS-FZ4UKym_zWbcT-yaj8ZB28QloT_XQMRl02qaKTZhlLc2_VBDySpe1PFTDJhfYnS7kekrrPwrLWLqdlGP3Tg7zSmW1fuwhhb1_ewieckjgb_fmxJecDJ7Y9emj3nxZfZA2nqvf2YqGrt0Nr1uA8LcyEOotfO7j1Dxq1_bq--CQfvWSYajjnmDnJvjkWyecgemhhq0M"
                      alt="Conceptual modern city skyline"
                      className="h-full w-full object-cover grayscale transition-all hover:grayscale-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white py-24">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#006098] to-[#007abf] px-12 py-16 text-center">
              <div className="absolute inset-0 opacity-10">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwdfdm8DxMTeK8u3C10fOaH3uv5jpX3L9tzA5v0nplG9Qe4xkK-lxVcktQXIGohzs8VolbxC2fe2-dYtRPQeIzAxB2qoLlrXkeRnIEtXeFhX1XpiU6UH7zIvBadEMnxGdUs7l646E03ApiOVl5Y2c2bKWA7w0eSEWnf1unrS9UAnUxPYQHKMZwLxaJW6_8W15AmdF0LOALHMBt31gd1kRLSxTcUkyWqHAOh3u98_dbuDSwCRfA__ummDDmp1y1dayNSnI0XIAQoY8"
                  alt="Blurred industrial workshop"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative z-10">
                <h2 className="mb-6 text-4xl font-black text-white md:text-5xl">Join the Digital Fabrication Network</h2>
                <p className="mb-10 mx-auto max-w-2xl text-lg text-white/80">
                  Access the collective intelligence and hardware infrastructure of the continent's most advanced fab-lab ecosystem.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                  <Link
                    href="/auth/register"
                    className="rounded-xl bg-white px-10 py-4 font-black text-[#006098] transition-colors hover:bg-slate-100"
                  >
                    Become a Member
                  </Link>
                  <Link
                    href="/about"
                    className="rounded-xl border-2 border-white/30 px-10 py-4 font-black text-white transition-colors hover:bg-white/10"
                  >
                    Download Ecosystem Map
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row lg:px-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/favicon.png"
                alt="DFN logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-md ring-1 ring-slate-200"
              />
              <span className="text-lg font-bold text-slate-900">DFN</span>
            </div>
            <p className="max-w-xs text-sm font-medium leading-relaxed text-slate-500">
              © {new Date().getFullYear()} Digital Fabrication Network. All rights reserved. Precision Engineering and Design.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-slate-500 sm:gap-8">
            <Link href="/about" className="transition-colors hover:text-sky-700">
              About DFN
            </Link>
            <Link href="/services" className="transition-colors hover:text-sky-700">
              Technical Specs
            </Link>
            <Link href="/settings" className="transition-colors hover:text-sky-700">
              Privacy Policy
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
    </div>
  );
}
