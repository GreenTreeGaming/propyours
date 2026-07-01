"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ownerPlans } from "@/data/pricing/ownerPlans";
import { developerPlans } from "@/data/pricing/developerPlans";
import { pricingFaqs } from "@/data/pricing/pricingFaq";
import Link from "next/link";
import {
    Check,
    X,
    Building,
    Zap,
    Award,
    Sparkles,
    Calculator,
    HelpCircle,
    PhoneCall,
    ArrowRight,
    ChevronDown,
    Info,
    User,
    Users,
    Target,
    BarChart3,
    TrendingUp,
    Eye,
    MessageSquare
} from "lucide-react";

// Pricing Types
interface PricingPlan {
    name: string;
    price: string;
    period: string;
    originalPrice?: string;
    badge?: string;
    badgeType?: "popular" | "premium" | "standard";
    description: string;
    icon: React.ReactNode;
    ctaText: string;
    ctaLink: string;
    features: string[];
    notIncluded?: string[];
    analyticsHighlight: string;
}

export default function PricingPage() {
    // FAQ Active Accordions
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const [pricingAudience, setPricingAudience] = useState<"owners" | "builders">("owners");

    const activePlans = pricingAudience === "owners" ? ownerPlans : developerPlans;

    const pricingContent = {
        owners: {
            eyebrow: "Owner Pricing",
            title: "List Your Property",
            description:
                "Choose a plan based on how many properties you want to list and how long you want them active.",
        },
        builders: {
            eyebrow: "Builder & Developer Pricing",
            title: "Promote Your Projects",
            description:
                "Paid plans for builders and developers who want stronger visibility, verified branding, project promotion, and lead management.",
        },
    };

    // Interactive Plan Finder State
    const [finderDuration, setFinderDuration] = useState<string | null>(null);
    const [finderLeads, setFinderLeads] = useState<string | null>(null);
    const [finderAnalytics, setFinderAnalytics] = useState<string | null>(null);
    const [finderResult, setFinderResult] = useState<string | null>(null);

    // Handle Plan Finder logic
    const handleFindPlan = () => {
        if (!finderDuration || !finderLeads || !finderAnalytics) return;

        if (finderDuration === "long" || finderLeads === "high" || finderAnalytics === "advanced") {
            setFinderResult("premium");
        } else if (finderDuration === "medium" || finderLeads === "moderate" || finderAnalytics === "basic") {
            setFinderResult("boost");
        } else {
            setFinderResult("basic");
        }
    };

    const resetFinder = () => {
        setFinderDuration(null);
        setFinderLeads(null);
        setFinderAnalytics(null);
        setFinderResult(null);
    };

    return (
        <div className="pt-24 min-h-screen bg-white font-body relative overflow-hidden">

            {/* Decorative Blur Background Blobs */}
            <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-1/2 right-1/10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-1/10 left-1/3 w-[500px] h-[500px] bg-primary-light/30 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Grid Pattern Layer */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none -z-20" />

            {/* --- HERO HEADER SECTION --- */}
            <section className="pt-16 pb-12 px-6 text-center">
                <div className="max-w-4xl mx-auto space-y-5">
                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight font-heading"
                    >
                        Property Exposure Backed by <span className="text-primary bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Real-Time Data</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
                    >
                        No broker commissions. Choose listing plans based on leads, ad extension runtime, compare visibility, and advanced visitor analytics.
                    </motion.p>
                </div>
            </section>

            {/* --- PRICING TOGGLE + CARDS SECTION --- */}
            <section className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                <div className="text-center space-y-6 mb-12">
                    <div className="inline-flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                        <button
                            type="button"
                            onClick={() => {
                                setPricingAudience("owners");
                                resetFinder();
                            }}
                            className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all ${
                                pricingAudience === "owners"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            Owners
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setPricingAudience("builders");
                                resetFinder();
                            }}
                            className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all ${
                                pricingAudience === "builders"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            Builders / Developers
                        </button>
                    </div>

                    <div className="space-y-3">
            <span className="text-primary font-black text-xs uppercase tracking-[0.3em]">
                {pricingContent[pricingAudience].eyebrow}
            </span>

                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 font-heading uppercase tracking-wide">
                            {pricingContent[pricingAudience].title}
                        </h2>

                        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
                            {pricingContent[pricingAudience].description}
                        </p>
                    </div>
                </div>

                {/* --- INTERACTIVE PLAN RECOMMENDER WIDGET --- */}
                {pricingAudience === "owners" && (
                    <div className="max-w-5xl mx-auto mb-14">
                        <div className="bg-gradient-to-br from-primary-dark to-primary p-6 md:p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/10 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
                                <div className="lg:col-span-2 space-y-3">
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-accent">
                        <Sparkles className="w-4 h-4" />
                        Not Sure?
                    </span>

                                    <h2 className="text-2xl md:text-3xl font-black font-heading leading-tight uppercase">
                                        Find Your Owner Plan
                                    </h2>

                                    <p className="text-sm text-white/80 leading-relaxed">
                                        Answer three quick questions and we’ll suggest Silver, Gold, or Diamond before you pick a plan.
                                    </p>
                                </div>

                                <div className="lg:col-span-3 bg-white text-gray-900 p-5 md:p-6 rounded-3xl shadow-lg border border-white/10">
                                    {!finderResult ? (
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-primary tracking-wider">
                                                    Listing duration
                                                </label>

                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { id: "short", label: "30 Days" },
                                                        { id: "medium", label: "90 Days" },
                                                        { id: "long", label: "180 Days" }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => setFinderDuration(item.id)}
                                                            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                                                                finderDuration === item.id
                                                                    ? "bg-primary/10 border-primary text-primary"
                                                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                            }`}
                                                        >
                                                            {item.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-primary tracking-wider">
                                                    Lead needs
                                                </label>

                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { id: "low", label: "Low" },
                                                        { id: "moderate", label: "Medium" },
                                                        { id: "high", label: "High" }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => setFinderLeads(item.id)}
                                                            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                                                                finderLeads === item.id
                                                                    ? "bg-primary/10 border-primary text-primary"
                                                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                            }`}
                                                        >
                                                            {item.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase text-primary tracking-wider">
                                                    Analytics
                                                </label>

                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { id: "none", label: "None" },
                                                        { id: "basic", label: "Basic" },
                                                        { id: "advanced", label: "Advanced" }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => setFinderAnalytics(item.id)}
                                                            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                                                                finderAnalytics === item.id
                                                                    ? "bg-primary/10 border-primary text-primary"
                                                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                            }`}
                                                        >
                                                            {item.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleFindPlan}
                                                disabled={!finderDuration || !finderLeads || !finderAnalytics}
                                                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all text-center flex items-center justify-center gap-2 ${
                                                    finderDuration && finderLeads && finderAnalytics
                                                        ? "bg-primary text-white hover:bg-primary-dark shadow-md cursor-pointer"
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                }`}
                                            >
                                                Recommend a Plan
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-4 space-y-5"
                                        >
                                            <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
                                                <Sparkles className="w-5 h-5" />
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-xs font-black uppercase tracking-wider text-gray-500">
                                                    Recommended owner plan
                                                </p>

                                                <h3 className="text-2xl font-black text-gray-900 uppercase font-heading tracking-wide">
                                                    {finderResult === "basic" && "Silver Plan"}
                                                    {finderResult === "boost" && "Gold Plan"}
                                                    {finderResult === "premium" && "Diamond Plan"}
                                                </h3>

                                                <p className="text-sm text-gray-600 max-w-sm mx-auto">
                                                    {finderResult === "basic" &&
                                                        "Best for a simple 30-day listing with basic visibility."}
                                                    {finderResult === "boost" &&
                                                        "Best for a 90-day listing with stronger visibility and basic analytics."}
                                                    {finderResult === "premium" &&
                                                        "Best for maximum exposure, 180 days, advanced analytics, and 2 active properties."}
                                                </p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={resetFinder}
                                                    className="w-full sm:w-auto px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50"
                                                >
                                                    Recalculate
                                                </button>

                                                <Link
                                                    href={
                                                        finderResult === "basic"
                                                            ? "/post-property?plan=silver"
                                                            : finderResult === "boost"
                                                                ? "/post-property?plan=gold"
                                                                : "/post-property?plan=diamond"
                                                    }
                                                    className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark shadow-md block text-center"
                                                >
                                                    Select Plan
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={pricingAudience}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.25 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
                    >
                        {activePlans.map((plan, index) => {
                            const isPopular = plan.badgeType === "popular";
                            const isPremium = plan.badgeType === "premium";
                            const Icon = plan.icon;

                            return (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`flex flex-col relative rounded-3xl transition-all duration-300 border-2 overflow-hidden bg-white ${
                                        isPopular
                                            ? "border-primary shadow-xl lg:-translate-y-4 shadow-primary/10 z-20"
                                            : isPremium
                                                ? "border-zinc-900 bg-zinc-950 text-white shadow-2xl z-10"
                                                : "border-gray-200 shadow-md hover:border-primary/50 hover:shadow-lg z-10"
                                    }`}
                                >
                                    {plan.badge && (
                                        <div
                                            className={`absolute top-0 right-0 py-1.5 px-6 rounded-bl-2xl text-[10px] font-black uppercase tracking-wider ${
                                                isPopular
                                                    ? "bg-primary text-white"
                                                    : "bg-accent text-gray-950"
                                            }`}
                                        >
                                            {plan.badge}
                                        </div>
                                    )}

                                    <div className="p-8 pb-6 border-b border-gray-100 flex-none relative">
                                        {isPremium && (
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                                        )}

                                        <div className="flex items-center gap-3 mb-4">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                    isPremium
                                                        ? "bg-zinc-800"
                                                        : isPopular
                                                            ? "bg-primary-light text-primary"
                                                            : "bg-gray-100"
                                                }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            <h3
                                                className={`text-xl font-bold font-heading uppercase tracking-wide ${
                                                    isPremium ? "text-white" : "text-gray-900"
                                                }`}
                                            >
                                                {plan.name}
                                            </h3>
                                        </div>

                                        <p className={`text-sm mb-6 ${isPremium ? "text-zinc-400" : "text-gray-500"}`}>
                                            {plan.description}
                                        </p>

                                        <div className="flex items-baseline gap-2">
                                            {plan.originalPrice && (
                                                <span
                                                    className={`text-base line-through font-medium ${
                                                        isPremium ? "text-zinc-600" : "text-gray-400"
                                                    }`}
                                                >
                                        {plan.originalPrice}
                                    </span>
                                            )}

                                            <span className="text-4xl font-black font-heading tracking-tight">
                                    {plan.price}
                                </span>

                                            <span className={`text-xs font-semibold ${isPremium ? "text-zinc-500" : "text-gray-500"}`}>
                                    {plan.period}
                                </span>
                                        </div>
                                    </div>

                                    <div
                                        className={`px-8 py-4 flex-none border-b border-gray-100/50 flex items-center gap-2 ${
                                            isPremium ? "bg-zinc-900/60 border-zinc-800" : "bg-primary-light/30"
                                        }`}
                                    >
                                        <BarChart3 className={`w-4 h-4 shrink-0 ${isPremium ? "text-accent" : "text-primary"}`} />

                                        <div className="text-xs font-bold leading-relaxed">
                                <span className={isPremium ? "text-zinc-400" : "text-gray-500"}>
                                    Analytics:{" "}
                                </span>

                                            <span className={isPremium ? "text-accent" : "text-primary-dark"}>
                                    {plan.analyticsHighlight}
                                </span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                                        <ul className="space-y-4">
                                            {plan.features.map((feature, fIdx) => (
                                                <li key={fIdx} className="flex items-start gap-3 text-sm">
                                                    <Check className={`w-5 h-5 shrink-0 ${isPremium ? "text-accent" : "text-primary"}`} />

                                                    <span className={isPremium ? "text-zinc-200" : "text-gray-700"}>
                                            {feature}
                                        </span>
                                                </li>
                                            ))}

                                            {plan.notIncluded?.map((feature, fIdx) => (
                                                <li key={fIdx} className="flex items-start gap-3 text-sm opacity-55">
                                                    <X className="w-5 h-5 text-red-400 shrink-0" />

                                                    <span className={isPremium ? "text-zinc-500 line-through" : "text-gray-400 line-through"}>
                                            {feature}
                                        </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="pt-6">
                                            <Link
                                                href={plan.ctaLink}
                                                className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                                                    isPremium
                                                        ? "bg-white text-zinc-950 hover:bg-accent hover:text-zinc-950"
                                                        : isPopular
                                                            ? "bg-primary text-white hover:bg-primary-dark"
                                                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                }`}
                                            >
                                                {plan.ctaText}
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </section>

            {/* --- FEATURES COMPARISON TABLE SECTION --- */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 font-heading uppercase tracking-wide">
                        Compare Advertising & Analytics Plans
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
                        Review side-by-side values to see what package best supports your listing goals.
                    </p>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-3xl shadow-sm bg-white">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-5 font-black text-xs uppercase text-gray-500 tracking-wider w-[35%]">Plan Details</th>
                                <th className="p-5 font-black text-xs uppercase text-gray-700 tracking-wider text-center">Basic (Free)</th>
                                <th className="p-5 font-black text-xs uppercase text-primary tracking-wider text-center bg-primary-light/20">3-Month Boost</th>
                                <th className="p-5 font-black text-xs uppercase text-primary-dark tracking-wider text-center bg-teal-500/5">6-Month Premium</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">

                            {/* Row: Ad Duration */}
                            <tr>
                                <td className="p-5 font-semibold text-gray-800">Advertisement Duration</td>
                                <td className="p-5 text-center text-gray-600">30 Days</td>
                                <td className="p-5 text-center font-semibold text-primary">90 Days (3 Months)</td>
                                <td className="p-5 text-center font-bold text-primary-dark">180 Days (6 Months)</td>
                            </tr>

                            {/* Row: Leads Included */}
                            <tr>
                                <td className="p-5 font-semibold text-gray-800">Verified Leads Included</td>
                                <td className="p-5 text-center text-gray-600">Up to 3 Standard Leads</td>
                                <td className="p-5 text-center font-semibold text-primary">Up to 30 Screened Leads</td>
                                <td className="p-5 text-center font-bold text-primary-dark">Unlimited Leads</td>
                            </tr>

                            {/* Row: Dashboard Analytics */}
                            <tr>
                                <td className="p-5 font-semibold text-gray-800 flex items-center gap-2">
                                    Performance Dashboard Analytics
                                    <div className="group relative cursor-pointer">
                                        <Info className="w-3.5 h-3.5 text-gray-400" />
                                        <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                                            Track clicks, profile views, contact details revealed, and WhatsApp conversions.
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 text-center text-gray-400">None</td>
                                <td className="p-5 text-center text-gray-600">Views & Clicks counts</td>
                                <td className="p-5 text-center font-bold text-primary-dark">CTR, Geo-traffic & Demographics</td>
                            </tr>

                            {/* Row: Search Boost */}
                            <tr>
                                <td className="p-5 font-semibold text-gray-800">Featured Placement Boost</td>
                                <td className="p-5 text-center"><X className="w-4 h-4 mx-auto text-red-400" /></td>
                                <td className="p-5 text-center text-gray-600">15 Days Boost</td>
                                <td className="p-5 text-center"><Check className="w-5 h-5 mx-auto text-primary-dark font-extrabold" /></td>
                            </tr>

                            {/* Row: Media Support */}
                            <tr>
                                <td className="p-5 font-semibold text-gray-800">Photos & Multimedia</td>
                                <td className="p-5 text-center text-gray-600">Up to 5 Photos</td>
                                <td className="p-5 text-center text-gray-600">Up to 10 Photos + 1 Video</td>
                                <td className="p-5 text-center font-semibold text-gray-900">Up to 15 Photos + 2 Videos</td>
                            </tr>

                            {/* Row: Compare Tool Prominence */}
                            <tr>
                                <td className="p-5 font-semibold text-gray-800">Compare Tool Prominence</td>
                                <td className="p-5 text-center text-gray-500">Standard Rank</td>
                                <td className="p-5 text-center text-primary font-bold">Highlighted Badge</td>
                                <td className="p-5 text-center text-primary-dark font-extrabold">Top Alternate Suggestion</td>
                            </tr>

                            {/* Row: Directory Listing */}
                            <tr>
                                <td className="p-5 font-semibold text-gray-800">Directory Presence (Builders/Designers)</td>
                                <td className="p-5 text-center"><X className="w-4 h-4 mx-auto text-red-400" /></td>
                                <td className="p-5 text-center text-gray-600">Standard Profile</td>
                                <td className="p-5 text-center"><Check className="w-5 h-5 mx-auto text-primary-dark font-extrabold" /></td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </section>

            {/* --- FAQ SECTION --- */}
            <section className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center space-y-4 mb-10">
                    <h2 className="text-3xl font-black text-gray-900 font-heading uppercase tracking-wide">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-sm text-gray-600">
                        Have questions about our pricing structures? Read through our standard inquiries or get in touch.
                    </p>
                </div>

                <div className="space-y-4">
                    {pricingFaqs.map((faq, index) => {
                        const isOpen = activeFaq === index;
                        return (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:border-gray-300"
                            >
                                <button
                                    onClick={() => setActiveFaq(isOpen ? null : index)}
                                    className="w-full p-5 text-left flex items-center justify-between font-bold text-gray-900 text-sm md:text-base focus:outline-none hover:bg-gray-50/50"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 shrink-0 ml-4 ${isOpen ? "rotate-180" : ""
                                        }`} />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-gray-100"
                                        >
                                            <div className="p-5 text-sm text-gray-600 leading-relaxed bg-gray-50/30">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* --- BOTTOM CTA --- */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                <div className="bg-zinc-950 text-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-2xl">
                            <span className="text-accent font-black text-xs uppercase tracking-[0.3em] block">Custom Developer Solutions</span>
                            <h2 className="text-3xl md:text-4xl font-black font-heading leading-tight uppercase tracking-tight">
                                Have a Large Property Portfolio?
                            </h2>
                            <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
                                If you are a professional builder or broker agency listing over 10 active developments, contact our accounts team for bulk discounts and custom CRM lead integration.
                            </p>
                        </div>

                        <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <Link
                                href="/builders"
                                className="w-full sm:w-auto py-4 px-8 text-center bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-850 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Browse Builders Directory
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
