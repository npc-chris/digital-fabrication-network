'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    BookOpen,
    CheckCircle,
    Clock,
    MessageSquare,
    ChevronRight,
    User,
    Star,
    LayoutDashboard,
    Settings,
    Bell
} from 'lucide-react';
import api from '@/lib/api';

export default function MentorDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [mentees, setMentees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Load user from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, menteesRes] = await Promise.all([
                api.get('/api/mentorship/dashboard/stats'),
                api.get('/api/mentorship/dashboard/mentees')
            ]);
            setStats(statsRes.data);
            setMentees(menteesRes.data);
        } catch (error) {
            console.error('Failed to fetch mentor dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-100 font-sans">
            {/* Sidebar Overlay for Mobile */}
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-[#1e293b] border-r border-gray-800 h-screen sticky top-0 hidden lg:block">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                            DFN Mentor
                        </h1>
                    </div>

                    <nav className="mt-6 px-4 space-y-2">
                        <Link href="/mentorship/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl transition-all">
                            <LayoutDashboard size={20} />
                            <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link href="/mentorship/requests" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all">
                            <MessageSquare size={20} />
                            <span className="font-medium">Messages</span>
                        </Link>
                        <Link href="/mentorship/settings" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all">
                            <Settings size={20} />
                            <span className="font-medium">Settings</span>
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 w-full">
                    {/* Top Header */}
                    <header className="h-20 bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10 flex items-center justify-between px-8">
                        <div>
                            <h2 className="text-xl font-semibold">Welcome back, {user?.firstName || 'Mentor'}</h2>
                            <p className="text-sm text-gray-400">Here's what's happening with your mentorship today.</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 text-gray-400 hover:bg-gray-800 rounded-full transition-all">
                                <Bell size={20} />
                            </button>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                                {user?.firstName?.[0] || 'M'}
                            </div>
                        </div>
                    </header>

                    <div className="p-8 max-w-7xl mx-auto space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-blue-500/50 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <Users size={24} />
                                    </div>
                                </div>
                                <h4 className="text-gray-400 text-sm font-medium">Total Mentees</h4>
                                <p className="text-3xl font-bold mt-1">{stats?.totalMentees || 0}</p>
                            </div>

                            <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-emerald-500/50 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <CheckCircle size={24} />
                                    </div>
                                </div>
                                <h4 className="text-gray-400 text-sm font-medium">Completed</h4>
                                <p className="text-3xl font-bold mt-1">{stats?.completedSessions || 0}</p>
                            </div>

                            <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-purple-500/50 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-all">
                                        <Clock size={24} />
                                    </div>
                                </div>
                                <h4 className="text-gray-400 text-sm font-medium">Active Sessions</h4>
                                <p className="text-3xl font-bold mt-1">{stats?.activeSessions || 0}</p>
                            </div>

                            <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-yellow-500/50 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl group-hover:bg-yellow-500 group-hover:text-white transition-all">
                                        <Star size={24} />
                                    </div>
                                </div>
                                <h4 className="text-gray-400 text-sm font-medium">Avg Rating</h4>
                                <p className="text-3xl font-bold mt-1">4.9</p>
                            </div>
                        </div>

                        {/* Mentees Table */}
                        <div className="bg-[#1e293b] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <BookOpen className="text-blue-400" size={20} />
                                    Active Mentees
                                </h3>
                                <button className="text-blue-400 text-sm font-medium hover:underline">View all</button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-[#0f172a]/50 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="px-6 py-4 font-medium">Mentee</th>
                                            <th className="px-6 py-4 font-medium">Topic</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-6 py-4 font-medium">Date Joined</th>
                                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {mentees.length > 0 ? mentees.map((item) => (
                                            <tr key={item.request.id} className="hover:bg-gray-800/50 transition-all">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-700 overflow-hidden">
                                                            {item.mentee.avatar ? (
                                                                <img src={item.mentee.avatar} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                                    <User size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white">{item.mentee.firstName} {item.mentee.lastName}</div>
                                                            <div className="text-xs text-gray-400">{item.mentee.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm">{item.request.topic}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.request.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                                                            item.request.status === 'matched' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                                                                'bg-gray-500/20 text-gray-400 border border-gray-500/20'
                                                        }`}>
                                                        {item.request.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-400">
                                                    {new Date(item.request.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all">
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                    No active mentees found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recommendations Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                                <div className="relative z-10 max-w-md">
                                    <h3 className="text-2xl font-bold mb-4">Grow your influence as a Mentor</h3>
                                    <p className="text-blue-100 mb-6 italic">
                                        "Mentorship is not just about teaching, it's about learning together."
                                    </p>
                                    <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all">
                                        Complete Your Profile
                                    </button>
                                </div>
                                <div className="absolute -right-10 -bottom-10 opacity-20">
                                    <Users size={240} />
                                </div>
                            </div>

                            <div className="bg-[#1e293b] rounded-3xl p-8 border border-gray-800 shadow-xl">
                                <h3 className="text-lg font-semibold mb-6">Quick Tools</h3>
                                <div className="space-y-4">
                                    <button className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-2xl transition-all group">
                                        <span className="font-medium">Schedule Meeting</span>
                                        <ChevronRight size={18} className="text-gray-500 group-hover:text-blue-400 transition-all" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-2xl transition-all group">
                                        <span className="font-medium">Resource Library</span>
                                        <ChevronRight size={18} className="text-gray-500 group-hover:text-blue-400 transition-all" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-2xl transition-all group">
                                        <span className="font-medium">Mentor Feedback</span>
                                        <ChevronRight size={18} className="text-gray-500 group-hover:text-blue-400 transition-all" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
