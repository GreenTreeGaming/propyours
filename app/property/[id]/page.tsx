"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Bed,
    Bath,
    Maximize,
    Layers,
    User,
    Phone,
    Mail,
    ArrowLeft,
    Share2,
    Heart,
    CheckCircle2,
    Check,
    Building2,
    UserCircle,
    Info,
    BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SharePropertyModal from "@/components/SharePropertyModal";
import PropertyAnalyticsModal from "@/components/PropertyAnalyticsModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    getStoredUser,
    getStoredUserId,
    updateStoredUserFavorites,
} from "@/lib/browser-user";
import { useCompare } from "@/components/CompareContext";

type FavoriteRecord = {
    _id: string;
};

type PropertyRecord = {
    _id: string;
    address: string;
    purpose?: string;
    propertyType?: string;
    bedrooms?: number;
    locality?: string;
    city?: string;
    price?: number;
    negotiable?: boolean;
    bathrooms?: number;
    size?: number;
    sizeUnit?: string;
    floors?: number;
    description?: string;
    uds?: number;
    ownershipType?: string;
    dimensions?: string;
    landmark?: string;
    userId?: {
        _id?: string;
        name?: string;
        email?: string;
        role?: string;
        bio?: string;
        company?: string;
        city?: string;
        phone?: string;
    };
    amenities?: string[];
};

export default function PropertyDetailsPage() {
    const { id } = useParams();
    const { compareList, addToCompare, removeFromCompare } = useCompare();
    const [property, setProperty] = useState<PropertyRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [favoriteError, setFavoriteError] = useState("");
    const [shareOpen, setShareOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [showPhone, setShowPhone] = useState(false);
    const [displayUnit, setDisplayUnit] = useState<string | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    const isInCompare = property ? compareList.some((p) => p._id === property._id) : false;

    const handleCompareToggle = () => {
        if (!property) return;
        if (isInCompare) {
            removeFromCompare(property._id);
        } else {
            addToCompare({
                _id: property._id,
                address: property.address,
                price: property.price || 0,
                size: property.size || 0,
                sizeUnit: property.sizeUnit || "sqft",
                propertyType: property.propertyType || "Residential",
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                locality: property.locality,
                city: property.city,
                amenities: property.amenities || [],
                ownershipType: property.ownershipType
            });
        }
    };

    const convertSize = (value: number, fromUnit: string, toUnit: string) => {
        const factors: Record<string, number> = {
            sqft: 1,
            sqyd: 9,
            sqm: 10.7639,
            acre: 43560,
            kanal: 5445,
            marla: 272.25
        };

        const sqftValue = value * (factors[fromUnit] || 1);
        const result = sqftValue / (factors[toUnit] || 1);

        // Return rounded to 2 decimals, or 4 if it's very small (like acres)
        return toUnit === "acre" ? result.toFixed(4) : Math.round(result * 100) / 100;
    };

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await fetch(`/api/property/${id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setProperty(data as PropertyRecord);
                setDisplayUnit(data.sizeUnit || "sqft");
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to load property";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProperty();
    }, [id]);

    useEffect(() => {
        const userId = getStoredUserId();
        if (userId && property?.userId?._id === userId) {
            setIsOwner(true);
        }
    }, [property]);

    useEffect(() => {
        if (!id || !property) return;
        const normalizedId = Array.isArray(id) ? id[0] : id;

        // Single view per session recording is handled on the backend check if needed,
        // but for now we simple-track every load
        const recordView = async () => {
            try {
                await fetch(`/api/property/${normalizedId}/analytics`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "view" }),
                });
            } catch (err) {
                console.error("Failed to record view:", err);
            }
        };
        recordView();
    }, [id, !!property]);

    useEffect(() => {
        if (!id) return;

        const normalizedId = Array.isArray(id) ? id[0] : id;
        const storedUser = getStoredUser();

        if (storedUser?.favorites?.includes(normalizedId)) {
            setIsFavorite(true);
        }

        const userId = getStoredUserId();
        if (!userId) return;

        const fetchFavorites = async () => {
            try {
                const res = await fetch(`/api/user/${userId}/favorites`, { cache: "no-store" });
                const data = await res.json();
                if (!res.ok) return;

                const favoriteIds = (data as FavoriteRecord[]).map((favorite) => favorite._id);
                updateStoredUserFavorites(favoriteIds);
                setIsFavorite(favoriteIds.includes(normalizedId));
            } catch (error) {
                console.error("Failed to sync favorite state:", error);
            }
        };

        fetchFavorites();
    }, [id]);

    useEffect(() => {
        if (typeof window === "undefined" || !id) return;
        const normalizedId = Array.isArray(id) ? id[0] : id;
        setShareUrl(`${window.location.origin}/property/${normalizedId}`);
    }, [id]);

    const handleFavoriteToggle = async () => {
        const userId = getStoredUserId();
        const normalizedId = Array.isArray(id) ? id[0] : id;

        if (!userId) {
            window.location.href = "/login";
            return;
        }

        setFavoriteLoading(true);
        setFavoriteError("");

        try {
            const res = await fetch(`/api/user/${userId}/favorites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ propertyId: normalizedId }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to update favorites");
            }

            const updatedFavorites = data.favorites as string[];
            updateStoredUserFavorites(updatedFavorites);
            setIsFavorite(updatedFavorites.includes(normalizedId));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update favorites";
            setFavoriteError(message);
        } finally {
            setFavoriteLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error || !property) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <Info size={40} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
            <p className="text-gray-500 mb-8 max-w-md">We couldn&apos;t find the property you&apos;re looking for. It might have been removed or the link is incorrect.</p>
            <Link href="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                Go Back Home
            </Link>
        </div>
    );

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[#F8FAFA] pt-32 pb-20">
                <div className="container-wide px-6">

                    {/* BACK & ACTIONS */}
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-semibold">
                            <ArrowLeft size={20} />
                            Back to Search
                        </Link>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCompareToggle}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shadow-sm font-bold text-xs uppercase tracking-widest ${isInCompare
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white border-gray-100 text-gray-500 hover:text-primary"
                                    }`}
                            >
                                <Layers size={18} />
                                {isInCompare ? "Comparing" : "Compare"}
                            </button>
                            <button
                                onClick={() => setShareOpen(true)}
                                className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-primary transition-all shadow-sm"
                            >
                                <Share2 size={20} />
                            </button>
                            <button
                                onClick={handleFavoriteToggle}
                                disabled={favoriteLoading}
                                className={`p-2.5 rounded-xl border border-gray-100 bg-white transition-all shadow-sm hover:bg-gray-50 ${favoriteLoading ? "opacity-60 cursor-not-allowed" : ""
                                    }`}
                            >
                                <Heart
                                    size={20}
                                    className={`transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-red-500"}`}
                                />
                            </button>
                            {isOwner && (
                                <button
                                    onClick={() => setShowAnalytics(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                >
                                    <BarChart3 size={18} />
                                    Analytics
                                </button>
                            )}
                        </div>
                    </div>

                    {favoriteError && (
                        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-500">
                            {favoriteError}
                        </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-10">

                        {/* LEFT COLUMN: Main Details */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Title & Price Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
                            >
                                <div className="flex flex-col gap-6">
                                    {/* TITLE BLOCK */}
                                    <div className="space-y-3 max-w-3xl">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm">
                                                {property.purpose || "FOR SALE"}
                                            </span>
                                            <span className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                                                {property.propertyType || "RESIDENTIAL"}
                                            </span>
                                        </div>

                                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter">
                                            {property.address}
                                        </h1>

                                        <div className="text-lg md:text-2xl text-gray-500 font-bold tracking-tight">
                                            {property.bedrooms ? `${property.bedrooms} BHK ` : ""}
                                            {property.propertyType} in {property.locality}, {property.city}
                                        </div>
                                    </div>

                                    {/* PRICE BLOCK — NOW LEFT ALIGNED */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Total Asking Price
                                        </p>

                                        <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tighter">
                                            ₹{property.price?.toLocaleString()}
                                        </h2>

                                        {property.negotiable && (
                                            <span className="inline-flex items-center text-[11px] font-bold text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                                                ★ NEGOTIABLE
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Key Stats Bar */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                            <Bed size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Bedrooms</p>
                                            <p className="text-sm font-bold text-gray-900">{property.bedrooms || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                            <Bath size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Bathrooms</p>
                                            <p className="text-sm font-bold text-gray-900">{property.bathrooms || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                            <Maximize size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Total Area</p>
                                            <div className="flex items-center gap-1">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {property.size && displayUnit ? (
                                                        convertSize(property.size, property.sizeUnit || "sqft", displayUnit)
                                                    ) : property.size}
                                                </p>
                                                <select
                                                    className="text-[10px] font-black uppercase bg-transparent text-primary hover:underline cursor-pointer outline-none border-none p-0 focus:ring-0"
                                                    value={displayUnit || "sqft"}
                                                    onChange={(e) => setDisplayUnit(e.target.value)}
                                                >
                                                    <option value="sqft">Sq Ft</option>
                                                    <option value="sqyd">Sq Yd</option>
                                                    <option value="sqm">Sq M</option>
                                                    <option value="acre">Acre</option>
                                                    <option value="kanal">Kanal</option>
                                                    <option value="marla">Marla</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                            <Layers size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Floors</p>
                                            <p className="text-sm font-bold text-gray-900">{property.floors || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Image Gallery Placeholder */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
                                <div className="relative rounded-3xl overflow-hidden shadow-sm group">
                                    <Image
                                        src="/loginimage.png"
                                        alt="Property"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                                <div className="grid grid-rows-2 gap-4 h-full">
                                    <div className="relative rounded-3xl overflow-hidden shadow-sm">
                                        <Image src="/signuppageimage.png" alt="Property" fill className="object-cover" />
                                    </div>
                                    <div className="relative rounded-3xl overflow-hidden shadow-sm bg-primary/10 flex items-center justify-center">
                                        <p className="text-primary font-bold">View all photos</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 size={22} className="text-primary" />
                                    About this Property
                                </h3>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    {property.description}
                                </p>
                            </div>

                            {/* Property Specs Table */}
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                                <h3 className="text-xl font-bold text-gray-900">Property Details</h3>
                                <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                                    {property.uds ? (
                                        <div className="flex justify-between py-3 border-b border-gray-50">
                                            <span className="text-gray-500 font-medium">UDS</span>
                                            <span className="text-gray-900 font-bold">{property.uds} sq. ft.</span>
                                        </div>
                                    ) : null}
                                    <div className="flex justify-between py-3 border-b border-gray-50">
                                        <span className="text-gray-500 font-medium">Ownership</span>
                                        <span className="text-gray-900 font-bold uppercase">{property.ownershipType || "Freehold"}</span>
                                    </div>
                                    {property.dimensions ? (
                                        <div className="flex justify-between py-3 border-b border-gray-50">
                                            <span className="text-gray-500 font-medium">Dimensions</span>
                                            <span className="text-gray-900 font-bold">{property.dimensions}</span>
                                        </div>
                                    ) : null}
                                    <div className="flex justify-between py-3 border-b border-gray-50">
                                        <span className="text-gray-500 font-medium">Nearby Landmark</span>
                                        <span className="text-gray-900 font-bold">{property.landmark || "None reported"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Amenities Section */}
                            {property.amenities && property.amenities.length > 0 && (
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <CheckCircle2 size={22} className="text-primary" />
                                        Amenities & Features
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                                        {property.amenities.map((amenity) => (
                                            <div key={amenity} className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                    <Check size={14} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-600">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Contact & Sidebar */}
                        <div className="space-y-8">

                            {/* Contact Card */}
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-36">
                                <div className="text-center mb-6">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary relative">
                                        <User size={40} />
                                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{property.userId?.name || "Owner"}</h3>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xs font-black text-primary uppercase tracking-wider bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                            {property.userId?.role || "PropYours User"}
                                        </span>
                                        {property.userId?.company && (
                                            <p className="text-xs font-bold text-gray-500">
                                                {property.userId.company}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {property.userId?.bio && (
                                    <div className="mb-6">
                                        <p className="text-xs text-center text-gray-500 leading-relaxed font-medium italic">
                                            "{property.userId.bio}"
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {showPhone ? (
                                        property.userId?.phone ? (
                                            <a
                                                href={`tel:${property.userId.phone}`}
                                                className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                                            >
                                                <Phone size={20} />
                                                {property.userId.phone}
                                            </a>
                                        ) : (
                                            <div className="w-full bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 border border-gray-100">
                                                <Phone size={20} className="text-gray-300" />
                                                No phone number provided
                                            </div>
                                        )
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                const normalizedId = Array.isArray(id) ? id[0] : id;
                                                // Record analytics only if it's the first click
                                                try {
                                                    await fetch(`/api/property/${normalizedId}/analytics`, {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ type: "phoneClick" }),
                                                    });
                                                } catch (err) {
                                                    console.error("Failed to record phone click:", err);
                                                }
                                                setShowPhone(true);
                                            }}
                                            className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                                        >
                                            <Phone size={20} />
                                            Show Phone Number
                                        </button>
                                    )}
                                    <button
                                        onClick={() => window.location.href = `mailto:${property.userId?.email}`}
                                        className="w-full bg-white border-2 border-primary text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-primary/5 active:scale-95"
                                    >
                                        <Mail size={20} />
                                        Email Seller
                                    </button>
                                    <Link
                                        href={`/profile/${property.userId?._id}`}
                                        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-all py-2"
                                    >
                                        <UserCircle size={18} />
                                        View Full Profile
                                    </Link>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-4">
                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                                        <CheckCircle2 size={16} className="text-green-500" />
                                        Trusted Listing
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                                        <CheckCircle2 size={16} className="text-green-500" />
                                        Verified Documents
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                                        <CheckCircle2 size={16} className="text-green-500" />
                                        Premium Visibility
                                    </div>
                                </div>

                                {/* Trust Badge */}
                                <div className="mt-8 bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                                    <Building2 size={32} className="text-gray-300" />
                                    <p className="text-xs font-bold text-gray-500 leading-tight">
                                        Always meet the seller in person before finalizing any payments.
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                <SharePropertyModal
                    isOpen={shareOpen}
                    onClose={() => setShareOpen(false)}
                    propertyTitle={property.address}
                    shareUrl={shareUrl}
                />

                <PropertyAnalyticsModal
                    isOpen={showAnalytics}
                    onClose={() => setShowAnalytics(false)}
                    property={property}
                />
            </main>
        </ProtectedRoute>
    );
}
