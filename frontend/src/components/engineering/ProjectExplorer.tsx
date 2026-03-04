'use client';

import React from 'react';
import { File, FileCode, Box, Layers, History, ChevronRight, Download } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProjectAsset {
    id: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
    hardwareFormat: string;
    version: number;
    commitMessage?: string;
}

interface ProjectExplorerProps {
    assets: ProjectAsset[];
    onSelectAsset: (asset: ProjectAsset) => void;
    selectedAssetId?: number;
}

const ProjectExplorer: React.FC<ProjectExplorerProps> = ({ assets, onSelectAsset, selectedAssetId }) => {
    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case '.stl':
            case '.obj':
            case '.glb':
                return <Box className="w-4 h-4 text-cyan-400" />;
            case '.step':
            case '.stp':
                return <Layers className="w-4 h-4 text-emerald-400" />;
            case '.brd':
            case '.sch':
            case '.pcb':
                return <FileCode className="w-4 h-4 text-purple-400" />;
            default:
                return <File className="w-4 h-4 text-zinc-400" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#141417] border-r border-[#27272a] overflow-hidden">
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Project Files</h3>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
                    {assets.length} Assets
                </span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="py-2">
                    {assets.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-xs text-zinc-500">No hardware assets found.</p>
                        </div>
                    ) : (
                        assets.map((asset) => (
                            <div
                                key={asset.id}
                                onClick={() => onSelectAsset(asset)}
                                className={cn(
                                    "group flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all border-l-2",
                                    selectedAssetId === asset.id
                                        ? "bg-[#1d1d21] border-cyan-500"
                                        : "border-transparent hover:bg-[#18181b] hover:border-zinc-700"
                                )}
                            >
                                <div className="flex-shrink-0">
                                    {getIcon(asset.fileType)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={cn(
                                            "text-sm truncate",
                                            selectedAssetId === asset.id ? "text-white font-medium" : "text-zinc-400"
                                        )}>
                                            {asset.fileName}
                                        </p>
                                        <span className="text-[10px] text-zinc-600 font-mono">v{asset.version}</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-600 truncate mt-0.5">
                                        {asset.hardwareFormat?.replace('_', ' ')}
                                    </p>
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={asset.fileUrl}
                                        download
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-cyan-400"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="p-3 bg-[#0a0a0c] border-t border-[#27272a]">
                <button className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-bold text-zinc-400 hover:text-white bg-[#141417] hover:bg-zinc-800 border border-[#27272a] rounded transition-colors uppercase tracking-wider">
                    <History className="w-3.5 h-3.5" />
                    Commit History
                </button>
            </div>
        </div>
    );
};

export default ProjectExplorer;
