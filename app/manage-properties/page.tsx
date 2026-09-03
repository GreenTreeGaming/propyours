"use client";

import {
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AnimatePresence,
    motion,
} from "framer-motion";
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    BarChart3,
    Bath,
    BedDouble,
    Building2,
    Check,
    ChevronDown,
    Clock3,
    Edit3,
    Eye,
    Filter,
    Grid2X2,
    Heart,
    ImageIcon,
    LayoutList,
    Loader2,
    MapPin,
    PhoneCall,
    Plus,
    RefreshCw,
    Rocket,
    Search,
    Sparkles,
    Square,
    Trash2,
    TrendingUp,
    X,
    type LucideIcon,
} from "lucide-react";

import PropertyAnalyticsModal from "@/components/PropertyAnalyticsModal";
import FullPropertyEditorModal, {
    type PropertyEditorProperty,
} from "@/components/FullPropertyEditorModal";
import PriceNegotiabilityBadge from "@/components/PriceNegotiabilityBadge";
import {
    PLAN_CATALOG,
    type PlanTier,
} from "@/lib/plan-catalog";
import {
    clearStoredUser,
    getStoredUser,
} from "@/lib/browser-user";

type ViewMode = "grid" | "list";
type StatusFilter =
    | "all"
    | "active"
    | "promoted"
    | "expiring"
    | "expired"
    | "inactive"
    | "sold";
type SortOption =
    | "newest"
    | "oldest"
    | "views"
    | "price-high"
    | "price-low";

interface StoredUser {
    _id?: string;
    id?: string;
    name?: string;
    role?: string;
    plan?: {
        tier?: PlanTier;
        status?: string;
        boostsRemaining?: number;
        boostsResetAt?: string;
    };
}

interface PropertyAnalytics {
    views?: number;
    phoneClicks?: number;
    favoritesCount?: number;
}

interface PropertyPlanSnapshot {
    tier?: PlanTier;
    listingDays?: number;
    maxPhotos?: number;
    maxVideoLinks?: number;
    featured?: boolean;
    homepageFeatured?: boolean;
    rankingLevel?: string;
    compareVisibility?: string;
    badgeLevel?: string;
    analyticsLevel?:
        | "none"
        | "basic"
        | "advanced"
        | "project"
        | "portfolio";
}

interface ManagedProperty extends PropertyEditorProperty {
    status?: "active" | "sold" | "inactive";
    featured?: boolean;
    listingExpiresAt?: string;
    promotedUntil?: string;
    analytics?: PropertyAnalytics;
    planSnapshot?: PropertyPlanSnapshot;
    createdAt?: string;
    updatedAt?: string;
}

interface PlanSummary {
    tier: PlanTier;
    status?: string;
    boostsRemaining: number;
    boostsPerMonth: number;
    boostsResetAt: string | null;
}

interface ToastMessage {
    type: "success" | "error";
    message: string;
}


const STATUS_FILTERS: Array<{
    value: StatusFilter;
    label: string;
}> = [
    { value: "all", label: "All listings" },
    { value: "active", label: "Active" },
    { value: "promoted", label: "Promoted" },
    { value: "expiring", label: "Expiring soon" },
    { value: "expired", label: "Expired" },
    { value: "inactive", label: "Inactive" },
    { value: "sold", label: "Sold" },
];

const SORT_OPTIONS: Array<{
    value: SortOption;
    label: string;
}> = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "views", label: "Most viewed" },
    {
        value: "price-high",
        label: "Price: high to low",
    },
    {
        value: "price-low",
        label: "Price: low to high",
    },
];

const FALLBACK_IMAGE = "/loginimage.png";

function isPlanTier(
    value: unknown,
): value is PlanTier {
    return (
        typeof value === "string" &&
        Object.prototype.hasOwnProperty.call(
            PLAN_CATALOG,
            value,
        )
    );
}

function isAbortError(error: unknown): boolean {
    return (
        error instanceof Error &&
        error.name === "AbortError"
    );
}

function getUserId(
    user: StoredUser | null,
): string {
    return user?._id || user?.id || "";
}

function formatPrice(price: number): string {
    if (price >= 10_000_000) {
        const crores = price / 10_000_000;

        return `₹${crores.toFixed(
            Number.isInteger(crores) ? 0 : 2,
        )} Cr`;
    }

    if (price >= 100_000) {
        const lakhs = price / 100_000;

        return `₹${lakhs.toFixed(
            Number.isInteger(lakhs) ? 0 : 1,
        )} L`;
    }

    return `₹${price.toLocaleString(
        "en-IN",
    )}`;
}

function formatCompactNumber(
    value: number,
): string {
    return new Intl.NumberFormat("en-IN", {
        notation:
            value >= 1_000
                ? "compact"
                : "standard",
        maximumFractionDigits: 1,
    }).format(value);
}

function formatDate(
    value?: string | null,
    fallback = "Not available",
): string {
    if (!value) {
        return fallback;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        },
    ).format(date);
}

function daysUntil(
    value?: string | null,
): number | null {
    if (!value) {
        return null;
    }

    const timestamp = new Date(
        value,
    ).getTime();

    if (Number.isNaN(timestamp)) {
        return null;
    }

    return Math.ceil(
        (timestamp - Date.now()) /
        86_400_000,
    );
}

function isPromoted(
    property: ManagedProperty,
): boolean {
    if (!property.promotedUntil) {
        return false;
    }

    return (
        new Date(
            property.promotedUntil,
        ).getTime() > Date.now()
    );
}

function isExpired(
    property: ManagedProperty,
): boolean {
    const remaining = daysUntil(
        property.listingExpiresAt,
    );

    return (
        remaining !== null &&
        remaining < 0
    );
}

function isExpiringSoon(
    property: ManagedProperty,
): boolean {
    const remaining = daysUntil(
        property.listingExpiresAt,
    );

    return (
        remaining !== null &&
        remaining >= 0 &&
        remaining <= 7
    );
}

function isActive(
    property: ManagedProperty,
): boolean {
    return (
        property.status !== "sold" &&
        property.status !== "inactive" &&
        !isExpired(property)
    );
}

function getListingStatus(
    property: ManagedProperty,
): {
    label: string;
    className: string;
} {
    if (isExpired(property)) {
        return {
            label: "Expired",
            className:
                "bg-amber-100 text-amber-800",
        };
    }

    if (property.status === "sold") {
        return {
            label: "Sold",
            className:
                "bg-blue-100 text-blue-700",
        };
    }

    if (
        property.status === "inactive"
    ) {
        return {
            label: "Inactive",
            className:
                "bg-slate-100 text-slate-600",
        };
    }

    return {
        label: "Active",
        className:
            "bg-emerald-100 text-emerald-700",
    };
}

function getPromotionState(
    property: ManagedProperty,
    planSummary: PlanSummary | null,
): {
    enabled: boolean;
    label: string;
    description: string;
} {
    if (isPromoted(property)) {
        return {
            enabled: false,
            label: "Boost active",
            description: `Promoted until ${formatDate(
                property.promotedUntil,
            )}`,
        };
    }

    if (isExpired(property)) {
        return {
            enabled: false,
            label: "Listing expired",
            description:
                "Expired listings cannot be promoted.",
        };
    }

    if (
        property.status !== "active"
    ) {
        return {
            enabled: false,
            label: "Listing inactive",
            description:
                "Only active listings can be promoted.",
        };
    }

    if (
        !planSummary ||
        planSummary.boostsPerMonth <= 0
    ) {
        return {
            enabled: false,
            label: "Boost not included",
            description:
                "Your current plan has no promotion boosts.",
        };
    }

    if (
        planSummary.boostsRemaining <= 0
    ) {
        return {
            enabled: false,
            label: "No boosts left",
            description:
                "Wait for the next reset or compare plans.",
        };
    }

    return {
        enabled: true,
        label: "Promote for 7 days",
        description: `${planSummary.boostsRemaining} boost ${
            planSummary.boostsRemaining ===
            1
                ? "token"
                : "tokens"
        } remaining`,
    };
}

function matchesStatus(
    property: ManagedProperty,
    filter: StatusFilter,
): boolean {
    switch (filter) {
        case "active":
            return isActive(property);
        case "promoted":
            return isPromoted(property);
        case "expiring":
            return isExpiringSoon(property);
        case "expired":
            return isExpired(property);
        case "inactive":
            return (
                property.status === "inactive"
            );
        case "sold":
            return property.status === "sold";
        case "all":
        default:
            return true;
    }
}

function getPropertySpecs(
    property: ManagedProperty,
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

    if (
        typeof property.bedrooms === "number" &&
        property.bedrooms > 0
    ) {
        specs.push({
            label: "Beds",
            value: String(property.bedrooms),
            icon: BedDouble,
        });
    }

    if (
        typeof property.bathrooms === "number" &&
        property.bathrooms > 0
    ) {
        specs.push({
            label: "Baths",
            value: String(property.bathrooms),
            icon: Bath,
        });
    }

    if (
        property.size !== undefined &&
        property.size > 0
    ) {
        specs.push({
            label: "Area",
            value: `${property.size.toLocaleString(
                "en-IN",
            )} ${property.sizeUnit || "sqft"}`,
            icon: Square,
        });
    }

    return specs.slice(0, 3);
}

function PortfolioMetric({
                             label,
                             value,
                             description,
                             icon: Icon,
                             dark = false,
                         }: {
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
    dark?: boolean;
}) {
    return (
        <div
            className={`relative overflow-hidden rounded-[1.5rem] border p-5 shadow-sm ${
                dark
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-950"
            }`}
        >
            {dark ? (
                <div
                    className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-teal-500/20 blur-3xl"
                    aria-hidden="true"
                />
            ) : null}

            <div className="relative flex items-start justify-between gap-4">
        <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                dark
                    ? "bg-white/10 text-teal-300 ring-1 ring-white/10"
                    : "bg-teal-50 text-primary"
            }`}
        >
          <Icon
              size={20}
              aria-hidden="true"
          />
        </span>

                <span
                    className={`text-[10px] font-black uppercase tracking-[0.12em] ${
                        dark
                            ? "text-slate-500"
                            : "text-slate-400"
                    }`}
                >
          Portfolio
        </span>
            </div>

            <p className="relative mt-6 text-3xl font-black tracking-tight">
                {value}
            </p>
            <p
                className={`relative mt-1 text-sm font-black ${
                    dark
                        ? "text-white"
                        : "text-slate-950"
                }`}
            >
                {label}
            </p>
            <p
                className={`relative mt-2 text-xs leading-5 ${
                    dark
                        ? "text-slate-400"
                        : "text-slate-500"
                }`}
            >
                {description}
            </p>
        </div>
    );
}

function PropertyCard({
                          property,
                          viewMode,
                          planSummary,
                          promotionPending,
                          onPromote,
                          onEdit,
                          onDelete,
                          onAnalytics,
                      }: {
    property: ManagedProperty;
    viewMode: ViewMode;
    planSummary: PlanSummary | null;
    promotionPending: boolean;
    onPromote: (
        property: ManagedProperty,
    ) => void;
    onEdit: (
        property: ManagedProperty,
    ) => void;
    onDelete: (
        property: ManagedProperty,
    ) => void;
    onAnalytics: (
        property: ManagedProperty,
    ) => void;
}) {
    const status = getListingStatus(
        property,
    );
    const promotion =
        getPromotionState(
            property,
            planSummary,
        );
    const specs =
        getPropertySpecs(property);
    const remaining = daysUntil(
        property.listingExpiresAt,
    );
    const promoted =
        isPromoted(property);
    const isList =
        viewMode === "list";

    return (
        <motion.article
            layout
            initial={{
                opacity: 0,
                y: 16,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
                scale: 0.97,
            }}
            className={`group overflow-hidden rounded-[1.75rem] border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_65px_rgba(15,23,42,0.1)] ${
                promoted
                    ? "border-teal-300 ring-2 ring-teal-100"
                    : "border-slate-200 hover:border-teal-200"
            }`}
        >
            <div
                className={
                    isList
                        ? "grid h-full lg:grid-cols-[280px_minmax(0,1fr)]"
                        : "flex h-full flex-col"
                }
            >
                <div
                    className={`relative overflow-hidden bg-slate-200 ${
                        isList
                            ? "h-64 lg:h-full lg:min-h-[350px]"
                            : "h-60"
                    }`}
                >
                    <Image
                        src={
                            property.images?.[0] ||
                            FALLBACK_IMAGE
                        }
                        alt={property.address}
                        fill
                        sizes={
                            isList
                                ? "(max-width: 1024px) 100vw, 280px"
                                : "(max-width: 768px) 100vw, 50vw"
                        }
                        className="object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/5" />

                    <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-3 p-4">
                        <div className="flex flex-wrap gap-2">
              <span
                  className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ${status.className}`}
              >
                {status.label}
              </span>

                            <span className="rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-900 backdrop-blur">
                {property.purpose}
              </span>
                        </div>

                        {promoted ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-300 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-950 shadow-lg">
                <Rocket
                    size={12}
                    aria-hidden="true"
                />
                Promoted
              </span>
                        ) : null}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
            <span className="rounded-full border border-white/20 bg-slate-950/50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide backdrop-blur">
              {property.propertyType}
            </span>

                        {property.images &&
                        property.images.length > 1 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/50 px-2.5 py-1.5 text-[10px] font-bold backdrop-blur">
                <ImageIcon
                    size={12}
                    aria-hidden="true"
                />
                                {property.images.length}
              </span>
                        ) : null}
                    </div>
                </div>

                <div
                    className={`flex min-w-0 flex-1 flex-col ${
                        isList
                            ? "p-5 sm:p-6"
                            : "p-5"
                    }`}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-primary">
                            <MapPin
                                size={14}
                                className="shrink-0"
                                aria-hidden="true"
                            />
                            <span className="truncate">
                {property.locality
                    ? `${property.locality}, ${property.city}`
                    : property.city}
              </span>
                        </div>

                        {remaining !== null ? (
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                                    remaining < 0
                                        ? "bg-amber-100 text-amber-700"
                                        : remaining <= 7
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-slate-100 text-slate-500"
                                }`}
                            >
                <Clock3
                    size={12}
                    aria-hidden="true"
                />
                                {remaining < 0
                                    ? "Expired"
                                    : `${remaining}d left`}
              </span>
                        ) : null}
                    </div>

                    <h2
                        className={`mt-3 line-clamp-2 font-black leading-tight tracking-tight text-slate-950 ${
                            isList
                                ? "text-xl sm:text-2xl"
                                : "text-lg"
                        }`}
                    >
                        {property.address}
                    </h2>

                    {isList &&
                    property.description ? (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                            {property.description}
                        </p>
                    ) : null}

                    <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p
                                className={`font-black tracking-tight text-slate-950 ${
                                    isList
                                        ? "text-2xl"
                                        : "text-xl"
                                }`}
                            >
                                {formatPrice(
                                    property.price,
                                )}
                            </p>
                            <PriceNegotiabilityBadge
                                negotiable={
                                    property.negotiable
                                }
                                className="mt-2"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {specs.map((spec) => {
                                const Icon = spec.icon;

                                return (
                                    <div
                                        key={`${spec.label}-${spec.value}`}
                                        className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                                    >
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
                                            <Icon
                                                size={13}
                                                aria-hidden="true"
                                            />
                                            {spec.label}
                                        </div>
                                        <p className="mt-1 text-xs font-black text-slate-900">
                                            {spec.value}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-slate-50 px-3 py-3">
                            <Eye
                                size={15}
                                className="text-primary"
                                aria-hidden="true"
                            />
                            <p className="mt-2 text-sm font-black text-slate-950">
                                {formatCompactNumber(
                                    property.analytics?.views ??
                                    0,
                                )}
                            </p>
                            <p className="mt-0.5 text-[9px] font-black uppercase tracking-wide text-slate-400">
                                Views
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 px-3 py-3">
                            <PhoneCall
                                size={15}
                                className="text-primary"
                                aria-hidden="true"
                            />
                            <p className="mt-2 text-sm font-black text-slate-950">
                                {formatCompactNumber(
                                    property.analytics
                                        ?.phoneClicks ?? 0,
                                )}
                            </p>
                            <p className="mt-0.5 text-[9px] font-black uppercase tracking-wide text-slate-400">
                                Contacts
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 px-3 py-3">
                            <Heart
                                size={15}
                                className="text-primary"
                                aria-hidden="true"
                            />
                            <p className="mt-2 text-sm font-black text-slate-950">
                                {formatCompactNumber(
                                    property.analytics
                                        ?.favoritesCount ?? 0,
                                )}
                            </p>
                            <p className="mt-0.5 text-[9px] font-black uppercase tracking-wide text-slate-400">
                                Saves
                            </p>
                        </div>
                    </div>

                    <div
                        className={`mt-5 rounded-2xl border p-4 ${
                            promotion.enabled
                                ? "border-teal-200 bg-teal-50"
                                : promoted
                                    ? "border-teal-200 bg-teal-50"
                                    : "border-slate-200 bg-slate-50"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p
                                    className={`text-sm font-black ${
                                        promotion.enabled ||
                                        promoted
                                            ? "text-primary"
                                            : "text-slate-700"
                                    }`}
                                >
                                    {promotion.label}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {
                                        promotion.description
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={
                                    !promotion.enabled ||
                                    promotionPending
                                }
                                onClick={() =>
                                    onPromote(property)
                                }
                                className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black transition ${
                                    promotion.enabled
                                        ? "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark"
                                        : "cursor-not-allowed bg-slate-200 text-slate-400"
                                }`}
                            >
                                {promotionPending ? (
                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Rocket
                                        size={15}
                                        aria-hidden="true"
                                    />
                                )}
                                Boost
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto grid grid-cols-[0.85fr_1.25fr_0.8fr_0.95fr] gap-2 border-t border-slate-100 pt-5">
                        <Link
                            href={`/property/${property._id}`}
                            className="inline-flex h-11 min-w-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-700 transition hover:border-primary hover:bg-teal-50 hover:text-primary"
                        >
                            <Eye
                                size={14}
                                className="shrink-0"
                                aria-hidden="true"
                            />
                            <span>View</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => onAnalytics(property)}
                            className="inline-flex h-11 min-w-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-700 transition hover:border-primary hover:bg-teal-50 hover:text-primary"
                        >
                            <BarChart3
                                size={14}
                                className="shrink-0"
                                aria-hidden="true"
                            />
                            <span>Analytics</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => onEdit(property)}
                            aria-label={`Edit ${property.address}`}
                            className="inline-flex h-11 min-w-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-700 transition hover:border-primary hover:bg-teal-50 hover:text-primary"
                        >
                            <Edit3
                                size={14}
                                className="shrink-0"
                                aria-hidden="true"
                            />
                            <span>Edit</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => onDelete(property)}
                            className="inline-flex h-11 min-w-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-xl border border-red-100 bg-red-50 px-2 text-xs font-black text-red-600 transition hover:border-red-200 hover:bg-red-100"
                        >
                            <Trash2
                                size={14}
                                className="shrink-0"
                                aria-hidden="true"
                            />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

function LoadingState() {
    return (
        <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-24">
            <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                <div className="h-48 animate-pulse rounded-[2rem] bg-slate-200" />

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({
                        length: 4,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="h-44 animate-pulse rounded-[1.5rem] bg-white"
                        />
                    ))}
                </div>

                <div className="mt-8 h-24 animate-pulse rounded-[1.5rem] bg-white" />

                <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({
                        length: 6,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="h-[620px] animate-pulse rounded-[1.75rem] bg-white"
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}

export default function ManagePropertiesPage() {
    const router = useRouter();
    const toastTimerRef =
        useRef<ReturnType<
            typeof setTimeout
        > | null>(null);

    const [user, setUser] =
        useState<StoredUser | null>(null);
    const [properties, setProperties] =
        useState<ManagedProperty[]>([]);
    const [planSummary, setPlanSummary] =
        useState<PlanSummary | null>(null);

    const [loading, setLoading] =
        useState(true);
    const [loadError, setLoadError] =
        useState("");
    const [loadWarning, setLoadWarning] =
        useState("");

    const [searchQuery, setSearchQuery] =
        useState("");
    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("all");
    const [typeFilter, setTypeFilter] =
        useState("All");
    const [sortBy, setSortBy] =
        useState<SortOption>("newest");
    const [viewMode, setViewMode] =
        useState<ViewMode>("grid");

    const [selectedProperty, setSelectedProperty] =
        useState<ManagedProperty | null>(
            null,
        );
    const [analyticsOpen, setAnalyticsOpen] =
        useState(false);

    const [editProperty, setEditProperty] =
        useState<ManagedProperty | null>(
            null,
        );

    const [deleteProperty, setDeleteProperty] =
        useState<ManagedProperty | null>(
            null,
        );
    const [deleteConfirmation, setDeleteConfirmation] =
        useState("");
    const [deletePending, setDeletePending] =
        useState(false);

    const [promotionPendingId, setPromotionPendingId] =
        useState<string | null>(null);
    const [toast, setToast] =
        useState<ToastMessage | null>(null);

    const showToast = useCallback(
        (
            type: ToastMessage["type"],
            message: string,
        ) => {
            if (toastTimerRef.current) {
                clearTimeout(
                    toastTimerRef.current,
                );
            }

            setToast({
                type,
                message,
            });

            toastTimerRef.current =
                setTimeout(() => {
                    setToast(null);
                }, 4000);
        },
        [],
    );

    useEffect(
        () => () => {
            if (toastTimerRef.current) {
                clearTimeout(
                    toastTimerRef.current,
                );
            }
        },
        [],
    );

    const loadPage = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            setLoadError("");
            setLoadWarning("");

            const storedUser =
                getStoredUser() as StoredUser | null;
            const userId = getUserId(storedUser);

            if (!storedUser || !userId) {
                router.replace(
                    "/login?redirect=/manage-properties",
                );
                return;
            }

            setUser(storedUser);

            try {
                const [propertiesResult, planResult] =
                    await Promise.allSettled([
                        fetch(
                            `/api/property/user/${userId}`,
                            {
                                credentials: "include",
                                cache: "no-store",
                                signal,
                            },
                        ),
                        fetch("/api/account/plan", {
                            credentials: "include",
                            cache: "no-store",
                            signal,
                        }),
                    ]);

                if (signal?.aborted) {
                    return;
                }

                if (propertiesResult.status === "rejected") {
                    if (isAbortError(propertiesResult.reason)) {
                        return;
                    }

                    throw propertiesResult.reason instanceof Error
                        ? propertiesResult.reason
                        : new Error(
                            "Unable to load your property listings.",
                        );
                }

                const propertiesResponse =
                    propertiesResult.value;

                if (
                    propertiesResponse.status === 401 ||
                    propertiesResponse.status === 403
                ) {
                    clearStoredUser();
                    router.replace(
                        "/login?redirect=/manage-properties",
                    );
                    return;
                }

                const propertiesPayload: unknown =
                    await propertiesResponse.json();

                if (signal?.aborted) {
                    return;
                }

                if (
                    !propertiesResponse.ok ||
                    !Array.isArray(propertiesPayload)
                ) {
                    const message =
                        typeof propertiesPayload === "object" &&
                        propertiesPayload !== null &&
                        "error" in propertiesPayload &&
                        typeof propertiesPayload.error === "string"
                            ? propertiesPayload.error
                            : "Unable to load your property listings.";

                    throw new Error(message);
                }

                setProperties(
                    propertiesPayload as ManagedProperty[],
                );

                if (planResult.status === "fulfilled") {
                    try {
                        const planResponse = planResult.value;
                        const planPayload: unknown =
                            await planResponse.json();

                        if (signal?.aborted) {
                            return;
                        }

                        if (
                            planResponse.ok &&
                            typeof planPayload === "object" &&
                            planPayload !== null &&
                            "tier" in planPayload &&
                            isPlanTier(planPayload.tier)
                        ) {
                            setPlanSummary(
                                planPayload as PlanSummary,
                            );
                        } else {
                            setPlanSummary(null);
                            setLoadWarning(
                                "Your listings loaded, but current plan usage could not be retrieved.",
                            );
                        }
                    } catch (error) {
                        if (
                            signal?.aborted ||
                            isAbortError(error)
                        ) {
                            return;
                        }

                        console.error(
                            "Unable to load plan usage:",
                            error,
                        );
                        setPlanSummary(null);
                        setLoadWarning(
                            "Your listings loaded, but current plan usage could not be retrieved.",
                        );
                    }
                } else if (!isAbortError(planResult.reason)) {
                    console.error(
                        "Unable to load plan usage:",
                        planResult.reason,
                    );
                    setPlanSummary(null);
                    setLoadWarning(
                        "Your listings loaded, but current plan usage could not be retrieved.",
                    );
                }
            } catch (error) {
                if (signal?.aborted || isAbortError(error)) {
                    return;
                }

                console.error(
                    "Unable to load property management:",
                    error,
                );
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load your property listings.",
                );
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [router],
    );

    useEffect(() => {
        const controller =
            new AbortController();

        void loadPage(
            controller.signal,
        );

        return () =>
            controller.abort();
    }, [loadPage]);

    useEffect(() => {
        if (
            !deleteProperty
        ) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        return () => {
            document.body.style.overflow =
                previousOverflow;
        };
    }, [deleteProperty]);

    const propertyTypes = useMemo(
        () => [
            "All",
            ...Array.from(
                new Set(
                    properties.map(
                        (property) =>
                            property.propertyType,
                    ),
                ),
            ).sort(),
        ],
        [properties],
    );

    const metrics = useMemo(() => {
        const activeCount =
            properties.filter(
                (property) =>
                    isActive(property),
            ).length;

        const expiringCount =
            properties.filter(
                (property) =>
                    isExpiringSoon(property),
            ).length;

        const totalViews =
            properties.reduce(
                (total, property) =>
                    total +
                    (property.analytics?.views ??
                        0),
                0,
            );

        const totalContacts =
            properties.reduce(
                (total, property) =>
                    total +
                    (property.analytics
                        ?.phoneClicks ?? 0),
                0,
            );

        const totalSaves =
            properties.reduce(
                (total, property) =>
                    total +
                    (property.analytics
                        ?.favoritesCount ?? 0),
                0,
            );

        return {
            activeCount,
            expiringCount,
            totalViews,
            totalContacts,
            totalSaves,
        };
    }, [properties]);

    const filteredProperties =
        useMemo(() => {
            const query =
                searchQuery
                    .trim()
                    .toLowerCase();

            return [...properties]
                .filter((property) => {
                    const searchable = [
                        property.address,
                        property.locality,
                        property.city,
                        property.propertyType,
                        property.purpose,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    const matchesSearch =
                        !query ||
                        searchable.includes(query);

                    const matchesType =
                        typeFilter === "All" ||
                        property.propertyType ===
                        typeFilter;

                    const matchesStatus =
                        matchesStatusFilter(
                            property,
                            statusFilter,
                        );

                    return (
                        matchesSearch &&
                        matchesType &&
                        matchesStatus
                    );
                })
                .sort((first, second) => {
                    if (sortBy === "oldest") {
                        return (
                            new Date(
                                first.createdAt || 0,
                            ).getTime() -
                            new Date(
                                second.createdAt || 0,
                            ).getTime()
                        );
                    }

                    if (sortBy === "views") {
                        return (
                            (second.analytics
                                ?.views ?? 0) -
                            (first.analytics
                                ?.views ?? 0)
                        );
                    }

                    if (
                        sortBy === "price-high"
                    ) {
                        return (
                            second.price -
                            first.price
                        );
                    }

                    if (
                        sortBy === "price-low"
                    ) {
                        return (
                            first.price -
                            second.price
                        );
                    }

                    return (
                        new Date(
                            second.createdAt || 0,
                        ).getTime() -
                        new Date(
                            first.createdAt || 0,
                        ).getTime()
                    );
                });
        }, [
            properties,
            searchQuery,
            sortBy,
            statusFilter,
            typeFilter,
        ]);

    const currentTier =
        planSummary?.tier ??
        user?.plan?.tier;
    const currentPlan =
        isPlanTier(currentTier)
            ? PLAN_CATALOG[currentTier]
            : PLAN_CATALOG.silver;
    const activeCapacity =
        currentPlan.entitlements
            .activeProperties;
    const activeUsage =
        metrics.activeCount;
    const usagePercentage =
        Math.min(
            100,
            Math.round(
                (activeUsage /
                    Math.max(
                        activeCapacity,
                        1,
                    )) *
                100,
            ),
        );

    async function handlePromote(
        property: ManagedProperty,
    ) {
        const promotion =
            getPromotionState(
                property,
                planSummary,
            );

        if (!promotion.enabled) {
            return;
        }

        setPromotionPendingId(
            property._id,
        );

        try {
            const response = await fetch(
                `/api/property/${property._id}/promote`,
                {
                    method: "POST",
                    credentials: "include",
                },
            );

            const payload: unknown =
                await response.json();

            if (!response.ok) {
                const message =
                    typeof payload ===
                    "object" &&
                    payload !== null &&
                    "error" in payload &&
                    typeof payload.error ===
                    "string"
                        ? payload.error
                        : "Unable to promote this property.";

                throw new Error(message);
            }

            if (
                typeof payload !==
                "object" ||
                payload === null ||
                !("property" in payload)
            ) {
                throw new Error(
                    "Promotion response was incomplete.",
                );
            }

            const promotedProperty =
                payload.property as ManagedProperty;

            setProperties(
                (current) =>
                    current.map(
                        (item) =>
                            item._id ===
                            property._id
                                ? promotedProperty
                                : item,
                    ),
            );

            if (
                "boostsRemaining" in
                payload &&
                typeof payload.boostsRemaining ===
                "number"
            ) {
                setPlanSummary(
                    (current) =>
                        current
                            ? {
                                ...current,
                                boostsRemaining:
                                    payload.boostsRemaining as number,
                                boostsResetAt:
                                    "boostsResetAt" in
                                    payload &&
                                    typeof payload.boostsResetAt ===
                                    "string"
                                        ? payload.boostsResetAt
                                        : current.boostsResetAt,
                            }
                            : current,
                );
            }

            showToast(
                "success",
                "Property promoted for seven days.",
            );
        } catch (error) {
            showToast(
                "error",
                error instanceof Error
                    ? error.message
                    : "Unable to promote this property.",
            );
        } finally {
            setPromotionPendingId(null);
        }
    }


    async function handleDeleteSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (
            !deleteProperty ||
            deleteConfirmation !==
            "DELETE"
        ) {
            return;
        }

        setDeletePending(true);

        try {
            const response = await fetch(
                `/api/property/${deleteProperty._id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                },
            );

            const payload: unknown =
                await response.json();

            if (!response.ok) {
                const message =
                    typeof payload ===
                    "object" &&
                    payload !== null &&
                    "error" in payload &&
                    typeof payload.error ===
                    "string"
                        ? payload.error
                        : "Unable to delete this property.";

                throw new Error(message);
            }

            setProperties(
                (current) =>
                    current.filter(
                        (property) =>
                            property._id !==
                            deleteProperty._id,
                    ),
            );

            setDeleteProperty(null);
            setDeleteConfirmation("");
            showToast(
                "success",
                "Property deleted successfully.",
            );
        } catch (error) {
            showToast(
                "error",
                error instanceof Error
                    ? error.message
                    : "Unable to delete this property.",
            );
        } finally {
            setDeletePending(false);
        }
    }

    if (loading && !user) {
        return <LoadingState />;
    }

    if (loadError || !user) {
        return (
            <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-28">
                <div className="mx-auto max-w-3xl px-5 sm:px-6">
                    <div className="rounded-[2rem] border border-red-100 bg-white p-7 text-center shadow-sm sm:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertTriangle
                  size={25}
                  aria-hidden="true"
              />
            </span>

                        <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
                            Your listings could not be loaded
                        </h1>

                        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                            {loadError ||
                                "The current account session is unavailable."}
                        </p>

                        <div className="mt-7 flex flex-wrap justify-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    void loadPage()
                                }
                                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white"
                            >
                                <RefreshCw
                                    size={16}
                                    aria-hidden="true"
                                />
                                Try again
                            </button>

                            <Link
                                href="/login"
                                className="inline-flex h-12 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700"
                            >
                                Go to login
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-20 font-body text-slate-950">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.15),_transparent_34%),linear-gradient(180deg,#f8fbfa_0%,#ffffff_100%)]">
                <div className="mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-6 lg:px-8 lg:pb-16">
                    <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.13em] text-primary shadow-sm">
                                <BadgeCheck
                                    size={15}
                                    aria-hidden="true"
                                />
                                Property operations
                            </div>

                            <h1 className="mt-6 max-w-3xl font-heading text-4xl font-black leading-[1.06] tracking-[-0.045em] text-slate-950 sm:text-5xl">
                                Manage every listing
                                <span className="block text-primary">
                  without losing the details.
                </span>
                            </h1>

                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                                Review status, expiry, engagement,
                                plan usage and promotion options
                                across your property portfolio.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/post-property"
                                    className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-dark"
                                >
                                    <Plus
                                        size={17}
                                        aria-hidden="true"
                                    />
                                    Add property
                                </Link>

                                <Link
                                    href="/dashboard"
                                    className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-700 shadow-sm transition hover:border-primary hover:text-primary"
                                >
                                    Back to dashboard
                                    <ArrowRight
                                        size={16}
                                        aria-hidden="true"
                                    />
                                </Link>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
                            <div
                                className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-500/20 blur-3xl"
                                aria-hidden="true"
                            />

                            <div className="relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-300">
                                            Current plan
                                        </p>
                                        <h2 className="mt-2 text-2xl font-black">
                                            {
                                                currentPlan
                                                    .presentation
                                                    .displayName
                                            }
                                        </h2>
                                    </div>

                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-teal-300 ring-1 ring-white/10">
                    <Sparkles
                        size={20}
                        aria-hidden="true"
                    />
                  </span>
                                </div>

                                <div className="mt-7">
                                    <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="font-bold text-slate-400">
                      Active listing usage
                    </span>
                                        <span className="font-black">
                      {activeUsage}/
                                            {activeCapacity}
                    </span>
                                    </div>

                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-teal-300 transition-[width]"
                                            style={{
                                                width: `${usagePercentage}%`,
                                            }}
                                        />
                                    </div>

                                    <p className="mt-3 text-xs leading-5 text-slate-400">
                                        {usagePercentage >= 100
                                            ? "Your active-listing allowance is currently full."
                                            : `${100 - usagePercentage}% of your active-listing allowance remains.`}
                                    </p>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
                                    <div className="rounded-xl bg-white/[0.06] p-3">
                                        <p className="text-xl font-black">
                                            {planSummary?.boostsRemaining ??
                                                0}
                                        </p>
                                        <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                                            Boosts left
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-white/[0.06] p-3">
                                        <p className="text-xl font-black">
                                            {planSummary?.boostsPerMonth ??
                                                0}
                                        </p>
                                        <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                                            Per month
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={`/pricing${
                                        currentPlan.audience ===
                                        "builder"
                                            ? "?audience=builder"
                                            : ""
                                    }`}
                                    className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-xs font-black text-slate-950 transition hover:bg-teal-200"
                                >
                                    Compare plans
                                    <ArrowRight
                                        size={15}
                                        aria-hidden="true"
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
                {loadWarning ? (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                        <AlertTriangle
                            size={18}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />
                        <p className="text-sm leading-6">
                            {loadWarning}
                        </p>
                    </div>
                ) : null}

                {/* Portfolio metrics */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <PortfolioMetric
                        label="Active listings"
                        value={String(
                            metrics.activeCount,
                        )}
                        description={`${properties.length} total properties in this account.`}
                        icon={Building2}
                        dark
                    />

                    <PortfolioMetric
                        label="Listing views"
                        value={formatCompactNumber(
                            metrics.totalViews,
                        )}
                        description="Combined public views across every listing."
                        icon={Eye}
                    />

                    <PortfolioMetric
                        label="Contact actions"
                        value={formatCompactNumber(
                            metrics.totalContacts,
                        )}
                        description={`${formatCompactNumber(
                            metrics.totalSaves,
                        )} saves recorded across the portfolio.`}
                        icon={PhoneCall}
                    />

                    <PortfolioMetric
                        label="Expiring soon"
                        value={String(
                            metrics.expiringCount,
                        )}
                        description="Active listings with seven days or less remaining."
                        icon={Clock3}
                    />
                </div>

                {/* Controls */}
                <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
                        <label className="relative">
              <span className="sr-only">
                Search properties
              </span>
                            <Search
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                                aria-hidden="true"
                            />
                            <input
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search address, locality, city or property type"
                                className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                            />
                        </label>

                        <label className="relative">
              <span className="sr-only">
                Property type
              </span>
                            <Building2
                                size={17}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                                aria-hidden="true"
                            />
                            <select
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(
                                        event.target.value,
                                    )
                                }
                                className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-bold text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                            >
                                {propertyTypes.map(
                                    (type) => (
                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type === "All"
                                                ? "All property types"
                                                : type}
                                        </option>
                                    ),
                                )}
                            </select>
                            <ChevronDown
                                size={15}
                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                aria-hidden="true"
                            />
                        </label>

                        <label className="relative">
              <span className="sr-only">
                Sort listings
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
                                        event.target
                                            .value as SortOption,
                                    )
                                }
                                className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-bold text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                            >
                                {SORT_OPTIONS.map(
                                    (option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ),
                                )}
                            </select>
                            <ChevronDown
                                size={15}
                                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                aria-hidden="true"
                            />
                        </label>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                            {STATUS_FILTERS.map(
                                (filter) => (
                                    <button
                                        key={filter.value}
                                        type="button"
                                        onClick={() =>
                                            setStatusFilter(
                                                filter.value,
                                            )
                                        }
                                        className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-black transition ${
                                            statusFilter ===
                                            filter.value
                                                ? "border-primary bg-teal-50 text-primary"
                                                : "border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:text-primary"
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ),
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold text-slate-500">
                                {
                                    filteredProperties.length
                                }{" "}
                                {filteredProperties.length ===
                                1
                                    ? "listing"
                                    : "listings"}
                            </p>

                            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setViewMode("grid")
                                    }
                                    aria-label="Grid view"
                                    aria-pressed={
                                        viewMode === "grid"
                                    }
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                                        viewMode === "grid"
                                            ? "bg-white text-primary shadow-sm"
                                            : "text-slate-400"
                                    }`}
                                >
                                    <Grid2X2
                                        size={17}
                                        aria-hidden="true"
                                    />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setViewMode("list")
                                    }
                                    aria-label="List view"
                                    aria-pressed={
                                        viewMode === "list"
                                    }
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                                        viewMode === "list"
                                            ? "bg-white text-primary shadow-sm"
                                            : "text-slate-400"
                                    }`}
                                >
                                    <LayoutList
                                        size={17}
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings */}
                <div className="mt-6">
                    {properties.length === 0 ? (
                        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                            <div className="grid lg:grid-cols-[1fr_0.8fr]">
                                <div className="p-7 sm:p-10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-primary">
                    <Building2
                        size={25}
                        aria-hidden="true"
                    />
                  </span>

                                    <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
                                        No properties listed yet
                                    </h2>

                                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                                        Create a clear listing and it
                                        will appear here with expiry,
                                        engagement, promotion and
                                        analytics controls.
                                    </p>

                                    <Link
                                        href="/post-property"
                                        className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white"
                                    >
                                        Post your first property
                                        <ArrowRight
                                            size={16}
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </div>

                                <div className="relative overflow-hidden bg-slate-950 p-7 text-white sm:p-10">
                                    <div
                                        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-teal-500/20 blur-3xl"
                                        aria-hidden="true"
                                    />
                                    <div className="relative">
                                        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-300">
                                            What appears here
                                        </p>
                                        <div className="mt-6 space-y-4">
                                            {[
                                                "Listing status and expiry",
                                                "Views, calls and saves",
                                                "Plan-aware promotion controls",
                                                "Quick editing and analytics",
                                            ].map((item) => (
                                                <div
                                                    key={item}
                                                    className="flex items-center gap-3 text-sm font-semibold text-slate-300"
                                                >
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-300/15 text-teal-300">
                            <Check
                                size={14}
                                aria-hidden="true"
                            />
                          </span>
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : filteredProperties.length ===
                    0 ? (
                        <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Filter
                    size={24}
                    aria-hidden="true"
                />
              </span>

                            <h2 className="mt-5 text-xl font-black text-slate-950">
                                No listings match these filters
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Broaden the property type, status
                                or search text to see more of your
                                portfolio.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("all");
                                    setTypeFilter("All");
                                    setSortBy("newest");
                                }}
                                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white"
                            >
                                Clear filters
                                <X
                                    size={15}
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                    ) : (
                        <div
                            className={
                                viewMode === "grid"
                                    ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                                    : "space-y-5"
                            }
                        >
                            <AnimatePresence>
                                {filteredProperties.map(
                                    (property) => (
                                        <PropertyCard
                                            key={property._id}
                                            property={property}
                                            viewMode={viewMode}
                                            planSummary={
                                                planSummary
                                            }
                                            promotionPending={
                                                promotionPendingId ===
                                                property._id
                                            }
                                            onPromote={
                                                handlePromote
                                            }
                                            onEdit={setEditProperty}
                                            onDelete={(
                                                item,
                                            ) => {
                                                setDeleteProperty(
                                                    item,
                                                );
                                                setDeleteConfirmation(
                                                    "",
                                                );
                                            }}
                                            onAnalytics={(
                                                item,
                                            ) => {
                                                setSelectedProperty(
                                                    item,
                                                );
                                                setAnalyticsOpen(
                                                    true,
                                                );
                                            }}
                                        />
                                    ),
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            <PropertyAnalyticsModal
                isOpen={analyticsOpen}
                onClose={() =>
                    setAnalyticsOpen(false)
                }
                property={selectedProperty}
            />

            <FullPropertyEditorModal
                isOpen={Boolean(editProperty)}
                property={editProperty}
                plan={currentPlan}
                onClose={() => setEditProperty(null)}
                onSaved={(updatedProperty) => {
                    setProperties((current) =>
                        current.map((property) =>
                            property._id === updatedProperty._id
                                ? {
                                    ...property,
                                    ...updatedProperty,
                                }
                                : property,
                        ),
                    );
                    setEditProperty(null);
                    showToast(
                        "success",
                        "All property details were updated.",
                    );
                }}
            />

            {/* Delete modal */}
            <AnimatePresence>
                {deleteProperty ? (
                    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-5">
                        <motion.button
                            type="button"
                            aria-label="Close delete dialog"
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            exit={{
                                opacity: 0,
                            }}
                            onClick={() =>
                                !deletePending &&
                                setDeleteProperty(null)
                            }
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />

                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="delete-property-title"
                            initial={{
                                opacity: 0,
                                y: 20,
                                scale: 0.96,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: 20,
                                scale: 0.96,
                            }}
                            className="relative z-10 w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8"
                        >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2
                    size={22}
                    aria-hidden="true"
                />
              </span>

                            <h2
                                id="delete-property-title"
                                className="mt-6 text-2xl font-black tracking-tight text-slate-950"
                            >
                                Delete this property?
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                This permanently removes{" "}
                                <span className="font-black text-slate-700">
                  {
                      deleteProperty.address
                  }
                </span>{" "}
                                and its stored analytics. This
                                action cannot be undone.
                            </p>

                            <form
                                onSubmit={
                                    handleDeleteSubmit
                                }
                                className="mt-7"
                            >
                                <label>
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-red-600">
                    Type DELETE to confirm
                  </span>
                                    <input
                                        required
                                        value={
                                            deleteConfirmation
                                        }
                                        onChange={(event) =>
                                            setDeleteConfirmation(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="DELETE"
                                        className="h-14 w-full rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-950 outline-none transition placeholder:text-red-300 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
                                    />
                                </label>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDeleteProperty(null)
                                        }
                                        disabled={deletePending}
                                        className="h-12 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-700"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            deleteConfirmation !==
                                            "DELETE" ||
                                            deletePending
                                        }
                                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {deletePending ? (
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Trash2
                                                size={17}
                                                aria-hidden="true"
                                            />
                                        )}
                                        Delete
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast ? (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 18,
                            scale: 0.96,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 18,
                            scale: 0.96,
                        }}
                        role="status"
                        aria-live="polite"
                        className={`fixed bottom-6 right-5 z-[1300] flex max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl sm:right-6 ${
                            toast.type ===
                            "success"
                                ? "border-emerald-200 text-emerald-800"
                                : "border-red-200 text-red-700"
                        }`}
                    >
            <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    toast.type ===
                    "success"
                        ? "bg-emerald-100"
                        : "bg-red-100"
                }`}
            >
              {toast.type ===
              "success" ? (
                  <Check
                      size={18}
                      aria-hidden="true"
                  />
              ) : (
                  <AlertTriangle
                      size={18}
                      aria-hidden="true"
                  />
              )}
            </span>

                        <p className="pt-1 text-sm font-bold leading-6">
                            {toast.message}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setToast(null)
                            }
                            className="ml-auto p-1 opacity-60 hover:opacity-100"
                            aria-label="Dismiss message"
                        >
                            <X
                                size={16}
                                aria-hidden="true"
                            />
                        </button>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </main>
    );
}

function matchesStatusFilter(
    property: ManagedProperty,
    filter: StatusFilter,
): boolean {
    return matchesStatus(
        property,
        filter,
    );
}
