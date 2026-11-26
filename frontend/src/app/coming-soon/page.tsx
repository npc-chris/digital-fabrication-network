'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Copy,
  Cpu,
  Factory,
  GraduationCap,
  Buildings,
  ArrowUpRight,
  BookOpen,
  Target,
  Clock,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react';

import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

type RoleKey = 'explorer' | 'provider' | 'researcher' | 'enterprise';

interface RoleOption {
  key: RoleKey;
  label: string;
  tagline: string;
  icon: typeof Cpu;
}

const ROLES: RoleOption[] = [
  {
    key: 'explorer',
    label: 'Hardware Designers',
    tagline: 'Product builders & startups developing physical devices',
    icon: Cpu,
  },
  {
    key: 'provider',
    label: 'Machine Shops',
    tagline: 'Fabrication hubs, CNC workshops & manufacturing facilities',
    icon: Factory,
  },
  {
    key: 'researcher',
    label: 'Research Fellows',
    tagline: 'University labs, academic R&D & advanced prototyping',
    icon: GraduationCap,
  },
  {
    key: 'enterprise',
    label: 'Industry and Enterprise',
    tagline: 'High-volume production, procurement & supply chain engineering',
    icon: Buildings,
  },
];

interface RoadmapMilestone {
  number: string;
  phaseId: string;
  title: string;
  scope: string;
  status: 'Completed' | 'In Progress' | 'Upcoming' | 'Planned';
  statusStyle: 'emerald' | 'sky' | 'slate';
  deliverables: string[];
  metricLabel: string;
  metricValue: string;
}

const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    number: '01',
    phaseId: 'PHASE 01',
    title: 'Ground Truth & Spindle Benchmarking',
    scope: 'On-site physical auditing of machine tools, spindle repeatability, and shop floor capacity across regional manufacturing hubs.',
    status: 'Completed',
    statusStyle: 'emerald',
    deliverables: [
      'Audited 42+ partner workshops (CNC milling, lathes, Wire EDM, and industrial 3D printing)',
      'Established standardized ±0.02mm baseline tolerance with dial indicator & test cuts',
      'Cataloged spindle travel, RPM envelopes, and verified material handling capabilities',
    ],
    metricLabel: 'Audited Hubs',
    metricValue: '42 Facilities',
  },
  {
    number: '02',
    phaseId: 'PHASE 02',
    title: 'Automated Quoting & Escrow Settlement',
    scope: 'Instant CAD geometry evaluation and spindle-hour pricing paired with inspection-gated milestone escrow to protect both clients and shops.',
    status: 'In Progress',
    statusStyle: 'sky',
    deliverables: [
      'Automated STEP/CAD file analysis for wall-thickness, undercuts, and tool reach constraints',
      'Transparent pricing algorithms based on spindle hours and live raw stock prices',
      'Milestone escrow architecture releasing payments only upon verified part sign-off',
    ],
    metricLabel: 'Quoting Latency',
    metricValue: '<60 Seconds',
  },
  {
    number: '03',
    phaseId: 'PHASE 03',
    title: 'Decentralized Job Routing & Quality Assurance',
    scope: 'Algorithmic capacity routing to verified idle machines, supported by standardized contact probe and optical CMM inspection sheets.',
    status: 'Upcoming',
    statusStyle: 'slate',
    deliverables: [
      'Automated dispatch matching part geometry to optimal idle machines in regional clusters',
      'Standardized post-machining inspection sheets with calibrated optical/CMM measurements',
      'Batch QR verification tags and material cert traceability for aerospace and industrial parts',
    ],
    metricLabel: 'Target Quality',
    metricValue: '99.4% First-Pass',
  },
  {
    number: '04',
    phaseId: 'PHASE 04',
    title: 'Shared Material Pool & Regional Logistics',
    scope: 'Consolidated raw material purchasing and scheduled inter-hub ground delivery rails across major manufacturing corridors in West Africa.',
    status: 'Planned',
    statusStyle: 'slate',
    deliverables: [
      'Bulk wholesale purchasing pool for certified 6061 aluminum, stainless, brass, and Delrin',
      'Centralized cutting tool and carbide insert exchange reducing tooling overhead for shops',
      'Dedicated local ground logistics connecting fabrication hubs with hardware teams in 48–72h',
    ],
    metricLabel: 'Material Savings',
    metricValue: 'Up to 25%',
  },
];

const CAPABILITIES = [
  {
    title: '5-Axis CNC & Wire EDM',
    category: 'SUBTRACTIVE PRECISION',
    spec: '±0.02mm Tolerances',
    description: 'Complex aerospace & industrial milling in 6061 aluminum, 316 stainless, brass, and tool steel.',
    image: '/root-hero-img.jpg',
    telemetry: 'Spindle RPM: 15,000 · Wire EDM Ra: 0.4µm',
  },
  {
    title: 'Industrial SLS & High-Temp FDM',
    category: 'ADDITIVE PRODUCTION',
    spec: 'Toolless Geometries',
    description: 'Nylon PA12, carbon-fiber reinforced PEEK, and rapid functional prototypes with zero tooling delay.',
    image: '/landing-design.jpg',
    telemetry: 'Layer Resolution: 50µm · Density: 99.8%',
  },
  {
    title: 'Optical CMM Metrology',
    category: 'QUALITY VERIFICATION',
    spec: 'NIST-Traceable Reports',
    description: 'Every production run verified with contact probe coordinate measuring and full dimensional certs.',
    image: '/landing-researchers.jpg',
    telemetry: 'Coordinate Accuracy: 1.8µm + L/300',
  },
  {
    title: 'Decentralized Spindle Dispatch',
    category: 'NETWORK INFRASTRUCTURE',
    spec: 'Algorithmic Routing',
    description: 'Automated job allocation balancing load across 42 calibrated workshops to eliminate machine downtime.',
    image: '/landing-manufacturers.jpg',
    telemetry: 'Cluster Capacity: 1,840 Machine Hrs/Wk',
  },
];

const DISPATCHES = [
  {
    slug: 'the-problem-of-innovating-in-nigeria',
    category: 'Research',
    readTime: '12 min read',
    title: 'The Problem of Innovating in Nigeria: Why Durable Systems Trump Perfect Ones',
    summary: 'A field report on how infrastructure friction reshapes technical ambition, and why durable systems matter more than perfect ones.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC_nVxWjzfx8lLQ8teMBCSFTLUOJIsueT2mdvw-UmwwLoIj_VEe9c923_dIp5-YvRJO3tkkeosigYJq-TGcdsuEDiSwu7pu6klnc79zajN9T9OsBCxilN7iiPMyXZs4JTrB28uurzIXaSXKCozX2hUg-5wx6OFP2QCqlLdKAmuaSOyGexvpNmKDiZnLon9t7ZrI1jzV4kanfLeuP4gN6LR5aBa9xzeg0Nu9lwqskmmQpB_TEjK5_dzf_qBAR5P1eSSSnjMlKnOeyY',
  },
  {
    slug: 'laser-sintering-beyond-traditional-casting',
    category: 'Fabrication',
    readTime: '7 min read',
    title: 'Laser Sintering: Beyond Traditional Casting for Complex Functional Parts',
    summary: 'How additive manufacturing is rewriting the rules for complex internal cooling channels and low-volume tooling without expensive dies.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-wcOOgaEAqWm-VWr9P6pqqDEwloigpblC74SSzYc1Zenv_AaOry64KGybJt9zoQEkgG4Y0rexn7w7qzjXSXsiXTvOTEH3TZd0Tg0qtaWXwb8AxTIuDiHjfZ7auSHzBrDl8cIn9VIdcOaIcJ9U8UR0zuGmWYPRDVGX4svkYf32CHbJat55DoLtfBtjo6Nuqm--wTq5WcjljZ3XeGbDQsbGO38Ogw0rAgc3duIklgiXdvw6cpP0zPUVM5VL6WpTE3HeBcV4MssZRMI',
  },
  {
    slug: 'kinematic-couplings-modular-robotics',
    category: 'Mechanical',
    readTime: '6 min read',
    title: 'Kinematic Couplings in Modular Robotics',
    summary: 'Exploring deterministic location and repeatable sub-micron precision for interchangeable robot end-effectors in distributed manufacturing.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy8deUCtUtgB8CjWsWo-oWdzGjGJ9j8pO7SoMdookvTFQTDeDkJMGKfMPvDF_iB5T9ug3wFJreO01L83Flm3eLX3DkwM9lki2-KiXz6Utmg-P1mVzFnCFb4bmMqtItmIxWNUs9PfgsAG_LL1kHB1vqrYhYNH_xPs8jhkrCIaXWbtDs2l48B6LqZfhWZrgTDgdEKQgo0QUYiDxQGpP-7txNIm9WgkSucuwuNOqryf32gU2EePnH2QQ7NkzBY9PTvn4JsdM5P3nnFsg',
  },
];

const WAITLIST_API_URL = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');

function formatHexTicketId(num: number | null | undefined, customHex?: string): string {
  if (customHex && customHex.startsWith('DFN-0x')) return customHex;
  const safeNum = Math.max(1, Number(num) || 1);
  return `DFN-0x${safeNum.toString(16).toUpperCase().padStart(4, '0')}`;
}

export default function ComingSoonV2Page() {
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
    fetch(`${WAITLIST_API_URL}/api/waitlist/count`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data?.totalCount === 'number') {
          setLiveCount(data.totalCount);
        }
      })
      .catch(() => {});

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
      } catch {}
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

    try {
      // 1. Check if email already registered
      try {
        const checkRes = await fetch(
          `${WAITLIST_API_URL}/api/waitlist/check?email=${encodeURIComponent(normalizedEmail)}`
        );
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
      } catch {}

      // 2. Submit new entry
      const response = await fetch(`${WAITLIST_API_URL}/api/waitlist`, {
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

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
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
        throw new Error(
          data?.error || 'Unable to complete waitlist registration right now. Please try again.'
        );
      }
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : '';
      const isNetworkError =
        !rawMessage ||
        rawMessage === 'Failed to fetch' ||
        rawMessage.includes('NetworkError') ||
        rawMessage.includes('Load failed');
      setErrorMsg(
        isNetworkError
          ? 'Unable to reach the waitlist server right now. Please try again in a moment.'
          : rawMessage
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
      <LandingNavbar active={null} />

      <main className="pt-14">
        {/* HERO SECTION: Split Layout with Form on Left & Team Photo with Goals on Right */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
          {/* Subtle Technical Blueprint Background Grid */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-sky-400/10 via-blue-500/5 to-transparent blur-[140px]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header Area without AI Pills */}
            <div className="mb-10 max-w-3xl">
              <h1 className="text-4xl font-black tracking-tight text-[#191c1e] sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-[#191c1e] via-[#004873] to-[#007abf] bg-clip-text text-transparent">
                  Coming Soon
                </span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-slate-600 sm:text-xl">
                We&apos;re uniting Nigeria&apos;s verified machine shops, fabs, and engineering labs into one decentralized production cloud. Turn designs into physical parts in days—without import delays or customs bottlenecks.
              </p>
            </div>

            {/* Split Grid: Left = Waitlist Form, Right = Team Photo & Platform Goals */}
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Left Column: Waitlist Form */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="border-b border-slate-100 pb-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold tracking-tight text-[#191c1e]">
                            Join the Waitlist
                          </h2>
                          <div className="font-mono text-xs font-semibold text-slate-500">
                            QUEUE: #{liveCount ? liveCount + 1 : '...'}
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Get early access to Nigeria&apos;s distributed manufacturing platform for rapid prototyping, small-batch production, and hardware R&amp;D.
                        </p>
                      </div>

                      {/* Track Selector with Tagline and Industrial Styling */}
                      <div>
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Primary Track
                        </label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {ROLES.map((role) => {
                            const isSelected = selectedRole === role.key;
                            const IconComp = role.icon;
                            return (
                              <button
                                key={role.key}
                                type="button"
                                onClick={() => setSelectedRole(role.key)}
                                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                                  isSelected
                                    ? 'border-[#006098] bg-[#f0f7ff] text-[#004873] shadow-xs ring-1 ring-[#006098]'
                                    : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-white'
                                }`}
                              >
                                <div
                                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                    isSelected ? 'bg-[#006098] text-white' : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  <IconComp size={15} weight="bold" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold leading-tight">{role.label}</div>
                                  <div className="text-[10px] text-slate-500 truncate">{role.tagline}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Inputs Grid: Name, Email, Org, Role */}
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Tunde Balogun"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-1 focus:ring-[#006098]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Email <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="tunde@lab.unilag.edu.ng"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-1 focus:ring-[#006098]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Organization
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Apex Precision Tools or UNILAG"
                              value={organization}
                              onChange={(e) => setOrganization(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-1 focus:ring-[#006098]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Role
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Lead Engineer, Shop Owner, Researcher"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-1 focus:ring-[#006098]"
                            />
                          </div>
                        </div>
                      </div>

                      {errorMsg && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                          {errorMsg}
                        </div>
                      )}

                      <div className="pt-1">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#004873] py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-sky-900/15 transition-all hover:from-[#007abf] hover:to-[#004873] active:scale-[0.99] disabled:opacity-70"
                        >
                          {submitting ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>Joining Waitlist...</span>
                            </>
                          ) : (
                            <>
                              <span>Join Waitlist</span>
                              <ArrowRight size={15} weight="bold" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Confirmed Allocation Ticket Card */
                    <div className="space-y-6">
                      <div className="border-b border-slate-200 pb-4">
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-700">
                            {isExistingRegistration ? 'WAITLIST ENTRY RETRIEVED' : 'WAITLIST ENTRY CONFIRMED'}
                          </div>
                          <div className="font-mono text-xs text-slate-400">
                            DATE: {new Date().toLocaleDateString()}
                          </div>
                        </div>
                        <h3 className="mt-1 text-2xl font-black text-[#191c1e]">
                          {isExistingRegistration ? 'Existing Allocation Retrieved' : 'Priority Access Confirmed'}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          You&apos;re on the priority queue for platform rollout and beta testing.
                        </p>
                      </div>

                      {/* Ticket Representation */}
                      <div className="rounded-xl border border-sky-300/80 bg-gradient-to-br from-sky-50/70 via-white to-slate-50 p-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-sky-200/70 pb-3">
                          <div>
                            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Access Token
                            </div>
                            <div className="font-mono text-2xl font-black tracking-tight text-[#004873]">
                              {currentTicketId}
                            </div>
                          </div>
                          <button
                            onClick={copyTicketCode}
                            className="flex items-center gap-1.5 rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-xs font-bold text-[#006098] shadow-xs transition-all hover:bg-sky-50 active:scale-95"
                          >
                            {copied ? (
                              <>
                                <Check size={14} weight="bold" className="text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} weight="bold" />
                                <span>Copy Token</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Ticket Meta Details */}
                        <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                          <div>
                            <span className="block font-mono text-[10px] uppercase text-slate-400">Track Category</span>
                            <span className="font-bold text-[#004873] capitalize">
                              {ROLES.find((r) => r.key === selectedRole)?.label || selectedRole}
                            </span>
                          </div>
                          <div>
                            <span className="block font-mono text-[10px] uppercase text-slate-400">Queue Position</span>
                            <span className="font-mono font-bold text-slate-800">#{queueNumber ?? 1}</span>
                          </div>
                          {email && (
                            <div className="col-span-2">
                              <span className="block font-mono text-[10px] uppercase text-slate-400">Email Address</span>
                              <span className="font-medium text-slate-700 truncate block">{email}</span>
                            </div>
                          )}
                          {organization && (
                            <div className="col-span-2">
                              <span className="block font-mono text-[10px] uppercase text-slate-400">Organization</span>
                              <span className="font-medium text-slate-700">{organization}</span>
                            </div>
                          )}
                        </div>

                        {/* Barcode Graphic Effect */}
                        <div className="mt-4 border-t border-sky-200/70 pt-3">
                          <div className="flex h-5 w-full items-center justify-between opacity-40">
                            {[4, 2, 6, 1, 3, 5, 2, 7, 2, 4, 1, 5, 3, 2, 6, 2, 4, 3, 5, 1, 3, 6, 2, 5, 3, 4, 2].map(
                              (w, i) => (
                                <div key={i} className="h-full bg-slate-900" style={{ width: `${w * 1.5}px` }} />
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <Link
                          href="/blog"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#006098] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#004873]"
                        >
                          <BookOpen size={15} weight="duotone" />
                          <span>Explore Field Dispatches</span>
                        </Link>
                        <Link
                          href="/manifesto"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-[#004873] transition-all hover:bg-slate-50"
                        >
                          <span>System Manifesto</span>
                          <ArrowUpRight size={13} weight="bold" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Picture of Team followed by Highlights of Goals */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                  {/* Photo of Team & Researchers Collaborating in Lab */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
                    <img
                      src="/landing-researchers.jpg"
                      alt="DFN engineering team and researchers collaborating on hardware prototyping"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white">
                      <div>
                        <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-300">
                          Collaborative Engineering &amp; Research
                        </div>
                        <div className="text-sm font-bold sm:text-base">
                          DFN Team &amp; Academic Researchers in the Lab
                        </div>
                      </div>
                      <div className="rounded-md bg-white/20 px-2 py-1 font-mono text-[10px] font-semibold backdrop-blur-xs">
                        ON GROUND
                      </div>
                    </div>
                  </div>

                  {/* Highlights of Goals */}
                  <div className="p-6 sm:p-7">
                    <div className="mb-4 flex items-center gap-2">
                      <Target size={18} weight="bold" className="text-[#006098]" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                        Platform Objectives &amp; Mission
                      </h3>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#006098]">
                          <Check size={12} weight="bold" />
                        </div>
                        <div className="text-xs leading-relaxed text-slate-700">
                          <strong className="text-slate-900">Network 50+ Machine Hubs:</strong> Unify verified CNC machine shops, precision turning centers, and 3D print labs into a synchronized national production cloud.
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#006098]">
                          <Check size={12} weight="bold" />
                        </div>
                        <div className="text-xs leading-relaxed text-slate-700">
                          <strong className="text-slate-900">Instant DFM &amp; Quoting:</strong> Replace slow manual procurement with automated toolpath analysis, wall-thickness checks, and instant spindle-hour pricing.
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#006098]">
                          <Check size={12} weight="bold" />
                        </div>
                        <div className="text-xs leading-relaxed text-slate-700">
                          <strong className="text-slate-900">Guaranteed ±0.02mm Tolerances:</strong> Enforce ISO 2768-m dimensional precision through standardized CMM inspection sheets and milestone-gated escrow releases.
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#006098]">
                          <Check size={12} weight="bold" />
                        </div>
                        <div className="text-xs leading-relaxed text-slate-700">
                          <strong className="text-slate-900">Domestic Supply Chain Resilience:</strong> Slash hardware prototyping lead times from 8–12 weeks of international shipping down to 48–72 hours of local manufacturing.
                        </div>
                      </div>
                    </div>

                    {/* Benchmark Metrics Strip */}
                    <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-5 text-center">
                      <div>
                        <div className="font-mono text-xl font-black text-[#006098]">42+</div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                          Audited Hubs
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-xl font-black text-slate-900">±0.02mm</div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                          Tolerance Baseline
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-xl font-black text-emerald-600">&lt;60s</div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                          Instant Quotes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: VERTICAL TIMELINE DIAGRAM ONLY */}
        <section className="relative border-t border-slate-200 bg-[#f2f4f6] py-16 sm:py-20 lg:py-24 overflow-hidden">
          {/* Subtle Blueprint Radial Texture */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#00487315_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="border-b border-slate-300/70 pb-8 text-center sm:text-left">
              <h2 className="text-3xl font-black tracking-tight text-[#191c1e] sm:text-4xl">
                Our Roadmap
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Staged progression from physical spindle calibration to decentralized multi-hub production.
              </p>
            </div>

            {/* VERTICAL TIMELINE DIAGRAM */}
            <div className="relative mx-auto mt-14 max-w-4xl">
              <div className="space-y-12 sm:space-y-16">
                {ROADMAP_MILESTONES.map((milestone, idx) => {
                  const isLeft = idx % 2 === 0;
                  const isCompleted = milestone.status === 'Completed';
                  const isInProgress = milestone.status === 'In Progress';
                  const hasNext = idx < ROADMAP_MILESTONES.length - 1;

                  return (
                    <div
                      key={milestone.number}
                      className={`relative flex flex-col sm:flex-row items-start ${
                        isLeft ? 'sm:flex-row-reverse' : ''
                      } gap-6 sm:gap-12 group`}
                    >
                      {/* Vertical line connecting this node down to the next node. Terminated at Milestone 4 (no line after last item). */}
                      {hasNext && (
                        <div
                          className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-9 -bottom-12 sm:-bottom-16 w-[2px] bg-gradient-to-b from-sky-600 via-sky-400 to-slate-300 pointer-events-none"
                          aria-hidden="true"
                        />
                      )}

                      {/* Center Node Indicator */}
                      <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-white shadow-md">
                        {isCompleted ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                            <Check size={16} weight="bold" />
                          </div>
                        ) : isInProgress ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#006098] text-white shadow-xs">
                            <span className="font-mono text-xs font-bold">{milestone.number}</span>
                          </div>
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 font-mono text-xs font-semibold">
                            {milestone.number}
                          </div>
                        )}
                      </div>

                      {/* Milestone Card */}
                      <div className="ml-12 sm:ml-0 w-full sm:w-[calc(50%-2.5rem)] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                        {/* Phase Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="font-mono text-xs font-black tracking-wider text-slate-400">
                            {milestone.phaseId}
                          </span>
                          <span
                            className={`font-mono text-[11px] font-bold tracking-wider ${
                              isCompleted
                                ? 'text-emerald-700'
                                : isInProgress
                                ? 'text-[#006098]'
                                : 'text-slate-500'
                            }`}
                          >
                            {milestone.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Title and Scope */}
                        <h3 className="mt-3 text-lg font-bold text-[#191c1e] sm:text-xl">
                          {milestone.title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-600">
                          {milestone.scope}
                        </p>

                        {/* Key Deliverables */}
                        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Milestone Deliverables
                          </div>
                          {milestone.deliverables.map((item, dIdx) => (
                            <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="mt-0.5 text-[#006098] font-bold">▸</span>
                              <span className="leading-snug">{item}</span>
                            </div>
                          ))}
                        </div>

                        {/* Telemetry / Metric Box */}
                        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs">
                          <span className="text-[10px] uppercase text-slate-400 font-semibold">{milestone.metricLabel}</span>
                          <span className="font-bold text-[#004873]">{milestone.metricValue}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Repurposed Strip: Core Platform Guarantees */}
            <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-slate-300/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="mb-4 font-mono text-xs font-bold uppercase tracking-wider text-[#006098]">
                Network Value Guarantees
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900">Zero Customs Bottlenecks</div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Machined and 3D printed inside Nigeria to eliminate 8–12 week international freight delays.
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900">Verified ±0.02mm Precision</div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Spindle calibrations and CMM dimensional inspection before parts leave the shop floor.
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900">Milestone-Gated Escrow</div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Client funds remain locked safely in escrow until manufactured parts are approved.
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900">Domestic Raw Materials</div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    Direct access to certified 6061 aluminum, 316 stainless, brass, and engineering polymers.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PHYSICAL MACHINERY & CAPABILITIES */}
        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <h2 className="text-3xl font-black tracking-tight text-[#191c1e] sm:text-4xl">
                What We Have Now
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Audited fabrication machinery and production capabilities across our partner network.
              </p>
            </div>

            {/* 4 Rich Visual Photography Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {CAPABILITIES.map((cap) => (
                <div
                  key={cap.title}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f7f9fb] transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                >
                  {/* Photo Container */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={cap.image}
                      alt={cap.title}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Category Stamp */}
                    <div className="absolute top-3 left-3 font-mono text-[9px] font-bold uppercase tracking-wider text-white/90">
                      {cap.category}
                    </div>

                    {/* Spec Stamp */}
                    <div className="absolute bottom-3 left-3 font-mono text-xs font-bold text-sky-300">
                      {cap.spec}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-bold text-[#191c1e] transition-colors group-hover:text-[#006098]">
                      {cap.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {cap.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-200/80 font-mono text-[10px] text-slate-500">
                      {cap.telemetry}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: FIELD NOTES & DISPATCH REPORTS */}
        <section className="border-t border-slate-200 bg-[#f2f4f6] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-black text-[#191c1e] sm:text-3xl">
                  Field Notes &amp; Dispatch Reports
                </h2>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Technical write-ups, manufacturing protocols, and on-ground case studies from the DFN engineering team.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider text-[#006098] hover:underline"
              >
                <span>View Full Index</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {DISPATCHES.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 rounded-md bg-white/90 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-xs">
                      {post.category}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                        <Clock size={12} weight="bold" />
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-[#191c1e] transition-colors group-hover:text-[#006098]">
                        {post.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-[#006098] pt-3 border-t border-slate-100">
                      <span>Read Dispatch</span>
                      <ArrowRight size={13} weight="bold" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
