"use client";

import React from "react";
import { useCompare } from "@/components/CompareContext";
import {
    X,
    Layers,
    ArrowLeft,
    MapPin,
    CircleDollarSign,
    Maximize,
    Home,
    ShieldCheck,
    Check,
    Info
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ComparePage() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();

    interface Attribute {
        label: string;
        key: string;
        icon: React.ComponentType<any>;
        format?: (value: any, property: any) => string;
    }

    const attributes: Attribute[] = [
        { label: "Price", key: "price", icon: CircleDollarSign, format: (v: any) => `₹${v.toLocaleString()}` },
        { label: "Location", key: "locality", icon: MapPin, format: (v: any, p: any) => `${v}, ${p.city}` },
        { label: "Property Type", key: "propertyType", icon: Home },
        { label: "Total Area", key: "size", icon: Maximize, format: (v: any, p: any) => `${v} ${p.sizeUnit}` },
        { label: "Price per Unit", key: "pricePerUnit", icon: CircleDollarSign, format: (v: any, p: any) => `₹${Math.round(p.price / p.size).toLocaleString()} / ${p.sizeUnit}` },
        { label: "Bedrooms", key: "bedrooms", icon: Info, format: (v: any) => v === 0 ? "Studio" : v || "N/A" },
        { label: "Bathrooms", key: "bathrooms", icon: Info },
        { label: "Ownership", key: "ownershipType", icon: ShieldCheck },
        { label: "Amenities", key: "amenities", icon: Check, format: (v: any) => v?.join(", ") || "Parking, Security, Power Backup" }
    ];

    if (compareList.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8FAFA] pt-32 pb-20 flex flex-col items-center justify-center px-6">
                <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mb-6">
                    <Layers size={40} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Comparison List is Empty</h1>
                <p className="text-gray-500 font-bold mb-8 text-center max-w-sm uppercase text-[10px] tracking-widest">
                    Add up to 3 properties to compare their features side-by-side.
                </p>
                <Link href="/" className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    Explore Properties
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFA] pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

                <div className="flex items-center justify-between mb-12">
                    <div>
                        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold mb-4 group text-sm">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Search
                        </Link>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Compare Properties</h1>
                    </div>
                    <button
                        onClick={clearCompare}
                        className="px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                    >
                        Clear All
                    </button>
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-8 text-left bg-gray-50/50 min-w-[250px]">
                                        <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Attributes</div>
                                    </th>
                                    {compareList.map((property) => (
                                        <th key={property._id} className="p-8 text-left min-w-[300px] relative border-l border-gray-50">
                                            <button
                                                onClick={() => removeFromCompare(property._id)}
                                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                            <div className="space-y-4">
                                                <div className="h-40 bg-gray-100 rounded-2xl overflow-hidden relative">
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-black uppercase tracking-widest text-[10px]">
                                                        Property Image
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-900 text-lg leading-tight truncate pr-6">{property.address}</h3>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">₹{property.price.toLocaleString()}</p>
                                                </div>
                                                <Link
                                                    href={`/property/${property._id}`}
                                                    className="inline-flex text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors mt-2"
                                                >
                                                    View Property →
                                                </Link>
                                            </div>
                                        </th>
                                    ))}
                                    {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                                        <th key={`empty-th-${i}`} className="p-8 bg-gray-50/30 border-l border-gray-50">
                                            <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                                <Layers size={32} className="mb-2 opacity-50" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Available slot</p>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {attributes.map((attr, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={attr.key}
                                        className="border-t border-gray-50 hover:bg-gray-50/30 transition-colors"
                                    >
                                        <td className="p-8 bg-gray-50/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary border border-primary/5">
                                                    <attr.icon size={16} />
                                                </div>
                                                <span className="font-bold text-gray-500 text-sm">{attr.label}</span>
                                            </div>
                                        </td>
                                        {compareList.map((property) => (
                                            <td key={`${property._id}-${attr.key}`} className="p-8 border-l border-gray-50">
                                                <div className="font-black text-gray-900 text-base">
                                                    {attr.format
                                                        ? attr.format((property as any)[attr.key], property)
                                                        : (property as any)[attr.key] || "N/A"}
                                                </div>
                                            </td>
                                        ))}
                                        {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                                            <td key={`empty-td-${idx}-${i}`} className="p-8 border-l border-gray-50">
                                                <span className="text-gray-200">—</span>
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
