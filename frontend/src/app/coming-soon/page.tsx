'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  ArrowRight,
  Stack,
  Cpu,
  Factory,
  GraduationCap,
  Buildings,
  BookOpen,
  ShieldCheck,
  Lightning,
  Copy,
  Check,
  Cube,
} from '@phosphor-icons/react';

import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

type RoleKey = 'explorer' | 'provider' | 'researcher' | 'enterprise';

interface RoleOption {
  key: RoleKey;
  label: string;
  icon: typeof Cpu;
}

const ROLES: RoleOption[] = [
  { key: 'explorer', label: 'Makers & Hobbyists', icon: Cpu },
  { key: 'provider', label: 'Workshops & Hubs', icon: Factory },
  { key: 'researcher', label: 'Research Fellows', icon: GraduationCap },
  { key: 'enterprise', label: 'Industry & Institutions', icon: Buildings },
];

interface RoadmapMilestone {
  phase: string;
  title: string;
  detail: string;
  status: 'completed' | 'in-progress' | 'planned';
}

const ROADMAP_ITEMS: RoadmapMilestone[] = [
  {
    phase: 'Phase 01',
    title: 'Geometry & DFM Kernel',
    detail: 'Automated STEP/CAD wall-thickness analysis and toolpath feasibility checks.',
    status: 'completed',
  },
  {
    phase: 'Phase 01',
    title: 'Ground Hub Benchmarking',
    detail: 'On-site calibration and tolerance auditing across 42 machine shops in Nigeria.',
    status: 'completed',
  },
  {
    phase: 'Phase 02',
    title: 'Instant RFQ & Quoting Engine',
    detail: 'Algorithmic machine-hour calculation and live raw-stock price modeling.',
    status: 'in-progress',
  },
  {
    phase: 'Phase 02',
    title: 'Milestone Escrow & Settlement',
    detail: 'Phased inspection-gated payouts and local banking integrations.',
    status: 'in-progress',
  },
  {
    phase: 'Phase 03',
    title: 'Distributed Dispatch Engine',
    detail: 'Direct job routing to idle CNC spindles, sheet metal, and 3D printing labs.',
    status: 'planned',
  },
  {
    phase: 'Phase 03',
    title: 'CMM Metrology Pipeline',
    detail: 'Standardized contact and optical inspection certificates before delivery.',
    status: 'planned',
  },
  {
    phase: 'Phase 04',
    title: 'Shared Tooling & Material Pool',
    detail: 'Aggregated raw billet procurement and regional logistics routing.',
    status: 'planned',
  },
];

function formatHexTicketId(num: number | null | undefined, customHex?: string): string {
  if (customHex && customHex.startsWith('DFN-0x')) return customHex;
  const safeNum = Math.max(1, Number(num) || 1);
  return `DFN-0x${safeNum.toString(16).toUpperCase().padStart(4, '0')}`;
}

export default function ComingSoonPage() {
  const [selectedRole, setSelectedRole] = useState<RoleKey>('explorer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [hexCode, setHexCode] = useState<string>('');
  const [isExistingRegistration, setIsExistingRegistration] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${apiUrl}/api/waitlist/count`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data?.totalCount === 'number') {
          setLiveCount(data.totalCount);
        }
      })
      .catch(() => { });

    const saved = localStorage.getItem('dfn_waitlist_ticket');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.queueNumber) {
          setQueueNumber(parsed.queueNumber);
          setHexCode(parsed.hexCode || formatHexTicketId(parsed.queueNumber));
          setSelectedRole(parsed.role || 'explorer');
          if (parsed.fullName) setFullName(parsed.fullName);
          if (parsed.organization) setOrganization(parsed.organization);
          if (parsed.notes) setNotes(parsed.notes);
          if (parsed.email) setEmail(parsed.email);
          setSubmitted(true);
        }
      } catch { }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setErrorMsg('Please enter a valid work or academic email address.');
      return;
    }

    setSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      // 1. Check if email already registered
      try {
        const checkRes = await fetch(`${apiUrl}/api/waitlist/check?email=${encodeURIComponent(normalizedEmail)}`);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.alreadyRegistered) {
            const qNum = checkData.queueNumber || 1;
            const hex = checkData.hexCode || formatHexTicketId(qNum);
            setQueueNumber(qNum);
            setHexCode(hex);
            if (checkData.role) setSelectedRole(checkData.role);
            if (checkData.fullName) setFullName(checkData.fullName);
            if (checkData.organization) setOrganization(checkData.organization);
            if (checkData.notes) setNotes(checkData.notes);
            setIsExistingRegistration(true);
            setSubmitted(true);
            localStorage.setItem(
              'dfn_waitlist_ticket',
              JSON.stringify({
                queueNumber: qNum,
                hexCode: hex,
                role: checkData.role || selectedRole,
                email: normalizedEmail,
                fullName: checkData.fullName,
                organization: checkData.organization,
                notes: checkData.notes,
                timestamp: checkData.createdAt || new Date().toISOString(),
              })
            );
            return;
          }
        }
      } catch { }

      // 2. Submit new entry
      const response = await fetch(`${apiUrl}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          fullName: fullName.trim() || undefined,
          role: selectedRole,
          organization: organization.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const assignedQueue = data.queueNumber || (liveCount ? liveCount + 1 : 1);
        const resolvedHex = data.hexCode || formatHexTicketId(assignedQueue);
        setQueueNumber(assignedQueue);
        setHexCode(resolvedHex);
        if (data.role) setSelectedRole(data.role);
        if (data.fullName || data.entry?.fullName) setFullName(data.fullName || data.entry?.fullName);
        if (data.organization || data.entry?.organization) setOrganization(data.organization || data.entry?.organization);
        if (data.notes || data.entry?.notes) setNotes(data.notes || data.entry?.notes);
        if (data.alreadyRegistered) setIsExistingRegistration(true);
        setSubmitted(true);
        localStorage.setItem(
          'dfn_waitlist_ticket',
          JSON.stringify({
            queueNumber: assignedQueue,
            hexCode: resolvedHex,
            role: data.role || selectedRole,
            email: normalizedEmail,
            fullName: data.fullName || data.entry?.fullName || fullName,
            organization: data.organization || data.entry?.organization || organization,
            notes: data.notes || data.entry?.notes || notes,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch {
      const fallbackQueue = (liveCount || 0) + 1;
      const resolvedHex = formatHexTicketId(fallbackQueue);
      setQueueNumber(fallbackQueue);
      setHexCode(resolvedHex);
      setSubmitted(true);
      localStorage.setItem(
        'dfn_waitlist_ticket',
        JSON.stringify({
          queueNumber: fallbackQueue,
          hexCode: resolvedHex,
          role: selectedRole,
          email: normalizedEmail,
          fullName,
          organization,
          notes,
          timestamp: new Date().toISOString(),
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentTicketId = formatHexTicketId(queueNumber, hexCode);

  const copyTicketCode = () => {
    if (!currentTicketId) return;
    navigator.clipboard.writeText(currentTicketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      <LandingNavbar />

      <main className="pt-14">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-black tracking-tight text-[#191c1e] sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-[#191c1e] via-[#004873] to-[#007abf] bg-clip-text text-transparent">
                  Coming Soon
                </span>
              </h1>
              <p className="mt-3 text-base sm:text-lg leading-relaxed text-slate-600">
                We are finalizing the final validation phases of West Africa's decentralized digital manufacturing platform.
              </p>
            </div>

            {/* Access Terminal */}
            <div id="waitlist-terminal" className="mx-auto mt-6 max-w-2xl scroll-mt-24">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-[#191c1e] sm:text-xl">
                        Join the Waitlist
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm text-slate-500">
                        Select your track
                      </p>
                    </div>

                    {/* Compact Role Selector */}
                    <div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {ROLES.map((role) => {
                          const isSelected = selectedRole === role.key;
                          const IconComp = role.icon;
                          return (
                            <button
                              key={role.key}
                              type="button"
                              onClick={() => setSelectedRole(role.key)}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all ${isSelected
                                ? 'border-[#006098] bg-[#f0f7ff] text-[#004873] shadow-xs ring-1 ring-[#006098]'
                                : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white'
                                }`}
                            >
                              <IconComp
                                size={16}
                                weight={isSelected ? 'bold' : 'duotone'}
                                className={isSelected ? 'text-[#006098] shrink-0' : 'text-slate-500 shrink-0'}
                              />
                              <span className="text-xs font-semibold leading-tight">{role.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-1 focus:ring-[#006098]"
                        />
                        <input
                          type="email"
                          required
                          placeholder="Work / Institutional Email *"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-1 focus:ring-[#006098]"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Company, Lab or Workshop"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-1 focus:ring-[#006098]"
                        />
                        <input
                          type="text"
                          placeholder="Machine need (e.g. 5-Axis CNC, SLS)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-1 focus:ring-[#006098]"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                        {errorMsg}
                      </div>
                    )}

                    <div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] py-3 text-center text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-[#004873] active:scale-[0.99] disabled:opacity-70"
                      >
                        {submitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Verifying access...</span>
                          </>
                        ) : (
                          <>
                            <span>Reserve Priority Access</span>
                            <ArrowRight size={15} weight="bold" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Confirmed Reservation */
                  <div className="space-y-5 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                      <CheckCircle size={28} weight="duotone" />
                    </div>

                    <div>
                      {isExistingRegistration ? (
                        <span className="inline-block rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-sky-800 mb-1.5">
                          Existing Spot Retrieved
                        </span>
                      ) : null}
                      <h3 className="text-xl font-bold text-[#191c1e] sm:text-2xl">
                        {isExistingRegistration ? 'Reservation Found' : 'Priority Access Confirmed'}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {isExistingRegistration
                          ? 'Your original priority reservation and details have been restored.'
                          : 'Your early access spot has been confirmed.'}
                      </p>
                    </div>

                    {/* Ticket Card */}
                    <div className="mx-auto max-w-sm rounded-xl border border-sky-200 bg-sky-50/50 p-4 text-left">
                      <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Priority Code
                          </span>
                          <div className="text-xl font-black font-mono tracking-tight text-[#004873]">
                            {currentTicketId}
                          </div>
                        </div>
                        <button
                          onClick={copyTicketCode}
                          className="flex items-center gap-1 rounded-lg border border-sky-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#006098] hover:bg-sky-50"
                        >
                          {copied ? (
                            <>
                              <Check size={13} weight="bold" className="text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} weight="bold" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-3 text-xs">
                        <div>
                          <span className="block text-slate-400">Track</span>
                          <span className="font-bold text-[#004873] capitalize">{selectedRole}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400">Queue Spot</span>
                          <span className="font-mono font-bold text-slate-800">#{queueNumber ?? 1}</span>
                        </div>
                        {email && (
                          <div className="col-span-2">
                            <span className="block text-slate-400">Email</span>
                            <span className="font-medium text-slate-700 truncate block">{email}</span>
                          </div>
                        )}
                        {organization && (
                          <div className="col-span-2">
                            <span className="block text-slate-400">Organization</span>
                            <span className="font-medium text-slate-700">{organization}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 pt-1">
                      <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#006098] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004873]"
                      >
                        <BookOpen size={15} weight="duotone" />
                        <span>Read Field Notes</span>
                      </Link>
                      <Link
                        href="/manifesto"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#004873] hover:bg-slate-50"
                      >
                        <span>Manifesto</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="border-t border-slate-200 bg-[#f2f4f6] py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tight text-[#191c1e] sm:text-3xl">
                Engineering Roadmap
              </h2>
            </div>

            {/* Vertical Timeline */}
            <div className="relative mt-12 border-l-2 border-slate-300 ml-4 sm:ml-8 space-y-8">
              {ROADMAP_ITEMS.map((item, idx) => {
                const isCompleted = item.status === 'completed';
                const isInProgress = item.status === 'in-progress';

                return (
                  <div key={idx} className="relative pl-6 sm:pl-8">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-[8px] top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-[#f2f4f6] ${
                        isCompleted
                          ? 'bg-emerald-600'
                          : isInProgress
                          ? 'bg-[#006098] ring-sky-200'
                          : 'bg-slate-300'
                      }`}
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-500">
                          {item.phase}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInProgress
                              ? 'bg-sky-100 text-[#004873]'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Planned'}
                        </span>
                      </div>

                      <h3 className="mt-1 text-sm sm:text-base font-bold text-[#191c1e]">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Technical Capabilities Grid */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-xl">
              <h2 className="text-2xl font-black tracking-tight text-[#191c1e] sm:text-3xl">
                What Powers the Network
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Stack,
                  title: '5-Axis CNC & Wire EDM',
                  desc: 'Subtractive milling with tolerances down to ±0.02mm.',
                },
                {
                  icon: Cube,
                  title: 'Industrial SLS & FDM',
                  desc: 'Nylon, PEEK, and composite 3D printing for functional parts.',
                },
                {
                  icon: ShieldCheck,
                  title: 'CMM Optical Inspection',
                  desc: 'Contact and optical coordinate verification before delivery.',
                },
                {
                  icon: Lightning,
                  title: 'Automated RFQ Routing',
                  desc: 'Algorithmic matching routes jobs to idle machine capacity.',
                },
              ].map((cap) => {
                const CapIcon = cap.icon;
                return (
                  <div
                    key={cap.title}
                    className="rounded-xl border border-slate-200/80 bg-[#f7f9fb] p-5 transition-all hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-900/5 text-[#006098]">
                      <CapIcon size={20} weight="duotone" />
                    </div>
                    <h4 className="mt-3 text-sm font-bold text-[#191c1e]">{cap.title}</h4>
                    <p className="mt-1 text-xs text-slate-600">{cap.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Blog CTA Section */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[#004873] p-7 text-white shadow-sm md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Follow the Engineering Dispatches
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-sky-100">
                Technical articles on distributed manufacturing, CNC protocols, and hardware case studies.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-[#004873] shadow-sm transition-all hover:bg-slate-100 shrink-0"
            >
              <span>Read DFN Blog</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
