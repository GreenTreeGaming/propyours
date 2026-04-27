"use client";

import React from "react";
import {
    X,
    TrendingUp,
    Users,
    Phone,
    Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface PropertyAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: any;
}

export default function PropertyAnalyticsModal({ isOpen, onClose, property }: PropertyAnalyticsModalProps) {
    if (!property) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 leading-tight">Property Diagnostics</h2>
                                <p className="text-gray-500 font-medium">Performance metrics for {property.title || property.address}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[80vh]">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 p-6 rounded-3xl space-y-2">
                                    <div className="flex items-center gap-3 text-blue-600">
                                        <Users size={20} />
                                        <span className="font-bold text-sm uppercase tracking-wider">Total Views</span>
                                    </div>
                                    <p className="text-4xl font-black text-blue-900">{property.analytics?.views || 0}</p>
                                </div>
                                <div className="bg-pink-50 p-6 rounded-3xl space-y-2">
                                    <div className="flex items-center gap-3 text-pink-600">
                                        <Heart size={20} />
                                        <span className="font-bold text-sm uppercase tracking-wider">Favorites</span>
                                    </div>
                                    <p className="text-4xl font-black text-pink-900">{property.analytics?.favoritesCount || 0}</p>
                                </div>
                                <div className="bg-green-50 p-6 rounded-3xl space-y-2">
                                    <div className="flex items-center gap-3 text-green-600">
                                        <Phone size={20} />
                                        <span className="font-bold text-sm uppercase tracking-wider">Contact Clicks</span>
                                    </div>
                                    <p className="text-4xl font-black text-green-900">{property.analytics?.phoneClicks || 0}</p>
                                </div>
                            </div>

                            {/* Graph Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <TrendingUp size={20} className="text-primary" />
                                        Views Over Time
                                    </h3>
                                </div>
                                <div className="h-[300px] w-full bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={property.analytics?.dailyStats || []}
                                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#008080" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#008080" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                                dy={10}
                                                tickFormatter={(str) => {
                                                    const date = new Date(str);
                                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                                dx={-10}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                    padding: '12px'
                                                }}
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="views"
                                                stroke="#008080"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorViews)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                {(!property.analytics?.dailyStats || property.analytics.dailyStats.length === 0) && (
                                    <div className="text-center py-12 text-gray-400 font-medium italic">
                                        No historical data available yet. Views will be tracked daily.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
