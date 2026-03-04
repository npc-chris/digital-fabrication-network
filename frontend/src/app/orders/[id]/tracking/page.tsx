'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    MapPin,
    Package,
    Truck,
    AlertCircle,
    Image as ImageIcon,
    Upload,
    Plus,
    ShieldCheck,
    Clock,
    Zap,
    History
} from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import LogisticsTracker from '@/components/LogisticsTracker';

export default function OrderTrackingPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    // New entry form state
    const [formData, setFormData] = useState({
        status: '',
        location: '',
        description: '',
        waybillId: '',
        proofImage: '',
        estimatedDelivery: ''
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        fetchTrackingData();
    }, [orderId]);

    const fetchTrackingData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/logistics/${orderId}`);
            setData(res.data);
            if (res.data.tracking.length > 0) {
                const latest = res.data.tracking[0];
                setFormData(prev => ({
                    ...prev,
                    waybillId: latest.waybillId || '',
                    location: latest.location || ''
                }));
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch tracking information');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/api/logistics/${orderId}/track`, formData);
            setIsUpdateModalOpen(false);
            fetchTrackingData();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center font-mono text-[10px] tracking-widest text-zinc-500 animate-pulse">
                INITIALIZING_SHIPMENT_SCAN...
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-8">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold font-mono uppercase tracking-tight">{error}</h2>
                <button
                    onClick={() => router.back()}
                    className="mt-6 px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl hover:text-white transition-all font-bold uppercase tracking-widest text-xs"
                >
                    Return to Mission Control
                </button>
            </div>
        );
    }

    const isProvider = user?.id === data.order.providerId;

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 selection:bg-primary-500/30">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Breadcrumbs />

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 mt-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Truck className="w-3 h-3 text-primary-500" />
                            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary-500 font-bold">Logistics Oversight</p>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">
                            Track_Order <span className="text-zinc-500 text-2xl ml-2 font-mono">#{orderId}</span>
                        </h1>
                    </div>

                    {isProvider && (
                        <button
                            onClick={() => setIsUpdateModalOpen(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                        >
                            <Plus size={18} />
                            Log_Shipment_Event
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Tracker */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-[#141417] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-zinc-800/50">
                                <History className="w-5 h-5 text-primary-500" />
                                <h3 className="text-white font-bold uppercase tracking-widest text-sm">Chronological Flow</h3>
                            </div>
                            <LogisticsTracker steps={data.tracking} currentStatus={data.order.status} />
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-8">
                        <div className="bg-[#141417] border border-zinc-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 opacity-[0.03] pointer-events-none grayscale">
                                <Package size={150} />
                            </div>

                            <h3 className="text-white font-bold mb-8 flex items-center gap-3">
                                <Package size={18} className="text-primary-500" />
                                Metadata_Summary
                            </h3>

                            <div className="space-y-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Type</span>
                                    <span className="text-white font-black uppercase tracking-tighter">{data.order.componentId ? 'Precision Component' : 'Custom Build'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Escrow Value</span>
                                    <span className="text-white font-mono font-bold">${data.order.totalPrice}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Initiated</span>
                                    <span className="text-white font-mono">{new Date(data.order.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary-500/5 border border-primary-500/10 rounded-2xl p-6 relative overflow-hidden">
                            <div className="relative z-10 flex gap-4">
                                <ShieldCheck className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <h3 className="text-primary-400 font-bold text-[10px] uppercase tracking-widest">Security Protocol</h3>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed font-mono uppercase">
                                        Hardware production is peer-monitored. Escrow release is synchronized with final delivery verification. Hub managers oversee all major transitions.
                                    </p>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Zap size={80} className="text-primary-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Update Status Modal */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#141417] border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-[#1a1a1e]">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 tracking-tight">Deploy_Update</h3>
                                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Verification Node: DFN-SST-AUTH</p>
                            </div>
                            <button onClick={() => setIsUpdateModalOpen(false)} className="text-zinc-600 hover:text-white transition-colors">
                                <ArrowLeft className="rotate-90 hover:rotate-0 transition-transform" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStatus} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Target Status</label>
                                    <select
                                        required
                                        className="w-full bg-[#1c1c21] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary-500 transition-all font-bold appearance-none shadow-inner"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="">Select Protocol...</option>
                                        <option value="ordered">ORDER_RETENTION</option>
                                        <option value="in_production">FABRICATION_START</option>
                                        <option value="quality_check">QUALITY_ASSURANCE</option>
                                        <option value="dispatched">HUB_TRANSIT</option>
                                        <option value="hub_arrival">NODE_ARRIVAL</option>
                                        <option value="out_for_delivery">FINAL_DISPATCH</option>
                                        <option value="delivered">LOGISTICS_COMPLETE</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Vector Location</label>
                                        <input
                                            className="w-full bg-[#1c1c21] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary-500 transition-all font-mono text-sm placeholder:text-zinc-700"
                                            placeholder="HUB_ Lagos_NG"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Object Reference</label>
                                        <input
                                            className="w-full bg-[#1c1c21] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary-500 transition-all font-mono text-sm placeholder:text-zinc-700"
                                            placeholder="DFN-ID-XXXX"
                                            value={formData.waybillId}
                                            onChange={e => setFormData({ ...formData, waybillId: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Event Description</label>
                                    <textarea
                                        className="w-full bg-[#1c1c21] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary-500 transition-all font-mono text-sm placeholder:text-zinc-700"
                                        placeholder="Detailed operation logs here..."
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsUpdateModalOpen(false)}
                                    className="flex-1 px-8 py-5 bg-transparent border border-zinc-800 text-zinc-500 hover:text-white font-bold rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-8 py-5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-600/20 uppercase tracking-widest text-[10px]"
                                >
                                    Confirm_Log
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
