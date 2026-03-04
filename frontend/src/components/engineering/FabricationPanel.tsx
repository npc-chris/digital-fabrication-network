'use client';

import React, { useState, useEffect } from 'react';
import { quotesAPI, paymentsAPI, ordersAPI } from '@/lib/api-services';
import { CreditCard, Clock, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Zap, Box, Info, Truck } from 'lucide-react';
import LogisticsTracker from './LogisticsTracker';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Quote {
    id: number;
    serviceId: number;
    providerId: number;
    projectDescription: string;
    status: string;
    estimatedPrice: string;
    riskBuffer?: string;
    estimatedDuration: number;
    notes: string;
    createdAt: string;
}

interface Order {
    id: number;
    quoteId: number;
    status: string;
    paymentStatus: string;
    totalPrice: string;
    createdAt: string;
    updatedAt: string;
}

const FabricationPanel = () => {
    const [quotesList, setQuotesList] = useState<Quote[]>([]);
    const [ordersList, setOrdersList] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState<number | null>(null);
    const [releasingId, setReleasingId] = useState<number | null>(null);
    const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [quotesData, ordersData] = await Promise.all([
                quotesAPI.getAll('requested'),
                ordersAPI.getAll()
            ]);
            setQuotesList(quotesData);
            // Filter only service-based orders (those with a quoteId)
            if (Array.isArray(ordersData)) {
                setOrdersList(ordersData.filter((o: any) => o.quoteId));
            } else if (ordersData?.data && Array.isArray(ordersData.data)) {
                setOrdersList(ordersData.data.filter((o: any) => o.quoteId));
            }
        } catch (error) {
            console.error('Failed to load fabrication data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (quoteId: number) => {
        try {
            setPayingId(quoteId);
            const paymentData = await paymentsAPI.initialize(quoteId);

            if (paymentData.status && paymentData.data?.authorization_url) {
                window.location.href = paymentData.data.authorization_url;
            } else {
                alert('Could not initialize payment. Please try again.');
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert('Payment initialization failed');
        } finally {
            setPayingId(null);
        }
    };

    const handleReleaseEscrow = async (orderId: number) => {
        if (!confirm('By confirming receipt, you are authorizing the final release of funds to the provider. Continue?')) {
            return;
        }

        try {
            setReleasingId(orderId);
            await ordersAPI.updateStatus(orderId, 'completed');
            alert('Funds released successfully. Order completed!');
            loadData();
        } catch (error) {
            console.error('Escrow Release Error:', error);
            alert('Failed to release funds');
        } finally {
            setReleasingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-500 font-mono text-xs animate-pulse">
                CONNECTING_TO_ESCROW_SERVICE...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c] text-white p-6 overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center mb-8 border-b border-[#27272a] pb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        Fabrication & Escrow
                    </h2>
                    <p className="text-zinc-500 text-xs mt-1">Manage production quotes and secure milestone payments</p>
                </div>

                <div className="flex gap-2">
                    <div className="bg-[#141417] border border-[#27272a] rounded px-3 py-1.5">
                        <p className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold">Escrow Balance</p>
                        <p className="text-sm font-mono text-white">$0.00</p>
                    </div>
                </div>
            </div>

            {quotesList.length === 0 ? (
                <div className="p-8 border border-dashed border-[#27272a] rounded-lg text-center opacity-40">
                    <CreditCard className="w-12 h-12 mb-4 mx-auto" />
                    <p className="text-sm">No active fabrication quotes found</p>
                    <p className="text-xs mt-1">Request a quote from a provider to start production</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {quotesList.map((quote) => (
                        <div key={quote.id} className="bg-[#141417] border border-[#27272a] rounded-lg overflow-hidden group hover:border-zinc-700 transition-all">
                            <div className="flex flex-col md:flex-row">
                                <div className={cn(
                                    "w-1 md:w-2 shrink-0",
                                    quote.status === 'approved' ? "bg-emerald-500" :
                                        quote.status === 'pending' ? "bg-amber-500" : "bg-zinc-800"
                                )} />

                                <div className="flex-1 p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">QUOTE_ID: #{quote.id}</span>
                                                <h3 className="text-sm font-bold text-white">Fabrication Quote</h3>
                                            </div>
                                            <p className="text-xs text-zinc-500 line-clamp-1">{quote.projectDescription}</p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-mono text-white">
                                                ${(parseFloat(quote.estimatedPrice || '0') + parseFloat(quote.riskBuffer || '0')).toFixed(2)}
                                            </p>
                                            {parseFloat(quote.riskBuffer || '0') > 0 && (
                                                <p className="text-[9px] text-amber-500 font-bold tracking-tighter">
                                                    INCL. ${quote.riskBuffer} RISK_BUFFER
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-[#0a0a0c] rounded p-2.5 border border-[#27272a]">
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase mb-1">
                                                <Clock className="w-3 h-3" /> Status
                                            </div>
                                            <p className={cn(
                                                "text-xs font-bold",
                                                quote.status === 'approved' ? "text-emerald-500" : "text-amber-500"
                                            )}>{quote.status.toUpperCase()}</p>
                                        </div>
                                        <div className="bg-[#0a0a0c] rounded p-2.5 border border-[#27272a]">
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase mb-1">
                                                <Info className="w-3 h-3" /> Base Price
                                            </div>
                                            <p className="text-xs text-zinc-400 font-medium">${quote.estimatedPrice}</p>
                                        </div>
                                        <div className="bg-[#0a0a0c] rounded p-2.5 border border-[#27272a]">
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase mb-1">
                                                <Zap className="w-3 h-3" /> Delivery
                                            </div>
                                            <p className="text-xs text-zinc-400 font-medium">Standard Logistics</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified Hub
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handlePayment(quote.id)}
                                                disabled={payingId !== null || quote.status !== 'approved'}
                                                className={cn(
                                                    "px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                                                    quote.status === 'approved'
                                                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                                )}
                                            >
                                                {payingId === quote.id ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="w-3.5 h-3.5" />
                                                        Pay & Start Build
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Active Fabrication Orders (In Escrow) */}
            <div className="mt-12 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Active Fabrication Cycles
                </h3>
            </div>

            {ordersList.length === 0 ? (
                <div className="p-8 border border-dashed border-[#27272a] rounded-lg text-center opacity-30">
                    <p className="text-xs font-mono">NO_ACTIVE_FABRICATION_CYCLES</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {ordersList.map((order) => (
                        <div key={order.id} className="bg-[#141417]/30 border border-[#27272a] rounded-lg p-5 flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                        <Box className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-550 font-bold uppercase tracking-tighter">Order #{order.id}</p>
                                        <h4 className="text-sm font-semibold">{order.status.replace('_', ' ').toUpperCase()}</h4>
                                        <p className="text-[10px] text-emerald-500/80 font-mono">ESCROW_LOCKED: ${order.totalPrice}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReleaseEscrow(order.id)}
                                        disabled={releasingId !== null || order.status === 'completed'}
                                        className={cn(
                                            "px-5 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                                            order.status === 'out_for_delivery' || order.status === 'completed'
                                                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                                : "bg-[#141417] border border-[#27272a] text-zinc-500 hover:text-emerald-400 hover:border-emerald-500"
                                        )}
                                    >
                                        {releasingId === order.id ? 'Releasing...' :
                                            order.status === 'completed' ? 'Funds Released' : 'Confirm Receipt & Release Funds'}
                                    </button>

                                    <button
                                        onClick={() => setTrackingOrderId(trackingOrderId === order.id ? null : order.id)}
                                        className={cn(
                                            "p-2 rounded border border-[#27272a] hover:border-cyan-500 hover:text-cyan-400 transition-all",
                                            trackingOrderId === order.id ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-[#141417] text-zinc-500"
                                        )}
                                        title="Track Shipment"
                                    >
                                        <Truck className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {trackingOrderId === order.id && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <LogisticsTracker
                                        orderId={order.id.toString()}
                                        providerName="DFN Logistics (Partner)"
                                        steps={[
                                            { status: 'completed', label: 'Order Confirmed', description: 'Payment verified and escrow locked.', isCompleted: true, isCurrent: false, date: 'Feb 24, 10:00' },
                                            { status: 'completed', label: 'In Production', description: 'Provider has started the fabrication process.', isCompleted: true, isCurrent: false, date: 'Feb 24, 14:30' },
                                            { status: 'completed', label: 'Quality Check', description: 'Automated inspection and wall thickness verification.', isCompleted: true, isCurrent: false, date: 'Feb 25, 09:12' },
                                            { status: 'pending', label: 'Hub Arrival', description: 'Arrived at DFN fulfillment center for final sorting.', isCompleted: false, isCurrent: true, date: 'Feb 25, 11:20' },
                                            { status: 'pending', label: 'Out for Delivery', description: 'Dispatched to your registered workshop address.', isCompleted: false, isCurrent: false }
                                        ]}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Security Footer */}
            <div className="mt-12 p-6 bg-[#141417]/50 border border-dashed border-[#27272a] rounded-xl">
                <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white mb-1">Escrow Protection Active</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            When you pay for a fabrication quote, funds are held securely in the DFN Escrow account.
                            Payment is only released to the provider once you verify the milestone or final delivery
                            is complete. Supported by Paystack & Flutterwave.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FabricationPanel;
