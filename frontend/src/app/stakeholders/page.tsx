'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';
import { verifySession } from '@/lib/auth';

export default function StakeholdersPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const statsRef = useRef<HTMLDivElement>(null);

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

      <LandingNavbar active="stakeholders" />

      <main className="pt-14">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-6 pb-12 sm:pt-8 sm:pb-14 lg:pt-10 lg:pb-16">
          {/* Background Ambient Blur & Grid Effect */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-sky-400/20 to-blue-600/10 blur-[120px] opacity-70" />
            <div className="absolute top-1/4 -right-20 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-sky-300/15 via-blue-500/10 to-indigo-500/5 blur-[140px] opacity-80" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>

          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
            <div className="space-y-6">
              <h1 className="reveal-up text-4xl font-black leading-[0.95] tracking-tight text-[#191c1e] sm:text-5xl lg:text-6xl">
                Building the
                <br />
                <span className="bg-gradient-to-r from-[#191c1e] via-[#004873] to-[#007abf] bg-clip-text text-transparent">Future Together.</span>
              </h1>

              <p className="reveal-up delay-1 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                The Digital Fabrication Network connects industry leaders, policy architects, and capital to catalyze the next era of West African hardware manufacturing.
              </p>

              <div className="reveal-up delay-2 flex flex-col gap-3.5 pt-1 sm:flex-row sm:items-center">
                <Link
                  href="/auth/register"
                  className="rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-7 py-3.5 text-center text-sm sm:text-base font-bold text-white shadow-lg shadow-sky-900/15 transition-all hover:-translate-y-0.5 hover:shadow-sky-500/30 active:scale-95"
                >
                  Partner With Us
                </Link>
                <Link
                  href="/manifesto"
                  className="rounded-xl border border-slate-300/80 bg-white px-7 py-3.5 text-center text-sm sm:text-base font-bold text-[#004873] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:border-slate-400/80 active:scale-95"
                >
                  View Our Manifesto
                </Link>
              </div>
            </div>

            <div className="reveal-up delay-3 group relative">
              <div className="absolute inset-0 rounded-full bg-sky-900/10 blur-3xl transition-all group-hover:bg-sky-900/20"></div>
              <div className="float-gentle relative overflow-hidden rounded-[2rem] shadow-2xl shadow-sky-900/15 ring-1 ring-slate-900/10">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3o8LHCSKiC7ROSihdECsGD1UB8mwehbxscZn_vkXEUKh6tzU-4b2RN0UQ_j3ke_znZSSUUK_wDQvvuztMJkvIMP--1_GTqj5K8Mjjh44OC7jkFBxjG3fQTODibYhnUiIBt2vQyRgxQLnNhETX8I4xjYyLsCBowGSvSAgJKBSgV19NkUyp75P8-uOXxdVmbIGc-4HmyvZxdnW3tSHcEeExZKKMlWmMgy43BZZAgFDpHiIh9JLPgYkCkjNPxMZOIizoUwvclhTwwxU"
                  alt="Close up of high precision industrial robotic arm in a clean lab setting"
                  className="h-[380px] sm:h-[440px] lg:h-[480px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient Vignette */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/10" />

                {/* Technical Grid Pattern Accent (Top-Right Corner) */}
                <div className="pointer-events-none absolute top-0 right-0 h-44 w-44 bg-[linear-gradient(to_right,#ffffff30_1px,transparent_1px),linear-gradient(to_bottom,#ffffff30_1px,transparent_1px)] bg-[size:16px_16px] opacity-70 [mask-image:radial-gradient(ellipse_100%_100%_at_100%_0%,#000_45%,transparent_100%)]" />

                {/* Dot Matrix Pattern Accent (Bottom-Left Corner) */}
                <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 bg-[radial-gradient(#ffffff45_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-75 [mask-image:radial-gradient(ellipse_100%_100%_at_0%_100%,#000_45%,transparent_100%)]" />

                {/* Technical Corner Brackets */}
                <div className="pointer-events-none absolute top-5 left-5 h-6 w-6 border-t-2 border-l-2 border-white/70 rounded-tl-sm" />
                <div className="pointer-events-none absolute bottom-5 right-5 h-6 w-6 border-b-2 border-r-2 border-white/70 rounded-br-sm" />
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
                  <Link href="/manifesto" className="inline-flex items-center gap-2 font-bold text-[#006098] transition-all hover:gap-4">
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

        <section className="bg-[#f2f4f6] py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-3xl font-black tracking-tight text-[#191c1e] sm:mb-10 sm:text-4xl">
              Our Goals*
            </h2>
            <div ref={statsRef} className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8">
              {[
                { value: '450+', label: 'Stakeholders' },
                { value: '1.2k', label: 'Projects' },
                { value: '85', label: 'Facilities' },
                { value: '12', label: 'Nations' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  data-stat-card
                  className="space-y-2 rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-8"
                >
                  <div className="text-3xl font-black text-[#004873] sm:text-4xl">{stat.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-sm">{stat.label}</div>
                </div>
              ))}
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
                <h2 className="mb-6 text-4xl font-black text-white md:text-5xl">Join Us Today</h2>
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
                    href="/"
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

      <Footer />
    </div>
  );
}
