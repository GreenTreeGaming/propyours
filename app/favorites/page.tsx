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
    ArrowRight,
    ArrowUpDown,
    Bath,
    BedDouble,
    BookmarkCheck,
    Building2,
    ChevronDown,
    Grid3X3,
    Heart,
    Home,
    List,
    Loader2,
    Map as MapIcon,
    MapPin,
    RefreshCw,
    Ruler,
    Search,
    SearchX,
    Sparkles,
    X,
} from "lucide-react";

import PriceNegotiabilityBadge from "@/components/PriceNegotiabilityBadge";
import {
    clearStoredUser,
    getStoredUser,
    updateStoredUserFavorites,
    type StoredUser,
} from "@/lib/browser-user";

type PropertyCategory =
    | "residential"
    | "land"
    | "commercial";

type PurposeFilter =
    | "all"
    | "Sell"
    | "Rent"
    | "PG/CO-Living";

type CategoryFilter =
    | "all"
    | PropertyCategory;

type SortOption =
    | "saved"
    | "newest"
    | "price-low"
    | "price-high"
    | "area-large";

type ViewMode = "grid" | "list";

interface FavoriteProperty {
    _id: string;
    address: string;
    city: string;
    state?: string;
    locality?: string;
    landmark?: string;
    propertyType: string;
    commercialType?: string | null;
    purpose: string;
    description?: string;
    price: number;
    priceType?: string;
    negotiable?: boolean;
    bedrooms?: number | null;
    bathrooms?: number | null;
    floors?: number | null;
    size: number;
    sizeUnit?: string;
    dimensions?: string;
    images?: string[];
    promotedUntil?: string;
    featured?: boolean;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface FavoriteToggleResponse {
    success?: boolean;
    favorites?: string[];
    error?: string;
}

interface RemovedFavorite {
    property: FavoriteProperty;
}

const LAND_TYPES = new Set([
    "Plot",
    "Agricultural Land",
]);

const PURPOSE_OPTIONS: Array<{
    value: PurposeFilter;
    label: string;
}> = [
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

const CATEGORY_OPTIONS: Array<{
    value: CategoryFilter;
    label: string;
}> = [
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

const SORT_OPTIONS: Array<{
    value: SortOption;
    label: string;
}> = [
    {
        value: "saved",
        label: "Saved order",
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

function isAbortError(
    error: unknown,
): boolean {
    return (
        error instanceof Error &&
        error.name === "AbortError"
    );
}

function getUserId(
    user: StoredUser | null,
): string | null {
    return user?.id ?? user?._id ?? null;
}

function getPropertyCategory(
    property: FavoriteProperty,
): PropertyCategory {
    if (
        property.propertyType ===
        "Commercial" ||
        property.commercialType
    ) {
        return "commercial";
    }

    if (
        LAND_TYPES.has(
            property.propertyType,
        )
    ) {
        return "land";
    }

    return "residential";
}

function getPropertyTypeLabel(
    property: FavoriteProperty,
): string {
    return (
        property.commercialType ||
        property.propertyType
    );
}

function getLocationLabel(
    property: FavoriteProperty,
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
    value: number,
): string {
    if (!Number.isFinite(value)) {
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
        const lakhs = value / 100_000;

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
    property: FavoriteProperty,
): string {
    const unitLabels: Record<
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

    return `${new Intl.NumberFormat(
        "en-IN",
    ).format(property.size)} ${
        unitLabels[
        property.sizeUnit || "sqft"
            ] ||
        property.sizeUnit ||
        "sq ft"
    }`;
}

function isPromoted(
    property: FavoriteProperty,
): boolean {
    if (!property.promotedUntil) {
        return false;
    }

    const promotedUntil = new Date(
        property.promotedUntil,
    ).getTime();

    return (
        Number.isFinite(promotedUntil) &&
        promotedUntil > Date.now()
    );
}

function matchesSearch(
    property: FavoriteProperty,
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

function PropertySpecChips({
                               property,
                           }: {
    property: FavoriteProperty;
}) {
    const category =
        getPropertyCategory(property);

    if (category === "land") {
        return (
            <div className="flex flex-wrap gap-2">
                <SpecChip
                    icon={Ruler}
                    label={formatArea(property)}
                />

                {property.dimensions ? (
                    <SpecChip
                        icon={MapIcon}
                        label={property.dimensions}
                    />
                ) : null}
            </div>
        );
    }

    if (category === "commercial") {
        return (
            <div className="flex flex-wrap gap-2">
                <SpecChip
                    icon={Ruler}
                    label={formatArea(property)}
                />

                {property.floors !==
                undefined &&
                property.floors !== null ? (
                    <SpecChip
                        icon={Building2}
                        label={`${property.floors} ${
                            property.floors === 1
                                ? "floor"
                                : "floors"
                        }`}
                    />
                ) : null}

                {property.bathrooms !==
                undefined &&
                property.bathrooms !== null ? (
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
            undefined &&
            property.bedrooms !== null ? (
                <SpecChip
                    icon={BedDouble}
                    label={
                        property.bedrooms === 0
                            ? "Studio"
                            : `${property.bedrooms} BHK`
                    }
                />
            ) : null}

            {property.bathrooms !==
            undefined &&
            property.bathrooms !== null ? (
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
                label={formatArea(property)}
            />
        </div>
    );
}

function SpecChip({
                      icon: Icon,
                      label,
                  }: {
    icon: typeof Ruler;
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

function PropertyCard({
                          property,
                          viewMode,
                          removing,
                          onRemove,
                      }: {
    property: FavoriteProperty;
    viewMode: ViewMode;
    removing: boolean;
    onRemove: (
        property: FavoriteProperty,
    ) => void;
}) {
    const imageSrc =
        property.images?.[0] ||
        "/house1.jpeg";
    const category =
        getPropertyCategory(property);
    const typeLabel =
        getPropertyTypeLabel(property);
    const location =
        getLocationLabel(property);

    if (viewMode === "list") {
        return (
            <article className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:border-teal-200 hover:shadow-[0_20px_55px_rgba(15,23,42,0.1)]">
                <div className="grid min-h-[250px] md:grid-cols-[300px_minmax(0,1fr)]">
                    <Link
                        href={`/property/${property._id}`}
                        className="relative block min-h-56 overflow-hidden bg-slate-100 md:min-h-full"
                    >
                        <Image
                            src={imageSrc}
                            alt={property.address}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            <PurposeBadge
                                purpose={property.purpose}
                            />
                        </div>
                    </Link>

                    <div className="flex min-w-0 flex-col p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-5">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                    {typeLabel}
                                </p>

                                <Link
                                    href={`/property/${property._id}`}
                                    className="mt-2 block"
                                >
                                    <h2 className="line-clamp-2 font-heading text-2xl font-black leading-tight tracking-[-0.025em] text-slate-950 transition group-hover:text-primary">
                                        {property.address}
                                    </h2>
                                </Link>

                                {location ? (
                                    <div className="mt-3 flex items-start gap-2 text-sm font-medium text-slate-500">
                                        <MapPin
                                            size={16}
                                            className="mt-0.5 shrink-0 text-primary"
                                            aria-hidden="true"
                                        />
                                        <span>
                      {location}
                    </span>
                                    </div>
                                ) : null}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    onRemove(property)
                                }
                                disabled={removing}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition hover:border-red-200 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
                                aria-label={`Remove ${property.address} from favorites`}
                            >
                                {removing ? (
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Heart
                                        size={18}
                                        fill="currentColor"
                                        aria-hidden="true"
                                    />
                                )}
                            </button>
                        </div>

                        {property.description ? (
                            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                                {property.description}
                            </p>
                        ) : null}

                        <div className="mt-5">
                            <PropertySpecChips
                                property={property}
                            />
                        </div>

                        <div className="mt-auto flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                                    Asking price
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
            </article>
        );
    }

    return (
        <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_24px_65px_rgba(15,23,42,0.12)]">
            <div className="relative">
                <Link
                    href={`/property/${property._id}`}
                    className="relative block h-60 overflow-hidden bg-slate-100"
                >
                    <Image
                        src={imageSrc}
                        alt={property.address}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                </Link>

                <div className="pointer-events-none absolute left-4 top-4 flex max-w-[calc(100%-76px)] flex-wrap gap-2">
                    <PurposeBadge
                        purpose={property.purpose}
                    />
                </div>

                <button
                    type="button"
                    onClick={() =>
                        onRemove(property)
                    }
                    disabled={removing}
                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/95 text-red-600 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                    aria-label={`Remove ${property.address} from favorites`}
                >
                    {removing ? (
                        <Loader2
                            size={18}
                            className="animate-spin"
                            aria-hidden="true"
                        />
                    ) : (
                        <Heart
                            size={18}
                            fill="currentColor"
                            aria-hidden="true"
                        />
                    )}
                </button>

                <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <span className="rounded-full bg-slate-950/80 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-white backdrop-blur">
            {category ===
            "commercial"
                ? "Commercial"
                : category === "land"
                    ? "Land"
                    : "Residential"}
          </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                    {typeLabel}
                </p>

                <Link
                    href={`/property/${property._id}`}
                    className="mt-2 block"
                >
                    <h2 className="line-clamp-2 font-heading text-xl font-black leading-tight tracking-[-0.025em] text-slate-950 transition group-hover:text-primary">
                        {property.address}
                    </h2>
                </Link>

                {location ? (
                    <div className="mt-3 flex items-start gap-2 text-sm font-medium text-slate-500">
                        <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-primary"
                            aria-hidden="true"
                        />
                        <span className="line-clamp-2">
              {location}
            </span>
                    </div>
                ) : null}

                <div className="mt-5">
                    <PropertySpecChips
                        property={property}
                    />
                </div>

                <div className="mt-auto border-t border-slate-100 pt-5">
                    <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                                Asking price
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

function PurposeBadge({
                          purpose,
                      }: {
    purpose: string;
}) {
    return (
        <span className="rounded-full border border-white/40 bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-800 shadow-sm backdrop-blur">
      {purpose === "Sell"
          ? "For sale"
          : purpose === "Rent"
              ? "For rent"
              : purpose}
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

function FavoritesSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({
                length: 6,
            }).map((_, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white"
                >
                    <div className="h-60 animate-pulse bg-slate-200" />
                    <div className="space-y-4 p-5">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
                        <div className="h-7 w-4/5 animate-pulse rounded-lg bg-slate-200" />
                        <div className="h-4 w-3/5 animate-pulse rounded-lg bg-slate-100" />
                        <div className="flex gap-2">
                            <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
                            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
                        </div>
                        <div className="border-t border-slate-100 pt-5">
                            <div className="h-7 w-32 animate-pulse rounded-lg bg-slate-200" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function FavoritesPage() {
    const [favorites, setFavorites] =
        useState<FavoriteProperty[]>([]);
    const [loading, setLoading] =
        useState(true);
    const [error, setError] =
        useState("");
    const [isLoggedIn, setIsLoggedIn] =
        useState<boolean | null>(null);
    const [query, setQuery] =
        useState("");
    const [
        purposeFilter,
        setPurposeFilter,
    ] =
        useState<PurposeFilter>("all");
    const [
        categoryFilter,
        setCategoryFilter,
    ] =
        useState<CategoryFilter>("all");
    const [sort, setSort] =
        useState<SortOption>("saved");
    const [viewMode, setViewMode] =
        useState<ViewMode>("grid");
    const [
        removingIds,
        setRemovingIds,
    ] = useState<Set<string>>(
        new Set(),
    );
    const [
        removedFavorite,
        setRemovedFavorite,
    ] =
        useState<RemovedFavorite | null>(
            null,
        );
    const [undoing, setUndoing] =
        useState(false);

    const loadFavorites = useCallback(
        async (
            signal?: AbortSignal,
        ) => {
            setLoading(true);
            setError("");

            const storedUser =
                getStoredUser();
            const userId =
                getUserId(storedUser);

            if (!storedUser || !userId) {
                setIsLoggedIn(false);
                setLoading(false);
                return;
            }

            setIsLoggedIn(true);

            try {
                const response = await fetch(
                    `/api/user/${userId}/favorites`,
                    {
                        cache: "no-store",
                        credentials: "include",
                        signal,
                    },
                );

                if (signal?.aborted) {
                    return;
                }

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    clearStoredUser();
                    setIsLoggedIn(false);
                    setFavorites([]);
                    return;
                }

                const payload: unknown =
                    await response.json();

                if (signal?.aborted) {
                    return;
                }

                if (
                    !response.ok ||
                    !Array.isArray(payload)
                ) {
                    const message =
                        typeof payload ===
                        "object" &&
                        payload !== null &&
                        "error" in payload &&
                        typeof payload.error ===
                        "string"
                            ? payload.error
                            : "Unable to load your saved properties.";

                    throw new Error(message);
                }

                setFavorites(
                    payload as FavoriteProperty[],
                );
            } catch (caughtError) {
                if (
                    signal?.aborted ||
                    isAbortError(caughtError)
                ) {
                    return;
                }

                setError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : "Unable to load your saved properties.",
                );
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [],
    );

    useEffect(() => {
        const controller =
            new AbortController();

        void loadFavorites(
            controller.signal,
        );

        return () =>
            controller.abort();
    }, [loadFavorites]);

    useEffect(() => {
        if (!removedFavorite) {
            return;
        }

        const timer = window.setTimeout(
            () =>
                setRemovedFavorite(null),
            6000,
        );

        return () =>
            window.clearTimeout(timer);
    }, [removedFavorite]);

    const counts = useMemo(() => {
        return favorites.reduce(
            (current, property) => {
                const category =
                    getPropertyCategory(
                        property,
                    );

                current.total += 1;
                current[category] += 1;

                return current;
            },
            {
                total: 0,
                residential: 0,
                land: 0,
                commercial: 0,
            },
        );
    }, [favorites]);

    const visibleFavorites =
        useMemo(() => {
            const normalizedQuery =
                query.trim().toLowerCase();

            const filtered =
                favorites.filter(
                    (property) => {
                        if (
                            purposeFilter !==
                            "all" &&
                            property.purpose !==
                            purposeFilter
                        ) {
                            return false;
                        }

                        if (
                            categoryFilter !==
                            "all" &&
                            getPropertyCategory(
                                property,
                            ) !== categoryFilter
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
                            first.price -
                            second.price
                        );
                    }

                    if (
                        sort === "price-high"
                    ) {
                        return (
                            second.price -
                            first.price
                        );
                    }

                    if (
                        sort === "area-large"
                    ) {
                        return (
                            second.size -
                            first.size
                        );
                    }

                    if (sort === "newest") {
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

                    return 0;
                },
            );
        }, [
            categoryFilter,
            favorites,
            purposeFilter,
            query,
            sort,
        ]);

    const hasFilters =
        query.trim().length > 0 ||
        purposeFilter !== "all" ||
        categoryFilter !== "all";

    async function toggleFavorite(
        propertyId: string,
    ): Promise<string[]> {
        const storedUser =
            getStoredUser();
        const userId =
            getUserId(storedUser);

        if (!userId) {
            throw new Error(
                "Sign in to update favorites.",
            );
        }

        const response = await fetch(
            `/api/user/${userId}/favorites`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    propertyId,
                }),
            },
        );

        const payload =
            (await response.json()) as
                FavoriteToggleResponse;

        if (!response.ok) {
            throw new Error(
                payload.error ||
                "Unable to update favorites.",
            );
        }

        const favoriteIds =
            Array.isArray(
                payload.favorites,
            )
                ? payload.favorites
                : [];

        updateStoredUserFavorites(
            favoriteIds,
        );

        return favoriteIds;
    }

    async function removeFavorite(
        property: FavoriteProperty,
    ) {
        if (
            removingIds.has(
                property._id,
            )
        ) {
            return;
        }

        setRemovingIds((current) => {
            const next =
                new Set(current);
            next.add(property._id);
            return next;
        });
        setError("");

        try {
            await toggleFavorite(
                property._id,
            );

            setFavorites((current) =>
                current.filter(
                    (item) =>
                        item._id !==
                        property._id,
                ),
            );
            setRemovedFavorite({
                property,
            });
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to remove this favorite.",
            );
        } finally {
            setRemovingIds(
                (current) => {
                    const next =
                        new Set(current);
                    next.delete(property._id);
                    return next;
                },
            );
        }
    }

    async function undoRemoval() {
        if (
            !removedFavorite ||
            undoing
        ) {
            return;
        }

        setUndoing(true);
        setError("");

        try {
            await toggleFavorite(
                removedFavorite.property._id,
            );

            setFavorites((current) => {
                if (
                    current.some(
                        (property) =>
                            property._id ===
                            removedFavorite
                                .property._id,
                    )
                ) {
                    return current;
                }

                return [
                    removedFavorite.property,
                    ...current,
                ];
            });

            setRemovedFavorite(null);
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Unable to restore this favorite.",
            );
        } finally {
            setUndoing(false);
        }
    }

    function clearFilters() {
        setQuery("");
        setPurposeFilter("all");
        setCategoryFilter("all");
        setSort("saved");
    }

    if (
        !loading &&
        isLoggedIn === false
    ) {
        return (
            <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-28 font-body">
                <div className="mx-auto max-w-5xl px-5 sm:px-6">
                    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.1)]">
                        <div className="grid lg:grid-cols-[1fr_0.8fr]">
                            <div className="p-7 sm:p-10">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <Heart
                      size={25}
                      fill="currentColor"
                      aria-hidden="true"
                  />
                </span>

                                <p className="mt-7 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                    Saved properties
                                </p>
                                <h1 className="mt-3 font-heading text-4xl font-black tracking-[-0.04em] text-slate-950">
                                    Keep the properties worth
                                    another look.
                                </h1>
                                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                                    Sign in to save listings,
                                    compare your shortlist and
                                    return to it from any device.
                                </p>

                                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href="/login?redirect=/favorites"
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20"
                                    >
                                        Sign in
                                        <ArrowRight
                                            size={16}
                                            aria-hidden="true"
                                        />
                                    </Link>

                                    <Link
                                        href="/buy"
                                        className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                    >
                                        Browse properties
                                    </Link>
                                </div>
                            </div>

                            <div className="relative overflow-hidden bg-slate-950 p-7 text-white sm:p-10">
                                <div
                                    className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl"
                                    aria-hidden="true"
                                />

                                <div className="relative">
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-300">
                                        Build a shortlist
                                    </p>

                                    <div className="mt-7 space-y-3">
                                        {[
                                            "Save promising listings",
                                            "Revisit price and location",
                                            "Remove options as you decide",
                                        ].map((item) => (
                                            <div
                                                key={item}
                                                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-4"
                                            >
                                                <BookmarkCheck
                                                    size={18}
                                                    className="text-teal-300"
                                                    aria-hidden="true"
                                                />
                                                <span className="text-sm font-bold text-slate-300">
                          {item}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-20 font-body text-slate-950">
            <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 text-white">
                <div
                    className="pointer-events-none absolute -right-32 -top-48 h-[520px] w-[520px] rounded-full bg-teal-500/20 blur-3xl"
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute -bottom-56 left-1/4 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl"
                    aria-hidden="true"
                />

                <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-6 lg:px-8 lg:pb-14 lg:pt-16">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div>

                            <h1 className="mt-5 max-w-3xl font-heading text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-5xl">
                                Saved properties,
                                <span className="block text-teal-300">
                  ready when you are.
                </span>
                            </h1>

                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
                                Search, organize and revisit
                                the homes, plots and commercial
                                spaces that caught your
                                attention.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[510px]">
                            <HeroMetric
                                label="Saved"
                                value={counts.total}
                                icon={Heart}
                                active
                            />
                            <HeroMetric
                                label="Homes"
                                value={
                                    counts.residential
                                }
                                icon={Home}
                            />
                            <HeroMetric
                                label="Land"
                                value={counts.land}
                                icon={MapIcon}
                            />
                            <HeroMetric
                                label="Commercial"
                                value={
                                    counts.commercial
                                }
                                icon={Building2}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
                {error ? (
                    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <AlertTriangle
                                size={19}
                                className="mt-0.5 shrink-0 text-red-600"
                                aria-hidden="true"
                            />
                            <p className="text-sm font-bold leading-6 text-red-700">
                                {error}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                void loadFavorites()
                            }
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-red-700 shadow-sm"
                        >
                            <RefreshCw
                                size={14}
                                aria-hidden="true"
                            />
                            Reload
                        </button>
                    </div>
                ) : null}

                <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_190px_190px_220px_auto]">
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
                                        event.target.value,
                                    )
                                }
                                placeholder="Search address, locality or property type"
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                            />
                        </label>

                        <FilterSelect
                            value={purposeFilter}
                            ariaLabel="Filter by purpose"
                            onChange={(value) =>
                                setPurposeFilter(
                                    value as PurposeFilter,
                                )
                            }
                        >
                            {PURPOSE_OPTIONS.map(
                                (option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ),
                            )}
                        </FilterSelect>

                        <FilterSelect
                            value={categoryFilter}
                            ariaLabel="Filter by category"
                            onChange={(value) =>
                                setCategoryFilter(
                                    value as CategoryFilter,
                                )
                            }
                        >
                            {CATEGORY_OPTIONS.map(
                                (option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ),
                            )}
                        </FilterSelect>

                        <FilterSelect
                            value={sort}
                            ariaLabel="Sort saved properties"
                            onChange={(value) =>
                                setSort(
                                    value as SortOption,
                                )
                            }
                            icon={ArrowUpDown}
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
                        </FilterSelect>

                        <div className="inline-flex h-12 rounded-xl border border-slate-200 bg-slate-50 p-1">
                            <button
                                type="button"
                                onClick={() =>
                                    setViewMode("grid")
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
                                    setViewMode("list")
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

                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-bold text-slate-500">
                            {loading
                                ? "Loading saved properties…"
                                : `${visibleFavorites.length} of ${favorites.length} saved ${
                                    favorites.length === 1
                                        ? "property"
                                        : "properties"
                                }`}
                        </p>

                        <div className="flex items-center gap-3">
                            {hasFilters ? (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-1.5 text-xs font-black text-primary"
                                >
                                    <X
                                        size={14}
                                        aria-hidden="true"
                                    />
                                    Clear filters
                                </button>
                            ) : null}

                            <Link
                                href="/buy"
                                className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700 transition hover:text-primary"
                            >
                                Browse more
                                <ArrowRight
                                    size={14}
                                    aria-hidden="true"
                                />
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="mt-7">
                    {loading ? (
                        <FavoritesSkeleton />
                    ) : favorites.length === 0 ? (
                        <EmptyFavorites />
                    ) : visibleFavorites.length ===
                    0 ? (
                        <NoResults
                            onClear={clearFilters}
                        />
                    ) : (
                        <div
                            className={
                                viewMode === "grid"
                                    ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                                    : "space-y-5"
                            }
                        >
                            {visibleFavorites.map(
                                (property) => (
                                    <PropertyCard
                                        key={property._id}
                                        property={property}
                                        viewMode={
                                            viewMode
                                        }
                                        removing={removingIds.has(
                                            property._id,
                                        )}
                                        onRemove={
                                            removeFavorite
                                        }
                                    />
                                ),
                            )}
                        </div>
                    )}
                </section>
            </div>

            {removedFavorite ? (
                <div
                    role="status"
                    className="fixed bottom-5 left-1/2 z-[1000] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white shadow-[0_24px_70px_rgba(15,23,42,0.35)]"
                >
                    <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
              <Heart
                  size={18}
                  aria-hidden="true"
              />
            </span>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-black">
                                Removed from favorites
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                                {
                                    removedFavorite
                                        .property.address
                                }
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                void undoRemoval()
                            }
                            disabled={undoing}
                            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-slate-950 disabled:opacity-60"
                        >
                            {undoing ? (
                                <Loader2
                                    size={14}
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                            ) : (
                                <RefreshCw
                                    size={14}
                                    aria-hidden="true"
                                />
                            )}
                            Undo
                        </button>
                    </div>
                </div>
            ) : null}
        </main>
    );
}

function HeroMetric({
                        label,
                        value,
                        icon: Icon,
                        active = false,
                    }: {
    label: string;
    value: number;
    icon: typeof Heart;
    active?: boolean;
}) {
    return (
        <div
            className={`rounded-2xl border p-4 ${
                active
                    ? "border-teal-300/30 bg-teal-300 text-slate-950"
                    : "border-white/10 bg-white/[0.055] text-white"
            }`}
        >
            <div className="flex items-center justify-between gap-3">
        <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                active
                    ? "bg-slate-950/10"
                    : "bg-white/10 text-teal-300"
            }`}
        >
          <Icon
              size={16}
              aria-hidden="true"
          />
        </span>

                <span
                    className={`text-2xl font-black ${
                        active
                            ? "text-slate-950"
                            : "text-white"
                    }`}
                >
          {value}
        </span>
            </div>

            <p
                className={`mt-3 text-[9px] font-black uppercase tracking-[0.12em] ${
                    active
                        ? "text-slate-700"
                        : "text-slate-500"
                }`}
            >
                {label}
            </p>
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
    icon?: typeof ArrowUpDown;
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
                    onChange(event.target.value)
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

function EmptyFavorites() {
    return (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[1fr_0.78fr]">
                <div className="p-7 sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Heart
                size={25}
                aria-hidden="true"
            />
          </span>

                    <p className="mt-7 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                        Your shortlist is empty
                    </p>

                    <h2 className="mt-3 max-w-xl font-heading text-3xl font-black tracking-[-0.035em] text-slate-950">
                        Save properties that deserve
                        a second look.
                    </h2>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                        Tap the heart on any listing to
                        collect it here. You can then
                        search, sort and remove options as
                        your shortlist becomes clearer.
                    </p>

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
                </div>

                <div className="relative overflow-hidden bg-slate-950 p-7 text-white sm:p-10">
                    <div
                        className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-teal-500/20 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-teal-300 ring-1 ring-white/10">
              <BookmarkCheck
                  size={21}
                  aria-hidden="true"
              />
            </span>

                        <h3 className="mt-7 text-xl font-black">
                            A focused shortlist helps
                        </h3>

                        <div className="mt-5 space-y-3">
                            {[
                                "Keep locations together",
                                "Recheck pricing later",
                                "Narrow choices without losing them",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.055] p-3"
                                >
                                    <span className="h-2 w-2 rounded-full bg-teal-300" />
                                    <p className="text-xs font-bold text-slate-300">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NoResults({
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

            <h2 className="mt-6 font-heading text-2xl font-black text-slate-950">
                No saved properties match
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Try a different search or clear the
                purpose and category filters.
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
