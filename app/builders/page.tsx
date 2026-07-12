// "use client";
//
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import {
//   Search,
//   MapPin,
//   Building2,
//   ChevronRight,
//   Award,
//   CheckCircle2,
//   X,
//   Loader2
// } from "lucide-react";
//
// interface Builder {
//   _id: string;
//   name: string;
//   company?: string;
//   role: string;
//   city?: string;
//   bio?: string;
//   phone?: string;
//   projects: number;
//   activeProjects: number;
//   featuredProjects: number;
//   totalViews: number;
//   phoneClicks: number;
//   favorites: number;
//   experience?: string;
//   builderPlan?: {
//     tier: "builder-starter" | "builder-growth" | "builder-elite" | null;
//     isActive: boolean;
//     rank: number;
//   };
// }
//
// function getBuilderCardStyles(builder: Builder) {
//   const tier = builder.builderPlan?.isActive
//       ? builder.builderPlan.tier
//       : null;
//
//   switch (tier) {
//     case "builder-elite":
//       return {
//         card: "bg-white rounded-[2.5rem] overflow-hidden border-2 border-primary shadow-xl shadow-primary/10 hover:shadow-2xl transition-all duration-500 group relative",
//         badge: "Premium Builder",
//         badgeClass: "bg-primary text-white border-primary",
//         cta: "w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
//       };
//
//     case "builder-growth":
//       return {
//         card: "bg-white rounded-[2.5rem] overflow-hidden border border-primary/30 shadow-lg shadow-primary/5 hover:shadow-2xl transition-all duration-500 group relative",
//         badge: "Verified Builder",
//         badgeClass: "bg-primary/10 text-primary border-primary/20",
//         cta: "w-full bg-[#f0f7f7] group-hover:bg-primary group-hover:text-white text-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
//       };
//
//     default:
//       return {
//         card: "bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative",
//         badge: null,
//         badgeClass: "",
//         cta: "w-full bg-[#f0f7f7] group-hover:bg-primary group-hover:text-white text-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
//       };
//   }
// }
//
// export default function BuildersPage() {
//   const [builders, setBuilders] = useState<Builder[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCity, setSelectedCity] = useState("All");
//
//   useEffect(() => {
//     const fetchBuilders = async () => {
//       try {
//         const response = await fetch("/api/builders");
//         const data = await response.json();
//         if (Array.isArray(data)) {
//           setBuilders(data);
//         }
//       } catch (error) {
//         console.error("Error fetching builders:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     fetchBuilders();
//   }, []);
//
//   const filteredBuilders = builders.filter(builder => {
//     const nameToSearch = (builder.company || builder.name).toLowerCase();
//     const matchesSearch = nameToSearch.includes(searchQuery.toLowerCase());
//     const matchesCity = selectedCity === "All" || (builder.city && builder.city === selectedCity);
//     return matchesSearch && matchesCity;
//   });
//
//   const cities = ["All", ...new Set(builders.map(b => b.city).filter(Boolean) as string[])];
//
//   return (
//     <main className="min-h-screen bg-[#fafafa] pt-32 pb-20 font-body">
//       <div className="max-w-7xl mx-auto px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-12">
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-4xl md:text-6xl font-black text-gray-900 mb-4 font-heading tracking-tight"
//           >
//             Discover <span className="text-primary">Top Builders</span>
//           </motion.h1>
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="text-gray-500 text-lg max-w-2xl font-medium"
//           >
//             Connect with the industry&apos;s most reputable developers. Verified track records, quality construction, and timely delivery.
//           </motion.p>
//         </div>
//
//         {/* Filter Bar */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="bg-white p-4 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 mb-12 flex flex-col md:flex-row items-center gap-4"
//         >
//           <div className="flex-1 relative w-full">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//             <input
//               type="text"
//               placeholder="Search by builder name..."
//               className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//
//           <div className="flex items-center gap-4 w-full md:w-auto">
//             <div className="relative flex-1 md:w-48">
//               <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//               <select
//                 className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold cursor-pointer appearance-none"
//                 value={selectedCity}
//                 onChange={(e) => setSelectedCity(e.target.value)}
//               >
//                 {cities.map(city => (
//                   <option key={city} value={city}>{city}</option>
//                 ))}
//               </select>
//               <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" size={16} />
//             </div>
//
//             <button
//               onClick={() => { setSearchQuery(""); setSelectedCity("All"); }}
//               className="p-3.5 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all active:scale-95"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </motion.div>
//
//         {/* Builders Grid */}
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-32">
//             <Loader2 className="text-primary animate-spin mb-4" size={40} />
//             <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing with builders...</p>
//           </div>
//         ) : filteredBuilders.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {filteredBuilders.map((builder, idx) => {
//               const styles = getBuilderCardStyles(builder);
//
//               return (
//                   <motion.div
//                       key={builder._id}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: idx * 0.05 }}
//                       className={styles.card}
//                   >
//                     <div className="p-8">
//                       {styles.badge && (
//                           <div className="mb-5 flex justify-end">
//                             <div
//                                 className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${styles.badgeClass}`}
//                             >
//                               {styles.badge}
//                             </div>
//                           </div>
//                       )}
//
//                       {/* Logo & Stats Header */}
//                       <div className="flex justify-between items-start mb-8">
//                         <div className="w-24 h-24 relative rounded-2xl bg-gray-50 p-4 border border-gray-100 group-hover:border-primary/20 transition-colors flex items-center justify-center">
//                           <Building2 className="w-12 h-12 text-gray-300" />
//                         </div>
//
//                         <div className="bg-primary/5 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-primary/10">
//                           <Award size={14} className="text-primary" />
//                           <span className="text-[11px] font-black text-primary">
//               {builder.featuredProjects > 0
//                   ? `${builder.featuredProjects} Featured`
//                   : `${builder.activeProjects} Active`}
//             </span>
//                         </div>
//                       </div>
//
//                       {/* Info */}
//                       <div className="mb-6">
//                         <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-primary transition-colors">
//                           {builder.company || builder.name}
//                         </h3>
//
//                         <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
//                           <MapPin size={12} className="text-primary" />
//                           {builder.city || "Tamil Nadu"}, India
//                         </div>
//                       </div>
//
//                       <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
//                         {builder.bio ||
//                             "No description provided. This builder is a verified partner on Propyours, delivering quality real estate solutions."}
//                       </p>
//
//                       {/* Stats Bar */}
//                       <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-50 mb-8">
//                         <div className="space-y-1">
//                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                             Projects
//                           </p>
//                           <div className="flex items-center gap-1.5">
//                             <Building2 size={16} className="text-primary" />
//                             <span className="font-bold text-gray-900">
//                 {builder.activeProjects} Active
//               </span>
//                           </div>
//                         </div>
//
//                         <div className="space-y-1">
//                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                             Enquiries
//                           </p>
//                           <div className="flex items-center gap-1.5">
//                             <CheckCircle2 size={16} className="text-primary" />
//                             <span className="font-bold text-gray-900">
//                 {builder.phoneClicks}
//               </span>
//                           </div>
//                         </div>
//                       </div>
//
//                       <Link href={`/profile/${builder._id}`} className={styles.cta}>
//                         View Builder Profile
//                         <ChevronRight
//                             size={16}
//                             className="group-hover:translate-x-1 transition-transform"
//                         />
//                       </Link>
//                     </div>
//                   </motion.div>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
//             <Building2 size={48} className="text-gray-200 mx-auto mb-4" />
//             <h3 className="text-xl font-bold text-gray-900 mb-2">No Builders Found</h3>
//             <p className="text-gray-500">Try adjusting your search filters.</p>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }














"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  Compass,
  Eye,
  Heart,
  Loader2,
  MapPin,
  PhoneCall,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  X,
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
  activeProjects: number;
  featuredProjects: number;
  totalViews: number;
  phoneClicks: number;
  favorites: number;
  builderPlan?: {
    tier:
        | "builder-starter"
        | "builder-growth"
        | "builder-elite"
        | null;
    isActive: boolean;
    rank: number;
  };
}

type BuilderFilter = "all" | "premium" | "active";
type BuilderSort = "recommended" | "projects" | "views" | "interest";

const BUILDER_FILTERS: Array<{
  value: BuilderFilter;
  label: string;
}> = [
  { value: "all", label: "All builders" },
  { value: "premium", label: "Verified & premium" },
  { value: "active", label: "With active projects" },
];

const BUILDER_SORT_OPTIONS: Array<{
  value: BuilderSort;
  label: string;
}> = [
  { value: "recommended", label: "Recommended" },
  { value: "projects", label: "Most active projects" },
  { value: "views", label: "Most viewed" },
  { value: "interest", label: "Most contact interest" },
];

function getBuilderName(builder: Builder): string {
  return builder.company?.trim() || builder.name;
}

function getBuilderInitials(builder: Builder): string {
  const source = getBuilderName(builder)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

  if (source.length === 0) {
    return "PB";
  }

  return source.map((part) => part[0]?.toUpperCase()).join("");
}

function getBuilderTier(builder: Builder) {
  if (!builder.builderPlan?.isActive) {
    return {
      label: "Builder profile",
      shortLabel: "Profile",
      rank: 0,
      badgeClass:
          "border-slate-200 bg-white text-slate-600",
      accentClass:
          "from-slate-800 via-slate-900 to-slate-950",
    };
  }

  switch (builder.builderPlan.tier) {
    case "builder-elite":
      return {
        label: "Premium builder",
        shortLabel: "Premium",
        rank: 3,
        badgeClass:
            "border-teal-300/40 bg-teal-300 text-slate-950",
        accentClass:
            "from-teal-700 via-teal-900 to-slate-950",
      };

    case "builder-growth":
      return {
        label: "Verified builder",
        shortLabel: "Verified",
        rank: 2,
        badgeClass:
            "border-teal-200 bg-teal-50 text-primary",
        accentClass:
            "from-primary via-teal-800 to-slate-950",
      };

    case "builder-starter":
      return {
        label: "Active builder",
        shortLabel: "Active",
        rank: 1,
        badgeClass:
            "border-slate-200 bg-slate-50 text-slate-700",
        accentClass:
            "from-slate-700 via-slate-900 to-slate-950",
      };

    default:
      return {
        label: "Builder profile",
        shortLabel: "Profile",
        rank: 0,
        badgeClass:
            "border-slate-200 bg-white text-slate-600",
        accentClass:
            "from-slate-800 via-slate-900 to-slate-950",
      };
  }
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: value >= 1_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function getBuilderDescription(builder: Builder): string {
  if (builder.bio?.trim()) {
    return builder.bio.trim();
  }

  const name = getBuilderName(builder);

  if (builder.activeProjects > 0) {
    return `${name} currently has ${builder.activeProjects} active ${
        builder.activeProjects === 1 ? "project" : "projects"
    } listed on Propyours.`;
  }

  return `${name} has a public builder profile on Propyours. Open the profile to review available details and listings.`;
}

function BuilderMonogram({
                           builder,
                           size = "large",
                         }: {
  builder: Builder;
  size?: "small" | "large";
}) {
  const tier = getBuilderTier(builder);

  return (
      <div
          className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br ${tier.accentClass} text-white shadow-xl ${
              size === "large"
                  ? "h-24 w-24 rounded-[1.75rem]"
                  : "h-16 w-16 rounded-2xl"
          }`}
          aria-hidden="true"
      >
        <div className="absolute -right-4 -top-5 h-16 w-16 rounded-full border-[12px] border-white/5" />
        <div className="absolute -bottom-8 -left-6 h-20 w-20 rounded-full bg-teal-300/10 blur-xl" />

        <span
            className={`relative font-black tracking-[-0.06em] ${
                size === "large" ? "text-3xl" : "text-xl"
            }`}
        >
        {getBuilderInitials(builder)}
      </span>

        {tier.rank > 0 ? (
            <span
                className={`absolute flex items-center justify-center rounded-full border-2 border-white bg-primary ${
                    size === "large"
                        ? "-bottom-1 -right-1 h-8 w-8"
                        : "-bottom-1 -right-1 h-6 w-6"
                }`}
            >
          <CheckCircle2
              size={size === "large" ? 16 : 12}
              aria-hidden="true"
          />
        </span>
        ) : null}
      </div>
  );
}

function BuilderCard({
                       builder,
                       index,
                     }: {
  builder: Builder;
  index: number;
}) {
  const tier = getBuilderTier(builder);

  return (
      <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: Math.min(index * 0.04, 0.2),
          }}
          className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_24px_65px_rgba(15,23,42,0.12)]"
      >
        <div
            className={`relative overflow-hidden bg-gradient-to-br ${tier.accentClass} px-6 pb-7 pt-6 text-white`}
        >
          <div
              className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border-[24px] border-white/5"
              aria-hidden="true"
          />
          <div
              className="pointer-events-none absolute -bottom-20 left-16 h-40 w-40 rounded-full bg-teal-300/10 blur-3xl"
              aria-hidden="true"
          />

          <div className="relative flex items-start justify-between gap-4">
            <BuilderMonogram builder={builder} size="small" />

            <span
                className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.11em] ${tier.badgeClass}`}
            >
            {tier.shortLabel}
          </span>
          </div>

          <div className="relative mt-7">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-200">
              Builder in {builder.city || "Tamil Nadu"}
            </p>

            <h3 className="mt-2 line-clamp-2 min-h-14 text-xl font-black leading-tight tracking-tight">
              {getBuilderName(builder)}
            </h3>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <MapPin
                size={14}
                className="shrink-0 text-primary"
                aria-hidden="true"
            />
            <span className="truncate">
            {builder.city || "Tamil Nadu"}, India
          </span>
          </div>

          <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">
            {getBuilderDescription(builder)}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
              <Building2
                  size={15}
                  className="text-primary"
                  aria-hidden="true"
              />
              <p className="mt-2 text-lg font-black text-slate-950">
                {builder.activeProjects}
              </p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.09em] text-slate-400">
                Active
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
              <Eye
                  size={15}
                  className="text-primary"
                  aria-hidden="true"
              />
              <p className="mt-2 text-lg font-black text-slate-950">
                {formatCompactNumber(builder.totalViews)}
              </p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.09em] text-slate-400">
                Views
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
              <Heart
                  size={15}
                  className="text-primary"
                  aria-hidden="true"
              />
              <p className="mt-2 text-lg font-black text-slate-950">
                {formatCompactNumber(builder.favorites)}
              </p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.09em] text-slate-400">
                Saves
              </p>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <Link
                href={`/profile/${builder._id}`}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition group-hover:bg-primary"
            >
              View builder profile
              <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </motion.article>
  );
}

function BuildersPage() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedFilter, setSelectedFilter] =
      useState<BuilderFilter>("all");
  const [sortBy, setSortBy] =
      useState<BuilderSort>("recommended");
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchBuilders() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch("/api/builders", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
              `Builder request failed with status ${response.status}`,
          );
        }

        const payload: unknown = await response.json();

        if (!Array.isArray(payload)) {
          throw new Error("Builder API returned an invalid response.");
        }

        setBuilders(payload as Builder[]);
      } catch (error) {
        if (
            error instanceof DOMException &&
            error.name === "AbortError"
        ) {
          return;
        }

        console.error("Unable to load builders:", error);
        setBuilders([]);
        setLoadError(
            "We could not load the builder directory. Please try again.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchBuilders();

    return () => controller.abort();
  }, [requestKey]);

  const cities = useMemo(() => {
    const values = builders
        .map((builder) => builder.city?.trim())
        .filter(
            (city): city is string =>
                Boolean(city),
        );

    return ["All", ...Array.from(new Set(values)).sort()];
  }, [builders]);

  const filteredBuilders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return builders
        .filter((builder) => {
          const searchableText = [
            builder.name,
            builder.company,
            builder.city,
            builder.bio,
          ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          const matchesSearch =
              !query || searchableText.includes(query);

          const matchesCity =
              selectedCity === "All" ||
              builder.city === selectedCity;

          const tier = getBuilderTier(builder);

          const matchesFilter =
              selectedFilter === "all" ||
              (selectedFilter === "premium" &&
                  tier.rank >= 2) ||
              (selectedFilter === "active" &&
                  builder.activeProjects > 0);

          return (
              matchesSearch &&
              matchesCity &&
              matchesFilter
          );
        })
        .sort((first, second) => {
          if (sortBy === "projects") {
            return (
                second.activeProjects -
                first.activeProjects ||
                second.projects - first.projects
            );
          }

          if (sortBy === "views") {
            return second.totalViews - first.totalViews;
          }

          if (sortBy === "interest") {
            return (
                second.phoneClicks -
                first.phoneClicks ||
                second.favorites - first.favorites
            );
          }

          return (
              getBuilderTier(second).rank -
              getBuilderTier(first).rank ||
              second.featuredProjects -
              first.featuredProjects ||
              second.activeProjects -
              first.activeProjects
          );
        });
  }, [
    builders,
    searchQuery,
    selectedCity,
    selectedFilter,
    sortBy,
  ]);

  useEffect(() => {
    setVisibleCount(9);
  }, [
    searchQuery,
    selectedCity,
    selectedFilter,
    sortBy,
  ]);

  const spotlightBuilder = filteredBuilders[0];
  const directoryBuilders = filteredBuilders.slice(
      1,
      visibleCount,
  );

  const directoryStats = useMemo(() => {
    const totalActiveProjects = builders.reduce(
        (total, builder) =>
            total + builder.activeProjects,
        0,
    );

    const totalCities = new Set(
        builders
            .map((builder) => builder.city)
            .filter(Boolean),
    ).size;

    const verifiedBuilders = builders.filter(
        (builder) => getBuilderTier(builder).rank >= 2,
    ).length;

    return {
      builders: builders.length,
      activeProjects: totalActiveProjects,
      cities: totalCities,
      verifiedBuilders,
    };
  }, [builders]);

  const hasActiveFilters =
      searchQuery.trim().length > 0 ||
      selectedCity !== "All" ||
      selectedFilter !== "all";

  function clearFilters() {
    setSearchQuery("");
    setSelectedCity("All");
    setSelectedFilter("all");
    setSortBy("recommended");
  }

  return (
      <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-20 font-body text-slate-950">
        <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.16),_transparent_34%),linear-gradient(180deg,#f7fbfa_0%,#ffffff_100%)]">
          <div
              className="pointer-events-none absolute -left-48 top-40 h-96 w-96 rounded-full bg-amber-50 blur-3xl"
              aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
              <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="mt-6 max-w-3xl font-heading text-4xl font-black leading-[1.06] tracking-[-0.04em] sm:text-5xl lg:text-[3.75rem]">
                  Find builders with
                  <span className="block text-primary">
                  real projects to explore.
                </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Review builder profiles, current project activity and
                  listing engagement before deciding who deserves a closer
                  look.
                </p>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                  {[
                    "Clear builder tiers",
                    "Visible project activity",
                    "Location-based discovery",
                  ].map((item) => (
                      <span
                          key={item}
                          className="flex items-center gap-2 text-sm font-semibold text-slate-600"
                      >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2
                          size={13}
                          aria-hidden="true"
                      />
                    </span>
                        {item}
                  </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                  initial={{ opacity: 0, x: 22 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 }}
                  className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8"
              >
                <div
                    className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-500/25 blur-3xl"
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-sky-500/10 blur-3xl"
                    aria-hidden="true"
                />

                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-300">
                        Builder directory
                      </p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight">
                        Useful signals at a glance
                      </h2>
                    </div>

                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-teal-300 ring-1 ring-white/10">
                    <Compass size={23} aria-hidden="true" />
                  </span>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "Builder profiles",
                        value: directoryStats.builders,
                        icon: Building2,
                      },
                      {
                        label: "Active projects",
                        value: directoryStats.activeProjects,
                        icon: Store,
                      },
                      {
                        label: "Cities represented",
                        value: directoryStats.cities,
                        icon: MapPin,
                      },
                      {
                        label: "Verified or premium",
                        value: directoryStats.verifiedBuilders,
                        icon: BadgeCheck,
                      },
                    ].map((stat) => {
                      const Icon = stat.icon;

                      return (
                          <div
                              key={stat.label}
                              className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                          >
                            <Icon
                                size={17}
                                className="text-teal-300"
                                aria-hidden="true"
                            />
                            <p className="mt-4 text-2xl font-black">
                              {loading
                                  ? "—"
                                  : formatCompactNumber(stat.value)}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              {stat.label}
                            </p>
                          </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="relative z-20 mt-12 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-5"
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_230px_240px]">
                <label className="relative">
                <span className="sr-only">
                  Search builders
                </span>

                  <Search
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                      aria-hidden="true"
                  />

                  <input
                      value={searchQuery}
                      onChange={(event) =>
                          setSearchQuery(event.target.value)
                      }
                      placeholder="Search builder or company name"
                      className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  />
                </label>

                <label className="relative">
                  <span className="sr-only">Filter by city</span>

                  <MapPin
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                      aria-hidden="true"
                  />

                  <select
                      value={selectedCity}
                      onChange={(event) =>
                          setSelectedCity(event.target.value)
                      }
                      className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-bold text-slate-950 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  >
                    {cities.map((city) => (
                        <option key={city} value={city}>
                          {city === "All"
                              ? "All Tamil Nadu"
                              : city}
                        </option>
                    ))}
                  </select>

                  <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                  />
                </label>

                <label className="relative">
                <span className="sr-only">
                  Filter builder type
                </span>

                  <Award
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                      aria-hidden="true"
                  />

                  <select
                      value={selectedFilter}
                      onChange={(event) =>
                          setSelectedFilter(
                              event.target.value as BuilderFilter,
                          )
                      }
                      className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-bold text-slate-950 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  >
                    {BUILDER_FILTERS.map((filter) => (
                        <option
                            key={filter.value}
                            value={filter.value}
                        >
                          {filter.label}
                        </option>
                    ))}
                  </select>

                  <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  Quick filter
                </span>

                  {BUILDER_FILTERS.map((filter) => (
                      <button
                          key={filter.value}
                          type="button"
                          onClick={() =>
                              setSelectedFilter(filter.value)
                          }
                          className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                              selectedFilter === filter.value
                                  ? "border-primary bg-teal-50 text-primary"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:text-primary"
                          }`}
                      >
                        {filter.label}
                      </button>
                  ))}
                </div>

                {hasActiveFilters ? (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex w-fit items-center gap-2 text-xs font-black text-slate-500 transition hover:text-primary"
                    >
                      <X size={14} aria-hidden="true" />
                      Clear filters
                    </button>
                ) : null}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                Builder directory
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                {selectedCity === "All"
                    ? "Builders across Tamil Nadu"
                    : `Builders in ${selectedCity}`}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {loading
                    ? "Loading builder profiles…"
                    : `${filteredBuilders.length} ${
                        filteredBuilders.length === 1
                            ? "builder matches"
                            : "builders match"
                    } your current search`}
              </p>
            </div>

            <label className="relative w-full sm:w-60">
            <span className="sr-only">
              Sort builder directory
            </span>

              <TrendingUp
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                  aria-hidden="true"
              />

              <select
                  value={sortBy}
                  onChange={(event) =>
                      setSortBy(
                          event.target.value as BuilderSort,
                      )
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                {BUILDER_SORT_OPTIONS.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                      {option.label}
                    </option>
                ))}
              </select>

              <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
              />
            </label>
          </div>

          {loading ? (
              <div className="mt-10">
                <div className="grid gap-6 lg:grid-cols-12">
                  <div className="min-h-[430px] animate-pulse rounded-[2rem] bg-slate-200 lg:col-span-7" />
                  <div className="min-h-[430px] animate-pulse rounded-[2rem] bg-slate-100 lg:col-span-5" />
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                      <div
                          key={index}
                          className="h-[480px] animate-pulse rounded-[1.75rem] bg-slate-100"
                      />
                  ))}
                </div>
              </div>
          ) : loadError ? (
              <div className="mt-10 rounded-[2rem] border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <RefreshCw size={24} aria-hidden="true" />
            </span>

                <h3 className="mt-5 text-xl font-black text-slate-950">
                  Builder directory could not be loaded
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {loadError}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        setRequestKey((value) => value + 1)
                    }
                    className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white"
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  Try again
                </button>
              </div>
          ) : spotlightBuilder ? (
              <>
                <div className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.1)]">
                  <div className="grid lg:grid-cols-12">
                    <div
                        className={`relative overflow-hidden bg-gradient-to-br ${getBuilderTier(spotlightBuilder).accentClass} p-7 text-white sm:p-10 lg:col-span-7`}
                    >
                      <div
                          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[44px] border-white/5"
                          aria-hidden="true"
                      />
                      <div
                          className="pointer-events-none absolute -bottom-20 left-28 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl"
                          aria-hidden="true"
                      />

                      <div className="relative">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-4">
                            <BuilderMonogram
                                builder={spotlightBuilder}
                            />

                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-300">
                                Builder spotlight
                              </p>
                              <p className="mt-1 text-sm text-slate-300">
                                Recommended from the current results
                              </p>
                            </div>
                          </div>

                          <span
                              className={`w-fit rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] ${getBuilderTier(spotlightBuilder).badgeClass}`}
                          >
                        {getBuilderTier(spotlightBuilder).label}
                      </span>
                        </div>

                        <h3 className="mt-10 max-w-2xl text-3xl font-black leading-tight tracking-[-0.03em] sm:text-4xl">
                          {getBuilderName(spotlightBuilder)}
                        </h3>

                        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-teal-200">
                          <MapPin size={16} aria-hidden="true" />
                          {spotlightBuilder.city || "Tamil Nadu"}, India
                        </div>

                        <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                          {getBuilderDescription(spotlightBuilder)}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                          <Link
                              href={`/profile/${spotlightBuilder._id}`}
                              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-teal-200"
                          >
                            View builder profile
                            <ArrowRight
                                size={16}
                                aria-hidden="true"
                            />
                          </Link>

                          {spotlightBuilder.activeProjects > 0 ? (
                              <span className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-bold text-white">
                          <Building2
                              size={16}
                              className="text-teal-300"
                              aria-hidden="true"
                          />
                                {spotlightBuilder.activeProjects} active{" "}
                                {spotlightBuilder.activeProjects === 1
                                    ? "project"
                                    : "projects"}
                        </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[linear-gradient(145deg,#f0fdfa_0%,#ffffff_65%)] p-7 sm:p-10 lg:col-span-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                            Activity snapshot
                          </p>
                          <h4 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                            Signals from their listings
                          </h4>
                        </div>

                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                      <Sparkles size={22} aria-hidden="true" />
                    </span>
                      </div>

                      <div className="mt-8 grid grid-cols-2 gap-3">
                        {[
                          {
                            label: "Total projects",
                            value: spotlightBuilder.projects,
                            icon: Building2,
                          },
                          {
                            label: "Active projects",
                            value: spotlightBuilder.activeProjects,
                            icon: Store,
                          },
                          {
                            label: "Listing views",
                            value: spotlightBuilder.totalViews,
                            icon: Eye,
                          },
                          {
                            label: "Contact actions",
                            value: spotlightBuilder.phoneClicks,
                            icon: PhoneCall,
                          },
                        ].map((stat) => {
                          const Icon = stat.icon;

                          return (
                              <div
                                  key={stat.label}
                                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                              >
                                <Icon
                                    size={17}
                                    className="text-primary"
                                    aria-hidden="true"
                                />
                                <p className="mt-4 text-2xl font-black text-slate-950">
                                  {formatCompactNumber(stat.value)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {stat.label}
                                </p>
                              </div>
                          );
                        })}
                      </div>

                      <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                        <div className="flex items-start gap-3">
                          <BadgeCheck
                              size={19}
                              className="mt-0.5 shrink-0 text-primary"
                              aria-hidden="true"
                          />
                          <div>
                            <p className="text-sm font-black text-slate-950">
                              Read the full profile before contacting
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              Review the builder information and available
                              listings rather than relying on activity numbers
                              alone.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {directoryBuilders.length > 0 ? (
                    <div className="mt-10">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.13em] text-primary">
                            More builder profiles
                          </p>
                          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                            Continue exploring
                          </h3>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {directoryBuilders.map((builder, index) => (
                            <BuilderCard
                                key={builder._id}
                                builder={builder}
                                index={index}
                            />
                        ))}
                      </div>

                      {visibleCount < filteredBuilders.length ? (
                          <div className="mt-9 flex flex-col items-center">
                            <p className="mb-3 text-xs font-semibold text-slate-400">
                              Showing{" "}
                              {Math.min(
                                  visibleCount,
                                  filteredBuilders.length,
                              )}{" "}
                              of {filteredBuilders.length} builders
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setVisibleCount(
                                        (count) => count + 9,
                                    )
                                }
                                className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-800 shadow-sm transition hover:border-primary hover:text-primary"
                            >
                              Load more builders
                              <ArrowRight
                                  size={16}
                                  aria-hidden="true"
                              />
                            </button>
                          </div>
                      ) : null}
                    </div>
                ) : null}
              </>
          ) : (
              <div className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="grid lg:grid-cols-[1fr_0.8fr]">
                  <div className="p-7 sm:p-10">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-primary">
                  <Search size={25} aria-hidden="true" />
                </span>

                    <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
                      No matching builders found
                    </h3>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                      Try searching only the company name, broadening the city,
                      or viewing all builder tiers.
                    </p>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white"
                    >
                      Clear all filters
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="relative overflow-hidden bg-slate-950 p-7 text-white sm:p-10">
                    <div
                        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-teal-500/20 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="relative">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-300">
                        Search tip
                      </p>
                      <h4 className="mt-4 text-xl font-black">
                        Start with a city, then compare activity.
                      </h4>
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        Location is often the most useful first filter. Project
                        activity and builder tier can help narrow the directory
                        afterwards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                  Compare with confidence
                </p>

                <h2 className="mt-3 max-w-xl text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
                  Look beyond the company name.
                </h2>

                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                  A professional profile is useful, but the best decision comes
                  from reviewing the builder, the active projects and the
                  individual property details together.
                </p>

                <Link
                    href="/buy"
                    className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-primary"
                >
                  Explore property listings
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Review the profile",
                    description:
                        "Read the company details, location and builder tier.",
                    icon: BadgeCheck,
                  },
                  {
                    step: "02",
                    title: "Open their projects",
                    description:
                        "Check the price, property type and exact locality.",
                    icon: Building2,
                  },
                  {
                    step: "03",
                    title: "Contact when ready",
                    description:
                        "Make an enquiry only after the listing feels relevant.",
                    icon: PhoneCall,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                      <div
                          key={item.step}
                          className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        <Icon size={20} aria-hidden="true" />
                      </span>

                          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Step {item.step}
                      </span>
                        </div>

                        <h3 className="mt-6 font-black text-slate-950">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {item.description}
                        </p>
                      </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#0f766e_0%,#0d9488_56%,#115e59_100%)] px-6 py-9 text-white shadow-[0_24px_70px_rgba(13,148,136,0.22)] sm:px-10 sm:py-10">
            <div
                className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[45px] border-white/5"
                aria-hidden="true"
            />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex max-w-2xl items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/15">
                <Award size={22} aria-hidden="true" />
              </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-100">
                    For builders and developers
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                    Present your projects with more clarity.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-teal-50/85">
                    Explore builder plans for stronger profile visibility,
                    project promotion and listing tools on Propyours.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                    href="/pricing"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white/15"
                >
                  View builder plans
                </Link>

                <Link
                    href="/post-property"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-slate-950 shadow-lg transition hover:bg-teal-50"
                >
                  List a project
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}

export default BuildersPage;