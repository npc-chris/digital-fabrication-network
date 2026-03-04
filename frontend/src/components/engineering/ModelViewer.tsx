'use client';

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, PerspectiveCamera, Environment, Center } from '@react-three/drei';
import { Maximize2, RotateCcw, Box, Info, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ModelProps {
    url: string;
    showLints?: boolean;
}

const Model: React.FC<ModelProps> = ({ url, showLints }) => {
    const { scene } = useGLTF(url);

    // Add a simple effect to highlight problem zones if lints exist
    // In a real app, this would use specific coordinates from the runner
    return (
        <group>
            <primitive object={scene} castShadow receiveShadow />
            {showLints && (
                <primitive object={scene.clone()} scale={1.005}>
                    <meshStandardMaterial
                        color="#ef4444"
                        wireframe
                        transparent
                        opacity={0.4}
                    />
                </primitive>
            )}
        </group>
    );
};

interface ModelViewerProps {
    assetUrl?: string;
    assetName?: string;
    hardwareFormat?: string;
    hasLints?: boolean;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ assetUrl, assetName, hardwareFormat, hasLints }) => {
    const [showStats, setShowStats] = useState(false);
    const [showLintsToggle, setShowLintsToggle] = useState(true);

    if (!assetUrl || !hardwareFormat?.includes('3d') && !assetName?.endsWith('.glb')) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-[#0a0a0c] text-zinc-500 p-8 text-center">
                <Box className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">Select a 3D model to preview</p>
                <p className="text-xs mt-2 opacity-60">Supports .GLB, .STL (converted), and .OBJ</p>
            </div>
        );
    }

    return (
        <div className="relative h-full bg-[#0a0a0c] overflow-hidden flex flex-col">
            {/* Viewer Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <div className="bg-[#141417]/80 backdrop-blur-md border border-[#27272a] rounded px-3 py-1.5 grayscale hover:grayscale-0 transition-all">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Previewing</p>
                        <p className="text-xs text-white font-mono truncate max-w-[200px]">{assetName}</p>
                    </div>
                    {hasLints && (
                        <div className="bg-red-500/20 text-red-500 border border-red-500/30 rounded px-2 py-1 flex items-center gap-1.5 animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">Material Violations Detected</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pointer-events-auto">
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className={cn(
                            "p-2 backdrop-blur-md border rounded transition-all",
                            showStats ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "bg-[#141417]/80 border-[#27272a] text-zinc-400 hover:text-white"
                        )}
                        title="Model Info"
                    >
                        <Info className="w-4 h-4" />
                    </button>
                    {hasLints && (
                        <button
                            onClick={() => setShowLintsToggle(!showLintsToggle)}
                            className={cn(
                                "p-2 backdrop-blur-md border rounded transition-all",
                                showLintsToggle ? "bg-red-500/20 border-red-500 text-red-500" : "bg-[#141417]/80 border-[#27272a] text-zinc-400 hover:text-white"
                            )}
                            title="Toggle Problem Zones"
                        >
                            <Box className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        className="p-2 bg-[#141417]/80 backdrop-blur-md border border-[#27272a] rounded text-zinc-400 hover:text-white transition-colors"
                        title="Reset View"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        className="p-2 bg-[#141417]/80 backdrop-blur-md border border-[#27272a] rounded text-zinc-400 hover:text-white transition-colors"
                        title="Fullscreen"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 w-full">
                <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
                    <Suspense fallback={null}>
                        <Stage environment="city" intensity={0.6} contactShadow={{ opacity: 0.5, blur: 2 } as any} {...({} as any)}>
                            <Model url={assetUrl} showLints={hasLints && showLintsToggle} />
                        </Stage>
                        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Model Stats Tray */}
            {showStats && (
                <div className="absolute bottom-4 left-4 z-10 w-64 bg-[#141417]/90 backdrop-blur-lg border border-[#27272a] rounded p-4 shadow-2xl">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Technical Specs</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-500">Format</span>
                            <span className="text-zinc-300 font-mono">GLB (Binary)</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-500">Geometry</span>
                            <span className="text-zinc-300 font-mono">84.2k Polygons</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-500">Unit Scale</span>
                            <span className="text-zinc-300 font-mono">Millimeters (mm)</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-tighter",
                                hasLints ? "text-amber-500" : "text-emerald-500"
                            )}>
                                {hasLints ? "Lints Found (Critical)" : "Ready for Slicing"}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Viewport Overlay */}
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-zinc-600 pointer-events-none select-none">
                RENDER_ENGINE: WEBGL_2.0
            </div>
        </div>
    );
};

export default ModelViewer;
