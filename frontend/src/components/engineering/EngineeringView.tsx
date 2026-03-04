'use client';

import React, { useState } from 'react';
import ProjectExplorer from './ProjectExplorer';
import ModelViewer from './ModelViewer';
import PipelineDashboard from './PipelineDashboard';
import BOMMatcher from './BOMMatcher';
import FabricationPanel from './FabricationPanel';
import { LayoutGrid, Cpu, Layers, MessageSquare, Terminal, ChevronLeft, ChevronRight, Settings, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface EngineeringViewProps {
    project: any;
    assets: any[];
}

const EngineeringView: React.FC<EngineeringViewProps> = ({ project, assets }) => {
    const [selectedAsset, setSelectedAsset] = useState<any>(assets[0] || null);
    const [activeTab, setActiveTab] = useState<'viewer' | 'bom' | 'logic' | 'fabrication'>('viewer');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Simulation data for Pipeline
    const pipelineSteps = [
        { name: 'Hardware Verification', status: 'completed' as const, duration: '12s' },
        { name: 'DRC Check (Gerber)', status: 'completed' as const, duration: '4s' },
        { name: '3D Mesh Generation', status: 'running' as const },
        { name: 'Pricing Calculation', status: 'pending' as const },
        { name: 'Build Artifact Bundle', status: 'pending' as const },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0a0a0c] text-white">
            {/* Top Console Bar */}
            <div className="h-12 border-b border-[#27272a] bg-[#141417] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-mono text-zinc-400">PROJECT_NODE: {project.title.toUpperCase().replace(/\s/g, '_')}</span>
                    </div>
                    <div className="h-4 w-[1px] bg-zinc-800" />
                    <nav className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('viewer')}
                            className={cn(
                                "px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all rounded",
                                activeTab === 'viewer' ? "bg-zinc-800 text-cyan-400" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <LayoutGrid className="w-3.5 h-3.5 inline mr-2" />
                            Workspace
                        </button>
                        <button
                            onClick={() => setActiveTab('bom')}
                            className={cn(
                                "px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all rounded",
                                activeTab === 'bom' ? "bg-zinc-800 text-cyan-400" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <Layers className="w-3.5 h-3.5 inline mr-2" />
                            BOM Matcher
                        </button>
                        <button
                            onClick={() => setActiveTab('logic')}
                            className={cn(
                                "px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all rounded",
                                activeTab === 'logic' ? "bg-zinc-800 text-cyan-400" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <Terminal className="w-3.5 h-3.5 inline mr-2" />
                            Build Config
                        </button>
                        <button
                            onClick={() => setActiveTab('fabrication')}
                            className={cn(
                                "px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all rounded",
                                activeTab === 'fabrication' ? "bg-zinc-800 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <ShieldCheck className="w-3.5 h-3.5 inline mr-2" />
                            Fabrication
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-[10px] text-zinc-650 font-mono pr-4 border-r border-zinc-800">
                        <span>MEM: 1.2GB</span>
                        <span>CPU: 4%</span>
                    </div>
                    <button className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - File Explorer */}
                <div className={cn(
                    "transition-all duration-300 ease-in-out shrink-0",
                    isSidebarOpen ? "w-64" : "w-0"
                )}>
                    {isSidebarOpen && (
                        <ProjectExplorer
                            assets={assets}
                            onSelectAsset={setSelectedAsset}
                            selectedAssetId={selectedAsset?.id}
                        />
                    )}
                </div>

                {/* Sidebar Toggle */}
                <div className="w-4 flex items-center justify-center bg-[#0a0a0c] border-x border-[#27272a] shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                        {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {activeTab === 'viewer' ? (
                        <div className="flex-1">
                            <ModelViewer
                                assetUrl={selectedAsset?.fileUrl}
                                assetName={selectedAsset?.fileName}
                                hardwareFormat={selectedAsset?.hardwareFormat}
                                hasLints={selectedAsset?.version && selectedAsset.version > 5} // Logic: older versions or specific ones have lints for demo
                            />
                        </div>
                    ) : activeTab === 'bom' ? (
                        <div className="flex-1">
                            <BOMMatcher />
                        </div>
                    ) : activeTab === 'fabrication' ? (
                        <div className="flex-1">
                            <FabricationPanel />
                        </div>
                    ) : (
                        <div className="flex-1 p-8 bg-[#0a0a0c] font-mono text-xs text-zinc-500">
                            {/* ... logic tab content ... */}
                        </div>
                    )}

                    {/* Bottom Terminal Toggle / Status */}
                    <div className="h-8 border-t border-[#27272a] bg-[#141417] flex items-center px-4 justify-between shrink-0">
                        {/* ... terminal content ... */}
                    </div>
                </div>

                {/* Right Sidebar - Pipeline Execution */}
                <PipelineDashboard
                    currentStatus="running"
                    progress={selectedAsset?.version ? (selectedAsset.version * 7) % 100 : 42}
                    steps={pipelineSteps}
                    pipelineName="Engineering Validation Pipeline"
                    buildabilityScore={selectedAsset?.version ? 100 - (selectedAsset.version * 3) % 40 : 85}
                />
            </div>
        </div>
    );
};

export default EngineeringView;
