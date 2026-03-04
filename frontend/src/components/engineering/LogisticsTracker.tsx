'use client';

import React from 'react';
import { Truck, Package, MapPin, CheckCircle2, Clock, ShieldCheck, Box } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Local cn utility
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LogisticsStep {
    status: string;
    label: string;
    description: string;
    date?: string;
    isCompleted: boolean;
    isCurrent: boolean;
}

interface LogisticsTrackerProps {
    orderId: string;
    providerName: string;
    steps: LogisticsStep[];
}

const LogisticsTracker: React.FC<LogisticsTrackerProps> = ({ orderId, providerName, steps }) => {
    return (
        <div className="bg-[#141417] border border-[#27272a] rounded-lg overflow-hidden group hover:border-zinc-700 transition-all">
            <div className="p-5 border-b border-[#27272a] flex justify-between items-center bg-[#1d1d21]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <Truck className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Shipment_Tracking</p>
                        <h3 className="text-sm font-bold text-white">Order #{orderId} via {providerName}</h3>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#0a0a0c] border border-[#27272a] rounded">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">Live_Updates_Active</span>
                </div>
            </div>

            <div className="p-6 relative">
                {/* Visual Step Tracker */}
                <div className="space-y-8">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative flex gap-4 pr-4">
                            {/* Connector Line */}
                            {idx < steps.length - 1 && (
                                <div className={cn(
                                    "absolute left-4 top-8 bottom-[-32px] w-[1px]",
                                    step.isCompleted ? "bg-emerald-500" : "bg-[#27272a]"
                                )} />
                            )}

                            {/* Node Icon */}
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border",
                                step.isCompleted ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" :
                                    step.isCurrent ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 animate-pulse" :
                                        "bg-[#0a0a0c] border-[#27272a] text-zinc-600"
                            )}>
                                {step.isCompleted ? <CheckCircle2 className="w-4 h-4" /> :
                                    step.isCurrent ? <Clock className="w-4 h-4" /> :
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />}
                            </div>

                            {/* Step Info */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className={cn(
                                        "text-xs font-bold uppercase tracking-wider",
                                        step.isCurrent ? "text-white" : step.isCompleted ? "text-zinc-300" : "text-zinc-650"
                                    )}>
                                        {step.label}
                                    </h4>
                                    {step.date && (
                                        <span className="text-[10px] font-mono text-zinc-600">{step.date}</span>
                                    )}
                                </div>
                                <p className={cn(
                                    "text-[11px] mt-1 leading-relaxed",
                                    step.isCurrent ? "text-zinc-400" : "text-zinc-600"
                                )}>
                                    {step.description}
                                </p>

                                {step.label === 'Hub Arrival' && step.isCurrent && (
                                    <div className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-cyan-500" />
                                        <p className="text-[10px] text-zinc-400">
                                            Item arrived at DFN Hub (Lagos). <span className="text-cyan-400">Escrow funds</span> currently held for verification.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-[#0a0a0c]/50 border-t border-[#27272a] flex justify-between items-center px-6">
                <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[200px]">CURRENT_LOC: 6.4541 N, 3.3947 E (Lagos_Hub)</span>
                </div>
                <button className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 transition-all">
                    View Digital Waybill <Box className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

export default LogisticsTracker;
