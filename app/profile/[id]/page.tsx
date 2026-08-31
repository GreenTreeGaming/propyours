"use client";

import Image from "next/image";
import Link from "next/link";
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    ArrowUpDown,
    BadgeCheck,
    Bath,
    BedDouble,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    CircleUserRound,
    Copy,
    ExternalLink,
    Eye,
    Grid3X3,
    Heart,
    Home,
    Landmark,
    Layers,
    List,
    Loader2,
    Mail,
    Map as MapIcon,
    MapPin,
    Phone,
    RefreshCw,
    Ruler,
    Search,
    SearchX,
    Share2,
    ShieldCheck,
    Sparkles,
    Store,
    Trees,
    UserRound,
    X,
    type LucideIcon,
} from "lucide-react";
import {
    AnimatePresence,
    motion,
} from "framer-motion";
import {
    useParams,
    useRouter,
} from "next/navigation";

import PriceNegotiabilityBadge from "@/components/PriceNegotiabilityBadge";
import {
    getStoredUser,
    type StoredUser,
} from "@/lib/browser-user";

type PropertyCategory =
    | "residential"
    | "land"
    | "commercial";

type CategoryFilter =
    | "all"
    | PropertyCategory;

type PurposeFilter =
    | "all"
    | "Sell"
    | "Rent"
    | "PG/CO-Living";

type SortOption =
    | "featured"
    | "newest"
    | "price-low"
    | "price-high"
    | "area-large";

type ViewMode = "grid" | "list";

interface PropertyListing {
    _id: string;
    address: string;
    locality?: string;
    city?: string;
    state?: string;
    landmark?: string;
    price?: number;
    priceType?: string;
    negotiable?: boolean;
    bedrooms?: number | null;
    bathrooms?: number | null;
    floors?: number | null;
    propertyType?: string;
    commercialType?: string | null;
    size?: number;
    sizeUnit?: string;
    dimensions?: string;
    purpose?: string;
    description?: string;
    images?: string[];
    featured?: boolean;
    promotedUntil?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface BuilderPlan {
    tier:
        | "builder-starter"
        | "builder-growth"
        | "builder-elite"
        | null;
    isActive: boolean;
    rank: number;
}

interface ProfileStats {
    totalListings: number;
    activeListings: number;
    featuredListings: number;
    totalViews: number;
    phoneClicks: number;
    favorites: number;
}

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role?: string;
    bio?: string;
    company?: string;
    address?: string;
    city?: string;
    phone?: string;
    reraNumber?: string;
    builderPlan?: BuilderPlan;
}

interface ProfileApiResponse {
    user?: UserProfile;
    properties?: PropertyListing[];
    stats?: ProfileStats;
    error?: string;
}

interface FilterOption<T extends string> {
    value: T;
    label: string;
}

const DEFAULT_PROFILE_STATS: ProfileStats = {
    totalListings: 0,
    activeListings: 0,
    featuredListings: 0,
    totalViews: 0,
    phoneClicks: 0,
    favorites: 0,
};

const LAND_PROPERTY_TYPES =
    new Set([
        "Plot",
        "Agricultural Land",
    ]);

const CATEGORY_OPTIONS: Array<
    FilterOption<CategoryFilter>
> = [
    {
        value: "all",
        label: "All categories",
    },
    {
        value: "residential",
        label: "Residential",
    },
    {
        value: "land",
        label: "Land & plots",
    },
    {
        value: "commercial",
        label: "Commercial",
    },
];

const PURPOSE_OPTIONS: Array<
    FilterOption<PurposeFilter>
> = [
    {
        value: "all",
        label: "All purposes",
    },
    {
        value: "Sell",
        label: "For sale",
    },
    {
        value: "Rent",
        label: "For rent",
    },
    {
        value: "PG/CO-Living",
        label: "PG / co-living",
    },
];

const SORT_OPTIONS: Array<
    FilterOption<SortOption>
> = [
    {
        value: "featured",
        label: "Featured first",
    },
    {
        value: "newest",
        label: "Recently listed",
    },
    {
        value: "price-low",
        label: "Price: low to high",
    },
    {
        value: "price-high",
        label: "Price: high to low",
    },
    {
        value: "area-large",
        label: "Largest area",
    },
];

const SIZE_UNIT_LABELS: Record<
    string,
    string
> = {
    sqft: "sq ft",
    sqyd: "sq yd",
    sqm: "sq m",
    acre: "acre",
    kanal: "kanal",
    marla: "marla",
};

function isAbortError(
    error: unknown,
): boolean {
    return (
        error instanceof Error &&
        error.name === "AbortError"
    );
}

function normalizeId(
    value: string | string[] | undefined,
): string | null {
    if (Array.isArray(value)) {
        return value[0] ?? null;
    }

    return value ?? null;
}

function getStoredUserId(
    user: StoredUser | null,
): string | null {
    return user?.id ?? user?._id ?? null;
}

function getInitials(
    profile: UserProfile,
): string {
    const source =
        profile.name?.trim() ||
        profile.company?.trim() ||
        "Profile";

    return source
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase(),
        )
        .join("");
}

function getPropertyCategory(
    property: PropertyListing,
): PropertyCategory {
    if (
        property.propertyType ===
        "Commercial" ||
        property.commercialType
    ) {
        return "commercial";
    }

    if (
        LAND_PROPERTY_TYPES.has(
            property.propertyType || "",
        )
    ) {
        return "land";
    }

    return "residential";
}

function getPropertyTypeLabel(
    property: PropertyListing,
): string {
    return (
        property.commercialType ||
        property.propertyType ||
        "Property"
    );
}

function getPurposeLabel(
    purpose?: string,
): string {
    if (purpose === "Sell") {
        return "For sale";
    }

    if (purpose === "Rent") {
        return "For rent";
    }

    if (
        purpose === "PG/CO-Living"
    ) {
        return "PG / co-living";
    }

    return purpose || "Available";
}

function getLocationLabel(
    property: PropertyListing,
): string {
    return [
        property.locality,
        property.city,
        property.state,
    ]
        .filter(Boolean)
        .join(", ");
}

function formatPrice(
    value?: number,
): string {
    if (
        value === undefined ||
        !Number.isFinite(value)
    ) {
        return "Price unavailable";
    }

    if (value >= 10_000_000) {
        const crores =
            value / 10_000_000;

        return `₹${crores.toFixed(
            Number.isInteger(crores)
                ? 0
                : 2,
        )} Cr`;
    }

    if (value >= 100_000) {
        const lakhs =
            value / 100_000;

        return `₹${lakhs.toFixed(
            Number.isInteger(lakhs)
                ? 0
                : 1,
        )} L`;
    }

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        },
    ).format(value);
}

function formatArea(
    property: PropertyListing,
): string {
    if (
        property.size === undefined ||
        !Number.isFinite(property.size)
    ) {
        return "Area unavailable";
    }

    const unit =
        SIZE_UNIT_LABELS[
        property.sizeUnit || "sqft"
            ] ||
        property.sizeUnit ||
        "sq ft";

    return `${new Intl.NumberFormat(
        "en-IN",
        {
            maximumFractionDigits: 2,
        },
    ).format(property.size)} ${unit}`;
}

function formatDate(
    value?: string,
): string | null {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return null;
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

function isPromoted(
    property: PropertyListing,
): boolean {
    if (!property.promotedUntil) {
        return false;
    }

    const promotedUntil =
        new Date(
            property.promotedUntil,
        ).getTime();

    return (
        Number.isFinite(
            promotedUntil,
        ) &&
        promotedUntil > Date.now()
    );
}

function getPlanPresentation(
    profile: UserProfile,
): {
    label: string;
    description: string;
    badgeClassName: string;
    accentClassName: string;
    icon: LucideIcon;
} {
    const tier =
        profile.builderPlan?.isActive
            ? profile.builderPlan.tier
            : null;

    if (tier === "builder-elite") {
        return {
            label: "Builder Elite",
            description:
                "Elite builder storefront",
            badgeClassName:
                "border-white/15 bg-white text-slate-950",
            accentClassName:
                "text-teal-300",
            icon: Sparkles,
        };
    }

    if (
        tier === "builder-growth"
    ) {
        return {
            label: "Builder Growth",
            description:
                "Growth builder storefront",
            badgeClassName:
                "border-teal-200/30 bg-teal-300 text-slate-950",
            accentClassName:
                "text-teal-300",
            icon: Building2,
        };
    }

    if (
        tier === "builder-starter"
    ) {
        return {
            label: "Builder Starter",
            description:
                "Starter builder storefront",
            badgeClassName:
                "border-white/15 bg-white/10 text-white",
            accentClassName:
                "text-teal-300",
            icon: Building2,
        };
    }

    return {
        label:
            profile.role ||
            "PropYours member",
        description:
            "Public property profile",
        badgeClassName:
            "border-white/15 bg-white/10 text-white",
        accentClassName:
            "text-teal-300",
        icon: UserRound,
    };
}

function matchesSearch(
    property: PropertyListing,
    query: string,
): boolean {
    if (!query) {
        return true;
    }

    const haystack = [
        property.address,
        property.locality,
        property.city,
        property.state,
        property.propertyType,
        property.commercialType,
        property.purpose,
        property.description,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return haystack.includes(query);
}

function ProfilePageSkeleton() {
    return (
        <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-24">
            <div className="mx-auto max-w-7xl space-y-7 px-5 sm:px-6 lg:px-8">
                <div className="h-[360px] animate-pulse rounded-[2.25rem] bg-slate-900" />

                <div className="grid gap-7 lg:grid-cols-[330px_minmax(0,1fr)]">
                    <div className="h-[480px] animate-pulse rounded-[2rem] bg-white" />
                    <div className="space-y-6">
                        <div className="h-24 animate-pulse rounded-[1.75rem] bg-white" />
                        <div className="grid gap-6 md:grid-cols-2">
                            {Array.from({
                                length: 4,
                            }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-[390px] animate-pulse rounded-[1.75rem] bg-white"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function PublicProfilePage() {
    const params = useParams<{
        id?: string | string[];
    }>();
    const router = useRouter();
    const profileId =
        normalizeId(params?.id);

    const [profile, setProfile] =
        useState<UserProfile | null>(
            null,
        );
    const [
        properties,
        setProperties,
    ] = useState<PropertyListing[]>(
        [],
    );
    const [stats, setStats] =
        useState<ProfileStats>(
            DEFAULT_PROFILE_STATS,
        );
    const [loading, setLoading] =
        useState(true);
    const [error, setError] =
        useState("");
    const [query, setQuery] =
        useState("");
    const [
        categoryFilter,
        setCategoryFilter,
    ] =
        useState<CategoryFilter>("all");
    const [
        purposeFilter,
        setPurposeFilter,
    ] =
        useState<PurposeFilter>("all");
    const [sort, setSort] =
        useState<SortOption>(
            "featured",
        );
    const [viewMode, setViewMode] =
        useState<ViewMode>("grid");
    const [shareMessage, setShareMessage] =
        useState("");

    const loadProfile =
        useCallback(
            async (
                signal?: AbortSignal,
            ) => {
                if (!profileId) {
                    setError(
                        "Profile not found.",
                    );
                    setLoading(false);
                    return;
                }

                setLoading(true);
                setError("");

                try {
                    const response =
                        await fetch(
                            `/api/profile/${profileId}`,
                            {
                                cache: "no-store",
                                credentials:
                                    "include",
                                signal,
                            },
                        );

                    if (signal?.aborted) {
                        return;
                    }

                    const payload =
                        (await response.json()) as
                            ProfileApiResponse;

                    if (
                        signal?.aborted
                    ) {
                        return;
                    }

                    if (
                        !response.ok ||
                        !payload.user
                    ) {
                        throw new Error(
                            payload.error ||
                            "Unable to load this profile.",
                        );
                    }

                    setProfile(payload.user);
                    setProperties(
                        Array.isArray(
                            payload.properties,
                        )
                            ? payload.properties
                            : [],
                    );
                    setStats(
                        payload.stats ??
                        DEFAULT_PROFILE_STATS,
                    );
                } catch (caughtError) {
                    if (
                        signal?.aborted ||
                        isAbortError(
                            caughtError,
                        )
                    ) {
                        return;
                    }

                    setError(
                        caughtError instanceof
                        Error
                            ? caughtError.message
                            : "Unable to load this profile.",
                    );
                } finally {
                    if (
                        !signal?.aborted
                    ) {
                        setLoading(false);
                    }
                }
            },
            [profileId],
        );

    useEffect(() => {
        const controller =
            new AbortController();

        void loadProfile(
            controller.signal,
        );

        return () =>
            controller.abort();
    }, [loadProfile]);

    useEffect(() => {
        if (!shareMessage) {
            return;
        }

        const timer = window.setTimeout(
            () =>
                setShareMessage(""),
            3200,
        );

        return () =>
            window.clearTimeout(timer);
    }, [shareMessage]);

    const currentUser =
        getStoredUser();
    const isOwnProfile =
        Boolean(
            profileId &&
            getStoredUserId(
                currentUser,
            ) === profileId,
        );

    const categoryCounts =
        useMemo(() => {
            return properties.reduce(
                (counts, property) => {
                    const category =
                        getPropertyCategory(
                            property,
                        );

                    counts[category] += 1;

                    return counts;
                },
                {
                    residential: 0,
                    land: 0,
                    commercial: 0,
                },
            );
        }, [properties]);

    const visibleProperties =
        useMemo(() => {
            const normalizedQuery =
                query
                    .trim()
                    .toLowerCase();

            const filtered =
                properties.filter(
                    (property) => {
                        if (
                            categoryFilter !==
                            "all" &&
                            getPropertyCategory(
                                property,
                            ) !== categoryFilter
                        ) {
                            return false;
                        }

                        if (
                            purposeFilter !==
                            "all" &&
                            property.purpose !==
                            purposeFilter
                        ) {
                            return false;
                        }

                        return matchesSearch(
                            property,
                            normalizedQuery,
                        );
                    },
                );

            return [...filtered].sort(
                (first, second) => {
                    if (
                        sort === "price-low"
                    ) {
                        return (
                            (first.price ?? 0) -
                            (second.price ?? 0)
                        );
                    }

                    if (
                        sort === "price-high"
                    ) {
                        return (
                            (second.price ?? 0) -
                            (first.price ?? 0)
                        );
                    }

                    if (
                        sort === "area-large"
                    ) {
                        return (
                            (second.size ?? 0) -
                            (first.size ?? 0)
                        );
                    }

                    if (
                        sort === "newest"
                    ) {
                        const firstDate =
                            first.createdAt
                                ? new Date(
                                    first.createdAt,
                                ).getTime()
                                : 0;
                        const secondDate =
                            second.createdAt
                                ? new Date(
                                    second.createdAt,
                                ).getTime()
                                : 0;

                        return (
                            secondDate -
                            firstDate
                        );
                    }

                    const firstPriority =
                        Number(
                            isPromoted(first),
                        ) *
                        2 +
                        Number(
                            first.featured,
                        );
                    const secondPriority =
                        Number(
                            isPromoted(second),
                        ) *
                        2 +
                        Number(
                            second.featured,
                        );

                    if (
                        secondPriority !==
                        firstPriority
                    ) {
                        return (
                            secondPriority -
                            firstPriority
                        );
                    }

                    const firstDate =
                        first.createdAt
                            ? new Date(
                                first.createdAt,
                            ).getTime()
                            : 0;
                    const secondDate =
                        second.createdAt
                            ? new Date(
                                second.createdAt,
                            ).getTime()
                            : 0;

                    return (
                        secondDate -
                        firstDate
                    );
                },
            );
        }, [
            categoryFilter,
            properties,
            purposeFilter,
            query,
            sort,
        ]);

    const hasFilters =
        query.trim().length > 0 ||
        categoryFilter !== "all" ||
        purposeFilter !== "all";

    function clearFilters() {
        setQuery("");
        setCategoryFilter("all");
        setPurposeFilter("all");
        setSort("featured");
    }

    async function handleShare() {
        if (
            typeof window ===
            "undefined" ||
            !profile
        ) {
            return;
        }

        const shareUrl =
            window.location.href;
        const shareData = {
            title: `${profile.name} on PropYours`,
            text: profile.company
                ? `View ${profile.company}'s active property listings on PropYours.`
                : `View ${profile.name}'s active property listings on PropYours.`,
            url: shareUrl,
        };

        try {
            if (
                navigator.share
            ) {
                await navigator.share(
                    shareData,
                );
                setShareMessage(
                    "Profile shared.",
                );
                return;
            }

            await navigator.clipboard.writeText(
                shareUrl,
            );
            setShareMessage(
                "Profile link copied.",
            );
        } catch (shareError) {
            if (
                shareError instanceof
                DOMException &&
                shareError.name ===
                "AbortError"
            ) {
                return;
            }

            try {
                await navigator.clipboard.writeText(
                    shareUrl,
                );
                setShareMessage(
                    "Profile link copied.",
                );
            } catch {
                setShareMessage(
                    "Unable to copy the profile link.",
                );
            }
        }
    }

    if (loading) {
        return (
            <ProfilePageSkeleton />
        );
    }

    if (
        error ||
        !profile
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6] px-5 py-28 font-body">
                <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-center shadow-[0_28px_80px_rgba(15,23,42,0.1)]">
                    <div className="bg-slate-950 p-8 text-white sm:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
              <AlertTriangle
                  size={25}
                  aria-hidden="true"
              />
            </span>

                        <h1 className="mt-6 font-heading text-3xl font-black tracking-[-0.035em]">
                            Profile unavailable
                        </h1>

                        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
                            {error ||
                                "This public profile could not be found."}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-center">
                        <button
                            type="button"
                            onClick={() =>
                                void loadProfile()
                            }
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
                        >
                            <RefreshCw
                                size={16}
                                aria-hidden="true"
                            />
                            Try again
                        </button>

                        <Link
                            href="/builders"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20"
                        >
                            Browse builders
                            <ArrowRight
                                size={16}
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const plan =
        getPlanPresentation(profile);
    const PlanIcon = plan.icon;
    const listedSince =
        properties
            .map((property) =>
                property.createdAt
                    ? new Date(
                        property.createdAt,
                    ).getTime()
                    : Number.NaN,
            )
            .filter(Number.isFinite)
            .sort(
                (first, second) =>
                    first - second,
            )[0];
    const portfolioStart =
        listedSince
            ? formatDate(
                new Date(
                    listedSince,
                ).toISOString(),
            )
            : null;

    return (
        <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-24 font-body text-slate-950">
            <section className="relative overflow-hidden bg-slate-950 text-white">
                <div
                    className="pointer-events-none absolute -right-40 -top-56 h-[620px] w-[620px] rounded-full bg-teal-500/20 blur-3xl"
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute -bottom-72 left-[-9rem] h-[540px] w-[540px] rounded-full bg-sky-500/10 blur-3xl"
                    aria-hidden="true"
                />

                <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-7 sm:px-6 lg:px-8 lg:pb-16">
                    <div className="flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() =>
                                router.back()
                            }
                            className="inline-flex items-center gap-2 text-xs font-black text-slate-400 transition hover:text-white"
                        >
                            <ArrowLeft
                                size={16}
                                aria-hidden="true"
                            />
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                void handleShare()
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-xs font-black text-white transition hover:bg-white/10"
                        >
                            <Share2
                                size={15}
                                aria-hidden="true"
                            />
                            Share profile
                        </button>
                    </div>

                    <div className="mt-10 grid gap-9 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
                        <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
                            <div className="relative shrink-0">
                <span className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/10 bg-white/10 text-3xl font-black text-teal-300 shadow-[0_22px_65px_rgba(0,0,0,0.28)] sm:h-36 sm:w-36 sm:text-4xl">
                  {getInitials(
                      profile,
                  )}
                </span>

                                {profile.builderPlan
                                    ?.isActive ? (
                                    <span className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-2xl border-[5px] border-slate-950 bg-teal-300 text-slate-950 shadow-lg">
                    <BadgeCheck
                        size={18}
                        aria-hidden="true"
                    />
                  </span>
                                ) : null}
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                  <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] ${plan.badgeClassName}`}
                  >
                    <PlanIcon
                        size={11}
                        aria-hidden="true"
                    />
                      {plan.label}
                  </span>

                                    {profile.role ? (
                                        <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-300">
                      {profile.role}
                    </span>
                                    ) : null}
                                </div>

                                <h1 className="mt-5 font-heading text-4xl font-black leading-[1.04] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                                    {profile.name}
                                </h1>

                                {profile.role === "Agent" &&
                                profile.reraNumber ? (
                                    <div className="mt-3">
        <span
            className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-emerald-300/25
                bg-emerald-300/10
                px-3
                py-1.5
                text-[10px]
                font-black
                uppercase
                tracking-[0.11em]
                text-emerald-300
            "
        >
            <BadgeCheck
                size={13}
                aria-hidden="true"
            />

            RERA: {profile.reraNumber}
        </span>
                                    </div>
                                ) : null}

                                {profile.company ? (
                                    <p className={`mt-3 text-xl font-black ${plan.accentClassName}`}>
                                        {profile.company}
                                    </p>
                                ) : null}

                                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-slate-400">
                                    {profile.city ? (
                                        <span className="inline-flex items-center gap-1.5">
                      <MapPin
                          size={14}
                          className="text-teal-300"
                          aria-hidden="true"
                      />
                                            {profile.city}
                    </span>
                                    ) : null}

                                    {portfolioStart ? (
                                        <span className="inline-flex items-center gap-1.5">
                      <CalendarDays
                          size={14}
                          className="text-teal-300"
                          aria-hidden="true"
                      />
                      Portfolio since{" "}
                                            {portfolioStart}
                    </span>
                                    ) : null}

                                    <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2
                        size={14}
                        className="text-teal-300"
                        aria-hidden="true"
                    />
                                        {
                                            plan.description
                                        }
                  </span>
                                </div>

                                {profile.bio ? (
                                    <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-400 sm:text-base">
                                        {profile.bio}
                                    </p>
                                ) : (
                                    <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-500">
                                        Explore the active
                                        properties currently
                                        published from this
                                        PropYours profile.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <HeroMetric
                                label="Active listings"
                                value={
                                    stats.activeListings
                                }
                                icon={Building2}
                                highlighted
                            />
                            <HeroMetric
                                label="Featured"
                                value={
                                    stats.featuredListings
                                }
                                icon={Sparkles}
                            />
                            <HeroMetric
                                label="Residential"
                                value={
                                    categoryCounts.residential
                                }
                                icon={Home}
                            />
                            <HeroMetric
                                label="Commercial & land"
                                value={
                                    categoryCounts.commercial +
                                    categoryCounts.land
                                }
                                icon={Landmark}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="relative z-10 mx-auto -mt-5 max-w-7xl px-5 sm:px-6 lg:px-8">
                <div className="grid items-start gap-7 lg:grid-cols-[330px_minmax(0,1fr)]">
                    <aside className="lg:sticky lg:top-24">
                        <ProfileContactCard
                            profile={profile}
                            plan={plan}
                            isOwnProfile={
                                isOwnProfile
                            }
                        />
                    </aside>

                    <section className="min-w-0">
                        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
                                        Public portfolio
                                    </p>
                                    <h2 className="mt-2 font-heading text-3xl font-black tracking-[-0.035em] text-slate-950">
                                        Active property
                                        listings
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Search and compare the
                                        properties currently
                                        available from this
                                        profile.
                                    </p>
                                </div>

                                <p className="text-xs font-black text-slate-500">
                                    {
                                        visibleProperties.length
                                    }{" "}
                                    of {properties.length}{" "}
                                    {properties.length === 1
                                        ? "listing"
                                        : "listings"}
                                </p>
                            </div>

                            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(240px,1fr)_180px_175px_195px_auto]">
                                <label className="relative block">
                                    <Search
                                        size={17}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        aria-hidden="true"
                                    />
                                    <input
                                        type="search"
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="Search location or property type"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                    />
                                </label>

                                <FilterSelect
                                    value={
                                        categoryFilter
                                    }
                                    ariaLabel="Filter by property category"
                                    onChange={(
                                        value,
                                    ) =>
                                        setCategoryFilter(
                                            value as CategoryFilter,
                                        )
                                    }
                                >
                                    {CATEGORY_OPTIONS.map(
                                        (option) => (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {
                                                    option.label
                                                }
                                            </option>
                                        ),
                                    )}
                                </FilterSelect>

                                <FilterSelect
                                    value={
                                        purposeFilter
                                    }
                                    ariaLabel="Filter by listing purpose"
                                    onChange={(
                                        value,
                                    ) =>
                                        setPurposeFilter(
                                            value as PurposeFilter,
                                        )
                                    }
                                >
                                    {PURPOSE_OPTIONS.map(
                                        (option) => (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {
                                                    option.label
                                                }
                                            </option>
                                        ),
                                    )}
                                </FilterSelect>

                                <FilterSelect
                                    value={sort}
                                    ariaLabel="Sort profile listings"
                                    onChange={(
                                        value,
                                    ) =>
                                        setSort(
                                            value as SortOption,
                                        )
                                    }
                                    icon={
                                        ArrowUpDown
                                    }
                                >
                                    {SORT_OPTIONS.map(
                                        (option) => (
                                            <option
                                                key={
                                                    option.value
                                                }
                                                value={
                                                    option.value
                                                }
                                            >
                                                {
                                                    option.label
                                                }
                                            </option>
                                        ),
                                    )}
                                </FilterSelect>

                                <div className="inline-flex h-12 rounded-xl border border-slate-200 bg-slate-50 p-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setViewMode(
                                                "grid",
                                            )
                                        }
                                        aria-pressed={
                                            viewMode === "grid"
                                        }
                                        className={`flex w-11 items-center justify-center rounded-lg transition ${
                                            viewMode === "grid"
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-slate-400 hover:text-slate-700"
                                        }`}
                                        aria-label="Grid view"
                                    >
                                        <Grid3X3
                                            size={17}
                                            aria-hidden="true"
                                        />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setViewMode(
                                                "list",
                                            )
                                        }
                                        aria-pressed={
                                            viewMode === "list"
                                        }
                                        className={`flex w-11 items-center justify-center rounded-lg transition ${
                                            viewMode === "list"
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-slate-400 hover:text-slate-700"
                                        }`}
                                        aria-label="List view"
                                    >
                                        <List
                                            size={17}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </div>

                            {hasFilters ? (
                                <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                        className="inline-flex items-center gap-1.5 text-xs font-black text-primary"
                                    >
                                        <X
                                            size={14}
                                            aria-hidden="true"
                                        />
                                        Clear filters
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-6">
                            {properties.length ===
                            0 ? (
                                <EmptyPortfolio
                                    isOwnProfile={
                                        isOwnProfile
                                    }
                                />
                            ) : visibleProperties.length ===
                            0 ? (
                                <NoListingResults
                                    onClear={
                                        clearFilters
                                    }
                                />
                            ) : (
                                <div
                                    className={
                                        viewMode ===
                                        "grid"
                                            ? "grid gap-6 md:grid-cols-2"
                                            : "space-y-5"
                                    }
                                >
                                    {visibleProperties.map(
                                        (
                                            property,
                                            index,
                                        ) => (
                                            <motion.div
                                                key={
                                                    property._id
                                                }
                                                initial={{
                                                    opacity: 0,
                                                    y: 18,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    delay: Math.min(
                                                        index *
                                                        0.05,
                                                        0.25,
                                                    ),
                                                }}
                                            >
                                                <ProfilePropertyCard
                                                    property={
                                                        property
                                                    }
                                                    viewMode={
                                                        viewMode
                                                    }
                                                />
                                            </motion.div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <AnimatePresence>
                {shareMessage ? (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 18,
                            x: "-50%",
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            x: "-50%",
                        }}
                        exit={{
                            opacity: 0,
                            y: 12,
                            x: "-50%",
                        }}
                        role="status"
                        className="fixed bottom-5 left-1/2 z-[1200] inline-flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-[0_24px_70px_rgba(15,23,42,0.35)]"
                    >
                        <Copy
                            size={17}
                            className="text-teal-300"
                            aria-hidden="true"
                        />
                        {shareMessage}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </main>
    );
}

function HeroMetric({
                        label,
                        value,
                        icon: Icon,
                        highlighted = false,
                    }: {
    label: string;
    value: number;
    icon: LucideIcon;
    highlighted?: boolean;
}) {
    return (
        <div
            className={`rounded-2xl border p-4 ${
                highlighted
                    ? "border-teal-300/30 bg-teal-300 text-slate-950"
                    : "border-white/10 bg-white/[0.055] text-white"
            }`}
        >
            <div className="flex items-center justify-between gap-3">
        <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                highlighted
                    ? "bg-slate-950/10"
                    : "bg-white/10 text-teal-300"
            }`}
        >
          <Icon
              size={16}
              aria-hidden="true"
          />
        </span>

                <span className="text-2xl font-black">
          {value}
        </span>
            </div>

            <p
                className={`mt-3 text-[9px] font-black uppercase tracking-[0.12em] ${
                    highlighted
                        ? "text-slate-700"
                        : "text-slate-500"
                }`}
            >
                {label}
            </p>
        </div>
    );
}

function ProfileContactCard({
                                profile,
                                plan,
                                isOwnProfile,
                            }: {
    profile: UserProfile;
    plan: ReturnType<
        typeof getPlanPresentation
    >;
    isOwnProfile: boolean;
}) {
    const PlanIcon = plan.icon;

    return (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_65px_rgba(15,23,42,0.1)]">
            <div className="p-5 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                    Profile details
                </p>

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
            <PlanIcon
                size={19}
                aria-hidden="true"
            />
          </span>

                    <div>
                        <p className="text-sm font-black text-slate-950">
                            {plan.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {plan.description}
                        </p>
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    {profile.company ? (
                        <ProfileDetail
                            icon={Building2}
                            label="Company"
                            value={profile.company}
                        />
                    ) : null}

                    {profile.role === "Agent" &&
                    profile.reraNumber ? (
                        <ProfileDetail
                            icon={BadgeCheck}
                            label="RERA number"
                            value={profile.reraNumber}
                        />
                    ) : null}

                    {profile.city ? (
                        <ProfileDetail
                            icon={MapPin}
                            label="Location"
                            value={profile.city}
                        />
                    ) : null}

                    {profile.address ? (
                        <ProfileDetail
                            icon={Landmark}
                            label="Office address"
                            value={
                                profile.address
                            }
                        />
                    ) : null}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-6">
                    {isOwnProfile ? (
                        <div className="space-y-3">
                            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                                <p className="text-sm font-black text-slate-950">
                                    This is your public
                                    profile
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                    Manage listings from
                                    your dashboard and use
                                    this page as the public
                                    portfolio you share.
                                </p>
                            </div>

                            <Link
                                href="/manage-properties"
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20"
                            >
                                Manage properties
                                <ArrowRight
                                    size={16}
                                    aria-hidden="true"
                                />
                            </Link>

                            <Link
                                href="/dashboard"
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
                            >
                                Open dashboard
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm font-black text-slate-950">
                                Contact this profile
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Ask about availability,
                                visits and property
                                documentation directly.
                            </p>

                            <div className="mt-4 space-y-3">
                                {profile.phone ? (
                                    <a
                                        href={`tel:${profile.phone}`}
                                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20"
                                    >
                                        <Phone
                                            size={17}
                                            aria-hidden="true"
                                        />
                                        Call profile
                                    </a>
                                ) : null}

                                {profile.email ? (
                                    <a
                                        href={`mailto:${profile.email}`}
                                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                    >
                                        <Mail
                                            size={17}
                                            aria-hidden="true"
                                        />
                                        Send email
                                    </a>
                                ) : null}

                                {!profile.phone &&
                                !profile.email ? (
                                    <div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                                        No public contact
                                        information is
                                        available.
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
                    {[
                        "Confirm availability before visiting",
                        "Inspect the property in person",
                        "Verify documents before payments",
                    ].map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-2.5"
                        >
                            <ShieldCheck
                                size={15}
                                className="shrink-0 text-primary"
                                aria-hidden="true"
                            />
                            <span className="text-xs font-bold text-slate-600">
                {item}
              </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ProfileDetail({
                           icon: Icon,
                           label,
                           value,
                       }: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-primary">
        <Icon
            size={16}
            aria-hidden="true"
        />
      </span>

            <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                    {label}
                </p>
                <p className="mt-1 break-words text-sm font-black leading-5 text-slate-800">
                    {value}
                </p>
            </div>
        </div>
    );
}

function FilterSelect({
                          value,
                          onChange,
                          children,
                          ariaLabel,
                          icon: Icon,
                      }: {
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
    ariaLabel: string;
    icon?: LucideIcon;
}) {
    return (
        <label className="relative block">
            {Icon ? (
                <Icon
                    size={15}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                />
            ) : null}

            <select
                value={value}
                aria-label={ariaLabel}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                className={`h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 ${
                    Icon
                        ? "pl-10"
                        : "pl-4"
                }`}
            >
                {children}
            </select>

            <ChevronDown
                size={15}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
            />
        </label>
    );
}

function ProfilePropertyCard({
                                 property,
                                 viewMode,
                             }: {
    property: PropertyListing;
    viewMode: ViewMode;
}) {
    const image =
        property.images?.[0] ||
        "/loginimage.png";
    const category =
        getPropertyCategory(property);
    const typeLabel =
        getPropertyTypeLabel(property);
    const location =
        getLocationLabel(property);
    const listedDate =
        formatDate(property.createdAt);

    if (viewMode === "list") {
        return (
            <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:border-teal-200 hover:shadow-[0_20px_55px_rgba(15,23,42,0.1)]">
                <div className="grid min-h-[250px] md:grid-cols-[285px_minmax(0,1fr)]">
                    <Link
                        href={`/property/${property._id}`}
                        className="relative block min-h-56 overflow-hidden bg-slate-100 md:min-h-full"
                    >
                        <Image
                            src={image}
                            alt={property.address}
                            fill
                            sizes="(max-width: 768px) 100vw, 285px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            <PropertyPurposeBadge
                                purpose={
                                    property.purpose
                                }
                            />

                            {isPromoted(
                                property,
                            ) ? (
                                <PromotedBadge />
                            ) : null}
                        </div>
                    </Link>

                    <div className="flex min-w-0 flex-col p-5 sm:p-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                {typeLabel}
                            </p>

                            <Link
                                href={`/property/${property._id}`}
                                className="mt-2 block"
                            >
                                <h3 className="line-clamp-2 font-heading text-2xl font-black leading-tight tracking-[-0.025em] text-slate-950 transition group-hover:text-primary">
                                    {
                                        property.address
                                    }
                                </h3>
                            </Link>

                            {location ? (
                                <p className="mt-3 flex items-start gap-2 text-sm font-medium text-slate-500">
                                    <MapPin
                                        size={15}
                                        className="mt-0.5 shrink-0 text-primary"
                                        aria-hidden="true"
                                    />
                                    {location}
                                </p>
                            ) : null}
                        </div>

                        {property.description ? (
                            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                                {
                                    property.description
                                }
                            </p>
                        ) : null}

                        <div className="mt-5">
                            <PropertySpecs
                                property={
                                    property
                                }
                            />
                        </div>

                        <div className="mt-auto flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                                    {property.purpose ===
                                    "Rent"
                                        ? "Listed rent"
                                        : "Asking price"}
                                </p>

                                <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">
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

                            <div className="flex flex-col items-start gap-2 sm:items-end">
                                {listedDate ? (
                                    <p className="text-[10px] font-bold text-slate-400">
                                        Listed{" "}
                                        {listedDate}
                                    </p>
                                ) : null}

                                <Link
                                    href={`/property/${property._id}`}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-xs font-black text-white transition hover:bg-primary"
                                >
                                    View property
                                    <ArrowRight
                                        size={15}
                                        aria-hidden="true"
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_24px_65px_rgba(15,23,42,0.12)]">
            <div className="relative">
                <Link
                    href={`/property/${property._id}`}
                    className="relative block h-58 overflow-hidden bg-slate-100"
                >
                    <Image
                        src={image}
                        alt={property.address}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                </Link>

                <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
                    <PropertyPurposeBadge
                        purpose={
                            property.purpose
                        }
                    />

                    {isPromoted(
                        property,
                    ) ? (
                        <PromotedBadge />
                    ) : property.featured ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.11em] text-primary shadow-sm backdrop-blur">
              <Sparkles
                  size={11}
                  aria-hidden="true"
              />
              Featured
            </span>
                    ) : null}
                </div>

                <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-slate-950/80 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-white backdrop-blur">
          {category ===
          "commercial"
              ? "Commercial"
              : category === "land"
                  ? "Land"
                  : "Residential"}
        </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                    {typeLabel}
                </p>

                <Link
                    href={`/property/${property._id}`}
                    className="mt-2 block"
                >
                    <h3 className="line-clamp-2 font-heading text-xl font-black leading-tight tracking-[-0.025em] text-slate-950 transition group-hover:text-primary">
                        {property.address}
                    </h3>
                </Link>

                {location ? (
                    <p className="mt-3 flex items-start gap-2 text-sm font-medium text-slate-500">
                        <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-primary"
                            aria-hidden="true"
                        />
                        <span className="line-clamp-2">
              {location}
            </span>
                    </p>
                ) : null}

                <div className="mt-5">
                    <PropertySpecs
                        property={
                            property
                        }
                    />
                </div>

                <div className="mt-auto border-t border-slate-100 pt-5">
                    <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                                {property.purpose ===
                                "Rent"
                                    ? "Listed rent"
                                    : "Asking price"}
                            </p>

                            <p className="mt-1 truncate text-2xl font-black tracking-tight text-slate-950">
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

                        <Link
                            href={`/property/${property._id}`}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition group-hover:bg-primary"
                            aria-label={`View ${property.address}`}
                        >
                            <ArrowRight
                                size={17}
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}

function PropertySpecs({
                           property,
                       }: {
    property: PropertyListing;
}) {
    const category =
        getPropertyCategory(property);

    if (category === "land") {
        return (
            <div className="flex flex-wrap gap-2">
                <SpecChip
                    icon={Ruler}
                    label={formatArea(
                        property,
                    )}
                />

                {property.dimensions ? (
                    <SpecChip
                        icon={MapIcon}
                        label={
                            property.dimensions
                        }
                    />
                ) : null}
            </div>
        );
    }

    if (
        category === "commercial"
    ) {
        return (
            <div className="flex flex-wrap gap-2">
                <SpecChip
                    icon={Ruler}
                    label={formatArea(
                        property,
                    )}
                />

                {property.floors !==
                null &&
                property.floors !==
                undefined ? (
                    <SpecChip
                        icon={Layers}
                        label={`${property.floors} ${
                            property.floors === 1
                                ? "floor"
                                : "floors"
                        }`}
                    />
                ) : null}

                {property.bathrooms !==
                null &&
                property.bathrooms !==
                undefined ? (
                    <SpecChip
                        icon={Bath}
                        label={`${property.bathrooms} ${
                            property.bathrooms === 1
                                ? "washroom"
                                : "washrooms"
                        }`}
                    />
                ) : null}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {property.bedrooms !==
            null &&
            property.bedrooms !==
            undefined ? (
                <SpecChip
                    icon={BedDouble}
                    label={
                        property.bedrooms ===
                        0
                            ? "Studio"
                            : `${property.bedrooms} BHK`
                    }
                />
            ) : null}

            {property.bathrooms !==
            null &&
            property.bathrooms !==
            undefined ? (
                <SpecChip
                    icon={Bath}
                    label={`${property.bathrooms} ${
                        property.bathrooms === 1
                            ? "bath"
                            : "baths"
                    }`}
                />
            ) : null}

            <SpecChip
                icon={Ruler}
                label={formatArea(
                    property,
                )}
            />
        </div>
    );
}

function SpecChip({
                      icon: Icon,
                      label,
                  }: {
    icon: LucideIcon;
    label: string;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-black text-slate-600">
      <Icon
          size={12}
          className="text-primary"
          aria-hidden="true"
      />
            {label}
    </span>
    );
}

function PropertyPurposeBadge({
                                  purpose,
                              }: {
    purpose?: string;
}) {
    return (
        <span className="rounded-full border border-white/40 bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-800 shadow-sm backdrop-blur">
      {getPurposeLabel(
          purpose,
      )}
    </span>
    );
}

function PromotedBadge() {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-amber-950 shadow-sm">
      <Sparkles
          size={11}
          aria-hidden="true"
      />
      Promoted
    </span>
    );
}

function EmptyPortfolio({
                            isOwnProfile,
                        }: {
    isOwnProfile: boolean;
}) {
    return (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[1fr_0.75fr]">
                <div className="p-7 sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-primary">
            <Building2
                size={24}
                aria-hidden="true"
            />
          </span>

                    <p className="mt-7 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                        Public portfolio
                    </p>

                    <h3 className="mt-3 font-heading text-3xl font-black tracking-[-0.035em] text-slate-950">
                        No active listings
                        right now.
                    </h3>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                        {isOwnProfile
                            ? "Publish a property to start building the portfolio shown on this public profile."
                            : "This profile does not currently have a public property available for sale or rent."}
                    </p>

                    {isOwnProfile ? (
                        <Link
                            href="/post-property"
                            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20"
                        >
                            List a property
                            <ArrowRight
                                size={16}
                                aria-hidden="true"
                            />
                        </Link>
                    ) : (
                        <Link
                            href="/buy"
                            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20"
                        >
                            Browse properties
                            <ArrowRight
                                size={16}
                                aria-hidden="true"
                            />
                        </Link>
                    )}
                </div>

                <div className="relative overflow-hidden bg-slate-950 p-7 text-white sm:p-10">
                    <div
                        className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-teal-500/20 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-teal-300 ring-1 ring-white/10">
              <BriefcaseBusiness
                  size={21}
                  aria-hidden="true"
              />
            </span>

                        <h4 className="mt-7 text-xl font-black">
                            A profile becomes a
                            storefront
                        </h4>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            Active listings appear
                            here with structured
                            pricing, location and
                            property details.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NoListingResults({
                              onClear,
                          }: {
    onClear: () => void;
}) {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <SearchX
            size={24}
            aria-hidden="true"
        />
      </span>

            <h3 className="mt-6 font-heading text-2xl font-black text-slate-950">
                No listings match
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Try another search or clear
                the category and purpose
                filters.
            </p>

            <button
                type="button"
                onClick={onClear}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-xs font-black text-white transition hover:bg-primary"
            >
                Clear filters
            </button>
        </div>
    );
}
