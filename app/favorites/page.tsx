"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { getStoredUserId } from "@/lib/browser-user";

type FavoriteProperty = {
    _id: string;
    address: string;
    city: string;
    state?: string;
    locality?: string;
    propertyType: string;
    purpose: string;
    price: number;
    bedrooms?: number;
    size: number;
    images?: string[];
};

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    useEffect(() => {
        const userId = getStoredUserId();

        if (!userId) {
            setIsLoggedIn(false);
            setLoading(false);
            return;
        }

        const fetchFavorites = async () => {
            try {
                const res = await fetch(`/api/user/${userId}/favorites`, { cache: "no-store" });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch favorites");
                }

                setFavorites(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to load favorites";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#F8FAFA] pt-32 pb-20">
                <div className="flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
            </main>
        );
    }

    if (!isLoggedIn) {
        return (
            <main className="min-h-screen bg-[#F8FAFA] pt-32 pb-20">
                <div className="container-wide px-6">
                    <div className="mx-auto max-w-2xl rounded-[2rem] border border-gray-100 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Heart size={30} />
                        </div>
                        <h1 className="mb-3 text-3xl font-black text-gray-900">Favorited Properties</h1>
                        <p className="mb-8 text-gray-500">
                            Log in to save listings and revisit them from your favorites page.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex rounded-2xl bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-dark"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-[#F8FAFA] pt-32 pb-20">
                <div className="container-wide px-6">
                    <div className="rounded-[2rem] border border-red-100 bg-white p-8 text-red-500 shadow-sm">
                        {error}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFA] pt-32 pb-20">
            <div className="container-wide px-6">
                <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-gray-900">
                            Favorited Properties
                        </h1>
                        <p className="mt-3 max-w-2xl text-gray-500">
                            Revisit the homes and investments you marked to compare later.
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white px-5 py-4 text-sm font-bold text-gray-700 shadow-sm">
                        {favorites.length} saved {favorites.length === 1 ? "property" : "properties"}
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <div className="rounded-[2rem] border border-gray-100 bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Heart size={34} />
                        </div>
                        <h2 className="mb-3 text-2xl font-black text-gray-900">No favorites yet</h2>
                        <p className="mb-8 text-gray-500">
                            Start saving listings from any property page and they will appear here.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex rounded-2xl bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-dark"
                        >
                            Browse Properties
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {favorites.map((property) => {
                            const imageSrc = property.images?.[0] || "/house1.jpeg";

                            return (
                                <Link
                                    key={property._id}
                                    href={`/property/${property._id}`}
                                    className="group overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="relative h-60 overflow-hidden">
                                        <Image
                                            src={imageSrc}
                                            alt={property.address}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-gray-700 backdrop-blur">
                                            {property.purpose}
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-6">
                                        <div>
                                            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                                                {property.propertyType}
                                            </p>
                                            <h2 className="text-2xl font-black leading-tight text-gray-900">
                                                {property.address}
                                            </h2>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm font-medium text-gray-500">
                                            <MapPin size={16} className="mt-0.5 shrink-0" />
                                            <span>
                                                {[property.locality, property.city, property.state].filter(Boolean).join(", ")}
                                            </span>
                                        </div>

                                        <div className="flex items-end justify-between gap-4 border-t border-gray-100 pt-4">
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                                                    Asking Price
                                                </p>
                                                <p className="text-2xl font-black text-primary">
                                                    ₹{property.price?.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm font-semibold text-gray-500">
                                                <p>{property.bedrooms === 0 ? "Studio" : `${property.bedrooms || 0} BHK`}</p>
                                                <p>{property.size} sq. ft.</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
