'use client';

import React from 'react';
import { Play, CheckCircle2, Circle, Clock, AlertCircle, Cpu, Zap, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PipelineStep {
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    duration?: string;
}

interface PipelineDashboardProps {
    pipelineName?: string;
    currentStatus: 'idle' | 'queued' | 'running' | 'completed' | 'failed';
    progress: number;
    steps: PipelineStep[];
    buildabilityScore?: number; // 0-100
    onTrigger?: () => void;
}

const PipelineDashboard: React.FC<PipelineDashboardProps> = ({
    pipelineName = "Production Build",
    currentStatus,
    progress,
    steps,
    buildabilityScore,
    onTrigger
}) => {
    const getStatusIcon = (status: PipelineStep['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'running':
                return <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />;
            case 'failed':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Circle className="w-4 h-4 text-zinc-700" />;
        }
    };

    // Calculate radial gauge properties
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = buildabilityScore !== undefined ? circumference - (buildabilityScore / 100) * circumference : circumference;

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c] border-l border-[#27272a] w-80 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#27272a] bg-[#141417]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-zinc-500" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">CI/CD Pipeline</h3>
                    </div>
                    <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                        currentStatus === 'running' ? "bg-cyan-500/10 text-cyan-400" :
                            currentStatus === 'completed' ? "bg-emerald-500/10 text-emerald-400" :
                                "bg-zinc-800 text-zinc-500"
                    )}>
                        {currentStatus}
                    </span>
                </div>

                <div className="flex gap-4 items-center mb-6">
                    {buildabilityScore !== undefined && (
                        <div className="relative w-16 h-16 shrink-0">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="32" cy="32" r={radius}
                                    className="stroke-[#27272a] fill-none"
                                    strokeWidth="4"
                                />
                                <circle
                                    cx="32" cy="32" r={radius}
                                    className={cn(
                                        "fill-none transition-all duration-1000",
                                        buildabilityScore > 80 ? "stroke-emerald-500" :
                                            buildabilityScore > 50 ? "stroke-amber-500" : "stroke-red-500"
                                    )}
                                    strokeWidth="4"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-white">{buildabilityScore}%</span>
                            </div>
                        </div>
                    )}
                    <div>
                        <h2 className="text-sm font-medium text-white line-clamp-1">{pipelineName}</h2>
                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5 uppercase tracking-tighter">
                            Buildability_Score
                        </p>
                    </div>
                </div>

                <button
                    onClick={onTrigger}
                    disabled={currentStatus === 'running'}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-colors"
                >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Trigger Build
                </button>
            </div>

            {/* Progress Section */}
            <div className="px-4 py-4 border-b border-[#27272a]">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-2 font-mono">
                    <span>PIPELINE_PROGRESS</span>
                    <span className="text-zinc-300">{progress}%</span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                {steps.map((step, idx) => (
                    <div key={idx} className="relative pl-6">
                        {/* Thread Line */}
                        {idx < steps.length - 1 && (
                            <div className="absolute left-2 top-4 bottom-[-16px] w-[1px] bg-[#27272a]" />
                        )}

                        <div className="absolute left-0 top-0 mt-0.5">
                            {getStatusIcon(step.status)}
                        </div>

                        <div className="flex flex-col">
                            <div className="flex justify-between items-center">
                                <span className={cn(
                                    "text-xs font-medium",
                                    step.status === 'completed' ? "text-zinc-300" :
                                        step.status === 'running' ? "text-white" :
                                            "text-zinc-500"
                                )}>
                                    {step.name}
                                </span>
                                {step.duration && (
                                    <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        {step.duration}
                                    </span>
                                )}
                            </div>

                            {step.status === 'running' && (
                                <div className="mt-2 p-2 bg-[#141417] border border-[#27272a] rounded">
                                    <div className="flex gap-2 items-center">
                                        <div className="w-1 h-1 rounded-full bg-cyan-500 animate-ping" />
                                        <span className="text-[9px] text-zinc-500 font-mono">EXECUTING_RUNNER_V2...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Logs Preview */}
            <div className="p-3 bg-black border-t border-[#27272a] font-mono">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span className="text-[9px] text-zinc-500 uppercase">Live Runner Logs</span>
                </div>
                <div className="text-[9px] text-zinc-600 space-y-1">
                    <p>[09:21:04] Fetching asset: drone_arm_v12.stl</p>
                    <p>[09:21:05] Initializing MeshOptimizer...</p>
                    <p className="text-zinc-400 underline">View Full Process Tree</p>
                </div>
            </div>
        </div>
    );
};

export default PipelineDashboard;
