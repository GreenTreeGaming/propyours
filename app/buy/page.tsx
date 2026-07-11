"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
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
  promotedUntil?: string;
}

function BuyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial state from URL params
  const [selectedCity, setSelectedCity] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("location") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "All");
  const [selectedBHK, setSelectedBHK] = useState(searchParams.get("bhk") || "All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState(
      searchParams.get("sort") ?? "default"
  );

  const [searchTerm, setSearchTerm] = useState(
      searchParams.get("location") || ""
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
    setSelectedCity(searchParams.get("city") || "All");
    setSearchQuery(searchParams.get("location") || "");
    setSelectedType(searchParams.get("type") || "All");
    setSelectedBHK(searchParams.get("bhk") || "All");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setSearchTerm(searchParams.get("location") || "");
    setSortBy(searchParams.get("sort") ?? "default");
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProperties = async () => {
      setLoading(true);

      try {
        const apiParams = new URLSearchParams();

        const filter = searchParams.get("filter");
        const sort = searchParams.get("sort");

        if (filter) {
          apiParams.set("filter", filter);
        }

        if (sort) {
          apiParams.set("sort", sort);
        }

        const queryString = apiParams.toString();

        const endpoint = queryString
            ? `/api/property?${queryString}`
            : "/api/property";

        const response = await fetch(endpoint, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
              `Property request failed with status ${response.status}`
          );
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Property API returned an invalid response");
        }

        setProperties(data);
      } catch (error) {
        if (
            error instanceof DOMException &&
            error.name === "AbortError"
        ) {
          return;
        }

        console.error("Error fetching properties:", error);
        setProperties([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchProperties();

    return () => {
      controller.abort();
    };
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
          searchRef.current &&
          !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
          "mousedown",
          handleClickOutside
      );
    };
  }, []);

  const filteredProperties = properties.filter(prop => {
    const matchesCity = selectedCity === "All" || prop.city.toLowerCase() === selectedCity.toLowerCase();

    const matchesSearch =
        searchQuery === "" ||
        prop.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.locality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.city?.toLowerCase().includes(searchQuery.toLowerCase());

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
    if (sortBy === "price-low") {
      return a.price - b.price;
    }

    if (sortBy === "price-high") {
      return b.price - a.price;
    }

    return 0;
  });

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} L`;
    return `₹ ${price.toLocaleString()}`;
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    setSortBy(value);

    if (
        value === "default" ||
        value === "price-low" ||
        value === "price-high"
    ) {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    const queryString = params.toString();

    router.replace(
        queryString ? `${pathname}?${queryString}` : pathname,
        {
          scroll: false,
        }
    );
  };

  const clearFilters = () => {
    setSelectedCity("All");
    setSearchQuery("");
    setSelectedType("All");
    setSelectedBHK("All");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("default");
    setSearchTerm("");
    setShowSuggestions(false);

    router.replace(pathname, {
      scroll: false,
    });
  };

  const getCityForArea = (area: string) => {
    for (const [city, areas] of Object.entries(TAMIL_NADU_LOCATIONS)) {
      if (areas.includes(area)) {
        return city;
      }
    }

    return null;
  };

  const searchableItems = [
    ...cities.map(city => ({
      type: "city",
      label: city
    })),

    ...Object.entries(TAMIL_NADU_LOCATIONS)
        .flatMap(([city, areas]) =>
            areas
                .filter(area => area !== "All")
                .map(area => ({
                  type: "area",
                  label: area,
                  city
                }))
        ),

    ...propertyTypes
        .filter(type => type !== "All")
        .map(type => ({
          type: "property",
          label: type
        }))
  ];

  const suggestions = searchTerm.length > 0
      ? searchableItems
          .filter(item =>
              item.label
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
          )
          .slice(0, 8)
      : [];

  const handleSuggestionClick = (
      item: {
        type: string;
        label: string;
      }
  ) => {
    if (item.type === "city") {
      setSelectedCity(item.label);
    }

    if (item.type === "area") {
      setSearchQuery(item.label);

      const city = getCityForArea(item.label);

      if (city) {
        setSelectedCity(city);
      }
    }

    if (item.type === "property") {
      setSelectedType(item.label);
    }

    if (item.type !== "city") {
      setSearchTerm("");
    }
    setShowSuggestions(false);
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

            <div
                ref={searchRef}
                className="lg:col-span-4 space-y-2 relative"
            >
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Search Location / Property
              </label>

              <div className="relative">
                <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                />

                <input
                    type="text"
                    value={searchTerm}
                    placeholder="Chennai, Adyar, OMR, Apartment..."
                    onChange={(event) => {
                      const value = event.target.value;

                      setSearchTerm(value);
                      setSearchQuery(value);
                      setShowSuggestions(true);
                    }}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-primary/10 font-bold"
                />

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                      {suggestions.map((item, index) => (
                          <button
                              key={`${item.type}-${index}`}
                              onClick={() => handleSuggestionClick(item)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                          >
                            {item.type === "city" && (
                                <MapPin size={16} className="text-primary" />
                            )}

                            {item.type === "area" && (
                                <MapPin size={16} className="text-gray-500" />
                            )}

                            {item.type === "property" && (
                                <Building2 size={16} className="text-green-500" />
                            )}

                            <div className="flex flex-col">
  <span className="font-semibold text-sm">
    {item.label}
  </span>

                              {item.type === "area" && (
                                  <span className="text-xs text-gray-400">
      {item.city}
    </span>
                              )}
                            </div>

                            <span className="ml-auto text-[10px] uppercase text-gray-400">
  {item.type === "city"
      ? "CITY"
      : item.type === "property"
          ? "PROPERTY"
          : ""}
</span>
                          </button>
                      ))}
                    </div>
                )}
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

          <div className="flex flex-wrap gap-2 mt-4">

            {selectedCity !== "All" && (
                <button
                    onClick={() => setSelectedCity("All")}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold"
                >
                  {selectedCity}
                  <X size={12} />
                </button>
            )}

            {searchQuery && (
                <button
                    onClick={() => setSearchQuery("")}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold"
                >
                  {searchQuery}
                  <X size={12} />
                </button>
            )}

            {selectedType !== "All" && (
                <button
                    onClick={() => setSelectedType("All")}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold"
                >
                  {selectedType}
                  <X size={12} />
                </button>
            )}

          </div>

          {/* Secondary Filter Row */}
          <div className="mt-6 pt-6 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      Sort By:
    </span>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: "default", label: "Recommended" },
                  { id: "newest", label: "Newest" },
                  { id: "popular", label: "Most Popular" },
                  { id: "price-low", label: "Price: Low to High" },
                  { id: "price-high", label: "Price: High to Low" },
                ].map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSortChange(option.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                            sortBy === option.id
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

                      {prop.promotedUntil &&
                          new Date(prop.promotedUntil).getTime() > Date.now() && (
                              <span className="px-4 py-1.5 rounded-full bg-yellow-400 text-yellow-950 text-[10px] font-black uppercase tracking-widest shadow-sm">
        Promoted
      </span>
                          )}
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
