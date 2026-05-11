"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Building2,
  Star,
  ChevronRight,
  Award,
  CheckCircle2,
  Clock,
  Filter,
  X,
  Loader2
} from "lucide-react";

interface Builder {
  _id: string;
  name: string;
  company?: string;
  role: string;
  city?: string;
  bio?: string;
  phone?: string;
  projects: number;
  experience?: string;
}

export default function BuildersPage() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");

  useEffect(() => {
    const fetchBuilders = async () => {
      try {
        const response = await fetch("/api/builders");
        const data = await response.json();
        if (Array.isArray(data)) {
          setBuilders(data);
        }
      } catch (error) {
        console.error("Error fetching builders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilders();
  }, []);

  const filteredBuilders = builders.filter(builder => {
    const nameToSearch = (builder.company || builder.name).toLowerCase();
    const matchesSearch = nameToSearch.includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "All" || (builder.city && builder.city === selectedCity);
    return matchesSearch && matchesCity;
  });

  const cities = ["All", ...new Set(builders.map(b => b.city).filter(Boolean) as string[])];

  return (
    <main className="min-h-screen bg-[#fafafa] pt-32 pb-20 font-body">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-gray-900 mb-4 font-heading tracking-tight"
          >
            Discover <span className="text-primary">Top Builders</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg max-w-2xl font-medium"
          >
            Connect with the industry&apos;s most reputable developers. Verified track records, quality construction, and timely delivery.
          </motion.p>
        </div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 mb-12 flex flex-col md:flex-row items-center gap-4"
        >
          <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by builder name..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold cursor-pointer appearance-none"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" size={16} />
            </div>

            <button
              onClick={() => { setSearchQuery(""); setSelectedCity("All"); }}
              className="p-3.5 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>

        {/* Builders Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="text-primary animate-spin mb-4" size={40} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing with builders...</p>
          </div>
        ) : filteredBuilders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBuilders.map((builder, idx) => (
              <motion.div
                key={builder._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="p-8">
                  {/* Logo & Rating Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-24 h-24 relative rounded-2xl bg-gray-50 p-4 border border-gray-100 group-hover:border-primary/20 transition-colors flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-300" />
                    </div>
                    <div className="bg-primary/5 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-primary/10">
                      <Star size={14} className="fill-primary text-primary" />
                      <span className="text-[11px] font-black text-primary">4.5</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-primary transition-colors">
                      {builder.company || builder.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                      <MapPin size={12} className="text-primary" /> {builder.city || "Tamil Nadu"}, India
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                    {builder.bio || "No description provided. This builder is a verified partner on Propyours, delivering quality real estate solutions."}
                  </p>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-50 mb-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Projects</p>
                      <div className="flex items-center gap-1.5">
                        <Building2 size={16} className="text-primary" />
                        <span className="font-bold text-gray-900">{builder.projects} Active</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience</p>
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} className="text-primary" />
                        <span className="font-bold text-gray-900">{builder.experience || "10+ Years"}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/profile/${builder._id}`}
                    className="w-full bg-[#f0f7f7] group-hover:bg-primary group-hover:text-white text-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    View Builder Profile
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
            <Building2 size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Builders Found</h3>
            <p className="text-gray-500">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </main>
  );
}
