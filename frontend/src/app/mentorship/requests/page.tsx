'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mentorshipAPI } from '@/lib/api-services';
import { Clock, CheckCircle, XCircle, MessageSquare, Target, Zap, ArrowLeft, FileText, Shield } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function MentorshipRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await mentorshipAPI.getAllRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'accepted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed': return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'active') {
      return ['pending', 'accepted'].includes(req.status);
    }
    return ['rejected', 'completed', 'cancelled'].includes(req.status);
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 pb-20 selection:bg-primary-500/30">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />

        {/* Header */}
        <div className="mb-12 mt-4">
          <Link href="/mentorship" className="inline-flex items-center gap-2 text-zinc-600 hover:text-primary-400 transition-colors mb-4 text-xs font-mono uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3" /> Mentorship_Hub
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1 w-8 bg-primary-600 rounded-full"></span>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary-500 font-bold">Operations Tracker</p>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">My_Mentorships</h1>
          <p className="text-zinc-500 mt-2 max-w-xl text-sm italic">
            Monitor active knowledge transfers, pending requests, and completed mentorship sessions across your DFN profile.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#141417] border border-zinc-800 rounded-2xl p-1.5 mb-10 w-fit shadow-xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition-all ${activeTab === 'active'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
              }`}
          >
            Active Requests
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition-all ${activeTab === 'history'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
              }`}
          >
            Archive Log
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-24 font-mono text-xs tracking-[0.5em] text-zinc-600 animate-pulse">
              QUERYING_SESSION_RECORDS...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-24 bg-[#141417] border border-dashed border-zinc-800 rounded-3xl">
              <Target className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-mono uppercase text-xs tracking-widest">
                No {activeTab === 'active' ? 'active' : 'archived'} mentorship operations located.
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div key={req.id} className="group bg-[#141417] border border-zinc-800 rounded-2xl p-8 shadow-2xl hover:border-zinc-700 transition-all">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-bold text-xl text-white tracking-tight">{req.topic}</h3>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-sm">
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Assigned Expert:</span>{' '}
                      <span className="font-bold text-zinc-300">{req.mentor?.firstName} {req.mentor?.lastName}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-xl">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Description Block */}
                <div className="bg-[#0a0a0c] border border-zinc-800/50 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-3 h-3 text-zinc-600" />
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Session_Brief</span>
                  </div>
                  <p className="text-sm text-zinc-400 italic leading-relaxed">{req.description}</p>
                </div>

                {/* Actions for accepted requests */}
                {req.status === 'accepted' && (
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary-600/20">
                      <MessageSquare className="w-4 h-4" />
                      Open Comms Channel
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 border border-zinc-800 text-zinc-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                      <CheckCircle className="w-4 h-4" />
                      Mark Session Complete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Security Note */}
        <div className="mt-12 bg-primary-500/5 border border-primary-500/10 rounded-2xl p-6">
          <div className="flex gap-4">
            <Shield className="w-5 h-5 text-primary-500 shrink-0 mt-1" />
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Data Integrity Protocol</h4>
              <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                All mentorship sessions are logged on the DFN trust ledger. Session completions require mutual confirmation from both parties for verification.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
