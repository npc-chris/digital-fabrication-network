'use client';

import Link from 'next/link';

import Footer from '@/components/Footer';
import LandingNavbar from '@/components/LandingNavbar';

export default function ResearchPage() {
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

      <LandingNavbar active="research" />

      <main className="pt-14">
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
                Accelerating
                <br />
                <span className="bg-gradient-to-r from-[#191c1e] via-[#004873] to-[#007abf] bg-clip-text text-transparent">Hardware Research</span>
                <br />
                in West Africa.
              </h1>

              <p className="reveal-up delay-1 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                We bridge the gap between conceptual design and physical realization by providing a decentralized network of high-precision laboratories and industrial partnerships.
              </p>

              <div className="reveal-up delay-2 flex flex-col gap-3.5 pt-1 sm:flex-row sm:items-center">
                <Link
                  href="/auth/register"
                  className="rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-7 py-3.5 text-center text-sm sm:text-base font-bold text-white shadow-lg shadow-sky-900/15 transition-all hover:-translate-y-0.5 hover:shadow-sky-500/30 active:scale-95"
                >
                  Join as Research Fellow
                </Link>
                <Link
                  href="/stakeholders"
                  className="rounded-xl border border-slate-300/80 bg-white px-7 py-3.5 text-center text-sm sm:text-base font-bold text-[#004873] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:border-slate-400/80 active:scale-95"
                >
                  Explore Partnerships
                </Link>
              </div>
            </div>

            <div className="reveal-up delay-3 group relative">
              <div className="absolute inset-0 rounded-full bg-sky-900/10 blur-3xl transition-all group-hover:bg-sky-900/20"></div>
              <div className="float-gentle relative overflow-hidden rounded-[2rem] shadow-2xl shadow-sky-900/15 ring-1 ring-slate-900/10">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVo0Ml4x3xb065fBhY-XZt_FpcNy1suyGBOvTVQ-Se9vb2qMYGVMwOKaiPj16XlCvZae50r1jesYkYLU-jekRnWeSWJm4XJqL9C83T15NjGgae-Z3e7zEUkWPIH5xcij1Y9jtT74WtMABOzLHDUy_QNbqtz96QMSWwr3HJ_7p5fC_qTJ0RCUgoWXc1rQOddt9Bn7tbB2Y56z15DlAHSqhJYv2UOzcf63ecsWyTZOaJyb73LewiPH9NJ7-gawPRCzJPTGQqPdCWDv4"
                  alt="Laboratory precision equipment"
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

        <section className="bg-[#f2f4f6] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12 md:mb-16">
              <h2 className="text-4xl font-bold tracking-tight text-[#191c1e]">Specialized Instrumentation</h2>
              <p className="mt-4 max-w-xl text-slate-600">Premium laboratory and fabrication equipment for high-fidelity research and production validation.</p>
            </div>

            <div className="grid h-auto grid-cols-1 gap-6 md:h-[600px] md:grid-cols-12">
              <div className="group reveal-up relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-white p-8 md:col-span-8">
                <div className="relative z-10">
                  <span className="material-symbols-outlined mb-4 text-4xl text-[#004873]">precision_manufacturing</span>
                  <h3 className="mb-2 text-3xl font-bold">Precision CNC & Additive</h3>
                  <p className="max-w-md text-slate-600">5-axis milling and industrial-grade SLM 3D printing for rapid hardware iteration without international shipping delays.</p>
                </div>
                <div className="relative z-10 mt-8 flex flex-wrap gap-3">
                  <span className="rounded-full bg-[#e6e8ea] px-3 py-1 text-xs font-bold">Micron Accuracy</span>
                  <span className="rounded-full bg-[#e6e8ea] px-3 py-1 text-xs font-bold">Multi-Material</span>
                  <span className="rounded-full bg-[#e6e8ea] px-3 py-1 text-xs font-bold">Remote Access</span>
                </div>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDj81Lo14Ae2b6WR7iPqAVCA64SUSURrSkp-T1F0Vto0HrqjXy-fbaKFWTEW23a43IreI_uyHe3bwkzVnDcShTYk1pIvNkak_2l9c_X0ygzRGH1IiPFv9_vvoRs6SBzLVqWH5kV00BmCVBQiqufYKd64HF91lkI3BaALtsp5PybPOKhIdni1M08vT_vODqgshiajjB1LODF6wfd5S-g7DzrJasjxc0vImZyikNG2CLD363Gwd6M-LvQwylHI14EyC5jQaMOHScHJEY"
                  alt="Precision manufacturing equipment"
                  className="absolute bottom-0 right-0 h-full w-1/2 object-cover opacity-20 transition-opacity group-hover:opacity-40"
                />
              </div>

              <div className="reveal-up delay-1 flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[#004873] p-8 text-white md:col-span-4">
                <div>
                  <span className="material-symbols-outlined mb-4 block text-4xl">biotech</span>
                  <h3 className="mb-2 text-2xl font-bold">Materials Laboratory</h3>
                  <p className="mb-6 text-sm leading-relaxed text-blue-100">Clean-room environments for PCB fabrication, sensor calibration, and material stress testing for regional environmental conditions.</p>
                </div>
                <Link href="/prototyping" className="inline-block text-sm font-bold text-blue-200 hover:text-white transition-colors">
                  Explore Services <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12 md:mb-16">
              <h2 className="text-4xl font-bold tracking-tight text-[#191c1e]">Academic-Industry Alliance</h2>
              <p className="mt-4 max-w-xl text-slate-600">Direct pipelines between West African universities and global hardware manufacturers for accelerated innovation.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="reveal-up rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <span className="material-symbols-outlined text-[#004873]">handshake</span>
                </div>
                <h3 className="mb-3 text-xl font-bold">Dual-Credit Research</h3>
                <p className="text-sm leading-relaxed text-slate-600">Published academic research with integrated IP protection for industrial sponsors, ensuring both innovation and attribution.</p>
              </div>

              <div className="reveal-up delay-1 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <span className="material-symbols-outlined text-[#004873]">factory</span>
                </div>
                <h3 className="mb-3 text-xl font-bold">Production Sandboxing</h3>
                <p className="text-sm leading-relaxed text-slate-600">Test manufacturing workflows in our labs before scaling to regional factories, reducing risk and optimizing processes.</p>
              </div>

              <div className="reveal-up delay-2 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <span className="material-symbols-outlined text-[#004873]">verified_user</span>
                </div>
                <h3 className="mb-3 text-xl font-bold">Data Security & IP</h3>
                <p className="text-sm leading-relaxed text-slate-600">Encrypted telemetry, decentralized IP ledger, and standardized metadata protocols protecting innovation while enabling collaboration.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[3rem] mx-4 my-20 sm:mx-6 lg:mx-8 bg-gradient-to-br from-[#006098] to-[#004873] px-8 py-16 text-white md:px-16 md:py-24">
          <div className="relative z-10">
            <h2 className="mb-8 text-4xl font-black leading-tight md:text-5xl">Ready to lead African hardware innovation?</h2>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-blue-100">
              Join the network as a research fellow, institutional partner, or equipment provider and get access to the continent's most advanced fabrication infrastructure.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/auth/register"
                className="rounded-xl bg-white px-8 py-4 font-bold text-[#004873] shadow-lg transition-all hover:-translate-y-0.5"
              >
                Submit Research Proposal
              </Link>
              <Link
                href="/stakeholders"
                className="rounded-xl border-2 border-white px-8 py-4 font-bold text-white transition-all hover:bg-white/10"
              >
                Explore Ecosystem Map
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="mb-6 text-4xl font-bold tracking-tight text-[#191c1e]">Open Data, Secure Innovation</h2>
                <p className="mb-8 text-lg text-slate-600">DFN Lab implements strict data sharing protocols that balance open-science collaboration with the competitive needs of local innovators.</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#004873]">check_circle</span>
                    <span className="font-medium">Encrypted Telemetry for Lab Machines</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#004873]">check_circle</span>
                    <span className="font-medium">Decentralized IP Ledger (Regional Nodes)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#004873]">check_circle</span>
                    <span className="font-medium">Standardized Metadata for Hardware Testing</span>
                  </li>
                </ul>
              </div>
              <div className="overflow-hidden rounded-[2rem] bg-[#f2f4f6] p-4 shadow-lg">
                <img
                  className="h-full w-full rounded-xl object-cover grayscale transition-all duration-700 hover:grayscale-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTKKNCDPinYjC3WjuKBFGHSuq7tJ9eMrshc4eJnnjMAUCVmWiJJ-1jwebQm5ZUSHKQlWCf4wKfgSMn0shQYYxSoZ_AlHg8RM6TFuYhCflsgAVS5Qk0lnS-_O_j-VGWJXU_yLQTvEddds2I8_HC2xuqViOuMoyFsM2IPDoDu4xc6mfJIq2UI2vdJEpOywZYw_q8njx2DNxEv6aoi9YFrhD3Q12HoKG4wdN2BJZR1N7PiDWahm1FZt1_aol3tYEZGKXZ2FNaYUwsqVns"
                  alt="Research data visualization dashboard"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 rounded-[2rem] bg-[#f2f4f6] p-8 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:rounded-[3rem] lg:p-16">
            <div className="space-y-8">
              <h2 className="text-4xl font-black tracking-tight text-[#191c1e] sm:text-5xl">Build the Future with Us</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: 'groups',
                    title: 'Pioneer Cohort',
                    text: 'Be part of the inaugural group shaping West African hardware standards.',
                  },
                  {
                    icon: 'construction',
                    title: 'Infrastructure Access',
                    text: 'Unprecedented access to localized manufacturing and global testing labs.',
                  },
                  {
                    icon: 'rocket_launch',
                    title: 'Mission-Driven',
                    text: 'Join a cause focused on economic self-sufficiency through engineering.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-5 sm:gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#004873]">
                      <span className="material-symbols-outlined text-white">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{item.title}</h4>
                      <p className="text-slate-600">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#006098] to-[#004873] p-1">
              <div className="space-y-7 rounded-[1.4rem] bg-white p-8 sm:p-10">
                <h3 className="text-2xl font-bold">Join the Pioneer Cohort</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full rounded-xl border-none bg-[#f2f4f6] px-5 py-4 text-slate-700 outline-none ring-0 transition-all focus:ring-2 focus:ring-[#006098]"
                  />
                  <input
                    type="email"
                    placeholder="Professional Email"
                    className="w-full rounded-xl border-none bg-[#f2f4f6] px-5 py-4 text-slate-700 outline-none ring-0 transition-all focus:ring-2 focus:ring-[#006098]"
                  />
                  <select
                    title="Stakeholder Type"
                    aria-label="Stakeholder Type"
                    className="w-full rounded-xl border-none bg-[#f2f4f6] px-5 py-4 text-slate-700 outline-none ring-0 transition-all focus:ring-2 focus:ring-[#006098]"
                  >
                    <option>Select Stakeholder Type</option>
                    <option>Manufacturer</option>
                    <option>Researcher</option>
                    <option>Engineer/Designer</option>
                  </select>
                </div>
                <Link
                  href="/auth/register"
                  className="block w-full rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] py-4 text-center text-lg font-bold text-white shadow-lg shadow-sky-900/15 transition-all hover:-translate-y-0.5 hover:shadow-sky-500/30 active:scale-95"
                >
                  Apply for Admission
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}