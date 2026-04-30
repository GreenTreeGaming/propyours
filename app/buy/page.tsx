"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Search,
  Filter,
  ArrowRight,
  Loader2,
  Building2,
  Home as HomeIcon,
  ChevronDown,
  X,
  SlidersHorizontal
} from "lucide-react";
import { TAMIL_NADU_LOCATIONS, TAMIL_NADU_CITIES } from "@/lib/locations";

interface Property {
  _id: string;
  propertyType: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  sizeUnit: string;
  locality: string;
  images: string[];
  purpose: string;
}

function BuyPageContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial state from URL params
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "Chennai");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("location") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "All");
  const [selectedBHK, setSelectedBHK] = useState(searchParams.get("bhk") || "All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState("newest");

  const cities = TAMIL_NADU_CITIES;
  const locations = TAMIL_NADU_LOCATIONS[selectedCity as keyof typeof TAMIL_NADU_LOCATIONS] || ["All"];

  const propertyTypes = [
    "All",
    "Apartment",
    "Independent House",
    "Independent Floor",
    "Duplex",
    "Villa",
    "Penthouse",
    "Plot",
    "Farm House",
    "Agricultural Land"
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/property");
        const data = await response.json();
        if (Array.isArray(data)) {
          setProperties(data);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(prop => {
    const matchesCity = selectedCity === "All" || prop.city.toLowerCase() === selectedCity.toLowerCase();

    const matchesSearch =
      prop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prop.locality && prop.locality.toLowerCase().includes(searchQuery.toLowerCase()));

    // Fuzzy matching for property types
    const normalizedSelectedType = (selectedType === "Apartments" || selectedType === "Apartment") ? "Apartment" :
      (selectedType === "Villas" || selectedType === "Villa") ? "Villa" : selectedType;

    const matchesType = normalizedSelectedType === "All" || prop.propertyType === normalizedSelectedType;

    const matchesBHK = selectedBHK === "All" ||
      (selectedBHK === "Studio" ? prop.bedrooms === 0 :
        (selectedBHK === "4+" || selectedBHK === "5+" ? prop.bedrooms >= 4 :
          prop.bedrooms === parseInt(selectedBHK)));

    const matchesMinPrice = minPrice === "" || prop.price >= parseInt(minPrice);
    const matchesMaxPrice = maxPrice === "" || prop.price <= parseInt(maxPrice);

    return matchesCity && matchesSearch && matchesType && matchesBHK && matchesMinPrice && matchesMaxPrice;
  }).sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return new Date(b._id).getTime() - new Date(a._id).getTime();
  });

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} L`;
    return `₹ ${price.toLocaleString()}`;
  };

  const clearFilters = () => {
    setSelectedCity("Chennai");
    setSearchQuery("");
    setSelectedType("All");
    setSelectedBHK("All");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] pt-28 pb-20 font-body">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-gray-900 mb-4 font-heading tracking-tight"
          >
            Find Your <span className="text-primary">Perfect Space</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg max-w-2xl font-medium"
          >
            Discover premium properties across Chennai. Use our advanced filters to narrow down your search.
          </motion.p>
        </div>

        {/* Enhanced Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-end">

            {/* City */}
            <div className="lg:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  className="w-full appearance-none pl-12 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold cursor-pointer"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSearchQuery("");
                  }}
                >
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Location */}
            <div className="lg:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Search Area</label>
              <div className="relative">
                <select
                  className="w-full appearance-none px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold cursor-pointer pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value === "All" ? "" : e.target.value)}
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Type */}
            <div className="lg:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Property Type</label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer pr-10"
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    if (e.target.value !== "Apartment") {
                      setSelectedBHK("All");
                    }
                  }}
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* BHK (Only if Apartment) */}
            {selectedType === "Apartment" && (
              <div className="lg:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">BHK</label>
                <div className="flex gap-1 p-1 pb-2 bg-gray-50 rounded-2xl overflow-x-auto custom-scrollbar">
                  {["All", "1", "2", "3", "4+", "Studio"].map(bhk => (
                    <button
                      key={bhk}
                      onClick={() => setSelectedBHK(bhk)}
                      className={`flex-shrink-0 min-w-[36px] px-3 py-2 text-[10px] font-black rounded-xl transition-all ${selectedBHK === bhk
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-gray-500 hover:text-primary"
                        }`}
                    >
                      {bhk}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className={`${selectedType === "Apartment" ? "lg:col-span-3" : "lg:col-span-5"} space-y-2`}>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-gray-300 font-bold">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Reset */}
            <div className="lg:col-span-1">
              <button
                onClick={clearFilters}
                className="w-full p-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center group shadow-lg shadow-gray-900/10"
                title="Reset Filters"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Secondary Filter Row */}
          <div className="mt-6 pt-6 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort By:</span>
              <div className="flex gap-2">
                {[
                  { id: "newest", label: "Newest" },
                  { id: "price-low", label: "Price: Low to High" },
                  { id: "price-high", label: "Price: High to Low" }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${sortBy === option.id
                      ? "bg-primary/5 border-primary text-primary"
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
              {filteredProperties.length} Properties Found
            </div>
          </div>
        </motion.div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="text-primary animate-spin mb-4" size={40} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing with market...</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProperties.map((prop, index) => (
              <motion.div
                key={prop._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group"
              >
                <Link href={`/property/${prop._id}`}>
                  <div className="relative h-72 overflow-hidden">
                    <Image
                      src={prop.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"}
                      alt={prop.address}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm">
                        {prop.propertyType}
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6 bg-primary px-5 py-2 rounded-2xl text-white text-lg font-black shadow-xl shadow-primary/30">
                      {formatPrice(prop.price)}
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors line-clamp-1">
                          {prop.address}
                        </h3>
                        <p className="text-gray-400 text-xs font-bold flex items-center gap-1 uppercase tracking-widest">
                          <MapPin size={14} className="text-primary" /> {prop.locality ? `${prop.locality}, ` : ""}{prop.city}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-50 mb-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                          <Bed size={20} />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{prop.bedrooms} Beds</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                          <Bath size={20} />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{prop.bathrooms} Baths</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                          <Maximize size={20} />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{prop.size} {prop.sizeUnit}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                          <Building2 size={18} className="text-green-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Verified</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Listing</span>
                        </div>
                      </div>
                      <span className="h-12 px-6 bg-gray-50 group-hover:bg-primary group-hover:text-white rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all duration-300">
                        Details <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-gray-200"
          >
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <SlidersHorizontal size={48} className="text-gray-300" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">No Perfect Matches Found</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto font-bold uppercase tracking-widest leading-relaxed">
              We couldn't find any properties matching those exact filters. Try relaxing your search criteria.
            </p>
            <button
              onClick={clearFilters}
              className="mt-10 px-10 py-4 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default function BuyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={40} />
      </div>
    }>
      <BuyPageContent />
    </Suspense>
  );
}
