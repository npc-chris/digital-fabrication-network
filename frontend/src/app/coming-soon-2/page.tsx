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
  ShieldCheck,
  Cube,
  CheckCircle,
  Lightning,
  Crosshair,
  Compass,
  Wrench,
  BookOpen,
  ArrowUpRight,
  Gauge,
  SlidersHorizontal,
  TreeStructure,
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
  { key: 'explorer', label: 'Hardware Designers', tagline: 'Product builders & startups', icon: Cpu },
  { key: 'provider', label: 'Machine Shops', tagline: 'CNC & fabrication hubs', icon: Factory },
  { key: 'researcher', label: 'University Labs', tagline: 'Academic R&D & prototyping', icon: GraduationCap },
  { key: 'enterprise', label: 'Industrial Enterprise', tagline: 'Volume production & procurement', icon: Buildings },
];

interface RoadmapDeliverable {
  label: string;
  metric?: string;
}

interface RoadmapMilestone {
  number: string;
  phaseId: string;
  title: string;
  scope: string;
  state: 'validated' | 'active' | 'staged' | 'projected';
  stateLabel: string;
  verificationProtocol: string;
  calibratedEquipment: string[];
  hubClusters: string[];
  deliverables: RoadmapDeliverable[];
  telemetry: { label: string; value: string }[];
}

const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    number: '01',
    phaseId: 'PHASE 01',
    title: 'Ground Truth & Kernel Calibration',
    scope: 'On-site machine calibration and automated CAD geometry validation across regional industrial clusters.',
    state: 'validated',
    stateLabel: 'VALIDATED ON-SITE',
    verificationProtocol: 'ISO 230-2 Spindle Repeatability & Dial Indicator Test Run',
    calibratedEquipment: ['Haas VF-4 5-Axis VMC', 'Mazak Super Velocity', 'Charmilles Wire EDM', 'Bridgeport Knees'],
    hubClusters: ['Ikeja Industrial Estate', 'Ilupeju Light Industrial', 'Ogun Agbara Cluster', 'Enugu Industrial Zone'],
    deliverables: [
      { label: 'Automated STEP/CAD kernel for wall-thickness & undercut checks' },
      { label: 'Calibrated spindle auditing across 42 machine shops in Nigeria' },
      { label: 'Standardized ±0.02mm tolerance baseline for precision metal parts' },
    ],
    telemetry: [
      { label: 'Audited Hubs', value: '42 Facilities' },
      { label: 'Indexed Spindles', value: '140+ Machines' },
      { label: 'CAD Kernel', value: 'v1.2 Deployed' },
    ],
  },
  {
    number: '02',
    phaseId: 'PHASE 02',
    title: 'Algorithmic Quoting & Escrow Settlement',
    scope: 'Instant machine-hour pricing models coupled with inspection-gated milestone payment releases.',
    state: 'active',
    stateLabel: 'ACTIVE STAGING',
    verificationProtocol: 'Deterministic Toolpath Time Estimator & Live Metals Spot Feed',
    calibratedEquipment: ['3- & 4-Axis CNC Milling', 'CNC Turning Centers', 'EOS Formiga P 110 SLS'],
    hubClusters: ['Lagos Mainland Rail', 'Abeokuta Heavy Hub', 'Port Harcourt Machine Valley'],
    deliverables: [
      { label: 'Algorithmic spindle-hour pricing based on toolpath complexity' },
      { label: 'Live raw stock indexing for 6061 Aluminum, Brass, and Delrin' },
      { label: 'Inspection-gated milestone escrow releasing upon metrology sign-off' },
    ],
    telemetry: [
      { label: 'Quote Latency', value: '<60 Seconds' },
      { label: 'Escrow Engine', value: 'Phased Payouts' },
      { label: 'Settlement Rail', value: 'Direct Banking' },
    ],
  },
  {
    number: '03',
    phaseId: 'PHASE 03',
    title: 'Distributed Dispatch & Metrology Pipeline',
    scope: 'Algorithmic capacity routing to idle machine spindles with certified optical & contact CMM inspection.',
    state: 'staged',
    stateLabel: 'STAGED DEPLOYMENT',
    verificationProtocol: 'Contact Probe CMM Coordinate Verification & NIST Calibration',
    calibratedEquipment: ['Mitutoyo Crysta-Plus CMM', 'GOM ATOS Optical Scanner', 'Fiber Laser Marking'],
    hubClusters: ['National Pilot Hubs', 'Lekki Free Zone', 'Nnewi Industrial Corridor'],
    deliverables: [
      { label: 'Direct job routing to verified idle CNC, Wire EDM, and SLS labs' },
      { label: 'Standardized contact probe & optical CMM inspection certificates' },
      { label: 'Laser-etched batch QR verification and material traceability sheets' },
    ],
    telemetry: [
      { label: 'Routing Kernel', value: 'Load Balanced' },
      { label: 'Metrology Spec', value: 'NIST Traceable' },
      { label: 'Quality Target', value: '99.4% First-Pass' },
    ],
  },
  {
    number: '04',
    phaseId: 'PHASE 04',
    title: 'Shared Tooling & Material Clearinghouse',
    scope: 'Aggregated procurement for raw billets, carbide tooling, and regional inter-hub logistics rails.',
    state: 'projected',
    stateLabel: 'EXPANSION HORIZON',
    verificationProtocol: 'Batch Mill Certification & Regional Bonded Logistics Network',
    calibratedEquipment: ['Bulk Cold-Rolled Billet Sawing', 'Sandvik Coromant Tooling Exchange', 'Dedicated Transport'],
    hubClusters: ['ECOWAS Regional Corridor', 'Accra-Lagos Logistics Rail'],
    deliverables: [
      { label: 'Aggregated raw billet procurement reducing stock costs by up to 25%' },
      { label: 'Centralized high-performance carbide cutting tool & insert exchange' },
      { label: 'Inter-hub regional ground logistics routing across West Africa' },
    ],
    telemetry: [
      { label: 'Billet Sourcing', value: 'Bulk Wholesale' },
      { label: 'Tooling Pool', value: 'Shared Catalog' },
      { label: 'Coverage', value: 'West Africa Rail' },
    ],
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
    category: 'FIELD REPORT',
    readTime: '6 min read',
    title: 'The Problem of Innovating in Nigeria: Why Durable Systems Trump Perfect Ones',
    summary: 'How infrastructure friction reshapes technical ambition, and how distributed fabrication solves the local supply bottleneck.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC_nVxWjzfx8lLQ8teMBCSFTLUOJIsueT2mdvw-UmwwLoIj_VEe9c923_dIp5-YvRJO3tkkeosigYJq-TGcdsuEDiSwu7pu6klnc79zajN9T9OsBCxilN7iiPMyXZs4JTrB28uurzIXaSXKCozX2hUg-5wx6OFP2QCqlLdKAmuaSOyGexvpNmKDiZnLon9t7ZrI1jzV4kanfLeuP4gN6LR5aBa9xzeg0Nu9lwqskmmQpB_TEjK5_dzf_qBAR5P1eSSSnjMlKnOeyY',
  },
  {
    slug: 'laser-sintering-beyond-traditional-casting',
    category: 'FABRICATION',
    readTime: '7 min read',
    title: 'Laser Sintering: Beyond Traditional Casting for Complex Functional Parts',
    summary: 'Rewriting the rules for internal cooling channels and low-volume tooling without expensive tooling dies.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-wcOOgaEAqWm-VWr9P6pqqDEwloigpblC74SSzYc1Zenv_AaOry64KGybJt9zoQEkgG4Y0rexn7w7qzjXSXsiXTvOTEH3TZd0Tg0qtaWXwb8AxTIuDiHjfZ7auSHzBrDl8cIn9VIdcOaIcJ9U8UR0zuGmWYPRDVGX4svkYf32CHbJat55DoLtfBtjo6Nuqm--wTq5WcjljZ3XeGbDQsbGO38Ogw0rAgc3duIklgiXdvw6cpP0zPUVM5VL6WpTE3HeBcV4MssZRMI',
  },
];

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
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(1); // Phase 2 default active
  const [roadmapViewMode, setRoadmapViewMode] = useState<'timeline' | 'matrix'>('timeline');

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${apiUrl}/api/waitlist/count`)
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
      } catch {}

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

  const activeMilestone = ROADMAP_MILESTONES[activePhaseIndex] || ROADMAP_MILESTONES[1];

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
      {/* Top Testing Context Bar */}
      <div className="sticky top-0 z-50 border-b border-sky-900/10 bg-slate-900 px-4 py-2 text-xs text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sky-400">TEST ROUTE: /coming-soon-2</span>
            <span className="hidden text-slate-400 sm:inline">|</span>
            <span className="hidden text-slate-400 sm:inline">
              Refined layout: Zero AI pill badges, full industrial photography, crisp microcopy, and vertical timeline diagram
            </span>
          </div>
          <Link
            href="/coming-soon"
            className="flex items-center gap-1 font-mono font-semibold text-white underline decoration-sky-400 underline-offset-4 hover:text-sky-300"
          >
            <span>Compare with Original (/coming-soon)</span>
            <ArrowRight size={13} weight="bold" />
          </Link>
        </div>
      </div>

      <LandingNavbar active={null} />

      <main className="pt-8">
        {/* HERO SECTION: Split Industrial Layout with High-Fidelity Visual Anchor */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
          {/* Subtle Technical Blueprint Background Grid */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-sky-400/10 via-blue-500/5 to-transparent blur-[140px]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header Area without AI Pills */}
            <div className="mb-10 max-w-3xl">
              <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#006098]">
                // 01 ARCHITECTURE & ACCESS TERMINAL
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[#191c1e] sm:text-5xl lg:text-6xl">
                The Physical Fabrication
                <br />
                <span className="bg-gradient-to-r from-[#191c1e] via-[#004873] to-[#007abf] bg-clip-text text-transparent">
                  Network.
                </span>
              </h1>
              <p className="mt-4 text-lg text-slate-600 sm:text-xl">
                Connecting Nigeria's verified machine shops, CNC spindles, and engineering labs into one on-demand production cloud.
              </p>
            </div>

            {/* Split Grid: Left = Access Allocation Terminal, Right = Active Hardware Viewport */}
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Access Terminal Column */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
                  {/* Technical Datum Brackets */}
                  <div className="pointer-events-none absolute top-3 left-3 font-mono text-[9px] text-slate-300">
                    + TERM_ID: LAG-01
                  </div>
                  <div className="pointer-events-none absolute top-3 right-3 font-mono text-[9px] text-slate-300">
                    SEC_LVL: 04 +
                  </div>

                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="border-b border-slate-100 pb-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold tracking-tight text-[#191c1e]">
                            Reserve Network Allocation
                          </h2>
                          <div className="font-mono text-xs font-semibold text-slate-500">
                            QUEUE: #{liveCount ? liveCount + 1 : 142}
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Direct capacity access for product builders, fabrication hubs, and research labs.
                        </p>
                      </div>

                      {/* Track Selector with Tagline and Industrial Styling */}
                      <div>
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Primary Engineering Track
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

                      {/* Inputs Grid */}
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Contact Name
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
                              Work / Institutional Email <span className="text-rose-500">*</span>
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
                              Organization, Hub, or University
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Apex Precision Tools"
                              value={organization}
                              onChange={(e) => setOrganization(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#006098] focus:bg-white focus:ring-1 focus:ring-[#006098]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Target Fabrication Capability
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 5-Axis Milling, Wire EDM, SLS"
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
                              <span>Allocating Queue Slot...</span>
                            </>
                          ) : (
                            <>
                              <span>Request Allocation Pass</span>
                              <ArrowRight size={15} weight="bold" />
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={14} weight="duotone" className="text-emerald-600" />
                          Zero Spam • No Public Disclosure
                        </span>
                        <span>Encrypted Escrow Staging</span>
                      </div>
                    </form>
                  ) : (
                    /* Confirmed Allocation Ticket Card: Styled like an authentic industrial Job Routing Ticket */
                    <div className="space-y-6">
                      <div className="border-b border-slate-200 pb-4">
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-700">
                            {isExistingRegistration ? 'CREDENTIAL RESTORED' : 'ALLOCATION CONFIRMED'}
                          </div>
                          <div className="font-mono text-xs text-slate-400">
                            STAMP: {new Date().toLocaleDateString()}
                          </div>
                        </div>
                        <h3 className="mt-1 text-2xl font-black text-[#191c1e]">
                          {isExistingRegistration ? 'Existing Allocation Retrieved' : 'Priority Access Ticket'}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Your early hardware allocation spot is registered on the West Africa pilot dispatch queue.
                        </p>
                      </div>

                      {/* Industrial Job Ticket Representation */}
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
                              <span className="block font-mono text-[10px] uppercase text-slate-400">Assigned Email</span>
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
                          <span>Explore Engineering Dispatches</span>
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

              {/* Hardware Viewport Column: Tactile Industrial Photography & HUD Telemetry */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div className="relative overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-950 text-white shadow-2xl">
                  {/* Real Industrial Hardware Photography */}
                  <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                    <img
                      src="/root-hero-img.jpg"
                      alt="5-Axis CNC Spindle carving high-precision metal parts"
                      className="h-full w-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/20" />

                    {/* Architectural Corner Brackets */}
                    <div className="pointer-events-none absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-white/70" />
                    <div className="pointer-events-none absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-white/70" />
                    <div className="pointer-events-none absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-white/70" />
                    <div className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-white/70" />

                    {/* Telemetry Reticle Crosshairs */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
                      <Crosshair size={48} weight="light" className="text-sky-300" />
                    </div>

                    {/* HUD Coordinates Bar */}
                    <div className="absolute top-4 left-6 right-6 flex items-center justify-between font-mono text-[10px] text-sky-200/90">
                      <span>FACILITY: IKEJA INDUSTRIAL CLUSTER</span>
                      <span>LAT: 6.5244° N / LON: 3.3792° E</span>
                    </div>

                    {/* Active Machine Readout */}
                    <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-mono text-[10px] uppercase text-sky-400">Audited Hardware Spec</div>
                        <div className="text-base font-bold text-white">5-Axis High-Speed Machining Center</div>
                      </div>
                      <div className="font-mono text-xs font-bold text-emerald-400">
                        SPINDLE: CALIBRATED (±0.02mm)
                      </div>
                    </div>
                  </div>

                  {/* Technical Benchmark Metrics Strip */}
                  <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 bg-slate-900/95 p-4 text-center">
                    <div>
                      <div className="font-mono text-xl font-black text-sky-400 sm:text-2xl">42</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        Calibrated Hubs
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-xl font-black text-white sm:text-2xl">±0.02mm</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        Tolerance Target
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-xl font-black text-emerald-400 sm:text-2xl">&lt;60s</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        Quoting Latency
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-card: Ground Reality Highlight */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#006098]/10 text-[#006098]">
                      <Compass size={18} weight="bold" />
                    </div>
                    <div className="text-xs leading-relaxed text-slate-600">
                      <strong className="text-slate-900">Decentralized Production Reality:</strong> Rather than building a single massive factory, DFN benchmarks existing precision CNC machines and 3D printers, unifying them into an automated, inspection-gated digital fabric.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: BESPOKE VERTICAL TIMELINE DIAGRAM & CLUSTER MATRIX */}
        <section className="relative border-t border-slate-200 bg-[#f2f4f6] py-16 sm:py-20 lg:py-24 overflow-hidden">
          {/* Subtle Blueprint Radial Texture */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#00487315_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section Header with Industrial Precision and View Mode Controls */}
            <div className="flex flex-col items-center justify-between gap-6 border-b border-slate-300/70 pb-8 text-center md:flex-row md:text-left">
              <div>
                <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#006098]">
                  // 02 DEPLOYMENT ARCHITECTURE
                </div>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-[#191c1e] sm:text-4xl">
                  Engineering Deployment Diagram
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Staged progression from physical spindle calibration to autonomous multi-hub dispatch.
                </p>
              </div>

              {/* View Switcher: Vertical Timeline Diagram vs Equipment Matrix */}
              <div className="flex items-center rounded-xl border border-slate-300 bg-white p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setRoadmapViewMode('timeline')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                    roadmapViewMode === 'timeline'
                      ? 'bg-[#006098] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TreeStructure size={14} weight="bold" />
                  <span>Timeline Diagram</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoadmapViewMode('matrix')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                    roadmapViewMode === 'matrix'
                      ? 'bg-[#006098] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <SlidersHorizontal size={14} weight="bold" />
                  <span>Equipment Matrix</span>
                </button>
              </div>
            </div>

            {/* VIEW A: VERTICAL TIMELINE DIAGRAM */}
            {roadmapViewMode === 'timeline' && (
              <div className="relative mx-auto mt-14 max-w-4xl">
                {/* Central/Left Calibrated Vertical Spine Axis with Millimeter Marks */}
                <div className="absolute top-4 bottom-4 left-4 sm:left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-emerald-500 via-[#006098] to-slate-400" />

                <div className="space-y-12 sm:space-y-16">
                  {ROADMAP_MILESTONES.map((milestone, idx) => {
                    const isLeft = idx % 2 === 0;
                    const isValidated = milestone.state === 'validated';
                    const isActive = milestone.state === 'active';
                    const isStaged = milestone.state === 'staged';
                    const isSelected = activePhaseIndex === idx;

                    return (
                      <div
                        key={milestone.number}
                        onClick={() => setActivePhaseIndex(idx)}
                        className={`relative cursor-pointer flex flex-col sm:flex-row items-start ${
                          isLeft ? 'sm:flex-row-reverse' : ''
                        } gap-6 sm:gap-12 group`}
                      >
                        {/* Center Node Indicator */}
                        <div
                          className={`absolute left-4 sm:left-1/2 -translate-x-1/2 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-xl border-2 bg-white shadow-md transition-all group-hover:scale-110 ${
                            isSelected ? 'ring-4 ring-sky-300/50' : ''
                          }`}
                        >
                          {isValidated ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                              <Check size={16} weight="bold" />
                            </div>
                          ) : isActive ? (
                            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-[#006098] text-white">
                              <span className="absolute -inset-1 animate-ping rounded-lg bg-sky-400 opacity-40" />
                              <Lightning size={16} weight="bold" />
                            </div>
                          ) : isStaged ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                              {milestone.number}
                            </div>
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 font-mono text-xs">
                              {milestone.number}
                            </div>
                          )}
                        </div>

                        {/* Milestone Card */}
                        <div
                          className={`ml-12 sm:ml-0 w-full sm:w-[calc(50%-2.5rem)] rounded-2xl border bg-white p-6 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md ${
                            isSelected
                              ? 'border-[#006098] ring-2 ring-[#006098]/30 shadow-sky-900/10'
                              : 'border-slate-200'
                          }`}
                        >
                          {/* Phase Header without Badges */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="font-mono text-xs font-black tracking-wider text-slate-400">
                              {milestone.phaseId}
                            </span>
                            <span
                              className={`font-mono text-[11px] font-bold tracking-wider ${
                                isValidated
                                  ? 'text-emerald-700'
                                  : isActive
                                  ? 'text-[#006098]'
                                  : 'text-slate-500'
                              }`}
                            >
                              {milestone.stateLabel}
                            </span>
                          </div>

                          {/* Title and Scope */}
                          <h3 className="mt-3 text-lg font-bold text-[#191c1e] sm:text-xl">
                            {milestone.title}
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-600">
                            {milestone.scope}
                          </p>

                          {/* Deliverables Checklist */}
                          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Key Deliverables
                            </div>
                            {milestone.deliverables.map((item, dIdx) => (
                              <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-700">
                                <span className="mt-0.5 text-[#006098]">▸</span>
                                <span className="leading-snug">{item.label}</span>
                              </div>
                            ))}
                          </div>

                          {/* Telemetry Strip */}
                          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center font-mono">
                            {milestone.telemetry.map((t, tIdx) => (
                              <div key={tIdx} className="min-w-0">
                                <div className="text-[10px] uppercase text-slate-400 truncate">{t.label}</div>
                                <div className="text-xs font-bold text-[#004873] truncate">{t.value}</div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 text-right">
                            <span className="font-mono text-[10px] font-semibold text-slate-400 group-hover:text-[#006098]">
                              {isSelected ? '● Inspected' : 'Click to inspect verification specs →'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Interactive Detailed Verification Deep-Dive Panel */}
                <div className="mt-16 rounded-2xl border-2 border-[#006098]/30 bg-white p-6 shadow-lg shadow-sky-900/5 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                    <div>
                      <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#006098]">
                        INSPECTION TELEMETRY // {activeMilestone.phaseId}
                      </div>
                      <h4 className="mt-1 text-xl font-black text-[#191c1e]">
                        {activeMilestone.title}
                      </h4>
                    </div>
                    <div className="font-mono text-xs font-bold text-[#004873] bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200">
                      STATUS: {activeMilestone.stateLabel}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 sm:grid-cols-3">
                    <div>
                      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Verification Protocol
                      </div>
                      <div className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {activeMilestone.verificationProtocol}
                      </div>
                    </div>

                    <div>
                      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Calibrated Hardware Tooling
                      </div>
                      <ul className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono">
                        {activeMilestone.calibratedEquipment.map((eq, i) => (
                          <li key={i} className="truncate">• {eq}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Regional Industrial Clusters
                      </div>
                      <ul className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                        {activeMilestone.hubClusters.map((cl, i) => (
                          <li key={i} className="truncate">• {cl}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW B: CLUSTER INFRASTRUCTURE MATRIX */}
            {roadmapViewMode === 'matrix' && (
              <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#004873]">
                    Decentralized Cluster Capability Matrix (Phase 01 & 02 Validated Nodes)
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {ROADMAP_MILESTONES.map((milestone) => (
                    <div key={milestone.number} className="p-6 transition-colors hover:bg-slate-50/50">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-md">
                          <div className="font-mono text-xs font-bold text-slate-400">{milestone.phaseId}</div>
                          <h4 className="mt-1 text-lg font-bold text-[#191c1e]">{milestone.title}</h4>
                          <p className="mt-1 text-xs text-slate-600">{milestone.scope}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <span className="block text-[10px] uppercase text-slate-400">Tolerance Benchmark</span>
                            <span className="font-bold text-[#004873]">±0.02mm ISO 2768-m</span>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <span className="block text-[10px] uppercase text-slate-400">Audited Spindles</span>
                            <span className="font-bold text-[#004873]">140+ Machine Tools</span>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white p-3 sm:col-span-2 lg:col-span-1">
                            <span className="block text-[10px] uppercase text-slate-400">Cluster Status</span>
                            <span className="font-bold text-emerald-700">{milestone.stateLabel}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Architecture Metrics Bar */}
            <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-slate-300/80 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
                <div>
                  <div className="font-mono text-2xl font-black text-[#004873]">48%</div>
                  <div className="font-mono text-xs text-slate-500">Pipeline Deployed</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-black text-emerald-600">42 / 50</div>
                  <div className="font-mono text-xs text-slate-500">Hubs Calibrated</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-black text-[#006098]">1,840h</div>
                  <div className="font-mono text-xs text-slate-500">Weekly Capacity</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-black text-slate-800">Q3 '26</div>
                  <div className="font-mono text-xs text-slate-500">Public Dispatch</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PHYSICAL MACHINERY & CAPABILITIES (FULL INDUSTRIAL PHOTOGRAPHY) */}
        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#006098]">
                // 03 PHYSICAL SUITE
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#191c1e] sm:text-4xl">
                What Powers the Network
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Audited fabrication machinery across the decentralized cluster.
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

        {/* SECTION 4: ENGINEERING DISPATCHES & FIELD NOTES */}
        <section className="border-t border-slate-200 bg-[#f2f4f6] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
              <div>
                <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#006098]">
                  // 04 FIELD INTELLIGENCE
                </div>
                <h2 className="mt-1 text-2xl font-black text-[#191c1e] sm:text-3xl">
                  Engineering Dispatches
                </h2>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Technical write-ups from our on-ground audits and mechanical case studies.
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

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {DISPATCHES.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <div className="relative h-44 sm:h-auto sm:w-48 shrink-0 overflow-hidden bg-slate-900">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                        <span>{post.category}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="mt-1.5 text-base font-bold text-[#191c1e] transition-colors group-hover:text-[#006098]">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                        {post.summary}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-[#006098]">
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
