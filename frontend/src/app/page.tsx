'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { verifySession } from '@/lib/auth';
import { Check, ArrowRight, Quotes, CubeFocus, GitFork, SealCheck } from '@phosphor-icons/react';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is already logged in
    verifySession().then(({ isAuthenticated, user }) => {
      if (isAuthenticated) {
        if (user?.role === 'admin' || user?.role === 'platform_manager') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setIsCheckingAuth(false);
      }
    });
  }, [router]);

  // Initialize GSAP animations
  useEffect(() => {
    if (isCheckingAuth) return;

    // Hero section: stagger animation for text elements
    const heroElements = heroTextRef.current?.querySelectorAll('[data-hero-item]');
    if (heroElements && heroElements.length > 0) {
      gsap.fromTo(
        heroElements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        }
      );
    }

    // Hero image parallax effect
    const heroImg = heroRef.current?.querySelector('[data-hero-image]');
    if (heroImg) {
      gsap.fromTo(
        heroImg,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          delay: 0.3,
        }
      );
    }

    // Stats section - scroll trigger
    const statCards = statsRef.current?.querySelectorAll('[data-stat-card]');
    statCards?.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 45%',
            scrub: false,
          },
          ease: 'power2.out',
        }
      );
    });

    // Service cards - scroll trigger with hover effect
    const serviceCards = servicesRef.current?.querySelectorAll('[data-service-card]');
    serviceCards?.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: index * 0.12,
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            end: 'top 40%',
            scrub: false,
          },
          ease: 'power3.out',
        }
      );

      // Add hover animation
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -8,
          duration: 0.3,
          overwrite: 'auto',
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          duration: 0.3,
          overwrite: 'auto',
        });
      });
    });

    // Pillar cards - scroll trigger
    const pillarCards = pillarsRef.current?.querySelectorAll('[data-pillar-card]');
    pillarCards?.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: index * 0.15,
          scrollTrigger: {
            trigger: card,
            start: 'top 75%',
            end: 'top 35%',
            scrub: false,
          },
          ease: 'power3.out',
        }
      );
    });

    // Testimonial section - scroll trigger
    const testimonialElements = document.querySelectorAll('[data-testimonial-item]');
    testimonialElements.forEach((el, index) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'top 50%',
            scrub: false,
          },
          ease: 'power2.out',
        }
      );
    });

    // Final CTA section - scroll trigger
    const ctaSection = document.querySelector('[data-cta-final]');
    if (ctaSection) {
      gsap.fromTo(
        ctaSection,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: ctaSection,
            start: 'top 80%',
            end: 'top 40%',
            scrub: false,
          },
          ease: 'power3.out',
        }
      );
    }

    // CTA button pulse effect
    const ctaButtons = document.querySelectorAll('[data-cta-pulse]');
    ctaButtons.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, {
          scale: 1.08,
          duration: 0.3,
          ease: 'back.out',
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          scale: 1,
          duration: 0.3,
          ease: 'back.out',
        });
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isCheckingAuth]);

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

        body {
          font-family: 'Inter', sans-serif;
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

        .float-gentle {
          animation: floatGentle 7s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nav-enter,
          .float-gentle {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <LandingNavbar active="home" />

      <main className="pt-14">
        <section ref={heroRef} className="relative overflow-hidden pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8">
          {/* Background Ambient Blur & Grid Effect */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-sky-400/20 to-blue-600/10 blur-[120px] opacity-70" />
            <div className="absolute top-1/4 -right-20 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-sky-300/15 via-blue-500/10 to-indigo-500/5 blur-[140px] opacity-80" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>

          <div className="mx-auto grid w-full max-w-7xl items-end gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 pb-1">
            <div ref={heroTextRef} className="space-y-6">
              <h1 data-hero-item className="text-4xl font-black leading-[0.95] tracking-tight text-[#191c1e] sm:text-5xl lg:text-6xl">
                Connect.
                <br />
                Build.
                <br />
                <span className="bg-gradient-to-r from-[#191c1e] via-[#004873] to-[#007abf] bg-clip-text text-transparent">Scale.</span>
              </h1>

              <p data-hero-item className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Connecting local engineering with underutilized manufacturing capacity across Nigeria. Turn months of import delays into days of reliable local production.
              </p>

              <div data-hero-item className="flex flex-col gap-3.5 pt-1 sm:flex-row sm:items-center">
                <Link
                  href="/coming-soon"
                  data-cta-pulse
                  className="rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-7 py-3.5 text-center text-sm sm:text-base font-bold text-white shadow-lg shadow-sky-900/15 transition-all hover:-translate-y-0.5 hover:shadow-sky-500/30 active:scale-95"
                >
                  Join the Network
                </Link>

                <Link
                  href="/manifesto"
                  className="rounded-xl border border-slate-300/80 bg-white px-7 py-3.5 text-center text-sm sm:text-base font-bold text-[#004873] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:border-slate-400/80 active:scale-95"
                >
                  Our Manifesto
                </Link>
              </div>
            </div>

            <div data-hero-image className="group relative">
              <div className="absolute inset-0 rounded-full bg-sky-900/10 blur-3xl transition-all group-hover:bg-sky-900/20"></div>
              <div className="float-gentle relative overflow-hidden rounded-[2rem] shadow-2xl shadow-sky-900/15 ring-1 ring-slate-900/10">
                <img
                  src="/root-hero-img.jpg"
                  alt="Advanced fabrication facility"
                  className="h-[380px] sm:h-[440px] lg:h-[480px] w-full object-cover object-[80%_center] transition-transform duration-700 group-hover:scale-105"
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
            <h2 className="reveal-up text-3xl font-black leading-tight tracking-tight text-[#191c1e] sm:text-4xl">Ending the Industrial Disconnect in African Manufacturing</h2>
            <p className="reveal-up delay-1 text-lg leading-relaxed text-slate-600">
              High regional demand for manufactured products meets capable local workshops operating below full capacity. Because of fragmented market visibility, businesses routinely rely on expensive overseas imports, while capable domestic facilities remain underutilized. DFN provides the digital routing, verification, and orchestration layer to bridge this gap.
            </p>

            <ul className="reveal-up delay-2 space-y-4 pt-2">
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-900/10">
                  <Check size={14} weight="bold" className="text-[#004873]" />
                </div>
                <span className="font-medium text-[#191c1e]">Verified fabrication nodes mapped across key regional industrial corridors.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-900/10">
                  <Check size={14} weight="bold" className="text-[#004873]" />
                </div>
                <span className="font-medium text-[#191c1e]">Standardized engineering protocols to validate designs before production.</span>
              </li>
            </ul>

            <div className="reveal-up delay-3 pt-3">
              <Link href="/manifesto" className="inline-flex items-center gap-1 font-bold text-[#006098] transition-all hover:gap-2 hover:underline">
                See our Ambitious Plans
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-24 lg:py-32">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 max-w-2xl space-y-4 lg:mb-16">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Our Core Capabilities</h2>
              <p className="text-slate-600">Unlocking the potential of domestic manufacturing for the next generation of innovators.</p>
            </div>

            <div ref={servicesRef} className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: CubeFocus,
                  title: 'Design & CAD Intelligence',
                  text: 'Automated analysis that evaluates manufacturability early, streamlining requirements and specifications before work reaches the shop floor.',
                },
                {
                  icon: GitFork,
                  title: 'Intelligent Job Routing',
                  text: 'Algorithmic matching that connects engineering projects directly to verified workshops with active capacity and compatible tooling.',
                },
                {
                  icon: SealCheck,
                  title: 'Standards & Quality Assurance',
                  text: 'End-to-end verification aligned with recognized industrial standards, ensuring locally produced parts meet strict quality benchmarks.',
                },
              ].map((service) => {
                const IconComp = service.icon;
                return (
                  <div
                    key={service.title}
                    data-service-card
                    className="group space-y-6 rounded-2xl bg-[#f8fafc] p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-sky-900/5"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-900/5 transition-colors group-hover:bg-[#004873]">
                      <IconComp size={32} weight="duotone" className="text-[#006098] transition-colors group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">{service.title}</h3>
                    <p className="leading-relaxed text-slate-600">{service.text}</p>
                  </div>
                );
              })}
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

            <div ref={pillarsRef} className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Manufacturers',
                  text: 'Optimize floor usage and connect with high-value contracts from innovative startups.',
                  img: '/landing-manufacturers.jpg',
                  href: '/stakeholders',
                },
                {
                  title: 'Researchers',
                  text: 'Bridge academic theory with industrial practice through collaborative R&D programs.',
                  img: '/landing-researchers.jpg',
                  href: '/research',
                },
                {
                  title: 'Engineers & Designers',
                  text: 'Access tools and mentorship to bring complex hardware designs to life efficiently.',
                  img: '/landing-design.jpg',
                  href: '/prototyping',
                },
              ].map((pillar) => (
                <div
                  key={pillar.title}
                  data-pillar-card
                  className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/10"
                >
                  <img src={pillar.img} alt={pillar.title} className="h-48 w-full rounded-xl object-cover grayscale transition-all hover:grayscale-0" />
                  <h4 className="text-xl font-bold">{pillar.title}</h4>
                  <p className="leading-relaxed text-[#b4d8ff]">{pillar.text}</p>
                  <Link href={pillar.href} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all hover:gap-4">
                    Learn More
                    <ArrowRight size={16} weight="bold" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f2f4f6] py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-3xl font-black tracking-tight text-[#191c1e] sm:mb-10 sm:text-4xl">
              <Link href="/stakeholders" className="transition-colors hover:text-[#004873] hover:underline underline-offset-4">
                Platform Benchmarks*
              </Link>
            </h2>
            <div ref={statsRef} className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8">
              {[
                { value: '±0.02mm', label: 'Tolerance Target' },
                { value: '25+', label: 'Standards Indexed' },
                { value: '6-Factor', label: 'Match Intelligence' },
                { value: '6', label: 'Industrial Hubs' },
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

        <section className="mx-auto w-full max-w-5xl space-y-8 px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-28">
          <Quotes size={72} weight="duotone" className="inline-block text-[#98cbff] opacity-60" />
          <blockquote data-testimonial-item className="text-3xl font-black italic leading-[1.12] tracking-tight text-[#191c1e] sm:text-4xl md:text-5xl">
            DFN is not just a network; it is the coordination infrastructure for African industrial autonomy. By indexing verified machine capacity and standardizing engineering workflows, we turn fragmented workshops into a reliable, enterprise-grade manufacturing pipeline.
          </blockquote>
          <div data-testimonial-item className="space-y-1">
            <div className="text-xl font-black">Udonsi Chris</div>
            <div className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500 sm:text-sm">Head of Product, Digital Fabrication Network</div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#006098]">
                Dispatches & Field Notes
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#191c1e] sm:text-4xl">
                From the Engineering Desk
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#006098] transition-all hover:gap-2 hover:underline"
            >
              <span>View All Articles</span>
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                slug: 'the-problem-of-innovating-in-nigeria',
                category: 'Research',
                readTime: '12 min read',
                title: 'The problem of innovating in Nigeria',
                excerpt:
                  'A field report on how infrastructure friction reshapes technical ambition, and why durable systems matter more than perfect ones.',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC_nVxWjzfx8lLQ8teMBCSFTLUOJIsueT2mdvw-UmwwLoIj_VEe9c923_dIp5-YvRJO3tkkeosigYJq-TGcdsuEDiSwu7pu6klnc79zajN9T9OsBCxilN7iiPMyXZs4JTrB28uurzIXaSXKCozX2hUg-5wx6OFP2QCqlLdKAmuaSOyGexvpNmKDiZnLon9t7ZrI1jzV4kanfLeuP4gN6LR5aBa9xzeg0Nu9lwqskmmQpB_TEjK5_dzf_qBAR5P1eSSSnjMlKnOeyY',
              },
              {
                slug: 'laser-sintering-beyond-traditional-casting',
                category: 'Fabrication',
                readTime: '7 min read',
                title: 'Laser Sintering: Beyond Traditional Casting',
                excerpt:
                  'How additive manufacturing is rewriting the rules for complex internal voids and low-volume production.',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-wcOOgaEAqWm-VWr9P6pqqDEwloigpblC74SSzYc1Zenv_AaOry64KGybJt9zoQEkgG4Y0rexn7w7qzjXSXsiXTvOTEH3TZd0Tg0qtaWXwb8AxTIuDiHjfZ7auSHzBrDl8cIn9VIdcOaIcJ9U8UR0zuGmWYPRDVGX4svkYf32CHbJat55DoLtfBtjo6Nuqm--wTq5WcjljZ3XeGbDQsbGO38Ogw0rAgc3duIklgiXdvw6cpP0zPUVM5VL6WpTE3HeBcV4MssZRMI',
              },
              {
                slug: 'kinematic-couplings-modular-robotics',
                category: 'Mechanical',
                readTime: '6 min read',
                title: 'Kinematic Couplings in Modular Robotics',
                excerpt:
                  'Exploring deterministic location and repeatable precision for interchangeable robot end-effectors.',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy8deUCtUtgB8CjWsWo-oWdzGjGJ9j8pO7SoMdookvTFQTDeDkJMGKfMPvDF_iB5T9ug3wFJreO01L83Flm3eLX3DkwM9lki2-KiXz6Utmg-P1mVzFnCFb4bmMqtItmIxWNUs9PfgsAG_LL1kHB1vqrYhYNH_xPs8jhkrCIaXWbtDs2l48B6LqZfhWZrgTDgdEKQgo0QUYiDxQGpP-7txNIm9WgkSucuwuNOqryf32gU2EePnH2QQ7NkzBY9PTvn4JsdM5P3nnFsg',
              },
            ].map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/70 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-slate-300"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-[#004873] backdrop-blur-sm">
                    {post.category}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs font-semibold text-slate-500">{post.readTime}</span>
                  <h3 className="mt-2 text-lg font-bold text-[#191c1e] transition-colors group-hover:text-[#006098]">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-4 flex items-center gap-1 text-xs font-bold text-[#006098] transition-colors group-hover:text-[#004873]">
                    <span>Read Article</span>
                    <ArrowRight size={14} weight="bold" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
          <div data-cta-final className="relative overflow-hidden rounded-[2rem] bg-[#004873] p-10 text-center text-white shadow-2xl sm:p-16 lg:rounded-[3rem] lg:p-24">
            <div className="absolute inset-0 bg-gradient-to-b from-[#006098] to-[#007abf] opacity-90"></div>
            <div className="relative z-10 space-y-7">
              <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Ready to Build the
                <br />
                Future of African Manufacturing?
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#cee5ff] sm:text-xl">
                Apply for priority access to the DFN Pioneer Cohort. Whether you are developing hardware, operating manufacturing capacity, or seeking resilient domestic supply chains, join our network today.
              </p>
              <div className="pt-3">
                <Link
                  href="/coming-soon"
                  data-cta-pulse
                  className="inline-block rounded-2xl bg-white px-10 py-5 text-xl font-black text-[#004873] shadow-2xl transition-all hover:scale-105 active:scale-95 sm:text-2xl"
                >
                  Join the Waitlist
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
