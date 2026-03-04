'use client';

import React from 'react';
import {
    Package,
    Settings,
    ShieldCheck,
    Truck,
    MapPin,
    Home,
    CheckCircle2,
    Clock,
    ExternalLink,
    ChevronRight
} from 'lucide-react';

interface TrackingStep {
    id: number;
    status: string;
    location?: string;
    description?: string;
    waybillId?: string;
    createdAt: string;
}

interface LogisticsTrackerProps {
    steps: TrackingStep[];
    currentStatus: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
    'ordered': { label: 'Order Confirmed', icon: Package, color: 'blue' },
    'in_production': { label: 'Fabrication', icon: Settings, color: 'purple' },
    'quality_check': { label: 'Quality Check', icon: ShieldCheck, color: 'cyan' },
    'dispatched': { label: 'Dispatched', icon: Truck, color: 'orange' },
    'hub_arrival': { label: 'At Hub', icon: MapPin, color: 'indigo' },
    'out_for_delivery': { label: 'Out for Delivery', icon: Truck, color: 'emerald' },
    'delivered': { label: 'Delivered', icon: Home, color: 'green' },
};

const ORDERED_STEPS = [
    'ordered',
    'in_production',
    'quality_check',
    'dispatched',
    'hub_arrival',
    'out_for_delivery',
    'delivered'
];

export default function LogisticsTracker({ steps, currentStatus }: LogisticsTrackerProps) {
    // Find current step index
    const currentStepIndex = ORDERED_STEPS.indexOf(currentStatus);

    return (
        <div className="bg-[#141417] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#27272a] bg-[#1a1a1e]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Truck className="text-cyan-400" size={20} />
                    Logistics Status
                </h3>
                <p className="text-zinc-500 text-sm mt-1">Real-time fabrication and delivery tracking</p>
            </div>

            <div className="p-8">
                <div className="relative">
                    {/* Progress Bar Background */}
                    <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-zinc-800" />

                    <div className="space-y-10 relative">
                        {ORDERED_STEPS.map((stepKey, index) => {
                            const config = STATUS_CONFIG[stepKey];
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const Icon = config.icon;

                            // Find latest tracking entry for this step if it exists
                            const logEntry = steps.find(s => s.status === stepKey);

                            return (
                                <div key={stepKey} className="flex gap-6 group">
                                    {/* Step Indicator */}
                                    <div className="relative z-10">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted
                                                ? `bg-${config.color}-500 text-white shadow-[0_0_20px_rgba(var(--${config.color}-500-rgb),0.3)]`
                                                : 'bg-zinc-900 border-2 border-zinc-800 text-zinc-600'
                                            } ${isCurrent ? 'ring-4 ring-white/10 scale-110' : ''}`}>
                                            {isCompleted && !isCurrent ? (
                                                <CheckCircle2 size={20} />
                                            ) : (
                                                <Icon size={20} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Step Content */}
                                    <div className="flex-1 pt-1 pb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className={`font-bold transition-colors ${isCompleted ? 'text-white' : 'text-zinc-500'
                                                    }`}>
                                                    {config.label}
                                                </h4>

                                                {isCompleted && logEntry && (
                                                    <div className="mt-2 space-y-2">
                                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                                            {logEntry.description || `Order has reached ${config.label.toLowerCase()} phase.`}
                                                        </p>

                                                        {(logEntry.location || logEntry.waybillId) && (
                                                            <div className="flex flex-wrap gap-3">
                                                                {logEntry.location && (
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-md text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                                                                        <MapPin size={10} className="text-cyan-500" />
                                                                        {logEntry.location}
                                                                    </div>
                                                                )}
                                                                {logEntry.waybillId && (
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-md text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                                                                        WAYBILL: <span className="text-white">{logEntry.waybillId}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
                                                            <Clock size={10} />
                                                            {new Date(logEntry.createdAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                )}

                                                {isCurrent && !logEntry && (
                                                    <p className="text-sm text-zinc-500 mt-1 animate-pulse italic">
                                                        Processing current phase...
                                                    </p>
                                                )}
                                            </div>

                                            {isCurrent && (
                                                <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">
                                                    Live Status
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {steps.some(s => s.waybillId) && (
                <div className="p-6 bg-[#1a1a1e] border-t border-[#27272a] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded">
                            <Package size={20} className="text-zinc-400" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Track Shipment</p>
                            <p className="text-sm text-white font-mono">{steps.find(s => s.waybillId)?.waybillId}</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-bold uppercase tracking-widest">
                        External Tracking
                        <ExternalLink size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
