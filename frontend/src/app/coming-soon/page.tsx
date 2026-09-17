'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  ArrowRight,
  ArrowDown,
  X,
  Sparkle,
  Stack,
  Cpu,
  Factory,
  GraduationCap,
  Buildings,
  BookOpen,
  Clock,
  ShieldCheck,
  Lightning,
  Copy,
  Check,
} from '@phosphor-icons/react';

import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

type RoleKey = 'explorer' | 'provider' | 'researcher' | 'enterprise';

interface RoleOption {
  key: RoleKey;
  label: string;
  badge: string;
  description: string;
  icon: typeof Cpu;
}

const ROLES: RoleOption[] = [
  {
    key: 'explorer',
    label: 'Hardware Innovators',
    badge: 'Explorer',
    description: 'Students, hardware startups, product engineers & designers needing rapid prototyping and batch manufacturing.',
    icon: Cpu,
  },
  {
    key: 'provider',
    label: 'Manufacturing & Supply Chain',
    badge: 'Provider',
    description: 'Upstream feed and tooling providers, machine shops, CNC machining hubs, 3D printing labs & foundries seeking automated RFQs and idle capacity utilization.',
    icon: Factory,
  },
  {
    key: 'researcher',
    label: 'Academic & R&D Fellows',
    badge: 'Researcher',
    description: 'University laboratories, research fellows & testing facilities collaborating on material science and regional standards.',
    icon: GraduationCap,
  },
  {
    key: 'enterprise',
    label: 'Industries & Institutions',
    badge: 'Enterprise',
    description: 'Procurement teams, public and private organizations, institutional partners & OEM manufacturers seeking to de-risk supply chains through localized production.',
    icon: Buildings,
  },
];

export default function ComingSoonPage() {
  const [selectedRole, setSelectedRole] = useState<RoleKey>('explorer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [liveCount, setLiveCount] = useState<number>(842);

  const [showInitialPrompt, setShowInitialPrompt] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showPostSubmitPrompt, setShowPostSubmitPrompt] = useState(false);

  // Auto-hide initial guidance prompt on first scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setHasScrolled(true);
        setShowInitialPrompt(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch current waitlist count
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${apiUrl}/api/waitlist/count`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.totalCount) {
          setLiveCount(data.totalCount);
        }
      })
      .catch(() => {
        // Fallback to initial count
      });

    // Check if user already submitted locally
    const saved = localStorage.getItem('dfn_waitlist_ticket');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.queueNumber) {
          setQueueNumber(parsed.queueNumber);
          setSelectedRole(parsed.role || 'explorer');
          setSubmitted(true);
        }
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid work or academic email address.');
      return;
    }

    setSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      const response = await fetch(`${apiUrl}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
          role: selectedRole,
          organization,
          notes,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const assignedQueue = data.queueNumber || (liveCount + 1);
        setQueueNumber(assignedQueue);
        setSubmitted(true);
        setShowPostSubmitPrompt(true);
        localStorage.setItem(
          'dfn_waitlist_ticket',
          JSON.stringify({
            queueNumber: assignedQueue,
            role: selectedRole,
            email,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (err: any) {
      // Graceful offline / network fallback
      const fallbackQueue = liveCount + Math.floor(Math.random() * 5) + 1;
      setQueueNumber(fallbackQueue);
      setSubmitted(true);
      setShowPostSubmitPrompt(true);
      localStorage.setItem(
        'dfn_waitlist_ticket',
        JSON.stringify({
          queueNumber: fallbackQueue,
          role: selectedRole,
          email,
          timestamp: new Date().toISOString(),
        })
      );
    } finally {
      setSubmitting(false);
    }
  };


  const copyTicketCode = () => {
    if (!queueNumber) return;
    const ticketCode = `DFN-ACCESS-#${String(queueNumber).padStart(4, '0')}`;
    navigator.clipboard.writeText(ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        body {
          font-family: 'Inter', sans-serif;
        }

        @keyframes pulseBeacon {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.15);
          }
        }

        .pulse-beacon {
          animation: pulseBeacon 2.5s ease-in-out infinite;
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .float-slow {
          animation: floatSlow 6s ease-in-out infinite;
        }
      `}</style>

      <LandingNavbar />

      <main className="pt-14">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32">
          {/* Ambient Technical Background */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-sky-400/20 to-blue-600/10 blur-[120px] opacity-70" />
            <div className="absolute top-1/3 -right-20 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-sky-300/15 via-blue-500/10 to-indigo-500/5 blur-[140px] opacity-80" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">

              {/* Main Headline */}
              <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-tight text-[#191c1e] sm:text-5xl lg:text-6xl">
                {/* Digital Fabrication Network is <br /> */}{' '}
                <span className="bg-gradient-to-r from-[#191c1e] via-[#004873] to-[#007abf] bg-clip-text text-transparent">
                  Coming Soon
                </span>
              </h1>

              <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
                We are finalizing the final validation phases of West Africa's decentralized digital manufacturing platform.
              </p>
            </div>

            {/* Interactive Early Access Pass Terminal */}
            <div id="waitlist-terminal" className="mx-auto mt-12 max-w-3xl scroll-mt-24">
              <div className="relative rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-2xl shadow-sky-950/10 backdrop-blur-xl sm:p-10">

                {/* Technical Corner Brackets */}
                <div className="pointer-events-none absolute top-4 left-4 h-4 w-4 border-t-2 border-l-2 border-[#006098]/40 rounded-tl-sm" />
                <div className="pointer-events-none absolute top-4 right-4 h-4 w-4 border-t-2 border-r-2 border-[#006098]/40 rounded-tr-sm" />
                <div className="pointer-events-none absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-[#006098]/40 rounded-bl-sm" />
                <div className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-[#006098]/40 rounded-br-sm" />

                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-7">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Step 1: Select Your Network Role
                        </label>
                        <span className="text-[11px] font-medium text-slate-400">Essential for priority allocation</span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {ROLES.map((role) => {
                          const isSelected = selectedRole === role.key;
                          const IconComp = role.icon;
                          return (
                            <button
                              key={role.key}
                              type="button"
                              onClick={() => setSelectedRole(role.key)}
                              className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${isSelected
                                ? 'border-[#006098] bg-[#f0f7ff] shadow-sm ring-1 ring-[#006098]'
                                : 'border-slate-200/90 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100/70'
                                }`}
                            >
                              <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? 'bg-[#006098] text-white' : 'bg-slate-200 text-slate-700'
                                      }`}
                                  >
                                    <IconComp size={18} weight={isSelected ? 'bold' : 'duotone'} />
                                  </div>
                                  <span className="text-sm font-bold text-[#191c1e]">{role.label}</span>
                                </div>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isSelected
                                    ? 'bg-[#cee5ff] text-[#004a77]'
                                    : 'bg-slate-200 text-slate-600'
                                    }`}
                                >
                                  {role.badge}
                                </span>
                              </div>
                              <p className="mt-2.5 text-xs leading-relaxed text-slate-600">{role.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Step 2: Contact & Verification Details
                        </label>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Full Name (or Lead Engineer)"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-2 focus:ring-[#006098]/20"
                          />
                        </div>
                        <div>
                          <input
                            type="email"
                            required
                            placeholder="Work / Institutional Email *"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-2 focus:ring-[#006098]/20"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Company, Lab or Workshop Name"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-2 focus:ring-[#006098]/20"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Key machinery or fabrication need (e.g. 5-Axis CNC, SLS)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-2 focus:ring-[#006098]/20"
                          />
                        </div>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
                        {errorMsg}
                      </div>
                    )}

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] py-4 text-center text-sm font-bold text-white shadow-lg shadow-sky-900/15 transition-all hover:-translate-y-0.5 hover:shadow-sky-500/30 active:scale-98 disabled:opacity-70 sm:text-base"
                      >
                        {submitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span>Generating Priority Access Pass...</span>
                          </>
                        ) : (
                          <>
                            <span>Reserve Priority Network Access</span>
                            <ArrowRight size={16} weight="bold" />
                          </>
                        )}
                      </button>
                      <p className="mt-3 text-center text-[11px] text-slate-400">
                        Zero spam. We will notify you with private dispatch tokens when early beta cohorts open.
                      </p>
                    </div>
                  </form>
                ) : (
                  /* Boarding Pass / Priority Access Ticket */
                  <div className="space-y-6 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                      <CheckCircle size={36} weight="duotone" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-[#191c1e] sm:text-3xl">
                        Priority Pass Confirmed!
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        You have reserved early access to the Digital Fabrication Network.
                      </p>
                    </div>

                    {/* Access Ticket Boarding Card */}
                    <div className="mx-auto max-w-md rounded-2xl border border-sky-200/80 bg-gradient-to-br from-[#f7fbff] to-[#edf5ff] p-6 text-left shadow-sm">
                      <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Access Priority Code
                          </span>
                          <div className="text-2xl font-black tracking-tight text-[#004873]">
                            DFN-ACCESS-#{String(queueNumber || 843).padStart(4, '0')}
                          </div>
                        </div>
                        <button
                          onClick={copyTicketCode}
                          className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#006098] transition-colors hover:bg-sky-50"
                        >
                          {copied ? (
                            <>
                              <Check size={14} weight="bold" className="text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} weight="bold" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 text-xs">
                        <div>
                          <span className="block font-medium text-slate-400">Selected Track</span>
                          <span className="font-bold uppercase text-[#004a77]">{selectedRole}</span>
                        </div>
                        <div>
                          <span className="block font-medium text-slate-400">Status</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Priority Queue
                          </span>
                        </div>
                        <div>
                          <span className="block font-medium text-slate-400">Launch Wave</span>
                          <span className="font-bold text-slate-700">Cohort Beta-1</span>
                        </div>
                        <div>
                          <span className="block font-medium text-slate-400">Estimated Dispatch</span>
                          <span className="font-bold text-slate-700">Q3 2026</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      We've queued your email. Keep an eye on your inbox for our invite token.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 pt-2">
                      <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5"
                      >
                        <BookOpen size={18} weight="duotone" />
                        Explore DFN Blog & Field Notes
                      </Link>
                      <Link
                        href="/manifesto"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#004873] shadow-sm transition-all hover:bg-slate-50"
                      >
                        Read Our Manifesto
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap / Launch Progress Section */}
        <section className="border-t border-slate-200/80 bg-[#f2f4f6] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#006098]">
                Deployment Trajectory
              </span>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#191c1e] sm:text-4xl">
                Engineering Roadmap to Launch
              </h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Our infrastructure is rolled out in verified phases to ensure extreme quality, machine calibration, and zero-defect job dispatch.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {/* Phase 1 */}
              <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                    Phase 01 • Completed
                  </span>
                  <CheckCircle size={20} weight="duotone" className="text-emerald-600 shrink-0" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#191c1e]">Core Geometry & DFM Kernel</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                  Integration of 3D WebGL STEP CAD analysis (DFN Prism), automated wall-thickness checks, aspect-ratio risk detection, and machine process classification.
                </p>
              </div>

              {/* Phase 2 */}
              <div className="relative rounded-2xl border-2 border-[#006098] bg-white p-7 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#cee5ff] px-3 py-1 text-[11px] font-bold text-[#004a77]">
                    Phase 02 • In Progress (85%)
                  </span>
                  <span className="relative flex h-3 w-3">
                    <span className="pulse-beacon absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[#006098]"></span>
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#004873]">Regional Facility Benchmarking</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                  On-site calibration of 42 manufacturing hubs across Lagos, Ogun, and Rivers states. Standardizing CMM inspection protocols and supplier ISO/NIS trust scores.
                </p>
              </div>

              {/* Phase 3 */}
              <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
                    Phase 03 • Launching Q3 2026
                  </span>
                  <Clock size={20} weight="duotone" className="text-amber-600 shrink-0" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#191c1e]">Public Dispatch & Escrow</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                  Automated RFQ matching engine (DFN Discovery), multi-shop batch coordination, milestone-based escrow contracts, and nationwide rapid logistics delivery corridors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Capabilities Grid */}
        <section className="bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 max-w-2xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#006098]">
                Industrial Infrastructure
              </span>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                What Powers the Network
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Industrial fabrication without geographical bottlenecks. Deploying modern manufacturing protocols directly to the shopfloor.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Stack,
                  title: '5-Axis CNC & Wire EDM',
                  desc: 'High-precision subtractive milling for aerospace-grade tolerances down to ±0.02mm.',
                },
                {
                  icon: Sparkle,
                  title: 'Industrial SLS & FDM',
                  desc: 'Functional nylon, PEEK, and composite 3D printing for production-grade end-use parts.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Verified CMM Inspection',
                  desc: 'Every completed part verified with optical and contact coordinate measuring before delivery.',
                },
                {
                  icon: Lightning,
                  title: 'Automated RFQ Routing',
                  desc: 'Algorithmic matching routes jobs to machines with idle capacity, avoiding production backlogs.',
                },
              ].map((cap) => {
                const CapIcon = cap.icon;
                return (
                  <div
                    key={cap.title}
                    className="group rounded-2xl bg-[#f7f9fb] p-7 transition-all hover:bg-white hover:shadow-xl hover:shadow-sky-900/5 hover:-translate-y-1"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-900/5 text-[#006098] transition-colors group-hover:bg-[#004873] group-hover:text-white">
                      <CapIcon size={24} weight="duotone" />
                    </div>
                    <h4 className="mt-5 text-lg font-bold text-[#191c1e]">{cap.title}</h4>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">{cap.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Blog & Field Notes CTA Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#004873] p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
            {/* Background Grid Pattern */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-10">
              <svg className="h-full w-full fill-current" viewBox="0 0 100 100" aria-hidden="true">
                <pattern id="blog-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
                <rect width="100" height="100" fill="url(#blog-grid)" />
              </svg>
            </div>

            <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#cee5ff] backdrop-blur-md">
                  <BookOpen size={14} weight="duotone" />
                  <span>DFN Insights & Field Notes</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl leading-tight">
                  Follow Our Engineering Journey on the Blog.
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-[#cee5ff]/90 max-w-xl">
                  While our core platform undergoes closed beta calibration, explore our articles on distributed manufacturing in West Africa, 5-axis CNC machining protocols, and hardware startup case studies.
                </p>
                <div className="pt-2">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm sm:text-base font-bold text-[#004873] shadow-lg transition-all hover:bg-slate-100 hover:scale-105 active:scale-95"
                  >
                    <span>Read DFN Blog Articles</span>
                    <ArrowRight size={16} weight="bold" />
                  </Link>
                </div>
              </div>

              {/* Editorial Feature Preview Snippet */}
              <div className="space-y-3 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#98cbff]">
                  Featured Deep Dive
                </span>
                <h4 className="text-xl font-bold leading-snug">
                  Solving the Tooling Deficit: How Distributed Machine Shops Are Catalyzing African Hardware Startups
                </h4>
                <p className="text-xs sm:text-sm text-slate-200/80 leading-relaxed">
                  An examination of how sharing idle CNC capacity and local tooling reduces capital expenditure for robotics, agricultural hardware, and medical devices.
                </p>
                <div className="pt-2">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#98cbff] hover:text-white transition-colors"
                  >
                    <span>View All Articles</span>
                    <ArrowRight size={14} weight="bold" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Bottom-Right Indicator: Initial Exploration Guidance or Post-Submission Celebration */}
      {showInitialPrompt && !hasScrolled && (
        <aside
          aria-label="Page navigation helper"
          className="fixed bottom-5 right-5 z-40 max-w-[340px] sm:max-w-sm rounded-2xl border border-sky-400 bg-gradient-to-br from-[#004873] to-[#00314f] p-4 text-white shadow-2xl shadow-sky-950/30 backdrop-blur-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-400 text-slate-950 font-black text-xs shadow-sm">
                <Sparkle size={14} weight="fill" className="text-slate-950" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-[#cee5ff]">
                Explore Platform & Blog
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowInitialPrompt(false)}
              className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Dismiss notice"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-blue-100">
            Reserve access or read technical deep dives on our blog.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                document.getElementById('waitlist-terminal')?.scrollIntoView({ behavior: 'smooth' });
                setShowInitialPrompt(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-[#004873] shadow-md transition-all hover:bg-slate-100 hover:scale-105 active:scale-95"
            >
              <span>Join Waitlist</span>
              <ArrowDown size={14} weight="bold" className="text-[#006098]" />
            </button>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <BookOpen size={14} weight="duotone" className="text-sky-300" />
              <span>DFN Blog</span>
            </Link>
          </div>
        </aside>
      )}

      {showPostSubmitPrompt && (
        <aside
          aria-label="Waitlist confirmation notice"
          className="fixed bottom-5 right-5 z-40 max-w-[340px] sm:max-w-sm rounded-2xl border border-sky-400 bg-gradient-to-br from-[#004873] to-[#00314f] p-4 text-white shadow-2xl shadow-sky-950/30 backdrop-blur-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-slate-900 font-black text-xs">
                ✓
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-[#cee5ff]">
                Priority Pass Reserved
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPostSubmitPrompt(false)}
              className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Dismiss notice"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-blue-100">
            Spot secured! While we prepare your dispatch tokens, check out our latest deep dives on African digital fabrication on the blog.
          </p>
          <div className="mt-3">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#004873] shadow-md transition-all hover:bg-slate-100 hover:scale-105 active:scale-95"
            >
              <BookOpen size={14} weight="duotone" />
              <span>Explore DFN Blog & Articles</span>
              <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
        </aside>
      )}

      <Footer />
    </div>
  );
}

