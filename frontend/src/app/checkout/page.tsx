'use client';

import { useState, useEffect } from 'react';
import { cartAPI, paymentsAPI } from '@/lib/api-services';
import Link from 'next/link';
import { CreditCard, ArrowLeft, ShieldCheck, Box, Info, Lock, Zap, Truck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const data = await cartAPI.getCart();
            setCart(data);
            if (!data || data.totalItems === 0) {
                router.push('/cart');
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
            router.push('/cart');
        } finally {
            setLoading(false);
        }
    };

    const handleAggregatePayment = async () => {
        try {
            setProcessing(true);
            const paymentData = await paymentsAPI.initializeCart();

            if (paymentData.status && paymentData.data?.authorization_url) {
                window.location.href = paymentData.data.authorization_url;
            } else {
                alert('Secure Gateway Error: Failed to initialize payment sequence.');
            }
        } catch (error) {
            console.error('Checkout Error:', error);
            alert('An error occurred during secure initialization.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-zinc-500 font-mono text-xs tracking-widest animate-pulse">
                SYNCHRONIZING_ENCRYPTED_GATEWAY...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 pb-20 selection:bg-primary-500/30">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Breadcrumbs />

                <div className="flex flex-col lg:flex-row gap-12 mt-8">
                    {/* Order Summary Column */}
                    <div className="lg:flex-1 space-y-12">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Lock className="w-3 h-3 text-emerald-500" />
                                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-500 font-bold">Secure Checkout Sequence</p>
                            </div>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">Final_Order_Review</h1>
                        </div>

                        <div className="space-y-6">
                            {cart?.vendors.map((vendor: any) => (
                                <div key={vendor.vendorKey} className="bg-[#141417] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                                    <div className="bg-zinc-900/50 px-6 py-3 border-b border-zinc-800 flex justify-between items-center">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Node Hub</span>
                                        <span className="text-xs font-black text-primary-400 uppercase tracking-tighter">{vendor.vendorName}</span>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {vendor.items.map((item: any) => (
                                            <div key={item.item.id} className="flex justify-between items-start">
                                                <div className="flex gap-4">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-mono text-zinc-600">
                                                        {item.item.quantity}x
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-tight">
                                                            {item.component?.name || item.campaign?.title || item.item.productName}
                                                        </p>
                                                        <p className="text-[10px] font-mono text-zinc-600 uppercase mt-1">
                                                            {item.component?.category || 'Hardware Resource'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-mono text-zinc-300 text-sm">
                                                    ${(parseFloat(item.item.price) * item.item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-4 items-start">
                            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Network Escrow Protection</p>
                                <p className="text-[11px] text-zinc-500 leading-relaxed font-mono uppercase">
                                    Funds are securely held in the DFN engineering escrow. Release is only triggered upon successful provider verification and logistics confirmation.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Column */}
                    <div className="lg:w-96">
                        <div className="lg:sticky lg:top-24">
                            <div className="bg-[#141417] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none grayscale">
                                    <CreditCard size={200} className="rotate-12" />
                                </div>

                                <h2 className="text-xl font-bold text-white mb-10 flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-primary-500" />
                                    Order_Aggregate
                                </h2>

                                <div className="space-y-4 mb-10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Net Resources</span>
                                        <span className="font-mono text-zinc-300">${cart.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Processing Fee</span>
                                        <span className="font-mono text-emerald-500 text-[10px] uppercase tracking-tighter">Network_Compounded</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Global Logistics</span>
                                        <span className="font-mono text-zinc-300 font-bold">$0.00</span>
                                    </div>

                                    <div className="h-px bg-zinc-800 my-6" />

                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-1">Authorization Total</span>
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-3xl font-black text-white font-mono">
                                                ${cart.totalPrice.toFixed(2)}
                                            </span>
                                            <span className="text-[10px] font-mono text-zinc-500">USD</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAggregatePayment}
                                    disabled={processing}
                                    className="w-full bg-primary-600 text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary-500 transition-all active:scale-95 shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            INITIALIZING...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={16} />
                                            Execute Payment
                                        </>
                                    )}
                                </button>

                                <div className="mt-8 pt-6 border-t border-zinc-800/50 flex flex-col items-center gap-4">
                                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Supported Gateways</p>
                                    <div className="flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Paystack_Logo.png" alt="Paystack" className="h-4" />
                                        <div className="w-px h-3 bg-zinc-800" />
                                        <img src="https://upload.wikimedia.org/wikipedia/en/2/26/Flutterwave_Logo.png" alt="Flutterwave" className="h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 items-start p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                                <Info className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                                <p className="text-[9px] text-zinc-600 leading-relaxed font-mono uppercase">
                                    You are initiating a direct hardware procurement sequence. By proceeding, you agree to the DFN Network Governance and Escrow terms.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
