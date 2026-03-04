'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mentorshipAPI } from '@/lib/api-services';
import { Search, Star, MapPin, Briefcase, Cpu, Target, Zap, Users, ArrowLeft } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function FindMentorPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const data = await mentorshipAPI.getMentors();
      setMentors(data);
    } catch (error) {
      console.error('Failed to load mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = (
      mentor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.mentorBio?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesArea = selectedArea ? mentor.mentorshipAreas?.includes(selectedArea) : true;
    return matchesSearch && matchesArea;
  });

  const areas = Array.from(new Set(mentors.flatMap(m => m.mentorshipAreas || [])));

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 pb-20 selection:bg-primary-500/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 mt-4">
          <div>
            <Link href="/mentorship" className="inline-flex items-center gap-2 text-zinc-600 hover:text-primary-400 transition-colors mb-4 text-xs font-mono uppercase tracking-widest">
              <ArrowLeft className="w-3 h-3" /> Mentorship_Hub
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-primary-600 rounded-full"></span>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary-500 font-bold">Expert Discovery</p>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Find_A_Mentor</h1>
            <p className="text-zinc-500 mt-2 max-w-xl text-sm italic">
              Browse verified fabrication experts across robotics, embedded systems, precision electronics, and additive manufacturing.
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-[#141417] border border-zinc-800 rounded-3xl p-8 mb-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Search Nodes</label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-zinc-600 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, expertise, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1c1c21] border border-zinc-800 rounded-2xl pl-12 pr-5 py-4 text-white outline-none focus:border-primary-500 transition-all font-mono text-sm placeholder:text-zinc-700 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Specialization</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full bg-[#1c1c21] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary-500 transition-all font-bold appearance-none shadow-inner text-sm"
              >
                <option value="">All Domains</option>
                {areas.map((area: any) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-24 font-mono text-xs tracking-[0.5em] text-zinc-600 animate-pulse">
              SCANNING_EXPERT_REGISTRY...
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-[#141417] border border-dashed border-zinc-800 rounded-3xl">
              <Target className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-mono uppercase text-xs tracking-widest">
                No expert nodes matching your query parameters.
              </p>
            </div>
          ) : (
            filteredMentors.map((mentor) => (
              <div key={mentor.id} className="group bg-[#141417] border border-zinc-800 rounded-2xl p-8 hover:border-primary-500/50 transition-all duration-500 shadow-2xl relative overflow-hidden flex flex-col">
                {/* Rating Badge */}
                {mentor.rating && (
                  <div className="absolute top-6 right-6">
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                      <Star className="w-3 h-3 text-amber-500 fill-current" />
                      <span className="text-[11px] font-mono font-bold text-amber-400">{mentor.rating}</span>
                    </div>
                  </div>
                )}

                {/* Avatar & Name */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary-500 font-black text-xl group-hover:bg-primary-600/10 group-hover:border-primary-500/30 transition-all">
                    {mentor.firstName?.[0]}{mentor.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white tracking-tight group-hover:text-primary-400 transition-colors">
                      {mentor.firstName} {mentor.lastName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span className="font-mono">{mentor.location || 'REMOTE_NODE'}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-zinc-500 text-sm mb-6 line-clamp-3 italic leading-relaxed flex-1">
                  {mentor.mentorBio}
                </p>

                {/* Expertise Tags */}
                <div className="mb-8">
                  <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-3">Expertise_Vector</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.mentorshipAreas?.map((area: string) => (
                      <span key={area} className="px-3 py-1 bg-primary-500/5 border border-primary-500/10 text-primary-400 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary-600/20 uppercase tracking-widest text-xs">
                  Request Mentorship
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
