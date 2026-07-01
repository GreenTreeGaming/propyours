"use client";

import React from "react";
import { useCompare } from "./CompareContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Layers } from "lucide-react";
import Link from "next/link";

export default function CompareFloatingBar() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    if (compareList.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-2xl"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-[2rem] p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 pl-2">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <Layers size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 tracking-tight">Comparison List</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{compareList.length} / 3 Selected</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-grow justify-center">
                        {compareList.map((prop) => (
                            <div key={prop._id} className="group relative">
                                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                                    <div className="text-[10px] font-black text-primary p-2 text-center leading-tight truncate">
                                        {prop.address.substring(0, 10)}...
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCompare(prop._id)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                            <div key={`empty-${i}`} className="w-12 h-12 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50" />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearCompare}
                            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors px-2"
                        >
                            Clear
                        </button>
                        <Link
                            href="/compare"
                            className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            Compare
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
