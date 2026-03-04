'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { forumAPI } from '@/lib/api-services';
import { MessageSquare, Users, Clock, Plus, Zap, Cpu, Code, Target, Hash } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ForumPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [recentThreads, setRecentThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForumData();
  }, []);

  const loadForumData = async () => {
    try {
      setLoading(true);
      const [cats, threads] = await Promise.all([
        forumAPI.getCategories(),
        forumAPI.getThreads()
      ]);
      setCategories(cats);
      setRecentThreads(threads);
    } catch (error) {
      console.error('Failed to load forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 pb-20 selection:bg-primary-500/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 mt-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-primary-600 rounded-full"></span>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary-500 font-bold">Network Discourse</p>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Community_Forum</h1>
            <p className="text-zinc-500 mt-2 max-w-xl text-sm italic">
              Synchronizing knowledge across the African fabrication network. Hardware debugs, CAD optimizations, and infrastructure discussions.
            </p>
          </div>
          <Link href="/forum/create">
            <button className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-primary-600/20 font-bold text-sm uppercase tracking-widest">
              <Plus className="w-5 h-5" />
              Initialize Discussion
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Categories */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Hash className="w-5 h-5 text-primary-500" />
              <h2 className="text-xl font-bold text-white uppercase tracking-widest">Channel_Sectors</h2>
            </div>

            {loading ? (
              <div className="text-center py-20 font-mono text-xs tracking-widest text-zinc-600 animate-pulse">
                SCANNING_PROTOCOLS...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-12 text-center bg-[#141417] border border-dashed border-zinc-800 rounded-3xl">
                <Target className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-500 font-mono uppercase text-xs tracking-widest">No active sectors found on current node.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <Link key={category.id} href={`/forum/category/${category.id}`}>
                    <div className="group bg-[#141417] border border-zinc-800 rounded-2xl p-8 hover:border-primary-500/50 transition-all duration-500 cursor-pointer h-full flex flex-col shadow-xl">
                      <div className="flex items-start justify-between mb-6">
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl group-hover:bg-primary-600/10 group-hover:border-primary-500/30 transition-all">
                          <MessageSquare className="w-6 h-6 text-zinc-500 group-hover:text-primary-400" />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-zinc-600 uppercase">Sector_ID</p>
                          <p className="text-xs font-mono text-zinc-400">#{category.id.toString().padStart(3, '0')}</p>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-primary-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-zinc-500 text-sm mb-8 italic line-clamp-2 leading-relaxed">
                        {category.description}
                      </p>

                      <div className="mt-auto flex items-center gap-6 pt-6 border-t border-zinc-800/50">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Active Threads</span>
                          <span className="text-white font-mono font-bold">{category.threadCount || 0}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Log Entries</span>
                          <span className="text-white font-mono font-bold">{category.postCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Discussions Sidebar */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-primary-500" />
              <h2 className="text-xl font-bold text-white uppercase tracking-widest">Synchronized_Feeds</h2>
            </div>

            <div className="bg-[#141417] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
              {loading ? (
                <div className="p-12 text-center text-zinc-600 font-mono text-xs animate-pulse">SYNCING...</div>
              ) : recentThreads.length === 0 ? (
                <div className="p-12 text-center text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Wait_for_initialization</div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {recentThreads.map((thread) => (
                    <Link key={thread.id} href={`/forum/${thread.id}`}>
                      <div className="p-6 hover:bg-zinc-900/50 transition-all cursor-pointer group">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-3 h-3 text-zinc-600" />
                          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                            {new Date(thread.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors tracking-tight">
                          {thread.title}
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                            <Users className="w-2.5 h-2.5 text-zinc-500" />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">{thread.author?.username || 'ANON_NODE'}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-primary-500/5 border border-primary-500/10 rounded-2xl p-6">
              <div className="flex gap-4">
                <Zap className="w-5 h-5 text-primary-500 shrink-0 mt-1" />
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Network Rule #01</h4>
                  <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                    Verify all hardware specifications before recommending fabrication paths. Collaboration is the core frequency of the DFN.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
