'use client';

import Link from 'next/link';
import { Users, Search, BookOpen, Award, Zap, ShieldCheck, Target, Box } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function MentorshipPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 pb-20 selection:bg-primary-500/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />

        {/* Hero Section */}
        <div className="text-center mb-20 mt-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20">
            <Zap className="w-3 h-3 text-primary-500" />
            <span className="text-[10px] font-mono text-primary-400 font-bold uppercase tracking-widest">Expertise Network Active</span>
          </div>
          <h1 className="text-6xl font-extrabold text-white mb-6 tracking-tighter">
            Hardware_Mentorship
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto italic leading-relaxed">
            Connecting industrial fabrication experts with emerging hardware innovators across the DFN ecosystem.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <Link href="/mentorship/find-mentor">
            <div className="group bg-[#141417] p-10 rounded-2xl border border-zinc-800 hover:border-primary-500/50 transition-all duration-500 cursor-pointer h-full relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 text-primary-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Access Expert Nodes</h2>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  Browse our network of certified experts in robotics, precision electronics, and industrial additive manufacturing.
                </p>
                <div className="flex items-center gap-2 text-primary-500 font-bold uppercase tracking-widest text-xs">
                  Launch Direct Search
                  <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
                </div>
              </div>

              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none grayscale group-hover:grayscale-0 transition-all">
                <Target size={120} className="rotate-12" />
              </div>
            </div>
          </Link>

          <Link href="/mentorship/requests">
            <div className="group bg-[#141417] p-10 rounded-2xl border border-zinc-800 hover:border-emerald-500/50 transition-all duration-500 cursor-pointer h-full relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Active Operations</h2>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  Monitor your ongoing knowledge transfer sessions and manage project-specific guidance requests.
                </p>
                <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-xs">
                  Open Mission Control
                  <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
                </div>
              </div>

              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none grayscale group-hover:grayscale-0 transition-all">
                <Box size={120} className="-rotate-12" />
              </div>
            </div>
          </Link>
        </div>

        {/* Global Access Banner */}
        <div className="bg-gradient-to-br from-[#1c1c21] to-[#0a0a0c] border border-zinc-800 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Network Certification Available</span>
              </div>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Enlist as a Network Mentor</h2>
              <p className="text-zinc-400 text-lg mb-10 leading-relaxed italic">
                Share your industrial expertise and contribute to the Pan-African hardware revolution. Verified mentors receive higher ecosystem visibility and priority access to specialized components.
              </p>
              <button className="bg-white text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                Apply for Validation
              </button>
            </div>
            <div className="hidden lg:block">
              <Award className="w-48 h-48 text-primary-500 opacity-20 rotate-12" />
            </div>
          </div>

          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        {/* Real-time stats */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-center border-t border-zinc-900 pt-16">
          <div className="space-y-2">
            <div className="text-5xl font-black text-white tracking-tighter">57</div>
            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Verified_Experts</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-black text-white tracking-tighter">2.4k</div>
            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Transfer_Hours</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-black text-white tracking-tighter">100%</div>
            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Peer_Validated</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
