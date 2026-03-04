'use client';

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Check, Search, DollarSign, ArrowRight, Package, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BOMItem {
    id: string;
    name: string;
    quantity: number;
    matchedComponent?: {
        name: string;
        price: number;
        supplier: string;
        stock: number;
    };
}

const BOMMatcher = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [items, setItems] = useState<BOMItem[]>([]);

    const simulateUpload = () => {
        setIsProcessing(true);
        // Simulate API call to parse CSV/Excel and match with database
        setTimeout(() => {
            setItems([
                {
                    id: '1',
                    name: 'STM32F103C8T6',
                    quantity: 2,
                    matchedComponent: { name: 'STM32F103 (BluePill)', price: 3.50, supplier: 'LocalTech NG', stock: 42 }
                },
                {
                    id: '2',
                    name: 'Resistor 10k 0805',
                    quantity: 20,
                    matchedComponent: { name: 'RC0805FR-0710KL', price: 0.01, supplier: 'In-Store', stock: 1200 }
                },
                {
                    id: '3',
                    name: 'DRV8825 Driver',
                    quantity: 4,
                    matchedComponent: { name: 'Pololu DRV8825 Hybrid', price: 8.20, supplier: 'RoboticsHub Lagos', stock: 12 }
                },
                {
                    id: '4',
                    name: 'USB-C Female Connector',
                    quantity: 1,
                    matchedComponent: undefined // No match found
                }
            ]);
            setIsProcessing(false);
        }, 1500);
    };

    const totalPrice = items.reduce((acc, item) =>
        acc + (item.matchedComponent ? item.matchedComponent.price * item.quantity : 0), 0
    );

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c] text-white">
            {items.length === 0 && !isProcessing ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); simulateUpload(); }}
                    className={cn(
                        "flex-1 m-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all",
                        isDragging ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.1)]" : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/20"
                    )}
                >
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                        <Upload className={cn("w-8 h-8 transition-transform", isDragging ? "translate-y-[-4px] text-cyan-400" : "text-zinc-500")} />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Drag & Drop your BOM</h3>
                    <p className="text-zinc-500 text-sm mb-8">Upload .csv or .xlsx to get instant local pricing and availability</p>
                    <button
                        onClick={simulateUpload}
                        className="px-6 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                        Choose File
                    </button>
                </div>
            ) : isProcessing ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
                    <p className="text-zinc-400 font-mono text-xs tracking-widest animate-pulse">MATCHING_COMPONENTS_ACROSS_NETWORK...</p>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-[#27272a] flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                                BOM Analysis
                            </h2>
                            <p className="text-zinc-500 text-xs mt-1">Found 4 line items • {items.filter(i => i.matchedComponent).length} local matches</p>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase text-zinc-550 font-bold tracking-widest mb-1">Total Estimated Cost</span>
                            <span className="text-2xl font-mono text-emerald-400">${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                        {items.map((item) => (
                            <div key={item.id} className="group bg-[#141417] border border-[#27272a] rounded-lg p-4 hover:border-zinc-600 transition-all">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">QTY: {item.quantity}</span>
                                            <h4 className="text-sm font-bold text-white">{item.name}</h4>
                                        </div>

                                        {item.matchedComponent ? (
                                            <div className="flex items-center gap-3 mt-3">
                                                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                                                    <Check className="w-3 h-3" />
                                                    Matched: {item.matchedComponent.name}
                                                </div>
                                                <span className="text-zinc-650">•</span>
                                                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                                                    <Package className="w-3 h-3" />
                                                    {item.matchedComponent.supplier}
                                                </div>
                                                <span className="text-zinc-650">•</span>
                                                <div className="text-[11px] text-zinc-500">
                                                    {item.matchedComponent.stock} available
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 mt-3 text-xs text-amber-500 bg-amber-500/5 border border-amber-500/10 rounded px-2 py-1 w-fit">
                                                <Search className="w-3 h-3" />
                                                No local vendor match. Request manual quote?
                                            </div>
                                        )}
                                    </div>

                                    {item.matchedComponent && (
                                        <div className="text-right">
                                            <p className="text-sm font-mono text-white">${(item.matchedComponent.price * item.quantity).toFixed(2)}</p>
                                            <p className="text-[10px] text-zinc-600">${item.matchedComponent.price.toFixed(2)} / unit</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-[#0a0a0c] border-t border-[#27272a] flex gap-4">
                        <button className="flex-1 py-3 bg-[#1d1d21] border border-zinc-700 text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors">
                            Export Analysis
                        </button>
                        <button className="flex-1 py-3 bg-cyan-600 text-white text-sm font-bold rounded-lg hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2 transition-all">
                            Add All to Order
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BOMMatcher;
