"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bath,
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  Grid2X2,
  Home,
  ImageIcon,
  List,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Square,
  Store,
  Trees,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  TAMIL_NADU_CITIES,
  TAMIL_NADU_LOCATIONS,
} from "@/lib/locations";

interface Property {
  _id: string;
  propertyType: string;
  address: string;
  locality?: string;
  city: string;
  state?: string;
  description?: string;
  price: number;
  priceType?: "Total" | "Per Sq Ft";
  negotiable?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  size?: number;
  sizeUnit?: string;
  images?: string[];
  purpose: string;
  featured?: boolean;
  promotedUntil?: string;
  createdAt?: string;
  planSnapshot?: {
    badgeLevel?: "none" | "verified" | "premium" | string;
    rankingLevel?: "standard" | "featured" | "priority" | "top" | string;
  };
}

type SearchMode = "buy" | "rent" | "commercial";
type ViewMode = "list" | "grid";
type SortOption =
    | "default"
    | "newest"
    | "popular"
    | "price-low"
    | "price-high";

type LocationSuggestion =
    | {
  type: "city";
  label: string;
}
    | {
  type: "area";
  label: string;
  city: string;
}
    | {
  type: "property";
  label: string;
};

interface FilterPanelProps {
  mode: SearchMode;
  selectedType: string;
  selectedBHK: string;
  minPrice: string;
  maxPrice: string;
  featuredOnly: boolean;
  propertyTypes: string[];
  onTypeChange: (value: string) => void;
  onBHKChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onFeaturedOnlyChange: (value: boolean) => void;
  onClear: () => void;
  onDone?: () => void;
}

interface PropertyCardProps {
  property: Property;
  viewMode: ViewMode;
  index: number;
}

const PROPERTY_TYPES = [
  "All",
  "Apartment",
  "Independent House",
  "Independent Floor",
  "Duplex",
  "Villa",
  "Penthouse",
  "Plot",
  "Farm House",
  "Agricultural Land",
  "Commercial",
];

const RESIDENTIAL_TYPES = new Set([
  "Apartment",
  "Independent House",
  "Independent Floor",
  "Duplex",
  "Villa",
  "Penthouse",
  "Farm House",
]);

const BHK_OPTIONS = ["All", "1", "2", "3", "4+", "Studio"];

const PRICE_PRESETS = [
  { label: "Under ₹25 L", value: "2500000" },
  { label: "Under ₹50 L", value: "5000000" },
  { label: "Under ₹1 Cr", value: "10000000" },
  { label: "Under ₹2 Cr", value: "20000000" },
];

const SORT_OPTIONS: Array<{
  value: SortOption;
  label: string;
}> = [
  { value: "default", label: "Recommended" },
  { value: "newest", label: "Newest first" },
  { value: "popular", label: "Most popular" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
];

const QUICK_PROPERTY_TYPES: Array<{
  value: string;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "All", label: "All types", icon: Sparkles },
  { value: "Apartment", label: "Apartments", icon: Building2 },
  { value: "Independent House", label: "Homes", icon: Home },
  { value: "Plot", label: "Plots", icon: Trees },
];

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=85&w=1200";

function parseMode(value: string | null): SearchMode {
  if (value === "rent") {
    return "rent";
  }

  if (value === "commercial") {
    return "commercial";
  }

  return "buy";
}

function modeToQuery(mode: SearchMode): string | null {
  if (mode === "rent") {
    return "rent";
  }

  if (mode === "commercial") {
    return "commercial";
  }

  return null;
}

function formatPrice(price: number): string {
  if (price >= 10_000_000) {
    const crores = price / 10_000_000;
    return `₹${crores.toFixed(Number.isInteger(crores) ? 0 : 2)} Cr`;
  }

  if (price >= 100_000) {
    const lakhs = price / 100_000;
    return `₹${lakhs.toFixed(Number.isInteger(lakhs) ? 0 : 1)} L`;
  }

  return `₹${price.toLocaleString("en-IN")}`;
}

function formatSize(size?: number, unit?: string): string | null {
  if (!size || size <= 0) {
    return null;
  }

  return `${size.toLocaleString("en-IN")} ${unit ?? "sqft"}`;
}

function getListingBadge(property: Property): string | null {
  if (
      property.promotedUntil &&
      new Date(property.promotedUntil).getTime() > Date.now()
  ) {
    return "Promoted";
  }

  if (property.planSnapshot?.badgeLevel === "premium") {
    return "Premium";
  }

  if (property.planSnapshot?.badgeLevel === "verified") {
    return "Verified";
  }

  if (property.featured) {
    return "Featured";
  }

  return null;
}

function getPurposeLabel(property: Property): string {
  if (property.purpose === "Rent") {
    return "For rent";
  }

  if (property.purpose === "PG/CO-Living") {
    return "PG / co-living";
  }

  return "For sale";
}

function getPropertySpecs(
    property: Property,
): Array<{
  label: string;
  value: string;
  icon: LucideIcon;
}> {
  const specs: Array<{
    label: string;
    value: string;
    icon: LucideIcon;
  }> = [];

  if (property.bedrooms !== undefined && property.bedrooms > 0) {
    specs.push({
      label: "Bedrooms",
      value: String(property.bedrooms),
      icon: BedDouble,
    });
  }

  if (property.bathrooms !== undefined && property.bathrooms > 0) {
    specs.push({
      label: "Bathrooms",
      value: String(property.bathrooms),
      icon: Bath,
    });
  }

  const size = formatSize(property.size, property.sizeUnit);

  if (size) {
    specs.push({
      label: "Area",
      value: size,
      icon: Square,
    });
  }

  if (property.floors !== undefined && property.floors > 0 && specs.length < 3) {
    specs.push({
      label: "Floors",
      value: String(property.floors),
      icon: Building2,
    });
  }

  return specs.slice(0, 3);
}

function PropertyCard({
                        property,
                        viewMode,
                        index,
                      }: PropertyCardProps) {
  const badge = getListingBadge(property);
  const specs = getPropertySpecs(property);
  const isList = viewMode === "list";

  return (
      <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: Math.min(index * 0.035, 0.18),
          }}
          className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_24px_65px_rgba(15,23,42,0.12)]"
      >
        <Link
            href={`/property/${property._id}`}
            className={
              isList
                  ? "grid h-full sm:grid-cols-[280px_minmax(0,1fr)]"
                  : "flex h-full flex-col"
            }
        >
          <div
              className={`relative overflow-hidden bg-slate-200 ${
                  isList ? "h-64 sm:h-full sm:min-h-[300px]" : "h-60"
              }`}
          >
            <Image
                src={property.images?.[0] || FALLBACK_IMAGE}
                alt={property.address}
                fill
                sizes={
                  isList
                      ? "(max-width: 640px) 100vw, 280px"
                      : "(max-width: 768px) 100vw, 50vw"
                }
                className="object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/5" />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
              <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/40 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-900 shadow-sm backdrop-blur">
                {property.propertyType}
              </span>

                {badge ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white shadow-lg shadow-primary/20">
                  <BadgeCheck size={12} aria-hidden="true" />
                      {badge}
                </span>
                ) : null}
              </div>

              {property.images && property.images.length > 1 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-slate-950/55 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur">
                <ImageIcon size={12} aria-hidden="true" />
                    {property.images.length}
              </span>
              ) : null}
            </div>

            <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 px-3.5 py-2 text-sm font-black text-slate-950 shadow-lg backdrop-blur">
              {getPurposeLabel(property)}
            </div>
          </div>

          <div
              className={`flex min-w-0 flex-1 flex-col ${
                  isList ? "p-5 sm:p-7" : "p-5"
              }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-primary">
                <MapPin size={14} className="shrink-0" aria-hidden="true" />
                <span className="truncate">
                {property.locality
                    ? `${property.locality}, ${property.city}`
                    : property.city}
              </span>
              </div>

              {property.negotiable ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                Negotiable
              </span>
              ) : null}
            </div>

            <h2
                className={`mt-3 line-clamp-2 font-black leading-tight tracking-tight text-slate-950 transition group-hover:text-primary ${
                    isList ? "text-xl sm:text-2xl" : "text-lg"
                }`}
            >
              {property.address}
            </h2>

            {isList && property.description ? (
                <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {property.description}
                </p>
            ) : null}

            <div
                className={`mt-5 grid gap-2 ${
                    specs.length >= 3
                        ? "grid-cols-3"
                        : specs.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-1"
                }`}
            >
              {specs.map((spec) => {
                const Icon = spec.icon;

                return (
                    <div
                        key={`${spec.label}-${spec.value}`}
                        className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
                    >
                      <div className="flex items-center gap-2 text-slate-400">
                        <Icon size={15} className="shrink-0" aria-hidden="true" />
                        <span className="truncate text-[10px] font-black uppercase tracking-[0.09em]">
                      {spec.label}
                    </span>
                      </div>
                      <p className="mt-1.5 truncate text-xs font-black text-slate-900">
                        {spec.value}
                      </p>
                    </div>
                );
              })}

              {specs.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.09em] text-slate-400">
                      Property
                    </p>
                    <p className="mt-1.5 text-xs font-black text-slate-900">
                      {property.propertyType}
                    </p>
                  </div>
              ) : null}
            </div>

            <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
              <div>
                <p
                    className={`font-black tracking-tight text-slate-950 ${
                        isList ? "text-2xl" : "text-xl"
                    }`}
                >
                  {formatPrice(property.price)}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  {property.priceType === "Per Sq Ft"
                      ? "Price per sq. ft."
                      : "Total asking price"}
                </p>
              </div>

              <span className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition group-hover:bg-primary">
              Details
              <ArrowRight
                  size={15}
                  className="transition group-hover:translate-x-1"
                  aria-hidden="true"
              />
            </span>
            </div>
          </div>
        </Link>
      </motion.article>
  );
}

function FilterPanel({
                       mode,
                       selectedType,
                       selectedBHK,
                       minPrice,
                       maxPrice,
                       featuredOnly,
                       propertyTypes,
                       onTypeChange,
                       onBHKChange,
                       onMinPriceChange,
                       onMaxPriceChange,
                       onFeaturedOnlyChange,
                       onClear,
                       onDone,
                     }: FilterPanelProps) {
  const shouldShowBHK =
      mode !== "commercial" &&
      (selectedType === "All" || RESIDENTIAL_TYPES.has(selectedType));

  const quickTypes =
      mode === "commercial"
          ? [{ value: "Commercial", label: "Commercial", icon: Store }]
          : QUICK_PROPERTY_TYPES;

  return (
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-8">
          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-black text-slate-950">
                Property type
              </h3>
              {selectedType !== "All" && mode !== "commercial" ? (
                  <button
                      type="button"
                      onClick={() => onTypeChange("All")}
                      className="text-xs font-bold text-primary hover:text-primary-dark"
                  >
                    Reset
                  </button>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {quickTypes.map((item) => {
                const Icon = item.icon;
                const active = selectedType === item.value;

                return (
                    <button
                        key={item.value}
                        type="button"
                        onClick={() => onTypeChange(item.value)}
                        className={`flex min-h-20 flex-col items-start justify-between rounded-2xl border p-3 text-left transition ${
                            active
                                ? "border-primary bg-teal-50 text-primary shadow-sm"
                                : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50/50"
                        }`}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span className="mt-3 text-xs font-black">
                    {item.label}
                  </span>
                    </button>
                );
              })}
            </div>

            {mode !== "commercial" ? (
                <label className="mt-3 block">
                  <span className="sr-only">All property types</span>
                  <span className="relative block">
                <select
                    value={selectedType}
                    onChange={(event) => onTypeChange(event.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-bold text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                >
                  {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "All" ? "More property types" : type}
                      </option>
                  ))}
                </select>
                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                />
              </span>
                </label>
            ) : null}
          </section>

          {shouldShowBHK ? (
              <section>
                <h3 className="text-sm font-black text-slate-950">
                  Bedrooms
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {BHK_OPTIONS.map((option) => (
                      <button
                          key={option}
                          type="button"
                          onClick={() => onBHKChange(option)}
                          className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-xs font-black transition ${
                              selectedBHK === option
                                  ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-primary"
                          }`}
                      >
                        {option}
                      </button>
                  ))}
                </div>
              </section>
          ) : null}

          <section>
            <h3 className="text-sm font-black text-slate-950">
              Budget
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <label>
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                Minimum
              </span>
                <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={minPrice}
                    onChange={(event) => onMinPriceChange(event.target.value)}
                    placeholder="₹ Min"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                />
              </label>

              <label>
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                Maximum
              </span>
                <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={maxPrice}
                    onChange={(event) => onMaxPriceChange(event.target.value)}
                    placeholder="₹ Max"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                />
              </label>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {PRICE_PRESETS.map((preset) => {
                const active = minPrice === "" && maxPrice === preset.value;

                return (
                    <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          onMinPriceChange("");
                          onMaxPriceChange(preset.value);
                        }}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                            active
                                ? "border-primary bg-teal-50 text-primary"
                                : "border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:text-primary"
                        }`}
                    >
                      {preset.label}
                    </button>
                );
              })}
            </div>
          </section>

          <section>
            <button
                type="button"
                aria-pressed={featuredOnly}
                onClick={() => onFeaturedOnlyChange(!featuredOnly)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                    featuredOnly
                        ? "border-primary bg-teal-50"
                        : "border-slate-200 bg-white hover:border-teal-200"
                }`}
            >
            <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                    featuredOnly
                        ? "border-primary bg-primary text-white"
                        : "border-slate-300 bg-white text-transparent"
                }`}
            >
              <Check size={13} aria-hidden="true" />
            </span>

              <span>
              <span className="block text-sm font-black text-slate-900">
                Featured listings only
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Prioritise promoted and featured properties.
              </span>
            </span>
            </button>
          </section>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-slate-200 pt-5">
          <button
              type="button"
              onClick={onClear}
              className="h-12 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Clear filters
          </button>

          {onDone ? (
              <button
                  type="button"
                  onClick={onDone}
                  className="h-12 rounded-xl bg-primary text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark"
              >
                Show results
              </button>
          ) : (
              <Link
                  href="/post-property"
                  className="flex h-12 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white transition hover:bg-primary"
              >
                List property
              </Link>
          )}
        </div>
      </div>
  );
}

function BuyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialMode = parseMode(searchParams.get("purpose"));

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  const [mode, setMode] = useState<SearchMode>(initialMode);
  const [selectedCity, setSelectedCity] = useState(
      searchParams.get("city") || "All",
  );
  const [searchQuery, setSearchQuery] = useState(
      searchParams.get("location") || "",
  );
  const [searchTerm, setSearchTerm] = useState(
      searchParams.get("location") || "",
  );
  const [selectedType, setSelectedType] = useState(
      searchParams.get("type") ||
      (initialMode === "commercial" ? "Commercial" : "All"),
  );
  const [selectedBHK, setSelectedBHK] = useState(
      searchParams.get("bhk") || "All",
  );
  const [minPrice, setMinPrice] = useState(
      searchParams.get("minPrice") || "",
  );
  const [maxPrice, setMaxPrice] = useState(
      searchParams.get("maxPrice") || "",
  );
  const [featuredOnly, setFeaturedOnly] = useState(
      searchParams.get("filter") === "featured",
  );
  const [sortBy, setSortBy] = useState<SortOption>(
      (searchParams.get("sort") as SortOption) || "default",
  );

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  const searchRef = useRef<HTMLDivElement>(null);

  const availablePropertyTypes = useMemo(
      () =>
          mode === "commercial"
              ? ["Commercial"]
              : PROPERTY_TYPES.filter((type) => type !== "Commercial"),
      [mode],
  );

  const selectedCityLocalities = useMemo(() => {
    if (selectedCity === "All") {
      return [];
    }

    return (
        TAMIL_NADU_LOCATIONS[
            selectedCity as keyof typeof TAMIL_NADU_LOCATIONS
            ] ?? []
    ).filter((location) => location !== "All");
  }, [selectedCity]);

  useEffect(() => {
    const nextMode = parseMode(searchParams.get("purpose"));

    setMode(nextMode);
    setSelectedCity(searchParams.get("city") || "All");

    const nextLocation = searchParams.get("location") || "";
    setSearchQuery(nextLocation);
    setSearchTerm(nextLocation);

    setSelectedType(
        searchParams.get("type") ||
        (nextMode === "commercial" ? "Commercial" : "All"),
    );
    setSelectedBHK(searchParams.get("bhk") || "All");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setFeaturedOnly(searchParams.get("filter") === "featured");

    const nextSort = searchParams.get("sort") as SortOption | null;
    setSortBy(
        nextSort && SORT_OPTIONS.some((option) => option.value === nextSort)
            ? nextSort
            : "default",
    );
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProperties() {
      setLoading(true);
      setLoadError("");

      try {
        const apiParams = new URLSearchParams();

        if (featuredOnly) {
          apiParams.set("filter", "featured");
        }

        if (sortBy !== "default") {
          apiParams.set("sort", sortBy);
        }

        const query = apiParams.toString();
        const endpoint = query ? `/api/property?${query}` : "/api/property";

        const response = await fetch(endpoint, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
              `Property request failed with status ${response.status}`,
          );
        }

        const payload: unknown = await response.json();

        if (!Array.isArray(payload)) {
          throw new Error("Property API returned an invalid response.");
        }

        setProperties(payload as Property[]);
      } catch (error) {
        if (
            error instanceof DOMException &&
            error.name === "AbortError"
        ) {
          return;
        }

        console.error("Unable to load properties:", error);
        setProperties([]);
        setLoadError(
            "We could not load the property listings. Please try again.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchProperties();

    return () => controller.abort();
  }, [featuredOnly, requestKey, sortBy]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      const purpose = modeToQuery(mode);

      if (purpose) {
        params.set("purpose", purpose);
      }

      if (selectedCity !== "All") {
        params.set("city", selectedCity);
      }

      if (searchQuery) {
        params.set("location", searchQuery);
      }

      if (selectedType !== "All") {
        params.set("type", selectedType);
      }

      if (selectedBHK !== "All") {
        params.set("bhk", selectedBHK);
      }

      if (minPrice) {
        params.set("minPrice", minPrice);
      }

      if (maxPrice) {
        params.set("maxPrice", maxPrice);
      }

      if (featuredOnly) {
        params.set("filter", "featured");
      }

      if (sortBy !== "default") {
        params.set("sort", sortBy);
      }

      const query = params.toString();

      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [
    featuredOnly,
    maxPrice,
    minPrice,
    mode,
    pathname,
    router,
    searchQuery,
    selectedBHK,
    selectedCity,
    selectedType,
    sortBy,
  ]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
          searchRef.current &&
          !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!filterDrawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [filterDrawerOpen]);

  const searchableItems = useMemo<LocationSuggestion[]>(() => {
    const cities: LocationSuggestion[] = TAMIL_NADU_CITIES.map((city) => ({
      type: "city",
      label: city,
    }));

    const areas: LocationSuggestion[] = Object.entries(
        TAMIL_NADU_LOCATIONS,
    ).flatMap(([city, localities]) =>
        localities
            .filter((locality) => locality !== "All")
            .map((locality) => ({
              type: "area" as const,
              label: locality,
              city,
            })),
    );

    const types: LocationSuggestion[] = PROPERTY_TYPES.filter(
        (type) => type !== "All",
    ).map((type) => ({
      type: "property" as const,
      label: type,
    }));

    return [...cities, ...areas, ...types];
  }, []);

  const suggestions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return searchableItems
        .filter((item) => item.label.toLowerCase().includes(query))
        .slice(0, 8);
  }, [searchTerm, searchableItems]);

  const filteredProperties = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesMode =
          mode === "rent"
              ? property.purpose === "Rent"
              : mode === "commercial"
                  ? property.propertyType === "Commercial"
                  : property.purpose !== "Rent" &&
                  property.purpose !== "PG/CO-Living";

      const matchesCity =
          selectedCity === "All" ||
          property.city.toLowerCase() === selectedCity.toLowerCase();

      const matchesSearch =
          !normalizedQuery ||
          property.address?.toLowerCase().includes(normalizedQuery) ||
          property.locality?.toLowerCase().includes(normalizedQuery) ||
          property.city?.toLowerCase().includes(normalizedQuery) ||
          property.propertyType?.toLowerCase().includes(normalizedQuery);

      const normalizedSelectedType =
          selectedType === "Apartments"
              ? "Apartment"
              : selectedType === "Villas"
                  ? "Villa"
                  : selectedType;

      const matchesType =
          normalizedSelectedType === "All" ||
          property.propertyType === normalizedSelectedType;

      const bedrooms = property.bedrooms ?? 0;
      const matchesBHK =
          selectedBHK === "All" ||
          (selectedBHK === "Studio"
              ? bedrooms === 0
              : selectedBHK === "4+"
                  ? bedrooms >= 4
                  : bedrooms === Number.parseInt(selectedBHK, 10));

      const matchesMinPrice =
          !minPrice || property.price >= Number.parseInt(minPrice, 10);

      const matchesMaxPrice =
          !maxPrice || property.price <= Number.parseInt(maxPrice, 10);

      return (
          matchesMode &&
          matchesCity &&
          matchesSearch &&
          matchesType &&
          matchesBHK &&
          matchesMinPrice &&
          matchesMaxPrice
      );
    });
  }, [
    maxPrice,
    minPrice,
    mode,
    properties,
    searchQuery,
    selectedBHK,
    selectedCity,
    selectedType,
  ]);

  const visibleProperties = filteredProperties.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(8);
  }, [
    featuredOnly,
    maxPrice,
    minPrice,
    mode,
    searchQuery,
    selectedBHK,
    selectedCity,
    selectedType,
    sortBy,
  ]);

  const activeFilters = [
    selectedCity !== "All"
        ? {
          id: "city",
          label: selectedCity,
          remove: () => setSelectedCity("All"),
        }
        : null,
    searchQuery
        ? {
          id: "location",
          label: searchQuery,
          remove: () => {
            setSearchQuery("");
            setSearchTerm("");
          },
        }
        : null,
    selectedType !== "All" && mode !== "commercial"
        ? {
          id: "type",
          label: selectedType,
          remove: () => setSelectedType("All"),
        }
        : null,
    selectedBHK !== "All"
        ? {
          id: "bhk",
          label:
              selectedBHK === "Studio"
                  ? "Studio"
                  : `${selectedBHK} BHK`,
          remove: () => setSelectedBHK("All"),
        }
        : null,
    minPrice || maxPrice
        ? {
          id: "budget",
          label:
              minPrice && maxPrice
                  ? `${formatPrice(Number(minPrice))} – ${formatPrice(Number(maxPrice))}`
                  : maxPrice
                      ? `Up to ${formatPrice(Number(maxPrice))}`
                      : `From ${formatPrice(Number(minPrice))}`,
          remove: () => {
            setMinPrice("");
            setMaxPrice("");
          },
        }
        : null,
    featuredOnly
        ? {
          id: "featured",
          label: "Featured only",
          remove: () => setFeaturedOnly(false),
        }
        : null,
  ].filter(
      (
          filter,
      ): filter is {
        id: string;
        label: string;
        remove: () => void;
      } => filter !== null,
  );

  function handleModeChange(nextMode: SearchMode) {
    setMode(nextMode);
    setSelectedBHK("All");

    if (nextMode === "commercial") {
      setSelectedType("Commercial");
      return;
    }

    if (selectedType === "Commercial") {
      setSelectedType("All");
    }
  }

  function handleTypeChange(value: string) {
    setSelectedType(value);

    if (value === "Commercial") {
      setMode("commercial");
      setSelectedBHK("All");
      return;
    }

    if (!RESIDENTIAL_TYPES.has(value) && value !== "All") {
      setSelectedBHK("All");
    }
  }

  function clearFilters() {
    setSelectedCity("All");
    setSearchQuery("");
    setSearchTerm("");
    setSelectedType(mode === "commercial" ? "Commercial" : "All");
    setSelectedBHK("All");
    setMinPrice("");
    setMaxPrice("");
    setFeaturedOnly(false);
    setSortBy("default");
    setShowSuggestions(false);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchQuery(searchTerm.trim());
    setShowSuggestions(false);
  }

  function handleSuggestionClick(item: LocationSuggestion) {
    if (item.type === "city") {
      setSelectedCity(item.label);
      setSearchTerm("");
      setSearchQuery("");
    }

    if (item.type === "area") {
      setSelectedCity(item.city);
      setSearchTerm(item.label);
      setSearchQuery(item.label);
    }

    if (item.type === "property") {
      handleTypeChange(item.label);
      setSearchTerm("");
      setSearchQuery("");
    }

    setShowSuggestions(false);
  }

  const resultHeading =
      selectedCity === "All"
          ? `Properties across Tamil Nadu`
          : `Properties in ${selectedCity}`;

  return (
      <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-20 font-body">
        <section className="relative overflow-visible border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.14),_transparent_34%),linear-gradient(180deg,#f8fbfa_0%,#ffffff_100%)]">
          <div className="mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="mt-5 font-heading text-4xl font-black leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[3.6rem]">
                  Find property without
                  <span className="block text-primary">
                  second-guessing every detail.
                </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Search apartments, independent homes, plots, agricultural
                  land and commercial spaces across Tamil Nadu using filters
                  that are easy to understand.
                </p>
              </div>

              <div className="grid max-w-md grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                  <BadgeCheck
                      size={20}
                      className="text-primary"
                      aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-black text-slate-950">
                    Visible listing labels
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Featured and verified status stays clear.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                  <SlidersHorizontal
                      size={20}
                      className="text-primary"
                      aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-black text-slate-950">
                    Practical filters
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Refine by place, type, bedrooms and price.
                  </p>
                </div>
              </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-40 mt-10 overflow-visible rounded-[1.75rem] bg-slate-950 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.24)] sm:p-4"
            >
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex w-fit rounded-xl bg-white/5 p-1">
                  {(
                      [
                        { value: "buy", label: "Buy" },
                        { value: "rent", label: "Rent" },
                        { value: "commercial", label: "Commercial" },
                      ] as Array<{
                        value: SearchMode;
                        label: string;
                      }>
                  ).map((item) => (
                      <button
                          key={item.value}
                          type="button"
                          onClick={() => handleModeChange(item.value)}
                          className={`rounded-lg px-5 py-2.5 text-sm font-black transition ${
                              mode === item.value
                                  ? "bg-white text-slate-950 shadow-sm"
                                  : "text-slate-400 hover:text-white"
                          }`}
                      >
                        {item.label}
                      </button>
                  ))}
                </div>

                <p className="text-xs font-semibold text-slate-400">
                  {loading
                      ? "Loading available properties…"
                      : `${filteredProperties.length} matching ${
                          filteredProperties.length === 1
                              ? "property"
                              : "properties"
                      }`}
                </p>
              </div>

              <form
                  onSubmit={handleSearchSubmit}
                  className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_230px_auto]"
              >
                <div ref={searchRef} className="relative">
                  <Search
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                      aria-hidden="true"
                  />

                  <input
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Search locality, city or property type"
                      className="h-14 w-full rounded-xl border border-white/10 bg-white pl-12 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-400/15"
                      aria-label="Search properties"
                  />

                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.2)]"
                        >
                          {suggestions.map((item) => (
                              <button
                                  key={`${item.type}-${item.label}`}
                                  type="button"
                                  onClick={() => handleSuggestionClick(item)}
                                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-teal-50"
                              >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-primary">
                            {item.type === "property" ? (
                                <Building2 size={17} aria-hidden="true" />
                            ) : (
                                <MapPin size={17} aria-hidden="true" />
                            )}
                          </span>

                                <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-black text-slate-900">
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-xs text-slate-400">
                              {item.type === "area"
                                  ? item.city
                                  : item.type === "city"
                                      ? "City"
                                      : "Property type"}
                            </span>
                          </span>

                                <ArrowRight
                                    size={15}
                                    className="shrink-0 text-slate-300"
                                    aria-hidden="true"
                                />
                              </button>
                          ))}
                        </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <label className="relative">
                  <MapPin
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                      aria-hidden="true"
                  />

                  <select
                      value={selectedCity}
                      onChange={(event) => {
                        setSelectedCity(event.target.value);
                        setSearchQuery("");
                        setSearchTerm("");
                      }}
                      className="h-14 w-full appearance-none rounded-xl border border-white/10 bg-white pl-11 pr-10 text-sm font-black text-slate-950 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-400/15"
                      aria-label="Select city"
                  >
                    <option value="All">All Tamil Nadu</option>
                    {TAMIL_NADU_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                    ))}
                  </select>

                  <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                  />
                </label>

                <button
                    type="submit"
                    className="flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-7 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-400/25"
                >
                  <Search size={18} aria-hidden="true" />
                  Search
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </form>

              {selectedCity !== "All" && selectedCityLocalities.length > 0 ? (
                  <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                  Popular nearby
                </span>
                    {selectedCityLocalities.slice(0, 5).map((locality) => (
                        <button
                            key={locality}
                            type="button"
                            onClick={() => {
                              setSearchTerm(locality);
                              setSearchQuery(locality);
                            }}
                            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-teal-300/40 hover:text-teal-200"
                        >
                          {locality}
                        </button>
                    ))}
                  </div>
              ) : null}
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="hidden xl:block">
              <div className="sticky top-28 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <SlidersHorizontal size={18} aria-hidden="true" />
                </span>
                  <div>
                    <h2 className="font-black text-slate-950">
                      Refine results
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Filters update instantly
                    </p>
                  </div>
                </div>

                <FilterPanel
                    mode={mode}
                    selectedType={selectedType}
                    selectedBHK={selectedBHK}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    featuredOnly={featuredOnly}
                    propertyTypes={availablePropertyTypes}
                    onTypeChange={handleTypeChange}
                    onBHKChange={setSelectedBHK}
                    onMinPriceChange={setMinPrice}
                    onMaxPriceChange={setMaxPrice}
                    onFeaturedOnlyChange={setFeaturedOnly}
                    onClear={clearFilters}
                />
              </div>
            </aside>

            <div className="min-w-0">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.13em] text-primary">
                      {mode === "rent"
                          ? "Properties for rent"
                          : mode === "commercial"
                              ? "Commercial discovery"
                              : "Properties for sale"}
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                      {resultHeading}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {loading
                          ? "Checking available listings…"
                          : `${filteredProperties.length} ${
                              filteredProperties.length === 1
                                  ? "match"
                                  : "matches"
                          } based on your current search`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setFilterDrawerOpen(true)}
                        className="relative flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-teal-200 hover:text-primary xl:hidden"
                    >
                      <SlidersHorizontal size={16} aria-hidden="true" />
                      Filters
                      {activeFilters.length > 0 ? (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-black text-white">
                        {activeFilters.length}
                      </span>
                      ) : null}
                    </button>

                    <label className="relative">
                      <span className="sr-only">Sort properties</span>
                      <select
                          value={sortBy}
                          onChange={(event) =>
                              setSortBy(event.target.value as SortOption)
                          }
                          className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                        ))}
                      </select>
                      <ChevronDown
                          size={15}
                          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          aria-hidden="true"
                      />
                    </label>

                    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                      <button
                          type="button"
                          onClick={() => setViewMode("list")}
                          aria-label="List view"
                          aria-pressed={viewMode === "list"}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                              viewMode === "list"
                                  ? "bg-white text-primary shadow-sm"
                                  : "text-slate-400 hover:text-slate-700"
                          }`}
                      >
                        <List size={17} aria-hidden="true" />
                      </button>

                      <button
                          type="button"
                          onClick={() => setViewMode("grid")}
                          aria-label="Grid view"
                          aria-pressed={viewMode === "grid"}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                              viewMode === "grid"
                                  ? "bg-white text-primary shadow-sm"
                                  : "text-slate-400 hover:text-slate-700"
                          }`}
                      >
                        <Grid2X2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                {activeFilters.length > 0 ? (
                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <span className="mr-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Active filters
                  </span>

                      {activeFilters.map((filter) => (
                          <button
                              key={filter.id}
                              type="button"
                              onClick={filter.remove}
                              className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-bold text-primary transition hover:border-primary"
                          >
                            {filter.label}
                            <X size={12} aria-hidden="true" />
                          </button>
                      ))}

                      <button
                          type="button"
                          onClick={clearFilters}
                          className="ml-1 text-xs font-black text-slate-500 transition hover:text-primary"
                      >
                        Clear all
                      </button>
                    </div>
                ) : null}
              </div>

              <div className="mt-6">
                {loading ? (
                    <div
                        className={
                          viewMode === "grid"
                              ? "grid gap-5 md:grid-cols-2"
                              : "space-y-5"
                        }
                    >
                      {Array.from({ length: 4 }).map((_, index) => (
                          <div
                              key={index}
                              className={`overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white ${
                                  viewMode === "list"
                                      ? "grid sm:grid-cols-[280px_minmax(0,1fr)]"
                                      : ""
                              }`}
                          >
                            <div
                                className={`animate-pulse bg-slate-200 ${
                                    viewMode === "list"
                                        ? "h-64 sm:h-full sm:min-h-[300px]"
                                        : "h-60"
                                }`}
                            />
                            <div className="space-y-4 p-5 sm:p-7">
                              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                              <div className="h-7 w-3/4 animate-pulse rounded bg-slate-200" />
                              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                              <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 3 }).map((__, specIndex) => (
                                    <div
                                        key={specIndex}
                                        className="h-16 animate-pulse rounded-xl bg-slate-100"
                                    />
                                ))}
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                ) : loadError ? (
                    <div className="rounded-[2rem] border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                    <RefreshCw size={24} aria-hidden="true" />
                  </span>
                      <h3 className="mt-5 text-xl font-black text-slate-950">
                        Listings could not be loaded
                      </h3>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        {loadError}
                      </p>
                      <button
                          type="button"
                          onClick={() => setRequestKey((value) => value + 1)}
                          className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white"
                      >
                        <RefreshCw size={16} aria-hidden="true" />
                        Try again
                      </button>
                    </div>
                ) : filteredProperties.length > 0 ? (
                    <>
                      <div
                          className={
                            viewMode === "grid"
                                ? "grid gap-5 md:grid-cols-2"
                                : "space-y-5"
                          }
                      >
                        {visibleProperties.map((property, index) => (
                            <PropertyCard
                                key={property._id}
                                property={property}
                                viewMode={viewMode}
                                index={index}
                            />
                        ))}
                      </div>

                      {visibleCount < filteredProperties.length ? (
                          <div className="mt-8 flex flex-col items-center">
                            <p className="mb-3 text-xs font-semibold text-slate-400">
                              Showing {visibleProperties.length} of{" "}
                              {filteredProperties.length} properties
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    setVisibleCount((count) => count + 8)
                                }
                                className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-800 shadow-sm transition hover:border-primary hover:text-primary"
                            >
                              Load more properties
                              <ArrowRight size={16} aria-hidden="true" />
                            </button>
                          </div>
                      ) : null}
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="grid lg:grid-cols-[1fr_0.8fr]">
                        <div className="p-7 sm:p-10">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-primary">
                        <Search size={25} aria-hidden="true" />
                      </span>
                          <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
                            No exact matches yet
                          </h3>
                          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                            Try expanding the city, increasing the budget or
                            choosing a broader property type. Your current search
                            may simply be too specific.
                          </p>

                          <div className="mt-7 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white"
                            >
                              Clear all filters
                              <ArrowRight size={16} aria-hidden="true" />
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                  setSearchQuery("");
                                  setSearchTerm("");
                                  setSelectedCity("All");
                                }}
                                className="h-12 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700"
                            >
                              Search all Tamil Nadu
                            </button>
                          </div>
                        </div>

                        <div className="relative min-h-64 bg-slate-950 p-7 text-white sm:p-10">
                          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-teal-500/20 blur-3xl" />
                          <div className="relative">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-300">
                              A useful starting point
                            </p>
                            <h4 className="mt-4 text-xl font-black">
                              Search the location first, then refine.
                            </h4>
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                              Begin with a city or locality and add property type,
                              bedrooms and budget only after you see the available
                              options.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {filterDrawerOpen ? (
              <div className="fixed inset-0 z-[1200] xl:hidden">
                <motion.button
                    type="button"
                    aria-label="Close filters"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setFilterDrawerOpen(false)}
                    className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
                />

                <motion.aside
                    role="dialog"
                    aria-modal="true"
                    aria-label="Property filters"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 28, stiffness: 260 }}
                    className="absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-950">
                        Refine results
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {filteredProperties.length} current matches
                      </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setFilterDrawerOpen(false)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500"
                        aria-label="Close filters"
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-6">
                    <FilterPanel
                        mode={mode}
                        selectedType={selectedType}
                        selectedBHK={selectedBHK}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        featuredOnly={featuredOnly}
                        propertyTypes={availablePropertyTypes}
                        onTypeChange={handleTypeChange}
                        onBHKChange={setSelectedBHK}
                        onMinPriceChange={setMinPrice}
                        onMaxPriceChange={setMaxPrice}
                        onFeaturedOnlyChange={setFeaturedOnly}
                        onClear={clearFilters}
                        onDone={() => setFilterDrawerOpen(false)}
                    />
                  </div>
                </motion.aside>
              </div>
          ) : null}
        </AnimatePresence>
      </main>
  );
}

export default function BuyPage() {
  return (
      <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6]">
              <div className="text-center">
                <Loader2
                    className="mx-auto animate-spin text-primary"
                    size={38}
                />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Loading properties
                </p>
              </div>
            </div>
          }
      >
        <BuyPageContent />
      </Suspense>
  );
}
