'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { projectsAPI } from '@/lib/api-services';
import { Heart, Eye, Users, Wrench, Plus, Target, Zap, Cpu, Code, Layers } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
  });

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll(filters);
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 pb-20 selection:bg-primary-500/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 mt-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-primary-600 rounded-full"></span>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary-500 font-bold">Innovation Repository</p>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Open_Hardware_Hub</h1>
            <p className="text-zinc-500 mt-2 max-w-xl text-sm italic">
              A collaborative library of verified hardware projects, CAD assemblies, and fabrication-ready designs from across the network.
            </p>
          </div>
          <Link href="/projects/create">
            <button className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-primary-600/20 font-bold text-sm uppercase tracking-widest">
              <Plus className="w-5 h-5" />
              Publish Project
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-[#141417] border border-zinc-800 rounded-3xl p-8 mb-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Project Identifier</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by keywords, components, or ID..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full bg-[#1c1c21] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary-500 transition-all font-mono text-sm placeholder:text-zinc-700 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Sector</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full bg-[#1c1c21] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary-500 transition-all font-bold appearance-none shadow-inner text-sm"
                title="Filter by sector"
              >
                <option value="">All Sectors</option>
                <option value="robotics">ROBOTICS_&_COBOTS</option>
                <option value="iot">IOT_&_EMBEDDED</option>
                <option value="3d-printing">ADDITIVE_FAB</option>
                <option value="pcb-design">CIRCUITRY_LAYOUT</option>
                <option value="automation">PLANT_AUTOMATION</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Complexity</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="w-full bg-[#1c1c21] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary-500 transition-all font-bold appearance-none shadow-inner text-sm"
                title="Filter by difficulty"
              >
                <option value="">All Levels</option>
                <option value="beginner">L1_BASIC</option>
                <option value="intermediate">L2_INTERMEDIATE</option>
                <option value="advanced">L3_ADVANCED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-24 font-mono text-xs tracking-[0.5em] text-zinc-600 animate-pulse">
              FETCHING_REPOSITORY_DATA...
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-[#141417] border border-dashed border-zinc-800 rounded-3xl">
              <Target className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-mono uppercase text-xs tracking-widest">
                No matching projects found in the global registry.
              </p>
            </div>
          ) : (
            projects.map((item) => {
              const project = item.project;
              const author = item.author;
              let thumb = null;
              try { thumb = project.images ? JSON.parse(project.images)[0] : null; } catch (e) { }

              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="group bg-[#141417] border border-zinc-800 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all duration-500 cursor-pointer h-full flex flex-col shadow-2xl relative">
                    <div className="absolute top-4 right-4 z-10">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${project.difficulty === 'advanced' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        project.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                        {project.difficulty}
                      </span>
                    </div>

                    <div className="h-52 bg-[#0a0a0c] relative overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={project.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-zinc-900 to-black">
                          <Cpu className="w-16 h-16 text-zinc-800 opacity-20 group-hover:opacity-40 transition-opacity" />
                        </div>
                      )}
                    </div>

                    <div className="p-8 flex-1 flex-col flex">
                      <div className="flex items-center gap-2 mb-4">
                        <Code className="w-3 h-3 text-primary-500" />
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Project: {project.category}</span>
                      </div>

                      <h3 className="font-bold text-xl text-white mb-4 tracking-tight group-hover:text-primary-400 transition-colors line-clamp-1">
                        {project.title}
                      </h3>

                      <p className="text-zinc-500 text-sm mb-8 line-clamp-2 italic leading-relaxed">
                        {project.description}
                      </p>

                      <div className="mt-auto pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <Heart className="w-3.5 h-3.5 group-hover:text-red-500 transition-colors" />
                            <span className="text-[11px] font-mono">{project.likeCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <Eye className="w-3.5 h-3.5 group-hover:text-primary-400 transition-colors" />
                            <span className="text-[11px] font-mono">{project.viewCount || 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                            <span className="text-[8px] font-bold text-zinc-500">
                              {author?.firstName?.[0]}{author?.lastName?.[0]}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[80px]">
                            {author?.firstName || 'AUTH_NODE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}