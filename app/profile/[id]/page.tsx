"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    MapPin,
    User,
    Phone,
    Mail,
    CheckCircle2,
    Building2,
    ArrowLeft,
    Share2,
    ArrowRight,
    Map
} from "lucide-react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

type PropertyListing = {
    _id: string;
    address: string;
    locality?: string;
    city?: string;
    price?: number;
    bedrooms?: number;
    propertyType?: string;
    size?: number;
    sizeUnit?: string;
    purpose?: string;
};

type UserProfile = {
    _id: string;
    name: string;
    email: string;
    role: string;
    bio?: string;
    company?: string;
    address?: string;
    city?: string;
    phone?: string;
};

export default function PublicProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [properties, setProperties] = useState<PropertyListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const res = await fetch(`/api/profile/${id}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Failed to load profile");

                setProfile(data.user);
                setProperties(data.properties);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfileData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
                <p className="text-gray-500 mb-8 max-w-md">The user you're looking for doesn't exist or has been removed.</p>
                <Link href="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold transition-all">
                    Go Home
                </Link>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[#F8FAFA] pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">

                    {/* BACK NAVIGATION */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold mb-8 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    <div className="grid lg:grid-cols-3 gap-10">

                        {/* LEFT COLUMN: Profile info */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 sticky top-32">
                                <div className="text-center mb-8">
                                    <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-primary relative">
                                        <User size={64} />
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-[6px] border-white rounded-full flex items-center justify-center shadow-lg">
                                            <CheckCircle2 size={16} className="text-white" />
                                        </div>
                                    </div>

                                    <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2 tracking-tight">
                                        {profile.name}
                                    </h1>

                                    <div className="flex flex-col items-center gap-2">
                                        <span className="px-5 py-1.5 bg-primary/5 text-primary text-xs font-black uppercase tracking-[0.15em] rounded-full border border-primary/10">
                                            {profile.role || "PropYours User"}
                                        </span>
                                        {profile.company && (
                                            <div className="flex items-center gap-1.5 text-gray-500 font-bold text-sm">
                                                <Building2 size={16} className="text-gray-400" />
                                                {profile.company}
                                            </div>
                                        )}
                                        {profile.city && (
                                            <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[11px] uppercase tracking-wider mt-1">
                                                <MapPin size={12} />
                                                {profile.city}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {profile.bio && (
                                    <div className="mb-8 pt-8 border-t border-gray-50">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">About</h3>
                                        <p className="text-sm font-medium text-gray-600 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                                            "{profile.bio}"
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <button
                                        onClick={() => profile.phone && (window.location.href = `tel:${profile.phone}`)}
                                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                                    >
                                        <Phone size={20} />
                                        Call {profile.role}
                                    </button>
                                    <button
                                        onClick={() => window.location.href = `mailto:${profile.email}`}
                                        className="w-full bg-white border-2 border-primary text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-primary/10 active:scale-95"
                                    >
                                        <Mail size={20} />
                                        Email Verified
                                    </button>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-4">
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <CheckCircle2 size={16} className="text-green-500" />
                                        Background Verified
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <CheckCircle2 size={16} className="text-green-500" />
                                        Industry Expert
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Listings */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Active Listings</h2>
                                    <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">
                                        {properties.length} Total Properties Available
                                    </p>
                                </div>
                                <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 px-6 py-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-primary leading-none">{properties.length}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Status</p>
                                    </div>
                                </div>
                            </div>

                            {properties.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {properties.map((prop, idx) => (
                                        <motion.div
                                            key={prop._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-primary/5"
                                        >
                                            <div className="relative h-56 overflow-hidden">
                                                <Image
                                                    src="/loginimage.png"
                                                    alt={prop.address}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[10px] font-black px-4 py-2 rounded-xl text-primary uppercase tracking-widest shadow-lg border border-primary/10">
                                                    {prop.purpose || "FOR SALE"}
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                                                <div className="absolute bottom-4 left-4 flex gap-2">
                                                    <span className="text-[10px] font-bold text-white bg-black/30 backdrop-blur px-2 py-1 rounded-lg">
                                                        {prop.propertyType}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-black text-gray-900 text-xl leading-tight truncate flex-1 pr-2">
                                                        {prop.address}
                                                    </h3>
                                                    <div className="text-primary font-black text-lg leading-none">
                                                        ₹{(prop.price || 0).toLocaleString()}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[11px] uppercase tracking-wider mb-5">
                                                    <MapPin size={12} className="text-primary" />
                                                    {prop.locality}, {prop.city}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 pb-6 pt-2 border-t border-gray-50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
                                                            <Map size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Area</p>
                                                            <p className="text-xs font-bold text-gray-900">{prop.size} {prop.sizeUnit}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
                                                            <Building2 size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</p>
                                                            <p className="text-xs font-bold text-gray-900 truncate max-w-[80px]">{prop.propertyType}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/property/${prop._id}`}
                                                    className="w-full bg-[#FAFBFC] hover:bg-primary text-gray-400 hover:text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group/btn border border-gray-100"
                                                >
                                                    View Listing
                                                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white border border-dashed border-gray-200 rounded-[2.5rem] p-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                                        <Building2 size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Listings</h3>
                                    <p className="text-gray-400 font-medium">This user currently doesn't have any properties listed for sale or rent.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
