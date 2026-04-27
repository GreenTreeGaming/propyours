"use client";

import { useEffect, useState } from "react";
import {
    MapPin,
    Bed,
    Bath,
    Maximize,
    Trash2,
    Edit,
    ChevronRight,
    AlertCircle,
    Building2,
    Plus,
    LayoutGrid,
    ListFilter,
    BarChart3,
    X,
    TrendingUp,
    Users,
    Phone,
    Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import PropertyAnalyticsModal from "@/components/PropertyAnalyticsModal";

export default function ManagePropertiesPage() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchProperties(parsedUser.id || parsedUser._id);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProperties = async (userId: string) => {
        try {
            const res = await fetch(`/api/property/user/${userId}`, { cache: 'no-store' });
            const data = await res.json();
            if (res.ok) {
                setProperties(data);
            }
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this property?")) return;

        try {
            const res = await fetch(`/api/property/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setProperties(properties.filter(p => p._id !== id));
                alert("Property removed successfully.");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete property.");
            }
        } catch (error) {
            console.error("Error deleting property:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    const handleViewAnalytics = (property: any) => {
        setSelectedProperty(property);
        setShowAnalytics(true);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
            <AlertCircle size={48} className="text-gray-300 mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Login Required</h1>
            <p className="text-gray-500 mb-8">Please login to manage your properties.</p>
            <Link href="/login" className="bg-primary text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105">
                Login Now
            </Link>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#F8FAFA] pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Properties</h1>
                        <p className="text-gray-500 font-medium">You have posted {properties.length} properties</p>
                    </div>
                    <Link
                        href="/post-property"
                        className="bg-primary text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} />
                        List New Property
                    </Link>
                </div>

                {properties.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-16 border border-gray-100 shadow-sm text-center"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Building2 size={48} className="text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Properties Shared Yet</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Start listing your properties today and reach thousands of potential buyers globally.</p>
                        <Link href="/post-property" className="text-primary font-bold hover:underline underline-offset-4">
                            Post your first listing now
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {properties.map((property, idx) => (
                                <motion.div
                                    key={property._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${property.purpose === 'Sell' ? 'bg-orange-500 text-white' : 'bg-primary text-white'
                                                }`}>
                                                {property.purpose}
                                            </span>
                                        </div>
                                        <Image
                                            src={property.images?.[0] || "/loginimage.png"}
                                            alt={property.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4 flex-grow">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-gray-900 truncate">{property.title}</h3>
                                            <p className="text-sm font-medium text-gray-400 flex items-center gap-1.5 uppercase tracking-tighter">
                                                <MapPin size={14} className="text-primary" />
                                                {property.city}, {property.state}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                            <p className="text-xl font-black text-primary">₹{property.price?.toLocaleString()}</p>
                                            <div className="flex items-center gap-4 text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Bed size={16} />
                                                    <span className="text-xs font-bold">{property.bedrooms || '0'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Maximize size={16} />
                                                    <span className="text-xs font-bold">{property.size}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3 pt-2">
                                            <div className="grid grid-cols-2 gap-3">
                                                <Link
                                                    href={`/property/${property._id}`}
                                                    className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => handleViewAnalytics(property)}
                                                    className="flex items-center justify-center gap-2 py-3 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-colors"
                                                >
                                                    <BarChart3 size={16} />
                                                    Analytics
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(property._id)}
                                                className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Analytics Modal */}
                <PropertyAnalyticsModal
                    isOpen={showAnalytics}
                    onClose={() => setShowAnalytics(false)}
                    property={selectedProperty}
                />
            </div>
        </main>
    );
}
