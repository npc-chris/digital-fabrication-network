"use client";

import Link from 'next/link';

import Footer from '@/components/Footer';
import LandingNavbar from '@/components/LandingNavbar';

export default function PrototypingPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        body {
          font-family: 'Inter', sans-serif;
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
        }

        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes floatGentle {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .reveal-up {
          opacity: 0;
          animation: revealUp 760ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
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

        .float-gentle {
          animation: floatGentle 7s ease-in-out infinite;
        }

        .primary-gradient {
          background: linear-gradient(180deg, #006098 0%, #004873 100%);
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal-up,
          .float-gentle {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <LandingNavbar active="prototyping" />

      <main className="pt-20">
        <section className="relative mx-auto max-w-[1400px] overflow-hidden px-4 py-20 sm:px-6 md:py-32 lg:px-8">
          <div className="relative z-10 max-w-3xl">
            <span className="reveal-up inline-block rounded-full bg-[#cee5ff] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#004a77]">
              Industrial Fabrication Reimagined
            </span>
            <h1 className="reveal-up delay-1 mb-8 mt-6 text-5xl font-black leading-[0.9] tracking-tighter text-[#191c1e] md:text-7xl lg:text-8xl">
              Concept to <span className="text-[#004873]">Physical Reality</span>.
            </h1>
            <p className="reveal-up delay-2 mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
              Deploy industrial-grade tools across a distributed global network. DFN provides the technical precision required for aerospace, medical, and high-performance
              engineering.
            </p>
            <div className="reveal-up delay-3 flex flex-wrap gap-4">
              <Link
                href="/auth/register"
                className="primary-gradient rounded-xl px-8 py-4 text-lg font-bold text-white shadow-xl shadow-sky-900/20 transition-all hover:-translate-y-0.5"
              >
                Start Your Build
              </Link>
              <Link
                href="/stakeholders"
                className="rounded-xl border border-slate-300/60 bg-white px-8 py-4 text-lg font-bold text-[#004873] transition-all hover:bg-[#f2f4f6]"
              >
                View Capability Map
              </Link>
            </div>
          </div>

          <div className="absolute right-0 top-1/2 hidden h-[80%] w-1/2 -translate-y-1/2 lg:block">
            <div className="float-gentle h-full w-full translate-x-12 rotate-2 overflow-hidden rounded-3xl bg-[#e6e8ea] shadow-2xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMoq5v99Meffj7SQ9l30YOCYoePpLaJ11H6oA37KTyWtds0TSRExA-ryZZtGlg2Wop9JYHd_axZeRDyFkS3CGtgPLo_hwBV-sSrlOxYK6vAB76xNbSfsLsshQVp1aEsthcDKAxRg_Mb2CUGELeJkJ7OkGug167Jq3pnR_l9pgmD4mrUHPvPlmKQWncY_pCsLt6xSyqUwLeNs17IP8vl_GyWEZHsbgcD7G8TPF-rxNsCEgDamQo6JSvmhbbc0Yyh1p7G4v7cXzoubA"
                alt="Industrial 3D printer detail"
                className="h-full w-full object-cover opacity-80 grayscale"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#f7f9fb] via-transparent to-transparent"></div>
          </div>
        </section>

        <section className="bg-[#f2f4f6] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12 md:mb-16">
              <h2 className="text-4xl font-bold tracking-tight text-[#191c1e]">Industrial Fabrication Suite</h2>
              <p className="mt-4 max-w-xl text-slate-600">Specialized machinery for high-fidelity production, from micro-meter tolerances to heavy-duty profiles.</p>
            </div>

            <div className="grid h-auto grid-cols-1 gap-6 md:h-[600px] md:grid-cols-12">
              <div className="group reveal-up relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-white p-8 md:col-span-8">
                <div className="relative z-10">
                  <span className="material-symbols-outlined mb-4 text-4xl text-[#004873]">precision_manufacturing</span>
                  <h3 className="mb-2 text-3xl font-bold">Additive (3D Printing)</h3>
                  <p className="max-w-md text-slate-600">Industrial SLA, SLS, and FDM with micron-level precision and multi-material engineering plastics.</p>
                </div>
                <div className="relative z-10 mt-8 flex flex-wrap gap-3">
                  <span className="rounded-full bg-[#e6e8ea] px-3 py-1 text-xs font-bold">SLA</span>
                  <span className="rounded-full bg-[#e6e8ea] px-3 py-1 text-xs font-bold">SLS</span>
                  <span className="rounded-full bg-[#e6e8ea] px-3 py-1 text-xs font-bold">METAL PBF</span>
                </div>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDj81Lo14Ae2b6WR7iPqAVCA64SUSURrSkp-T1F0Vto0HrqjXy-fbaKFWTEW23a43IreI_uyHe3bwkzVnDcShTYk1pIvNkak_2l9c_X0ygzRGH1IiPFv9_vvoRs6SBzLVqWH5kV00BmCVBQiqufYKd64HF91lkI3BaALtsp5PybPOKhIdni1M08vT_vODqgshiajjB1LODF6wfd5S-g7DzrJasjxc0vImZyikNG2CLD363Gwd6M-LvQwylHI14EyC5jQaMOHScHJEY"
                  alt="SLS 3D printing part"
                  className="absolute bottom-0 right-0 h-full w-1/2 object-cover opacity-20 transition-opacity group-hover:opacity-40"
                />
              </div>

              <div className="reveal-up delay-1 flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[#004873] p-8 text-white md:col-span-4">
                <div>
                  <span className="material-symbols-outlined mb-4 text-4xl">architecture</span>
                  <h3 className="mb-2 text-3xl font-bold">Subtractive (CNC)</h3>
                  <p className="text-white/80">Multi-axis milling for aerospace-grade aluminum and titanium alloys.</p>
                </div>
                <div className="mt-8">
                  <button className="rounded-xl bg-white/10 px-6 py-2 text-sm font-bold transition-all hover:bg-white/20">Explore Materials</button>
                </div>
              </div>

              <div className="reveal-up delay-2 flex flex-col rounded-[2rem] bg-[#e0e3e5] p-8 md:col-span-4">
                <span className="material-symbols-outlined mb-4 text-4xl text-[#004873]">flare</span>
                <h3 className="mb-2 text-2xl font-bold">Laser & Plasma</h3>
                <p className="text-sm text-slate-600">High-speed profile cutting with minimal heat-affected zones for sheets up to 50mm.</p>
              </div>

              <div className="reveal-up delay-3 flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white p-8 md:col-span-8">
                <div className="max-w-md">
                  <h3 className="mb-2 text-2xl font-bold">Micron-Level Validation</h3>
                  <p className="text-sm text-slate-600">Every part undergoes automated CMM inspection to ensure design-intent compliance.</p>
                </div>
                <div className="hidden text-[#004873]/20 sm:block">
                  <span className="material-symbols-outlined text-8xl">verified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-[1400px] flex-col items-center gap-16 px-4 py-24 sm:px-6 lg:flex-row lg:gap-20 lg:px-8 lg:py-28">
          <div className="lg:w-1/2">
            <div className="reveal-up mb-6 inline-flex items-center gap-2 rounded-full bg-[#ffdad5] px-3 py-1 text-xs font-bold uppercase text-[#930009]">
              <span className="material-symbols-outlined text-xs">engineering</span>
              Technical Mentorship
            </div>
            <h2 className="reveal-up delay-1 mb-8 text-4xl font-extrabold leading-tight tracking-tight text-[#191c1e] sm:text-5xl">
              Design for <span className="text-[#004873]">Manufacturing</span> Support.
            </h2>
            <p className="reveal-up delay-2 mb-10 text-lg leading-relaxed text-slate-600">
              Moving from a prototype to a product requires more than just machines. Our dedicated engineering experts provide deep DFM support to streamline supply chain logistics and
              hardware development cycles.
            </p>
            <ul className="reveal-up delay-3 mb-10 space-y-4">
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#004873]">check_circle</span>
                <span className="font-medium">Supply chain risk assessment and mitigation.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#004873]">check_circle</span>
                <span className="font-medium">Material selection for mechanical optimization.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#004873]">check_circle</span>
                <span className="font-medium">Direct access to senior hardware architects.</span>
              </li>
            </ul>
            <Link href="/stakeholders" className="reveal-up delay-3 inline-flex items-center gap-2 font-bold text-[#006098] transition-transform hover:translate-x-1">
              Meet the Mentors
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <div className="grid w-full grid-cols-2 gap-4 lg:w-1/2">
            <div className="reveal-up rounded-xl bg-[#f2f4f6] p-6">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDGkGM0HYoBUMp7QITmWUyefBeunQZ4PvvRvyF9BnzahfibSXuuygNdBzPUvaI1OOu7xcjqCyifFEvj-x8rlcxo2XosX6FDCHJ_0B5lw7dWcoUmXV9nxDVr-k4dTlRrTqDB9YYwEjnPuFJgFRvmoRIt7riAQC7zaQhyJZuriWNE2l_hEKncyYC-VkPn6I3mP1gHITJl-WjP7YSl2ih09zchDV8t9M-Uz0IQ4HTQ2iQgn3vyuV-zaFayPEmu4nzRhKMFJVjl1dKBCU"
                alt="Lead engineer"
                className="mb-4 h-16 w-16 rounded-full object-cover"
              />
              <h4 className="font-bold">Sarah Chen</h4>
              <p className="text-xs text-slate-600">Additive Specialist</p>
            </div>
            <div className="reveal-up delay-1 mt-12 rounded-xl bg-white p-6 shadow-xl shadow-sky-900/5">
              <span className="text-4xl font-black text-[#004873]/20">01</span>
              <h4 className="mt-4 font-bold">DFM Review</h4>
              <p className="mt-2 text-sm text-slate-600">Iterative feedback on your CAD files before first-cut.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#191c1e] px-4 py-20 text-[#eff1f3] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end md:gap-12">
              <div>
                <h2 className="text-4xl font-black tracking-tight md:text-5xl">
                  Startup Ready &
                  <br />
                  Accelerator Program
                </h2>
                <p className="mt-4 max-w-xl text-slate-400">A 6-month intensive fabrication track designed specifically for pre-seed to Series A hardware startups.</p>
              </div>
              <Link href="/auth/register" className="rounded-xl bg-[#006098] px-8 py-4 font-bold text-white transition-transform hover:-translate-y-0.5">
                Apply for Our Cohort
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-10 border-t border-slate-700/40 pt-14 md:grid-cols-3">
              <div>
                <h4 className="mb-4 text-xl font-bold">Prototyping Credits</h4>
                <p className="text-sm leading-relaxed text-slate-400">Access up to $50k in fabrication credits to burn through iterations without capital stress.</p>
              </div>
              <div>
                <h4 className="mb-4 text-xl font-bold">Unified Cloud OS</h4>
                <p className="text-sm leading-relaxed text-slate-400">Every machine in our network runs on a unified kernel for predictable output across any hub.</p>
              </div>
              <div>
                <h4 className="mb-4 text-xl font-bold">24/7 Monitoring</h4>
                <p className="text-sm leading-relaxed text-slate-400">Live telemetry and real-time vision systems monitor every build to prevent defects early.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Global Network, Local Access</h2>
            <p className="mx-auto mt-5 max-w-2xl text-slate-600">
              Manufacturing is no longer localized to one factory. Distribute production across 40+ hubs to minimize shipping and taxes.
            </p>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] bg-[#e6e8ea]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOr8n91orcn2nAS23kbFEvPt86p04nJCrWJ3T6TR7b_kJqs2qCwVWPBVGR_qgHyzMd9E93unJhCgpqRuZv6qMGv45z5UTuRKxAgpoNdxC4QMVe2cx4S3fvRNZRCluKENCJyAMa6mWoJjBzOFwgdMT4k4cfqYoeqeEnfGhZZUJLSUjeYZi5ROskm5Pl6yTbvJuUAISLkjl_hrTSuodPMf2rQz-fgRPKnzjopKSi5ZjXxUTXj0m-JXBZ6ZP3E4AjgQuwjq7Ro9oSvMg"
              alt="World map"
              className="h-full w-full object-cover opacity-50 grayscale"
            />
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
                {[
                  ['42', 'Active Hubs'],
                  ['12ms', 'Sync Latency'],
                  ['0.02%', 'Error Rate'],
                  ['24/7', 'Uptime'],
                ].map(([value, label]) => (
                  <div key={label} className="flex flex-col items-center">
                    <span className="text-3xl font-black text-[#004873] md:text-4xl">{value}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 md:text-xs">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-[#eceef0] p-10 md:p-16">
            <div className="relative z-10 max-w-xl">
              <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-[#006098]">Success Story</span>
              <h2 className="mb-6 text-3xl font-black md:text-4xl">
                Project Orion:
                <br />
                Scaling at Light Speed
              </h2>
              <p className="mb-8 leading-relaxed text-slate-600">
                From a singular SLA prototype in Berlin to 10,000 units manufactured across 12 hubs simultaneously. Project Orion reduced their carbon footprint by 65% through distributed
                manufacturing.
              </p>
              <div className="flex items-center gap-6">
                <div className="h-px w-12 bg-slate-300"></div>
                <span className="italic text-slate-600">DFN turned our hardware roadmap from a 2-year struggle into a 6-month launch.</span>
              </div>
            </div>

            <div className="absolute right-0 top-0 hidden h-full w-1/2 bg-[#e6e8ea] lg:block">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlftxXLzrG2-F5Ck_z67HKmO80ddRTYzyUAkCCj-Ivcr84-ZyZduK9o0EpcMm-uzi61MtEhV6gUrF5ju8mMdkEKtPe8j4HV439801RGCoYxs0PSQKtKVVXTcMdxfU3Pu5BiOUseEWYQBNF8HmcF_nvWdcybSNhid3auAKKfZWGH5aO28U4N1bO3ezlprvK7BttvSk35ePAlT1NiV3eq0DEUhBFBZfR99uXYrWg8-lVAf4dha1naiXLbPdfiI-iMJ9imiRmY3mcnFg"
                alt="Aerospace part"
                className="h-full w-full object-cover opacity-40 mix-blend-multiply"
              />
            </div>
          </div>I 
        </section> */}

        <section className="mx-auto max-w-[1200px] px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-28">
          <h2 className="text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">
            Ready to build
            <br />
            the future?
          </h2>
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <Link
              href="/auth/register"
              className="primary-gradient rounded-xl px-10 py-5 text-xl font-bold text-white shadow-xl shadow-sky-900/20 transition-all hover:-translate-y-0.5"
            >
              Apply for Access
            </Link>
            <Link href="/research" className="rounded-xl bg-[#f2f4f6] px-10 py-5 text-xl font-bold text-[#191c1e] transition-all hover:bg-[#e6e8ea]">
              Explore Research
            </Link>
          </div>
          <p className="mt-8 text-sm font-medium text-slate-600">Join 2,500+ engineers building on the Network.</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
