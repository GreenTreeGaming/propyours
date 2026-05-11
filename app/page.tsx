"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Building2,
  Home as HomeIcon,
  Store,
  Armchair,
  ChevronRight,
  CheckCircle,
  Layers,
  HeadphonesIcon,
  ChevronDown,
  ArrowRight,
  Menu,
  X
} from "lucide-react";
import { TAMIL_NADU_LOCATIONS, TAMIL_NADU_CITIES } from "@/lib/locations";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Buy");
  const [activePropertyTab, setActivePropertyTab] = useState("Featured");

  // Search State
  const [city, setCity] = useState("Chennai");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bhk, setBhk] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const cities = TAMIL_NADU_CITIES;
  const locations = TAMIL_NADU_LOCATIONS[city as keyof typeof TAMIL_NADU_LOCATIONS] || [];
  const propertyTypes = [
    "Apartment", "Independent House", "Independent Floor",
    "Duplex", "Villa", "Penthouse", "Plot",
    "Farm House", "Agricultural Land"
  ];
  const bhkOptions = ["1", "2", "3", "4+", "Studio"];
  const priceRanges = ["Under 50L", "50L - 1Cr", "1Cr - 2Cr", "2Cr - 5Cr", "Above 5Cr", "10Cr+"];

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (location) params.append("location", location);
    if (propertyType) params.append("type", propertyType);
    if (propertyType === "Apartment" && bhk) params.append("bhk", bhk);
    if (maxPrice) {
      // Map simplified price ranges to actual values if needed, 
      // but for now we'll just pass the string or try to parse it.
      // Under 50L -> 5000000
      let maxVal = "";
      if (maxPrice.includes("50L")) maxVal = "5000000";
      else if (maxPrice.includes("1Cr")) maxVal = "10000000";
      else if (maxPrice.includes("2Cr")) maxVal = "20000000";
      else if (maxPrice.includes("5Cr")) maxVal = "50000000";

      if (maxVal) params.append("maxPrice", maxVal);
    }

    router.push(`/buy?${params.toString()}`);
  };

  const propertyTabs = ["Featured", "New Launch", "Popular", "Affordable"];

  const [realProperties, setRealProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/property");
        const data = await response.json();
        if (Array.isArray(data)) {
          setRealProperties(data.slice(0, 4)); // Show first 4 on home page
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} L`;
    return `₹ ${price.toLocaleString()}`;
  };

  return (
    <main className="flex-1 bg-white pt-24 font-body">
      {/* Hero Section */}
      <section className="relative bg-[#fafafa] z-[60]">
        {/* Abstract Background Curve */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-0 right-0 h-full w-[60%] text-[#f0f5f5]" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
            <path d="M0,0 C40,40 20,100 100,100 L100,0 Z"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 lg:pt-20 pb-0 relative z-30 flex flex-col lg:flex-row items-center">

          <div className="w-full lg:w-3/5 pr-0 lg:pr-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 font-heading"
            >
              Find Your <span className="text-primary">Dream Home</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 mb-8 max-w-lg"
            >
              Explore verified properties, connect with trusted builders, and design your perfect space.
            </motion.p>

            {/* Search Bar Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative z-[100] mt-12 bg-white p-3 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center gap-2 max-w-4xl"
            >
              <div className="flex-1 min-w-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">

                {/* Buy Dropdown */}
                <div
                  className="px-3 py-2 flex items-center justify-between min-w-[80px] cursor-pointer hover:bg-gray-50 rounded-l-xl relative group"
                  onClick={() => toggleDropdown('buy')}
                >
                  <div className="flex items-center gap-1.5">
                    <HomeIcon size={14} className="text-gray-400" />
                    <span className="font-bold text-gray-800 text-xs">{activeTab}</span>
                  </div>
                  <ChevronDown size={12} className={`text-gray-500 transition-transform ${openDropdown === 'buy' ? 'rotate-180' : ''}`} />

                  <AnimatePresence>
                    {openDropdown === 'buy' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white shadow-2xl rounded-2xl border border-gray-100 py-2 z-[60] overflow-hidden"
                      >
                          {["Buy", "Rent", "Sell", "PG/CO-Living"].map(tab => (
                            <div key={tab} className="px-5 py-3 hover:bg-primary/5 hover:text-primary text-sm font-bold transition-colors cursor-pointer" onClick={(e) => { 
                              e.stopPropagation(); 
                              if (tab === "Sell") {
                                router.push("/sell");
                              } else {
                                setActiveTab(tab); 
                              }
                              setOpenDropdown(null); 
                            }}>{tab}</div>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* City */}
                <div
                  className="px-3 py-2 flex-1 min-w-0 md:basis-[100px] flex items-center justify-between cursor-pointer hover:bg-gray-50 relative"
                  onClick={() => toggleDropdown('city')}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin size={14} className="text-primary flex-shrink-0" />
                    <span className={`text-xs truncate ${city ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                      {city || "City"}
                    </span>
                  </div>
                  <ChevronDown size={12} className={`text-gray-400 transition-transform ${openDropdown === 'city' ? 'rotate-180' : ''}`} />

                  <AnimatePresence>
                    {openDropdown === 'city' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white shadow-2xl rounded-2xl border border-gray-100 py-2 z-[60]"
                      >
                        {cities.map(c => (
                          <div
                            key={c}
                            className="px-4 py-2 hover:bg-primary/5 hover:text-primary text-xs font-bold transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCity(c);
                              setLocation("");
                              setOpenDropdown(null);
                            }}
                          >
                            {c}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Location */}
                <div
                  className="px-3 py-2 flex-1 min-w-0 md:basis-[120px] flex items-center justify-between cursor-pointer hover:bg-gray-50 relative"
                  onClick={() => toggleDropdown('location')}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin size={14} className="text-primary flex-shrink-0" />
                    <span className={`text-xs truncate ${location ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                      {location || "Location"}
                    </span>
                  </div>
                  <ChevronDown size={12} className={`text-gray-400 transition-transform ${openDropdown === 'location' ? 'rotate-180' : ''}`} />

                  <AnimatePresence>
                    {openDropdown === 'location' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-72 bg-white shadow-2xl rounded-2xl border border-gray-100 py-3 z-[60]"
                      >
                        <div className="px-4 pb-3 border-b border-gray-50 mb-2">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search areas..."
                              className="w-full bg-gray-50 rounded-xl pl-9 pr-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar px-2 space-y-1">
                          {locations.map(loc => (
                            <div
                              key={loc}
                              className="px-4 py-2.5 hover:bg-primary/5 hover:text-primary text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                              onClick={(e) => { e.stopPropagation(); setLocation(loc); setOpenDropdown(null); }}
                            >
                              {loc}
                              <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Property Type */}
                <div
                  className="px-3 py-2 flex-1 min-w-0 md:basis-[120px] flex items-center justify-between cursor-pointer hover:bg-gray-50 relative"
                  onClick={() => toggleDropdown('type')}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Building2 size={14} className="text-primary flex-shrink-0" />
                    <span className={`text-xs truncate ${propertyType ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                      {propertyType || "Type"}
                    </span>
                  </div>
                  <ChevronDown size={12} className={`text-gray-400 transition-transform ${openDropdown === 'type' ? 'rotate-180' : ''}`} />

                  <AnimatePresence>
                    {openDropdown === 'type' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl rounded-2xl border border-gray-100 py-2 z-[60] max-h-64 overflow-y-auto"
                      >
                        {propertyTypes.map(type => (
                          <div key={type} className="px-5 py-3 hover:bg-primary/5 hover:text-primary text-xs font-black transition-colors cursor-pointer" onClick={(e) => {
                            e.stopPropagation();
                            setPropertyType(type);
                            if (type !== "Apartment") setBhk("");
                            setOpenDropdown(null);
                          }}>{type}</div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* BHK (Only visible if Apartment is selected) */}
                {propertyType === "Apartment" && (
                  <div
                    className="px-3 py-2 flex-1 min-w-0 md:basis-[80px] flex items-center justify-between cursor-pointer hover:bg-gray-50 relative"
                    onClick={() => toggleDropdown('bhk')}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-xs truncate ${bhk ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                        {bhk || "BHK"}
                      </span>
                    </div>
                    <ChevronDown size={12} className={`text-gray-400 transition-transform ${openDropdown === 'bhk' ? 'rotate-180' : ''}`} />

                    <AnimatePresence>
                      {openDropdown === 'bhk' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-32 bg-white shadow-2xl rounded-2xl border border-gray-100 py-2 z-[60]"
                        >
                          {bhkOptions.map(option => (
                            <div key={option} className="px-4 py-2 hover:bg-primary/5 hover:text-primary text-xs font-bold transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); setBhk(option); setOpenDropdown(null); }}>{option}</div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Max Price */}
                <div
                  className="px-3 py-2 flex-1 min-w-0 md:basis-[100px] flex items-center justify-between cursor-pointer hover:bg-gray-50 relative"
                  onClick={() => toggleDropdown('price')}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-primary font-bold text-sm leading-none flex-shrink-0">₹</span>
                    <span className={`text-xs truncate ${maxPrice ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                      {maxPrice || "Max Price"}
                    </span>
                  </div>
                  <ChevronDown size={12} className={`text-gray-400 transition-transform ${openDropdown === 'price' ? 'rotate-180' : ''}`} />

                  <AnimatePresence>
                    {openDropdown === 'price' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-full bg-white shadow-2xl rounded-xl border border-gray-100 py-2 z-[60]"
                      >
                        {priceRanges.map(price => (
                          <div key={price} className="px-4 py-2 hover:bg-primary/5 hover:text-primary text-xs font-bold cursor-pointer" onClick={(e) => { e.stopPropagation(); setMaxPrice(price); setOpenDropdown(null); }}>{price}</div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search Button */}
                <div className="p-1.5 flex items-stretch flex-shrink-0">
                  <button
                    className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white rounded-xl px-7 py-2 text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm shadow-primary/20"
                    onClick={handleSearch}
                  >
                    <Search size={16} />
                    Search
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Popular Searches */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex items-center gap-3 mt-6 flex-wrap"
            >
              <span className="text-sm text-gray-500">Popular:</span>
              {["ADYAR", "OMR", "Apartments"].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase font-bold tracking-wider bg-white border border-gray-200 text-gray-400 px-3 py-1.5 rounded-full hover:border-primary hover:text-primary cursor-pointer transition-colors shadow-sm"
                  onClick={() => tag === "Apartments" ? setPropertyType(tag) : setLocation(tag)}
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Hero Image */}
          <div className="w-full lg:w-2/5 mt-12 lg:mt-0 relative h-[400px]">
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border-4 border-white">
              <Image
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1000"
                alt="Modern Living Room"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Quick Links Bar (Now inside Hero for better stacking) */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-10 relative z-20 translate-y-12">
          <div className="bg-white rounded-[1.5rem] shadow-lg border border-gray-100 p-2 md:p-3 flex flex-col md:flex-row justify-between divide-y md:divide-y-0 md:divide-x divide-gray-100">

            <Link href="/buy" className="flex items-center gap-3 px-4 py-3 md:py-1 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors flex-1">
              <div className="w-11 h-11 rounded-full bg-[#f0f7f7] flex items-center justify-center text-primary border border-primary/10 flex-shrink-0">
                <HomeIcon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Buy a Home</h3>
                <p className="text-[10px] text-gray-500">Explore verified properties</p>
              </div>
            </Link>

            <Link href="/sell" className="flex items-center gap-3 px-4 py-3 md:py-1 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors flex-1">
              <div className="w-11 h-11 rounded-full bg-[#f0f7f7] flex items-center justify-center text-primary border border-primary/10 flex-shrink-0">
                <Store size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Sell a Property</h3>
                <p className="text-[10px] text-gray-500">List your property for free</p>
              </div>
            </Link>

            <div className="flex items-center gap-3 px-6 py-3 md:py-1 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors flex-1">
              <div className="w-11 h-11 rounded-full bg-[#f5f0fb] flex items-center justify-center text-[#8a5bd6] border border-[#8a5bd6]/10 flex-shrink-0">
                <Armchair size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Interior Designers</h3>
                <p className="text-[10px] text-gray-500">Find top interior experts</p>
              </div>
            </div>

            <Link href="/builders" className="flex items-center gap-3 px-6 py-3 md:py-1 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors flex-1">
              <div className="w-11 h-11 rounded-full bg-[#fffcf0] flex items-center justify-center text-[#d19b33] border border-[#d19b33]/10 flex-shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Top Builders</h3>
                <p className="text-[10px] text-gray-500">Discover trusted builders</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Explore Properties */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Explore Properties in Tamil Nadu</h2>
            <div className="flex items-center gap-2 border border-gray-200 rounded-full p-1 bg-white inline-flex">
              {propertyTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePropertyTab(tab)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activePropertyTab === tab ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <Link href="/buy" className="flex items-center gap-1 text-primary hover:text-primary-dark font-medium text-sm transition-colors group">
            View All Properties <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : realProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {realProperties.map((prop, idx) => (
                <div key={prop._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={prop.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600"}
                      alt={prop.address}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold px-3 py-1.5 rounded-full text-gray-700 uppercase tracking-wider shadow-sm">
                      {prop.propertyType}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{prop.address}</h3>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
                      <MapPin size={12} /> {prop.city}
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-1">{formatPrice(prop.price)}</div>
                    <div className="text-sm text-gray-500 mb-5">{prop.bedrooms === 0 ? "Studio" : `${prop.bedrooms} BHK`} {prop.propertyType}</div>
                    <Link href={`/property/${prop._id}`} className="w-full bg-[#f0f7f7] hover:bg-primary text-primary hover:text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                      View Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No properties listed yet.</p>
              <Link href="/post-property" className="text-primary font-bold hover:underline mt-2 inline-block">Post your property</Link>
            </div>
          )}

          <button className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:text-primary z-10 hidden xl:flex hover:scale-105 transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Trusted By & Why Choose Section */}
      <section className="bg-[#fafafa] py-16 border-t border-gray-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-heading">Trusted Partnerships</h2>
              <p className="text-gray-500 mb-10 text-sm">We partner with the industry's most reputable builders and talented designers.</p>

              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Top Builders</h4>
                  <div className="flex items-center gap-8 justify-between">
                    <div className="text-lg font-black text-gray-300 hover:text-primary transition-colors cursor-default">CASAGRAND</div>
                    <div className="text-lg font-black text-gray-300 hover:text-primary transition-colors cursor-default">BRIGADE</div>
                    <div className="text-lg font-black text-gray-300 hover:text-primary transition-colors cursor-default">PRESTIGE</div>
                  </div>
                </div>

                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Interior Designers</h4>
                  <div className="flex items-center gap-8 justify-start">
                    <div className="text-lg font-black text-gray-300 hover:text-primary transition-colors cursor-default">V-CREATE</div>
                    <div className="text-lg font-black text-gray-300 hover:text-primary transition-colors cursor-default">HOMELANE</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">Why Choose Propyours?</h3>
                  <p className="text-gray-500 text-sm">Transparent and legally secure real estate journey.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex gap-3">
                    <CheckCircle className="text-primary flex-shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Verified</h4>
                      <p className="text-xs text-gray-500">Authentic listings.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Layers className="text-primary flex-shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Platform</h4>
                      <p className="text-xs text-gray-500">All-in-one ecosystem.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <HeadphonesIcon className="text-primary flex-shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Expertise</h4>
                      <p className="text-xs text-gray-500">20 years legal backing.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block w-[400px] relative pointer-events-none">
              <div className="absolute top-0 right-10 w-[240px] h-[500px] bg-white rounded-[2.5rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden z-20 translate-y-10">
                <div className="w-1/2 h-5 bg-gray-900 absolute top-0 left-1/4 rounded-b-2xl"></div>
                <div className="h-full w-full bg-gray-50 flex flex-col relative">
                  <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 justify-between">
                    <div className="font-bold text-primary text-xs flex items-center gap-1"><HomeIcon size={12} /> PROPYOURS</div>
                    <Menu size={16} />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="text-lg font-bold">Find Your</div>
                    <div className="text-lg font-bold text-primary mb-2">Dream Home</div>
                    <div className="h-20 bg-gray-200 rounded-xl mb-4 w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-[#eff5f5] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Ready for the next step?</h3>
              <p className="text-gray-600 text-sm">List your property and connect with buyers.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sell" className="bg-white text-primary border border-primary px-6 py-3 rounded-lg font-bold text-sm hover:bg-primary/5 transition-colors shadow-sm">
                List Property
              </Link>
              <button className="bg-primary text-white border border-primary px-6 py-3 rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors shadow-md">
                List Business
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
