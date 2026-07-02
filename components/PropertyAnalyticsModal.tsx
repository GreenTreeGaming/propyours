"use client";

import React, { useEffect, useState } from "react";
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

function BarChartBadge() {
    return (
        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
    );
}

export default function PropertyAnalyticsModal({ isOpen, onClose, property }: PropertyAnalyticsModalProps) {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen || !property?._id) return;

        const fetchAnalytics = async () => {
            setLoading(true);
            setError("");
            setAnalytics(null);

            try {
                const res = await fetch(`/api/property/${property._id}/analytics`, {
                    credentials: "include",
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load analytics");
                }

                setAnalytics(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load analytics"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [isOpen, property?._id]);

    if (!property) return null;

    const hasAdvancedAnalytics = ["advanced", "project", "portfolio"].includes(
        analytics?.level
    );

    const hasProjectAnalytics = ["project", "portfolio"].includes(
        analytics?.level
    );

    const hasPortfolioAnalytics = analytics?.level === "portfolio";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
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
                        className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-gray-100 flex items-start justify-between gap-6 bg-gradient-to-br from-primary/5 to-white">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-gray-900 leading-tight">
                                    Performance Dashboard
                                </h2>

                                <p className="text-gray-500 font-semibold max-w-2xl">
                                    Insights for {property.title || property.address}
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[80vh]">
                            {loading && (
                                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 text-sm font-bold text-gray-500">
                                    Loading analytics...
                                </div>
                            )}

                            {error && (
                                <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-sm font-bold text-red-500">
                                    {error}
                                </div>
                            )}

                            {!loading && !error && (
                                <div className="space-y-8">
                                    {/* Primary Metrics */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl">
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <Users size={22} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Reach
                    </span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                                Total Views
                                            </p>
                                            <p className="text-5xl font-black text-gray-900 tracking-tight mt-2">
                                                {analytics?.views || 0}
                                            </p>
                                        </div>

                                        <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl">
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                                                    <Phone size={22} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Intent
                    </span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                                Contact Clicks
                                            </p>
                                            <p className="text-5xl font-black text-gray-900 tracking-tight mt-2">
                                                {analytics?.phoneClicks || 0}
                                            </p>
                                        </div>

                                        <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl">
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="w-11 h-11 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                                                    <Heart size={22} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Saves
                    </span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                                Favorites
                                            </p>
                                            <p className="text-5xl font-black text-gray-900 tracking-tight mt-2">
                                                {analytics?.favoritesCount || 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Advanced Dashboard */}
                                    {hasAdvancedAnalytics && (
                                        <div className="grid lg:grid-cols-3 gap-6">
                                            <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
                                                <div className="flex items-start justify-between gap-4 mb-6">
                                                    <div>
                                                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                                            <TrendingUp size={20} className="text-primary" />
                                                            Views Over Time
                                                        </h3>
                                                        <p className="text-sm font-semibold text-gray-400 mt-1">
                                                            Daily traffic trend for this listing.
                                                        </p>
                                                    </div>

                                                    <span className="px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10 text-[10px] font-black uppercase tracking-widest">
                            {analytics?.level}
                        </span>
                                                </div>

                                                <div className="h-[320px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart
                                                            data={analytics?.dailyStats || []}
                                                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                                        >
                                                            <defs>
                                                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#008080" stopOpacity={0.18} />
                                                                    <stop offset="95%" stopColor="#008080" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                            <XAxis
                                                                dataKey="date"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: "#9ca3af", fontSize: 12 }}
                                                                dy={10}
                                                                tickFormatter={(str) => {
                                                                    const date = new Date(str);
                                                                    return date.toLocaleDateString("en-US", {
                                                                        month: "short",
                                                                        day: "numeric",
                                                                    });
                                                                }}
                                                            />
                                                            <YAxis
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: "#9ca3af", fontSize: 12 }}
                                                                dx={-10}
                                                            />
                                                            <Tooltip
                                                                contentStyle={{
                                                                    borderRadius: "16px",
                                                                    border: "none",
                                                                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                                                    padding: "12px",
                                                                }}
                                                                labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
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

                                                {(!analytics?.dailyStats || analytics.dailyStats.length === 0) && (
                                                    <div className="text-center py-10 text-gray-400 font-semibold italic">
                                                        No historical data available yet.
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                <div className="bg-primary text-white rounded-3xl p-6 shadow-lg shadow-primary/20">
                                                    <p className="text-xs font-black uppercase tracking-widest text-white/70">
                                                        Contact Conversion
                                                    </p>
                                                    <p className="text-5xl font-black mt-3">
                                                        {analytics?.conversionRate || 0}%
                                                    </p>
                                                    <p className="text-sm font-semibold text-white/75 mt-3">
                                                        Contact clicks divided by total views.
                                                    </p>
                                                </div>

                                                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                                                        Analytics Level
                                                    </p>
                                                    <p className="text-3xl font-black text-gray-900 capitalize mt-3">
                                                        {analytics?.level || "basic"}
                                                    </p>
                                                    <p className="text-sm font-semibold text-gray-400 mt-3">
                                                        Based on your current plan.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Project Analytics */}
                                    {hasProjectAnalytics && (
                                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                            <div className="mb-6">
                                                <h3 className="text-xl font-black text-gray-900">
                                                    Recent Performance
                                                </h3>
                                                <p className="text-sm font-semibold text-gray-400 mt-1">
                                                    Last 7 days activity.
                                                </p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="rounded-3xl bg-gray-50 p-6">
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                                                        Last 7 Days Views
                                                    </p>
                                                    <p className="text-4xl font-black text-gray-900 mt-2">
                                                        {analytics?.last7DaysViews || 0}
                                                    </p>
                                                </div>

                                                <div className="rounded-3xl bg-gray-50 p-6">
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                                                        Last 7 Days Contact Clicks
                                                    </p>
                                                    <p className="text-4xl font-black text-gray-900 mt-2">
                                                        {analytics?.last7DaysPhoneClicks || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Portfolio Analytics */}
                                    {hasPortfolioAnalytics && (
                                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                            <div className="mb-6">
                                                <h3 className="text-xl font-black text-gray-900">
                                                    Portfolio-Level Insights
                                                </h3>
                                                <p className="text-sm font-semibold text-gray-400 mt-1">
                                                    Deeper trends available on Builder Elite.
                                                </p>
                                            </div>

                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="rounded-3xl bg-gray-50 p-6">
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                                                        Last 30 Days Views
                                                    </p>
                                                    <p className="text-4xl font-black text-gray-900 mt-2">
                                                        {analytics?.last30DaysViews || 0}
                                                    </p>
                                                </div>

                                                <div className="rounded-3xl bg-gray-50 p-6">
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                                                        Last 30 Days Clicks
                                                    </p>
                                                    <p className="text-4xl font-black text-gray-900 mt-2">
                                                        {analytics?.last30DaysPhoneClicks || 0}
                                                    </p>
                                                </div>

                                                <div className="rounded-3xl bg-gray-50 p-6">
                                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                                                        Best Day
                                                    </p>
                                                    <p className="text-xl font-black text-gray-900 mt-2">
                                                        {analytics?.bestPerformingDay?.date || "No data yet"}
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-400 mt-2">
                                                        {analytics?.bestPerformingDay?.views || 0} views
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!hasAdvancedAnalytics && (
                                        <div className="rounded-3xl bg-gray-50 border border-gray-100 p-6">
                                            <p className="text-sm font-bold text-gray-500">
                                                Upgrade to Platinum or a Builder plan to unlock daily trends and conversion insights.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
