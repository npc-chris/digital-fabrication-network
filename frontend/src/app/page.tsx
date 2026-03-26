'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { verifySession } from '@/lib/auth';

export default function LandingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    verifySession().then(({ isAuthenticated }) => {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        setIsCheckingAuth(false);
      }
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

        @keyframes floatGentle {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
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

        .delay-4 {
          animation-delay: 420ms;
        }

        .float-gentle {
          animation: floatGentle 7s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nav-enter,
          .reveal-up,
          .float-gentle {
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
            <Link href="/" className="border-b-2 border-sky-700 pb-1 text-sm font-bold text-sky-700">
              Home
            </Link>
            <Link href="/forum" className="text-sm font-medium text-slate-600 transition-colors hover:text-sky-900">
              Research
            </Link>
            <Link href="/services" className="text-sm font-medium text-slate-600 transition-colors hover:text-sky-900">
              Prototyping
            </Link>
            <Link href="/stakeholders" className="text-sm font-medium text-slate-600 transition-colors hover:text-sky-900">
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
        <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="reveal-up space-y-8">
            <div className="reveal-up delay-1 inline-flex items-center gap-2 rounded-full bg-[#cee5ff] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#004a77]">
              <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
              West Africa's Tech Hub
            </div>

            <h1 className="reveal-up delay-2 text-5xl font-black leading-[0.95] tracking-tight text-[#191c1e] sm:text-6xl lg:text-7xl">
              Connect.
              <br />
              Fabricate.
              <br />
              Innovate.
            </h1>

            <p className="reveal-up delay-3 max-w-lg text-lg leading-relaxed text-slate-600 sm:text-xl">
              West Africa's premier platform for professional hardware development and precision engineering. We bridge the gap between design and physical reality.
            </p>

            <div className="reveal-up delay-4 flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
              <Link
                href="/auth/register"
                className="rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-8 py-4 text-center text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-sky-500/30"
              >
                Join the Network
              </Link>
              <Link
                href="/about"
                className="rounded-xl bg-[#f2f4f6] px-8 py-4 text-center text-base font-bold text-[#004873] transition-all hover:-translate-y-0.5 hover:bg-[#e6e8ea]"
              >
                Our Manifesto
              </Link>
            </div>
          </div>

          <div className="group reveal-up delay-2 relative">
            <div className="absolute inset-0 rounded-full bg-sky-900/10 blur-3xl transition-all group-hover:bg-sky-900/20"></div>
            <div className="float-gentle relative overflow-hidden rounded-[2rem] shadow-2xl shadow-sky-900/10">
              <img
                src="https://media.licdn.com/dms/image/v2/D4D12AQEwa6c_EymbPw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1692005969362?e=2147483647&v=beta&t=06PrlnV6KhBp6QMXkeZ7cCtQHotsZ8ki9d1a807d6TE"
                alt="Advanced fabrication facility"
                className="h-[480px] w-full object-cover transition-transform duration-700 group-hover:scale-105 lg:h-[600px]"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#f2f4f6] py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-3xl font-black tracking-tight text-[#191c1e] sm:mb-10 sm:text-4xl">
              Our Goals for the Year
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8">
              {[
                { value: '450+', label: 'Stakeholders' },
                { value: '1.2k', label: 'Projects' },
                { value: '85', label: 'Facilities' },
                { value: '12', label: 'Nations' },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`reveal-up space-y-2 rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-8 ${
                    index === 0 ? 'delay-1' : index === 1 ? 'delay-2' : index === 2 ? 'delay-3' : 'delay-4'
                  }`}
                >
                  <div className="text-3xl font-black text-[#004873] sm:text-4xl">{stat.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-32">
          <div className="order-2 relative lg:order-1">
            <div className="relative z-10 overflow-hidden rounded-2xl shadow-xl">
              <img
                src="https://www.pnnl.gov/sites/default/files/styles/hero_1600x1200/public/media/image/Full%20Size-Rapid_Prototyping_Lab-11.jpg?h=8c1344d8&itok=dKKJFDij"
                alt="Engineering workflow"
                className="h-[420px] w-full object-cover sm:h-[500px]"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 -z-10 h-64 w-64 rounded-full bg-sky-900/5 blur-2xl"></div>
          </div>

          <div className="order-1 space-y-6 lg:order-2">
            <h2 className="reveal-up text-3xl font-black leading-tight tracking-tight text-[#191c1e] sm:text-4xl">Redefining Engineering through Connectivity</h2>
            <p className="reveal-up delay-1 text-lg leading-relaxed text-slate-600">
              At DFN, we believe that innovation should not happen in silos. We are building a borderless ecosystem where regional manufacturers connect with global designers,
              leveraging modern infrastructure to turn ambitious concepts into market-ready hardware.
            </p>

            <ul className="reveal-up delay-2 space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-900/10">
                  <span className="material-symbols-outlined text-sm text-[#004873]">check</span>
                </div>
                <span className="font-medium text-[#191c1e]">Verified fabrication partners across 12 countries.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-900/10">
                  <span className="material-symbols-outlined text-sm text-[#004873]">check</span>
                </div>
                <span className="font-medium text-[#191c1e]">Standardized prototyping protocols for speed.</span>
              </li>
            </ul>

            <div className="reveal-up delay-3 pt-3">
              <Link href="/about" className="inline-flex items-center gap-1 font-bold text-[#006098] transition-all hover:gap-2 hover:underline">
                See our Ambitious Plans
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-24 lg:py-32">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 max-w-2xl space-y-4 lg:mb-16">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Our Core Services</h2>
              <p className="text-slate-600">Unlocking the potential of industrial fabrication for the next generation of innovators.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: 'hub',
                  title: 'Regional Collaboration',
                  text: 'Forge powerful partnerships across borders. Access a network of expertise tailored to regional engineering challenges.',
                },
                {
                  icon: 'biotech',
                  title: 'Modern Prototyping',
                  text: 'From 3D printing to CNC machining, utilize state-of-the-art facilities for rapid hardware iteration and testing.',
                },
                {
                  icon: 'speed',
                  title: 'Accelerated Innovation',
                  text: 'Cut down time-to-market. Our streamlined processes ensure your innovation moves from drawing board to production faster.',
                },
              ].map((service, index) => (
                <div
                  key={service.title}
                  className={`group reveal-up space-y-6 rounded-2xl bg-[#f8fafc] p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-900/5 ${
                    index === 0 ? 'delay-1' : index === 1 ? 'delay-2' : 'delay-3'
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-900/5 transition-colors group-hover:bg-[#004873]">
                    <span className="material-symbols-outlined text-3xl text-[#006098] transition-colors group-hover:text-white">{service.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold">{service.title}</h3>
                  <p className="leading-relaxed text-slate-600">{service.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#004873] py-24 text-white lg:py-32">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-10">
            <svg className="h-full w-full fill-current" viewBox="0 0 100 100" aria-hidden="true">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-14 text-3xl font-black tracking-tight sm:text-5xl lg:mb-16">
              Built for Every Pillar
              <br />
              of the Ecosystem
            </h2>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Manufacturers',
                  text: 'Optimize floor usage and connect with high-value contracts from innovative startups.',
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkQeticBpHUNZ6QhvagMFmsLAXRA6Aqq9_EMvCmHkajgCPisNl7UOu08_XrDThtO011Hhwldd5O9HKBvaDFo1YUk_YehWRrZEXLwNFT_guMmXznc22HhWPoNMwkSFUJmHcDIIfqohQ8BY-8izMS4FGNwBHhIkHo8ssx0NIHM4YjogrWkJSnlW5R1ZY1bqzvcC5_RbeFlhiv-sq_fIGE5xs3lMaj8IKZt1UQTfggNs26MN8bA8hgJzdcJFkXgQT4CUTMPLWe0Q9q0I',
                },
                {
                  title: 'Researchers',
                  text: 'Bridge academic theory with industrial practice through collaborative R&D programs.',
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLwB1w2MFfGB5wQ4oalCvHF54KGyt8PY5U5rbeKCBP1XHp0el_H8sfsrmLcB-GvtdvFMeEnctBAdF8Gt82faFHX-0kPPznUS5imxTfxoed1vq0KuN3Rhl9TsdLMswjt1esNmVN0r7uoaN4ATc_4oCQslRUYM2AlKnnQXIy58zw_nI5h6j-SqOvQQNOfRMEevYEvAeVyiX0NbZAeO-N2ktQAutO8NppbgYT-jomcuRVQmZSdZb2taF5Qyj7YpD2bS_wlMGIjIAhX1c',
                },
                {
                  title: 'Engineers & Designers',
                  text: 'Access tools and mentorship to bring complex hardware designs to life efficiently.',
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2iSmu1DeY-SgETQmEqmn_EP9jHzvFS2SSpbwmhQ8_dQUEb7Gw8RJX1bgRdmu8399ERx3__ZbjbF8HiLc64Y30g5bU2PDYFLyDYDiYXLYf0GchkxFv9BvcXc6UBtQz9v79WF-DuT3t82FgldjAwI5EcMAp2htBU8TOAO66CmN17x5ClP8bP_CCyuZMEVgqCIDhVbzybmnIK3ZUjA1G7x2vaGSLE96Cz4-gXxhoeKo4jDXKRhsAjJ1_dGD21ZGbrdKQgW4HqomjGtE',
                },
              ].map((pillar, index) => (
                <div
                  key={pillar.title}
                  className={`reveal-up space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/10 ${
                    index === 0 ? 'delay-1' : index === 1 ? 'delay-2' : 'delay-3'
                  }`}
                >
                  <img src={pillar.img} alt={pillar.title} className="h-48 w-full rounded-xl object-cover grayscale transition-all hover:grayscale-0" />
                  <h4 className="text-xl font-bold">{pillar.title}</h4>
                  <p className="leading-relaxed text-[#b4d8ff]">{pillar.text}</p>
                  <Link href="/about" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all hover:gap-4">
                    Learn More
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </div>
              ))}
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
                  className="block w-full rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] py-4 text-center text-lg font-bold text-white shadow-xl"
                >
                  Apply for Admission
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl space-y-8 px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-28">
          <span className="material-symbols-outlined material-symbols-filled reveal-up text-7xl text-[#98cbff] opacity-40 sm:text-8xl">
            format_quote
          </span>
          <blockquote className="reveal-up delay-1 text-3xl font-black italic leading-[1.12] tracking-tight text-[#191c1e] sm:text-4xl md:text-5xl">
            DFN is not just a network; it is the missing link in our industrial value chain. By centralizing fabrication resources, we reduce R&D costs for our partners by up to 40%.
          </blockquote>
          <div className="reveal-up delay-2 space-y-1">
            <div className="text-xl font-black">Udonsi Chris</div>
            <div className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500 sm:text-sm">Head of Product, Digital Fabrication Network</div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#004873] p-10 text-center text-white shadow-2xl sm:p-16 lg:rounded-[3rem] lg:p-24">
            <div className="absolute inset-0 bg-gradient-to-b from-[#006098] to-[#007abf] opacity-90"></div>
            <div className="relative z-10 space-y-7">
              <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Ready to Lead the
                <br />
                Innovation Wave?
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#cee5ff] sm:text-xl">
                Join hundreds of leaders building the future of African fabrication. The next industrial revolution is hardware, and it starts here.
              </p>
              <div className="pt-3">
                <Link
                  href="/auth/register"
                  className="inline-block rounded-2xl bg-white px-10 py-5 text-xl font-black text-[#004873] shadow-2xl transition-all hover:scale-105 active:scale-95 sm:text-2xl"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

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
