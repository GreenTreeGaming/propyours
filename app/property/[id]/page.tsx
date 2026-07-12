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
    BadgeCheck,
    Bath,
    BedDouble,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    Expand,
    ExternalLink,
    Eye,
    FileText,
    Heart,
    Home,
    Landmark,
    Layers,
    Loader2,
    Mail,
    Map as MapIcon,
    MapPin,
    MessageCircle,
    Phone,
    RefreshCw,
    Ruler,
    Share2,
    ShieldCheck,
    Sparkles,
    Store,
    Trees,
    UserCircle,
    Video,
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

import EMICalculator from "@/components/EMICalculator";
import PriceNegotiabilityBadge from "@/components/PriceNegotiabilityBadge";
import PropertyAnalyticsModal from "@/components/PropertyAnalyticsModal";
import SharePropertyModal from "@/components/SharePropertyModal";
import {
    useCompare,
} from "@/components/CompareContext";
import {
    getStoredUser,
    updateStoredUserFavorites,
    type StoredUser,
} from "@/lib/browser-user";

type PropertyCategory =
    | "residential"
    | "land"
    | "commercial";

type AnalyticsLevel =
    | "none"
    | "basic"
    | "advanced"
    | "project"
    | "portfolio";

interface FavoriteRecord {
    _id: string;
}

interface PropertyOwner {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    bio?: string;
    company?: string;
    city?: string;
    phone?: string;
}

interface PropertyRecord {
    _id: string;
    address: string;
    images?: string[];
    videoLinks?: string[];
    brochure?: {
        url?: string;
        fileName?: string;
    } | null;
    purpose?: string;
    propertyType?: string;
    commercialType?: string | null;
    bedrooms?: number | null;
    locality?: string;
    city?: string;
    state?: string;
    price?: number;
    priceType?: string;
    negotiable?: boolean;
    bathrooms?: number | null;
    size?: number;
    sizeUnit?: string;
    floors?: number | null;
    description?: string;
    uds?: number | null;
    ownershipType?: string;
    dimensions?: string;
    landmark?: string;
    userId?: PropertyOwner;
    amenities?: string[];
    promotedUntil?: string;
    listingExpiresAt?: string;
    featured?: boolean;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    planSnapshot?: {
        tier?: string;
        homepageFeatured?: boolean;
        rankingLevel?:
            | "standard"
            | "featured"
            | "priority"
            | "top";
        compareVisibility?:
            | "standard"
            | "highlighted"
            | "priority";
        badgeLevel?:
            | "none"
            | "verified"
            | "premium";
        analyticsLevel?: AnalyticsLevel;
    };
}

interface FavoriteTogglePayload {
    favorites?: string[];
    error?: string;
}

interface LeadPayload {
    success?: boolean;
    error?: string;
}

interface DetailItem {
    label: string;
    value: string;
    icon: LucideIcon;
}

interface AmenityGroup {
    title: string;
    items: string[];
}

const FALLBACK_IMAGE =
    "/house1.jpeg";

const SIZE_UNITS = [
    {
        value: "sqft",
        label: "Sq Ft",
    },
    {
        value: "sqyd",
        label: "Sq Yd",
    },
    {
        value: "sqm",
        label: "Sq M",
    },
    {
        value: "acre",
        label: "Acre",
    },
    {
        value: "kanal",
        label: "Kanal",
    },
    {
        value: "marla",
        label: "Marla",
    },
] as const;

const SIZE_FACTORS: Record<
    string,
    number
> = {
    sqft: 1,
    sqyd: 9,
    sqm: 10.7639,
    acre: 43_560,
    kanal: 5_445,
    marla: 272.25,
};

const LAND_PROPERTY_TYPES =
    new Set([
        "Plot",
        "Agricultural Land",
    ]);

const AMENITY_GROUP_RULES: Array<{
    title: string;
    keywords: string[];
}> = [
    {
        title: "Security & access",
        keywords: [
            "security",
            "cctv",
            "intercom",
            "fire",
            "gated",
            "gate",
            "emergency",
            "24x7 access",
            "security cabin",
        ],
    },
    {
        title: "Parking & logistics",
        keywords: [
            "parking",
            "loading",
            "truck",
            "service entry",
            "road facing",
            "main road",
            "goods lift",
            "internal road",
            "approach road",
        ],
    },
    {
        title: "Business & convenience",
        keywords: [
            "internet",
            "reception",
            "conference",
            "pantry",
            "central ac",
            "signage",
            "display window",
            "footfall",
            "mall",
            "ground floor",
            "corner",
            "laundry",
            "servant",
        ],
    },
    {
        title: "Utilities",
        keywords: [
            "power",
            "lift",
            "water",
            "borewell",
            "pipeline",
            "sewage",
            "waste",
            "electricity",
            "drainage",
            "street lights",
            "washroom",
        ],
    },
    {
        title: "Lifestyle & surroundings",
        keywords: [
            "clubhouse",
            "gym",
            "pool",
            "play",
            "jogging",
            "party",
            "library",
            "games",
            "park",
            "garden",
            "vastu",
            "compound",
            "fencing",
            "levelled",
            "farm access",
            "rain water",
        ],
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

function normalizePropertyId(
    value: string | string[] | undefined,
): string | null {
    if (Array.isArray(value)) {
        return value[0] ?? null;
    }

    return value ?? null;
}

function getPropertyCategory(
    property: PropertyRecord,
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
    property: PropertyRecord,
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
    property: PropertyRecord,
): string {
    return [
        property.locality,
        property.city,
        property.state,
    ]
        .filter(Boolean)
        .join(", ");
}

function getFullAddress(
    property: PropertyRecord,
): string {
    return [
        property.address,
        property.locality,
        property.city,
        property.state,
    ]
        .filter(Boolean)
        .join(", ");
}

function getMapsUrl(
    property: PropertyRecord,
): string {
    const query =
        encodeURIComponent(
            getFullAddress(property),
        );

    return `https://www.google.com/maps/search/?api=1&query=${query}`;
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

function formatAreaValue(
    value: number,
    unit: string,
): string {
    const maximumFractionDigits =
        unit === "acre" ? 4 : 2;

    return new Intl.NumberFormat(
        "en-IN",
        {
            maximumFractionDigits,
        },
    ).format(value);
}

function convertSize(
    value: number,
    fromUnit: string,
    toUnit: string,
): number {
    const squareFeet =
        value *
        (SIZE_FACTORS[fromUnit] || 1);

    return (
        squareFeet /
        (SIZE_FACTORS[toUnit] || 1)
    );
}

function isPromoted(
    property: PropertyRecord,
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

function getListingBadges(
    property: PropertyRecord,
): string[] {
    const badges: string[] = [];

    if (
        property.planSnapshot
            ?.badgeLevel === "premium"
    ) {
        badges.push("Premium listing");
    } else if (
        property.planSnapshot
            ?.badgeLevel === "verified"
    ) {
        badges.push("Verified profile");
    }

    if (isPromoted(property)) {
        badges.push("Promoted");
    }

    if (
        property.planSnapshot
            ?.homepageFeatured
    ) {
        badges.push("Homepage featured");
    }

    if (
        property.planSnapshot
            ?.rankingLevel === "top"
    ) {
        badges.push("Top ranked");
    } else if (
        property.planSnapshot
            ?.rankingLevel === "priority"
    ) {
        badges.push("Priority listing");
    }

    return badges;
}

function getVideoEmbedUrl(
    value: string,
): string | null {
    try {
        const url = new URL(value);
        const hostname =
            url.hostname.toLowerCase();

        if (
            hostname === "youtube.com" ||
            hostname ===
            "www.youtube.com"
        ) {
            const videoId =
                url.searchParams.get("v");

            if (videoId) {
                return `https://www.youtube.com/embed/${encodeURIComponent(
                    videoId,
                )}`;
            }

            const segments =
                url.pathname
                    .split("/")
                    .filter(Boolean);

            if (
                segments[0] === "shorts" &&
                segments[1]
            ) {
                return `https://www.youtube.com/embed/${encodeURIComponent(
                    segments[1],
                )}`;
            }
        }

        if (
            hostname === "youtu.be"
        ) {
            const videoId =
                url.pathname
                    .split("/")
                    .filter(Boolean)[0];

            if (videoId) {
                return `https://www.youtube.com/embed/${encodeURIComponent(
                    videoId,
                )}`;
            }
        }

        if (
            hostname === "vimeo.com" ||
            hostname === "www.vimeo.com"
        ) {
            const videoId =
                url.pathname
                    .split("/")
                    .filter(Boolean)[0];

            if (videoId) {
                return `https://player.vimeo.com/video/${encodeURIComponent(
                    videoId,
                )}`;
            }
        }

        return null;
    } catch {
        return null;
    }
}

function groupAmenities(
    amenities: string[],
): AmenityGroup[] {
    const groups = new Map<
        string,
        string[]
    >();
    const uncategorized: string[] =
        [];

    for (const amenity of amenities) {
        const normalized =
            amenity.toLowerCase();

        const matchingRule =
            AMENITY_GROUP_RULES.find(
                (rule) =>
                    rule.keywords.some(
                        (keyword) =>
                            normalized.includes(
                                keyword,
                            ),
                    ),
            );

        if (!matchingRule) {
            uncategorized.push(
                amenity,
            );
            continue;
        }

        const current =
            groups.get(
                matchingRule.title,
            ) ?? [];

        current.push(amenity);
        groups.set(
            matchingRule.title,
            current,
        );
    }

    const result =
        AMENITY_GROUP_RULES.flatMap(
            (rule) => {
                const items =
                    groups.get(rule.title);

                return items &&
                items.length > 0
                    ? [
                        {
                            title: rule.title,
                            items,
                        },
                    ]
                    : [];
            },
        );

    if (
        uncategorized.length > 0
    ) {
        result.push({
            title: "Other features",
            items: uncategorized,
        });
    }

    return result;
}

function getPrimaryDetails(
    property: PropertyRecord,
): DetailItem[] {
    const category =
        getPropertyCategory(property);
    const details: DetailItem[] =
        [];

    if (
        category === "residential"
    ) {
        if (
            property.bedrooms !==
            null &&
            property.bedrooms !==
            undefined
        ) {
            details.push({
                label: "Bedrooms",
                value:
                    property.bedrooms === 0
                        ? "Studio"
                        : `${property.bedrooms} BHK`,
                icon: BedDouble,
            });
        }

        if (
            property.bathrooms !==
            null &&
            property.bathrooms !==
            undefined
        ) {
            details.push({
                label: "Bathrooms",
                value: String(
                    property.bathrooms,
                ),
                icon: Bath,
            });
        }
    }

    if (
        category === "commercial"
    ) {
        if (
            property.bathrooms !==
            null &&
            property.bathrooms !==
            undefined
        ) {
            details.push({
                label: "Washrooms",
                value: String(
                    property.bathrooms,
                ),
                icon: Bath,
            });
        }

        if (
            property.floors !==
            null &&
            property.floors !==
            undefined
        ) {
            details.push({
                label: "Total floors",
                value: String(
                    property.floors,
                ),
                icon: Building2,
            });
        }
    }

    if (
        category === "land" &&
        property.dimensions
    ) {
        details.push({
            label: "Dimensions",
            value:
            property.dimensions,
            icon: MapIcon,
        });
    }

    if (
        category !== "commercial" &&
        category !== "land" &&
        property.floors !==
        null &&
        property.floors !==
        undefined
    ) {
        details.push({
            label: "Total floors",
            value: String(
                property.floors,
            ),
            icon: Layers,
        });
    }

    if (property.ownershipType) {
        details.push({
            label: "Ownership",
            value:
            property.ownershipType,
            icon: Landmark,
        });
    }

    return details.slice(0, 4);
}

function getFactRows(
    property: PropertyRecord,
): Array<{
    label: string;
    value: string;
}> {
    const rows: Array<{
        label: string;
        value: string;
    }> = [
        {
            label: "Listing purpose",
            value: getPurposeLabel(
                property.purpose,
            ),
        },
        {
            label: "Property type",
            value:
                getPropertyTypeLabel(
                    property,
                ),
        },
    ];

    if (property.priceType) {
        rows.push({
            label: "Price type",
            value:
            property.priceType,
        });
    }

    if (property.ownershipType) {
        rows.push({
            label: "Ownership",
            value:
            property.ownershipType,
        });
    }

    if (
        property.uds !== null &&
        property.uds !== undefined
    ) {
        rows.push({
            label: "UDS",
            value: `${new Intl.NumberFormat(
                "en-IN",
            ).format(
                property.uds,
            )} sq ft`,
        });
    }

    if (property.dimensions) {
        rows.push({
            label: "Dimensions",
            value:
            property.dimensions,
        });
    }

    if (property.landmark) {
        rows.push({
            label: "Nearby landmark",
            value:
            property.landmark,
        });
    }

    const listedDate =
        formatDate(property.createdAt);

    if (listedDate) {
        rows.push({
            label: "Listed on",
            value: listedDate,
        });
    }

    return rows;
}

function getWhatsAppUrl(
    phone: string,
    property: PropertyRecord,
): string {
    const digits =
        phone.replace(/\D/g, "");

    const message =
        encodeURIComponent(
            `Hi, I am interested in the ${getPropertyTypeLabel(
                property,
            )} at ${getFullAddress(
                property,
            )} listed on PropYours.`,
        );

    return `https://wa.me/${digits}?text=${message}`;
}

function PropertyPageSkeleton() {
    return (
        <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-24">
            <div className="mx-auto max-w-7xl space-y-7 px-5 sm:px-6 lg:px-8">
                <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />

                <div className="grid h-[520px] gap-3 md:grid-cols-[2fr_1fr]">
                    <div className="animate-pulse rounded-[2rem] bg-slate-200" />
                    <div className="hidden gap-3 md:grid">
                        <div className="animate-pulse rounded-[2rem] bg-slate-200" />
                        <div className="animate-pulse rounded-[2rem] bg-slate-200" />
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <div className="h-72 animate-pulse rounded-[2rem] bg-white" />
                        <div className="h-64 animate-pulse rounded-[2rem] bg-white" />
                        <div className="h-80 animate-pulse rounded-[2rem] bg-white" />
                    </div>
                    <div className="h-[520px] animate-pulse rounded-[2rem] bg-white" />
                </div>
            </div>
        </main>
    );
}

export default function PropertyDetailsPage() {
    const params = useParams<{
        id?: string | string[];
    }>();
    const router = useRouter();
    const propertyId =
        normalizePropertyId(
            params?.id,
        );

    const {
        compareList,
        addToCompare,
        removeFromCompare,
    } = useCompare();

    const [property, setProperty] =
        useState<PropertyRecord | null>(
            null,
        );
    const [loading, setLoading] =
        useState(true);
    const [loadError, setLoadError] =
        useState("");
    const [
        contactError,
        setContactError,
    ] = useState("");
    const [
        favoriteError,
        setFavoriteError,
    ] = useState("");
    const [
        favoriteLoading,
        setFavoriteLoading,
    ] = useState(false);
    const [isFavorite, setIsFavorite] =
        useState(false);
    const [shareOpen, setShareOpen] =
        useState(false);
    const [
        analyticsOpen,
        setAnalyticsOpen,
    ] = useState(false);
    const [
        selectedImageIndex,
        setSelectedImageIndex,
    ] = useState<number | null>(
        null,
    );
    const [
        displayUnit,
        setDisplayUnit,
    ] = useState("sqft");
    const [showPhone, setShowPhone] =
        useState(false);
    const [
        contactLoading,
        setContactLoading,
    ] = useState<
        "phone" | "email" | "whatsapp" | null
    >(null);
    const [shareUrl, setShareUrl] =
        useState("");
    const [isOwner, setIsOwner] =
        useState(false);

    const loadProperty = useCallback(
        async (
            signal?: AbortSignal,
        ) => {
            if (!propertyId) {
                setLoadError(
                    "Property not found.",
                );
                setLoading(false);
                return;
            }

            setLoading(true);
            setLoadError("");

            try {
                const response = await fetch(
                    `/api/property/${propertyId}`,
                    {
                        cache: "no-store",
                        credentials: "include",
                        signal,
                    },
                );

                if (signal?.aborted) {
                    return;
                }

                const payload: unknown =
                    await response.json();

                if (signal?.aborted) {
                    return;
                }

                if (
                    !response.ok ||
                    typeof payload !==
                    "object" ||
                    payload === null
                ) {
                    const message =
                        typeof payload ===
                        "object" &&
                        payload !== null &&
                        "error" in payload &&
                        typeof payload.error ===
                        "string"
                            ? payload.error
                            : "Property not found.";

                    throw new Error(message);
                }

                const nextProperty =
                    payload as PropertyRecord;

                setProperty(nextProperty);
                setDisplayUnit(
                    nextProperty.sizeUnit ||
                    "sqft",
                );
            } catch (error) {
                if (
                    signal?.aborted ||
                    isAbortError(error)
                ) {
                    return;
                }

                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load this property.",
                );
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [propertyId],
    );

    useEffect(() => {
        const controller =
            new AbortController();

        void loadProperty(
            controller.signal,
        );

        return () =>
            controller.abort();
    }, [loadProperty]);

    useEffect(() => {
        if (
            !property ||
            !propertyId
        ) {
            return;
        }

        const user =
            getStoredUser();
        const userId =
            getUserId(user);

        setIsOwner(
            Boolean(
                userId &&
                property.userId?._id ===
                userId,
            ),
        );
    }, [
        property,
        propertyId,
    ]);

    useEffect(() => {
        if (
            !propertyId ||
            !property
        ) {
            return;
        }

        const sessionKey =
            `viewed-property-${propertyId}`;

        if (
            sessionStorage.getItem(
                sessionKey,
            )
        ) {
            return;
        }

        sessionStorage.setItem(
            sessionKey,
            "true",
        );

        void fetch(
            `/api/property/${propertyId}/analytics`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    type: "view",
                }),
            },
        ).catch((error) => {
            console.error(
                "Failed to record property view:",
                error,
            );
        });
    }, [
        property,
        propertyId,
    ]);

    useEffect(() => {
        if (!propertyId) {
            return;
        }

        const currentPropertyId = propertyId;

        const user = getStoredUser();

        if (
            user?.favorites?.includes(
                currentPropertyId,
            )
        ) {
            setIsFavorite(true);
        }

        const userId =
            getUserId(user);

        if (!userId) {
            return;
        }

        const controller =
            new AbortController();

        async function syncFavorites() {
            try {
                const response =
                    await fetch(
                        `/api/user/${userId}/favorites`,
                        {
                            cache: "no-store",
                            credentials: "include",
                            signal:
                            controller.signal,
                        },
                    );

                if (
                    !response.ok ||
                    controller.signal.aborted
                ) {
                    return;
                }

                const payload: unknown =
                    await response.json();

                if (
                    controller.signal.aborted ||
                    !Array.isArray(payload)
                ) {
                    return;
                }

                const favoriteIds =
                    (
                        payload as FavoriteRecord[]
                    ).map(
                        (favorite) =>
                            favorite._id,
                    );

                updateStoredUserFavorites(
                    favoriteIds,
                );

                setIsFavorite(
                    favoriteIds.includes(
                        currentPropertyId,
                    ),
                );
            } catch (error) {
                if (
                    !controller.signal.aborted &&
                    !isAbortError(error)
                ) {
                    console.error(
                        "Failed to sync favorite state:",
                        error,
                    );
                }
            }
        }

        void syncFavorites();

        return () =>
            controller.abort();
    }, [propertyId]);

    useEffect(() => {
        if (
            typeof window ===
            "undefined" ||
            !propertyId
        ) {
            return;
        }

        setShareUrl(
            `${window.location.origin}/property/${propertyId}`,
        );
    }, [propertyId]);

    useEffect(() => {
        if (
            selectedImageIndex ===
            null
        ) {
            return;
        }

        const previousOverflow =
            document.body.style
                .overflow;
        document.body.style.overflow =
            "hidden";

        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (event.key === "Escape") {
                setSelectedImageIndex(
                    null,
                );
            }

            if (
                event.key ===
                "ArrowLeft"
            ) {
                setSelectedImageIndex(
                    (current) => {
                        if (
                            current === null ||
                            propertyImages.length ===
                            0
                        ) {
                            return current;
                        }

                        return current === 0
                            ? propertyImages.length -
                            1
                            : current - 1;
                    },
                );
            }

            if (
                event.key ===
                "ArrowRight"
            ) {
                setSelectedImageIndex(
                    (current) => {
                        if (
                            current === null ||
                            propertyImages.length ===
                            0
                        ) {
                            return current;
                        }

                        return current ===
                        propertyImages.length -
                        1
                            ? 0
                            : current + 1;
                    },
                );
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    });

    const propertyImages =
        useMemo(() => {
            const images =
                property?.images?.filter(
                    Boolean,
                ) ?? [];

            return images.length > 0
                ? images
                : [FALLBACK_IMAGE];
        }, [property?.images]);

    const category = property
        ? getPropertyCategory(
            property,
        )
        : "residential";

    const typeLabel = property
        ? getPropertyTypeLabel(
            property,
        )
        : "Property";

    const locationLabel = property
        ? getLocationLabel(property)
        : "";

    const badges = useMemo(
        () =>
            property
                ? getListingBadges(
                    property,
                )
                : [],
        [property],
    );

    const primaryDetails =
        useMemo(
            () =>
                property
                    ? getPrimaryDetails(
                        property,
                    )
                    : [],
            [property],
        );

    const factRows = useMemo(
        () =>
            property
                ? getFactRows(property)
                : [],
        [property],
    );

    const amenityGroups =
        useMemo(
            () =>
                groupAmenities(
                    property?.amenities ?? [],
                ),
            [property?.amenities],
        );

    const videoEmbeds =
        useMemo(
            () =>
                (
                    property?.videoLinks ??
                    []
                )
                    .map((url) => ({
                        sourceUrl: url,
                        embedUrl:
                            getVideoEmbedUrl(
                                url,
                            ),
                    }))
                    .filter(
                        (
                            video,
                        ): video is {
                            sourceUrl: string;
                            embedUrl: string;
                        } =>
                            Boolean(
                                video.embedUrl,
                            ),
                    ),
            [property?.videoLinks],
        );

    const displayedArea =
        useMemo(() => {
            if (
                !property?.size
            ) {
                return null;
            }

            const converted =
                convertSize(
                    property.size,
                    property.sizeUnit ||
                    "sqft",
                    displayUnit,
                );

            return formatAreaValue(
                converted,
                displayUnit,
            );
        }, [
            displayUnit,
            property?.size,
            property?.sizeUnit,
        ]);

    const isInCompare =
        property
            ? compareList.some(
                (item) =>
                    item._id ===
                    property._id,
            )
            : false;

    function redirectToLogin() {
        const redirect =
            propertyId
                ? `/property/${propertyId}`
                : "/buy";

        router.push(
            `/login?redirect=${encodeURIComponent(
                redirect,
            )}`,
        );
    }

    async function createLead(
        source:
            | "phone"
            | "email"
            | "whatsapp"
            | "favorite",
    ): Promise<boolean> {
        if (!propertyId) {
            return false;
        }

        const user =
            getStoredUser();

        if (!getUserId(user)) {
            redirectToLogin();
            return false;
        }

        const response = await fetch(
            `/api/property/${propertyId}/lead`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    source,
                }),
            },
        );

        const payload =
            (await response.json()) as
                LeadPayload;

        if (response.status === 401) {
            redirectToLogin();
            return false;
        }

        if (!response.ok) {
            throw new Error(
                payload.error ||
                "Unable to contact this seller.",
            );
        }

        return true;
    }

    async function recordPhoneClick() {
        if (!propertyId) {
            return;
        }

        await fetch(
            `/api/property/${propertyId}/analytics`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    type: "phoneClick",
                }),
            },
        );
    }

    async function handleFavoriteToggle() {
        if (
            !propertyId ||
            favoriteLoading
        ) {
            return;
        }

        const user =
            getStoredUser();
        const userId =
            getUserId(user);

        if (!userId) {
            redirectToLogin();
            return;
        }

        setFavoriteLoading(true);
        setFavoriteError("");

        try {
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
                    FavoriteTogglePayload;

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

            const nextIsFavorite =
                favoriteIds.includes(
                    propertyId,
                );

            setIsFavorite(
                nextIsFavorite,
            );

            if (nextIsFavorite) {
                try {
                    await createLead(
                        "favorite",
                    );
                } catch (error) {
                    console.error(
                        "Favorite saved, but lead creation failed:",
                        error,
                    );
                }
            }
        } catch (error) {
            setFavoriteError(
                error instanceof Error
                    ? error.message
                    : "Unable to update favorites.",
            );
        } finally {
            setFavoriteLoading(false);
        }
    }

    function handleCompareToggle() {
        if (!property) {
            return;
        }

        if (isInCompare) {
            removeFromCompare(
                property._id,
            );
            return;
        }

        addToCompare({
            _id: property._id,
            address:
            property.address,
            images:
                property.images ?? [],
            price:
                property.price ?? 0,
            negotiable:
            property.negotiable,
            size:
                property.size ?? 0,
            sizeUnit:
                property.sizeUnit ??
                "sqft",
            propertyType:
                property.propertyType ??
                "Residential",
            bedrooms:
                property.bedrooms ??
                undefined,
            bathrooms:
                property.bathrooms ??
                undefined,
            locality:
            property.locality,
            city: property.city,
            amenities:
                property.amenities ??
                [],
            ownershipType:
            property.ownershipType,
            planSnapshot:
            property.planSnapshot,
        });
    }

    async function handlePhone() {
        if (
            !property ||
            contactLoading
        ) {
            return;
        }

        if (isOwner) {
            setShowPhone(true);
            return;
        }

        setContactLoading("phone");
        setContactError("");

        try {
            const leadCreated =
                await createLead("phone");

            if (!leadCreated) {
                return;
            }

            await recordPhoneClick();
            setShowPhone(true);
        } catch (error) {
            setContactError(
                error instanceof Error
                    ? error.message
                    : "Unable to reveal the phone number.",
            );
        } finally {
            setContactLoading(null);
        }
    }

    async function handleEmail() {
        if (
            !property ||
            !property.userId?.email ||
            contactLoading
        ) {
            return;
        }

        if (isOwner) {
            window.location.href =
                `mailto:${property.userId.email}`;
            return;
        }

        setContactLoading("email");
        setContactError("");

        try {
            const leadCreated =
                await createLead("email");

            if (!leadCreated) {
                return;
            }

            window.location.href =
                `mailto:${property.userId.email}`;
        } catch (error) {
            setContactError(
                error instanceof Error
                    ? error.message
                    : "Unable to start an email.",
            );
        } finally {
            setContactLoading(null);
        }
    }

    async function handleWhatsApp() {
        if (
            !property ||
            !property.userId?.phone ||
            contactLoading
        ) {
            return;
        }

        if (!isOwner) {
            setContactLoading(
                "whatsapp",
            );
            setContactError("");

            try {
                const leadCreated =
                    await createLead(
                        "whatsapp",
                    );

                if (!leadCreated) {
                    return;
                }
            } catch (error) {
                setContactError(
                    error instanceof Error
                        ? error.message
                        : "Unable to open WhatsApp.",
                );
                return;
            } finally {
                setContactLoading(null);
            }
        }

        window.location.href =
            getWhatsAppUrl(
                property.userId.phone,
                property,
            );
    }

    if (loading) {
        return (
            <PropertyPageSkeleton />
        );
    }

    if (
        loadError ||
        !property
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6] px-5 py-28 font-body">
                <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-center shadow-[0_28px_80px_rgba(15,23,42,0.1)]">
                    <div className="bg-slate-950 p-8 text-white">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
              <AlertTriangle
                  size={25}
                  aria-hidden="true"
              />
            </span>

                        <h1 className="mt-6 font-heading text-3xl font-black tracking-[-0.035em]">
                            Property unavailable
                        </h1>

                        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
                            {loadError ||
                                "This property could not be found. It may have expired, been removed or no longer be public."}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-center">
                        <button
                            type="button"
                            onClick={() =>
                                void loadProperty()
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
                            href="/buy"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20"
                        >
                            Browse properties
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

    const categoryLabel =
        category === "commercial"
            ? "Commercial"
            : category === "land"
                ? "Land & plots"
                : "Residential";
    const CategoryIcon =
        category === "commercial"
            ? Store
            : category === "land"
                ? Trees
                : Home;
    const listedDate =
        formatDate(
            property.createdAt,
        );

    return (
        <main className="min-h-screen bg-[#f5f7f6] pb-28 pt-20 font-body text-slate-950 lg:pb-20">
            <div className="mx-auto max-w-7xl px-5 pt-7 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href="/buy"
                        className="inline-flex w-fit items-center gap-2 text-sm font-black text-slate-600 transition hover:text-primary"
                    >
                        <ArrowLeft
                            size={17}
                            aria-hidden="true"
                        />
                        Back to property search
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                        <ActionButton
                            label={
                                isInCompare
                                    ? "Comparing"
                                    : "Compare"
                            }
                            icon={Layers}
                            active={isInCompare}
                            onClick={
                                handleCompareToggle
                            }
                        />

                        <ActionButton
                            label="Share"
                            icon={Share2}
                            onClick={() =>
                                setShareOpen(true)
                            }
                        />

                        <button
                            type="button"
                            onClick={() =>
                                void handleFavoriteToggle()
                            }
                            disabled={
                                favoriteLoading
                            }
                            className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-xs font-black transition ${
                                isFavorite
                                    ? "border-red-100 bg-red-50 text-red-600"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:text-red-600"
                            } disabled:cursor-wait disabled:opacity-60`}
                        >
                            {favoriteLoading ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                            ) : (
                                <Heart
                                    size={16}
                                    fill={
                                        isFavorite
                                            ? "currentColor"
                                            : "none"
                                    }
                                    aria-hidden="true"
                                />
                            )}
                            {isFavorite
                                ? "Saved"
                                : "Save"}
                        </button>

                        {isOwner ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setAnalyticsOpen(true)
                                }
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-black text-white shadow-lg shadow-primary/20"
                            >
                                <Eye
                                    size={16}
                                    aria-hidden="true"
                                />
                                Analytics
                            </button>
                        ) : null}
                    </div>
                </div>

                {favoriteError ? (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
                        <AlertTriangle
                            size={18}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />
                        <p className="text-sm font-bold">
                            {favoriteError}
                        </p>
                    </div>
                ) : null}

                <section className="mt-6">
                    <PropertyGallery
                        images={propertyImages}
                        address={
                            property.address
                        }
                        onOpen={
                            setSelectedImageIndex
                        }
                    />
                </section>

                <section className="relative z-10 -mt-6 px-2 sm:px-5 lg:px-8">
                    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_75px_rgba(15,23,42,0.13)]">
                        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
                            <div className="p-5 sm:p-7 lg:p-8">
                                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                    {getPurposeLabel(
                        property.purpose,
                    )}
                  </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-600">
                    <CategoryIcon
                        size={11}
                        aria-hidden="true"
                    />
                                        {categoryLabel}
                  </span>

                                    {badges.map(
                                        (badge) => (
                                            <ListingBadge
                                                key={badge}
                                                label={badge}
                                            />
                                        ),
                                    )}
                                </div>

                                <h1 className="mt-5 max-w-4xl font-heading text-3xl font-black leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                                    {property.address}
                                </h1>

                                <p className="mt-3 text-lg font-bold text-slate-500 sm:text-xl">
                                    {category ===
                                    "residential" &&
                                    property.bedrooms !==
                                    null &&
                                    property.bedrooms !==
                                    undefined
                                        ? property.bedrooms ===
                                        0
                                            ? `Studio ${typeLabel}`
                                            : `${property.bedrooms} BHK ${typeLabel}`
                                        : typeLabel}
                                    {locationLabel
                                        ? ` in ${locationLabel}`
                                        : ""}
                                </p>

                                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-slate-500">
                                    {locationLabel ? (
                                        <span className="inline-flex items-center gap-1.5">
                      <MapPin
                          size={14}
                          className="text-primary"
                          aria-hidden="true"
                      />
                                            {locationLabel}
                    </span>
                                    ) : null}

                                    {listedDate ? (
                                        <span className="inline-flex items-center gap-1.5">
                      <CalendarDays
                          size={14}
                          className="text-primary"
                          aria-hidden="true"
                      />
                      Listed {listedDate}
                    </span>
                                    ) : null}

                                    <span className="inline-flex items-center gap-1.5">
                    <BadgeCheck
                        size={14}
                        className="text-primary"
                        aria-hidden="true"
                    />
                    Listing ID{" "}
                                        {property._id
                                            .slice(-6)
                                            .toUpperCase()}
                  </span>
                                </div>
                            </div>

                            <div className="relative overflow-hidden bg-slate-950 p-5 text-white sm:p-7 lg:p-8">
                                <div
                                    className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-500/20 blur-3xl"
                                    aria-hidden="true"
                                />

                                <div className="relative">
                                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-teal-300">
                                        {property.purpose ===
                                        "Rent"
                                            ? "Listed rent"
                                            : "Asking price"}
                                    </p>

                                    <p className="mt-3 text-4xl font-black tracking-[-0.04em] text-white lg:text-5xl">
                                        {formatPrice(
                                            property.price,
                                        )}
                                    </p>

                                    {property.priceType ? (
                                        <p className="mt-2 text-xs font-bold text-slate-400">
                                            {
                                                property.priceType
                                            }
                                        </p>
                                    ) : null}

                                    <PriceNegotiabilityBadge
                                        negotiable={
                                            property.negotiable
                                        }
                                        className="mt-4"
                                    />

                                    <div className="mt-7 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.055] p-4">
                                        <ShieldCheck
                                            size={19}
                                            className="shrink-0 text-teal-300"
                                            aria-hidden="true"
                                        />
                                        <p className="text-xs leading-5 text-slate-400">
                                            Inspect the property and
                                            verify documents before
                                            making any payment.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-5">
                            <AreaDetail
                                property={property}
                                displayUnit={
                                    displayUnit
                                }
                                displayedArea={
                                    displayedArea
                                }
                                onUnitChange={
                                    setDisplayUnit
                                }
                            />

                            {primaryDetails.map(
                                (detail) => (
                                    <SummaryDetail
                                        key={detail.label}
                                        {...detail}
                                    />
                                ),
                            )}
                        </div>
                    </div>
                </section>

                <nav
                    aria-label="Property detail sections"
                    className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
                >
                    <div className="flex min-w-max gap-1">
                        {[
                            {
                                href: "#overview",
                                label: "Overview",
                            },
                            {
                                href: "#details",
                                label: "Property details",
                            },
                            {
                                href: "#amenities",
                                label: "Amenities",
                            },
                            ...(videoEmbeds.length >
                            0
                                ? [
                                    {
                                        href: "#media",
                                        label: "Videos",
                                    },
                                ]
                                : []),
                            ...(property.purpose ===
                            "Sell" &&
                            (property.price ?? 0) >
                            0
                                ? [
                                    {
                                        href: "#finance",
                                        label: "EMI estimate",
                                    },
                                ]
                                : []),
                        ].map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="rounded-xl px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-teal-50 hover:text-primary"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </nav>

                <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_370px]">
                    <div className="min-w-0 space-y-7">
                        <section
                            id="overview"
                            className="scroll-mt-28 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8"
                        >
                            <SectionHeading
                                eyebrow="Property overview"
                                title="About this property"
                                description="The key context supplied by the person who published this listing."
                                icon={Building2}
                            />

                            {property.description ? (
                                <p className="mt-6 whitespace-pre-line text-[15px] leading-8 text-slate-600">
                                    {
                                        property.description
                                    }
                                </p>
                            ) : (
                                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                                    No additional description
                                    was provided for this
                                    property.
                                </div>
                            )}

                            <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                <a
                                    href={getMapsUrl(
                                        property,
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group relative overflow-hidden rounded-2xl border border-teal-100 bg-teal-50 p-5 transition hover:border-primary"
                                >
                                    <div
                                        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10"
                                        aria-hidden="true"
                                    />

                                    <div className="relative flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                      <MapPin
                          size={19}
                          aria-hidden="true"
                      />
                    </span>

                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-primary">
                                                Location
                                            </p>
                                            <p className="mt-2 text-sm font-black leading-6 text-slate-950">
                                                {getFullAddress(
                                                    property,
                                                )}
                                            </p>
                                            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-primary">
                        Open in Maps
                        <ExternalLink
                            size={13}
                            aria-hidden="true"
                        />
                      </span>
                                        </div>
                                    </div>
                                </a>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                      <Landmark
                          size={19}
                          aria-hidden="true"
                      />
                    </span>

                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                                                Nearby landmark
                                            </p>
                                            <p className="mt-2 text-sm font-black leading-6 text-slate-950">
                                                {property.landmark ||
                                                    "No landmark provided"}
                                            </p>
                                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                                Confirm the exact
                                                entrance and access
                                                route with the owner
                                                before visiting.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section
                            id="details"
                            className="scroll-mt-28 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8"
                        >
                            <SectionHeading
                                eyebrow={`${categoryLabel} facts`}
                                title="Property details"
                                description="Structured listing information for easier comparison."
                                icon={
                                    category ===
                                    "commercial"
                                        ? Store
                                        : category ===
                                        "land"
                                            ? MapIcon
                                            : Home
                                }
                            />

                            <div className="mt-7 grid gap-x-10 md:grid-cols-2">
                                {factRows.map(
                                    (row) => (
                                        <FactRow
                                            key={row.label}
                                            label={row.label}
                                            value={row.value}
                                        />
                                    ),
                                )}
                            </div>
                        </section>

                        <section
                            id="amenities"
                            className="scroll-mt-28 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8"
                        >
                            <SectionHeading
                                eyebrow={
                                    category ===
                                    "commercial"
                                        ? "Business features"
                                        : category ===
                                        "land"
                                            ? "Land features"
                                            : "Amenities"
                                }
                                title="What the listing includes"
                                description="Facilities marked as available by the listing owner."
                                icon={CheckCircle2}
                            />

                            {amenityGroups.length >
                            0 ? (
                                <div className="mt-7 space-y-7">
                                    {amenityGroups.map(
                                        (group) => (
                                            <div
                                                key={
                                                    group.title
                                                }
                                            >
                                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                                    {
                                                        group.title
                                                    }
                                                </p>

                                                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                    {group.items.map(
                                                        (
                                                            amenity,
                                                        ) => (
                                                            <div
                                                                key={
                                                                    amenity
                                                                }
                                                                className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                                                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                                  <Check
                                      size={
                                          14
                                      }
                                      aria-hidden="true"
                                  />
                                </span>
                                                                <span className="text-xs font-bold leading-5 text-slate-700">
                                  {
                                      amenity
                                  }
                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-500">
                                    No amenities or special
                                    features were selected for
                                    this listing.
                                </div>
                            )}
                        </section>

                        {videoEmbeds.length > 0 ? (
                            <section
                                id="media"
                                className="scroll-mt-28 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8"
                            >
                                <SectionHeading
                                    eyebrow="Property media"
                                    title="Video walkthroughs"
                                    description="Tours and supporting videos uploaded with the listing."
                                    icon={Video}
                                />

                                <div className="mt-7 grid gap-5">
                                    {videoEmbeds.map(
                                        (
                                            video,
                                            index,
                                        ) => (
                                            <div
                                                key={`${video.sourceUrl}-${index}`}
                                                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm"
                                            >
                                                <div className="aspect-video">
                                                    <iframe
                                                        src={
                                                            video.embedUrl
                                                        }
                                                        title={`Property video ${index + 1}`}
                                                        className="h-full w-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </section>
                        ) : null}

                        {property.brochure?.url ? (
                            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                <div className="grid lg:grid-cols-[minmax(0,1fr)_260px]">
                                    <div className="p-5 sm:p-7 lg:p-8">
                                        <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-primary">
                        <FileText
                            size={21}
                            aria-hidden="true"
                        />
                      </span>

                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                    Supporting document
                                                </p>
                                                <h2 className="mt-2 font-heading text-2xl font-black tracking-[-0.03em] text-slate-950">
                                                    Property brochure
                                                </h2>
                                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                                    {property
                                                            .brochure
                                                            .fileName ||
                                                        "View the brochure supplied with this listing."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-slate-950 p-5 sm:p-7">
                                        <a
                                            href={
                                                property.brochure
                                                    .url
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-teal-50"
                                        >
                                            <Download
                                                size={17}
                                                aria-hidden="true"
                                            />
                                            Open brochure
                                        </a>
                                    </div>
                                </div>
                            </section>
                        ) : null}

                        {property.purpose ===
                        "Sell" &&
                        (property.price ?? 0) >
                        0 ? (
                            <section
                                id="finance"
                                className="scroll-mt-28"
                            >
                                <EMICalculator
                                    propertyPrice={
                                        property.price ??
                                        0
                                    }
                                />
                            </section>
                        ) : null}
                    </div>

                    <aside className="lg:sticky lg:top-28">
                        <ContactCard
                            property={property}
                            isOwner={isOwner}
                            showPhone={showPhone}
                            contactLoading={
                                contactLoading
                            }
                            contactError={
                                contactError
                            }
                            onPhone={() =>
                                void handlePhone()
                            }
                            onEmail={() =>
                                void handleEmail()
                            }
                            onWhatsApp={() =>
                                void handleWhatsApp()
                            }
                            onAnalytics={() =>
                                setAnalyticsOpen(true)
                            }
                        />
                    </aside>
                </div>
            </div>

            {!isOwner ? (
                <MobileContactBar
                    property={property}
                    contactLoading={
                        contactLoading
                    }
                    onPhone={() =>
                        void handlePhone()
                    }
                    onWhatsApp={() =>
                        void handleWhatsApp()
                    }
                />
            ) : null}

            <AnimatePresence>
                {selectedImageIndex !==
                null ? (
                    <ImageViewer
                        images={propertyImages}
                        address={
                            property.address
                        }
                        selectedIndex={
                            selectedImageIndex
                        }
                        onClose={() =>
                            setSelectedImageIndex(
                                null,
                            )
                        }
                        onChange={
                            setSelectedImageIndex
                        }
                    />
                ) : null}
            </AnimatePresence>

            <SharePropertyModal
                isOpen={shareOpen}
                onClose={() =>
                    setShareOpen(false)
                }
                propertyTitle={
                    property.address
                }
                shareUrl={shareUrl}
            />

            <PropertyAnalyticsModal
                isOpen={analyticsOpen}
                onClose={() =>
                    setAnalyticsOpen(false)
                }
                property={property}
            />
        </main>
    );
}

function PropertyGallery({
                             images,
                             address,
                             onOpen,
                         }: {
    images: string[];
    address: string;
    onOpen: (index: number) => void;
}) {
    const imageCount = images.length;
    const isSingleImage =
        imageCount === 1;
    const isTwoImageGallery =
        imageCount === 2;
    const secondaryImages =
        images.slice(1, 3);

    const galleryLayout =
        isSingleImage
            ? "relative h-[430px] overflow-hidden rounded-[2rem] bg-slate-200 md:h-[580px]"
            : `relative grid h-[430px] gap-3 overflow-hidden rounded-[2rem] bg-slate-200 md:h-[540px] ${
                isTwoImageGallery
                    ? "md:grid-cols-[1.55fr_1fr]"
                    : "md:grid-cols-[2fr_1fr]"
            }`;

    return (
        <div className={galleryLayout}>
            <button
                type="button"
                onClick={() => onOpen(0)}
                className="group relative h-full min-h-0 w-full overflow-hidden text-left"
                aria-label="Open main property photo"
            >
                <Image
                    src={images[0]}
                    alt={address}
                    fill
                    priority
                    sizes={
                        isSingleImage
                            ? "100vw"
                            : "(max-width: 768px) 100vw, 67vw"
                    }
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
            </button>

            {!isSingleImage ? (
                <div
                    className={`hidden min-h-0 gap-3 md:grid ${
                        isTwoImageGallery
                            ? "md:grid-rows-1"
                            : "md:grid-rows-2"
                    }`}
                >
                    {secondaryImages.map(
                        (image, index) => (
                            <button
                                key={`${image}-${index}`}
                                type="button"
                                onClick={() =>
                                    onOpen(index + 1)
                                }
                                className="group relative min-h-0 overflow-hidden text-left"
                                aria-label={`Open property photo ${index + 2}`}
                            >
                                <Image
                                    src={image}
                                    alt={`${address} photo ${index + 2}`}
                                    fill
                                    sizes="33vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                                />

                                {index === 1 &&
                                imageCount > 3 ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-[1px]">
                    <span className="text-center text-white">
                      <span className="block text-4xl font-black">
                        +
                          {imageCount - 3}
                      </span>
                      <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">
                        More photos
                      </span>
                    </span>
                                    </div>
                                ) : null}
                            </button>
                        ),
                    )}
                </div>
            ) : null}

            <button
                type="button"
                onClick={() => onOpen(0)}
                className="absolute bottom-5 right-5 inline-flex h-11 items-center gap-2 rounded-xl border border-white/35 bg-white/95 px-4 text-xs font-black text-slate-950 shadow-lg backdrop-blur transition hover:bg-white"
            >
                <Expand
                    size={15}
                    aria-hidden="true"
                />
                {isSingleImage
                    ? "View photo"
                    : `View all ${imageCount} photos`}
            </button>
        </div>
    );
}

function ActionButton({
                          label,
                          icon: Icon,
                          active = false,
                          onClick,
                      }: {
    label: string;
    icon: LucideIcon;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-xs font-black transition ${
                active
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/15"
                    : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary"
            }`}
        >
            <Icon
                size={16}
                aria-hidden="true"
            />
            {label}
        </button>
    );
}

function ListingBadge({
                          label,
                      }: {
    label: string;
}) {
    const promoted =
        label === "Promoted";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.11em] ${
                promoted
                    ? "border-amber-200 bg-amber-100 text-amber-800"
                    : "border-teal-100 bg-teal-50 text-primary"
            }`}
        >
      {promoted ? (
          <Sparkles
              size={11}
              aria-hidden="true"
          />
      ) : (
          <BadgeCheck
              size={11}
              aria-hidden="true"
          />
      )}
            {label}
    </span>
    );
}

function AreaDetail({
                        property,
                        displayUnit,
                        displayedArea,
                        onUnitChange,
                    }: {
    property: PropertyRecord;
    displayUnit: string;
    displayedArea: string | null;
    onUnitChange: (value: string) => void;
}) {
    return (
        <div className="border-b border-slate-200 p-4 sm:border-b-0 sm:border-r lg:p-5">
            <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-primary">
          <Ruler
              size={18}
              aria-hidden="true"
          />
        </span>

                <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.11em] text-slate-400">
                        Total area
                    </p>

                    <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <p
                            className="max-w-full break-words text-sm font-black tabular-nums leading-tight text-slate-950"
                            title={
                                displayedArea ||
                                "Not provided"
                            }
                        >
                            {displayedArea ||
                                "Not provided"}
                        </p>

                        {property.size ? (
                            <span className="relative shrink-0">
                <select
                    value={displayUnit}
                    aria-label="Area unit"
                    onChange={(event) =>
                        onUnitChange(
                            event.target.value,
                        )
                    }
                    className="appearance-none bg-transparent py-0 pl-0 pr-4 text-[10px] font-black uppercase text-primary outline-none"
                >
                  {SIZE_UNITS.map(
                      (unit) => (
                          <option
                              key={unit.value}
                              value={
                                  unit.value
                              }
                          >
                              {unit.label}
                          </option>
                      ),
                  )}
                </select>

                <ChevronDown
                    size={10}
                    className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-primary"
                    aria-hidden="true"
                />
              </span>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryDetail({
                           label,
                           value,
                           icon: Icon,
                       }: DetailItem) {
    return (
        <div className="border-b border-slate-200 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:p-5">
            <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-primary">
          <Icon
              size={18}
              aria-hidden="true"
          />
        </span>

                <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.11em] text-slate-400">
                        {label}
                    </p>
                    <p className="mt-1 truncate text-sm font-black text-slate-950">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

function SectionHeading({
                            eyebrow,
                            title,
                            description,
                            icon: Icon,
                        }: {
    eyebrow: string;
    title: string;
    description: string;
    icon: LucideIcon;
}) {
    return (
        <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-primary">
        <Icon
            size={21}
            aria-hidden="true"
        />
      </span>

            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                    {eyebrow}
                </p>
                <h2 className="mt-2 font-heading text-2xl font-black tracking-[-0.03em] text-slate-950">
                    {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function FactRow({
                     label,
                     value,
                 }: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-5 border-b border-slate-100 py-4">
      <span className="text-sm font-medium text-slate-500">
        {label}
      </span>
            <span className="max-w-[55%] text-right text-sm font-black text-slate-950">
        {value}
      </span>
        </div>
    );
}

function ContactCard({
                         property,
                         isOwner,
                         showPhone,
                         contactLoading,
                         contactError,
                         onPhone,
                         onEmail,
                         onWhatsApp,
                         onAnalytics,
                     }: {
    property: PropertyRecord;
    isOwner: boolean;
    showPhone: boolean;
    contactLoading:
        | "phone"
        | "email"
        | "whatsapp"
        | null;
    contactError: string;
    onPhone: () => void;
    onEmail: () => void;
    onWhatsApp: () => void;
    onAnalytics: () => void;
}) {
    const owner =
        property.userId;
    const ownerName =
        owner?.name ||
        "Property owner";
    const initials = ownerName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase(),
        )
        .join("");

    return (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_65px_rgba(15,23,42,0.11)]">
            <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
                <div
                    className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-teal-500/20 blur-3xl"
                    aria-hidden="true"
                />

                <div className="relative flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-black text-teal-300 ring-1 ring-white/10">
            {initials || (
                <UserCircle
                    size={25}
                    aria-hidden="true"
                />
            )}
          </span>

                    <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-teal-300">
                            Listed by
                        </p>
                        <h2 className="mt-2 truncate text-xl font-black">
                            {ownerName}
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-300">
                {owner?.role ||
                    "PropYours member"}
              </span>

                            {owner?.company ? (
                                <span className="truncate text-xs font-bold text-slate-400">
                  {owner.company}
                </span>
                            ) : null}
                        </div>
                    </div>
                </div>

                {owner?.bio ? (
                    <p className="relative mt-5 line-clamp-3 text-xs leading-6 text-slate-400">
                        {owner.bio}
                    </p>
                ) : null}
            </div>

            <div className="p-5 sm:p-6">
                {isOwner ? (
                    <div className="space-y-3">
                        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                            <p className="text-sm font-black text-slate-950">
                                This is your listing
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                                Open management tools to
                                edit details, update media or
                                review performance.
                            </p>
                        </div>

                        <Link
                            href="/manage-properties"
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20"
                        >
                            Manage property
                            <ArrowRight
                                size={16}
                                aria-hidden="true"
                            />
                        </Link>

                        <button
                            type="button"
                            onClick={onAnalytics}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
                        >
                            <Eye
                                size={16}
                                aria-hidden="true"
                            />
                            View analytics
                        </button>
                    </div>
                ) : (
                    <>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                Interested in this property?
                            </p>
                            <h3 className="mt-2 font-heading text-2xl font-black tracking-[-0.03em] text-slate-950">
                                Contact the listing owner
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                Sign in before contacting so
                                the owner receives a verified
                                enquiry from your profile.
                            </p>
                        </div>

                        {contactError ? (
                            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-red-700">
                                <AlertTriangle
                                    size={16}
                                    className="mt-0.5 shrink-0"
                                    aria-hidden="true"
                                />
                                <p className="text-xs font-bold leading-5">
                                    {contactError}
                                </p>
                            </div>
                        ) : null}

                        <div className="mt-5 space-y-3">
                            {showPhone &&
                            owner?.phone ? (
                                <a
                                    href={`tel:${owner.phone}`}
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20"
                                >
                                    <Phone
                                        size={17}
                                        aria-hidden="true"
                                    />
                                    {owner.phone}
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onPhone}
                                    disabled={
                                        contactLoading !==
                                        null
                                    }
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20 disabled:cursor-wait disabled:opacity-60"
                                >
                                    {contactLoading ===
                                    "phone" ? (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Phone
                                            size={17}
                                            aria-hidden="true"
                                        />
                                    )}
                                    {owner?.phone
                                        ? "Show phone number"
                                        : "Request phone contact"}
                                </button>
                            )}

                            {owner?.phone ? (
                                <button
                                    type="button"
                                    onClick={onWhatsApp}
                                    disabled={
                                        contactLoading !==
                                        null
                                    }
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#159C62] px-5 text-sm font-black text-white transition hover:bg-[#118353] disabled:cursor-wait disabled:opacity-60"
                                >
                                    {contactLoading ===
                                    "whatsapp" ? (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <MessageCircle
                                            size={17}
                                            aria-hidden="true"
                                        />
                                    )}
                                    WhatsApp owner
                                </button>
                            ) : null}

                            <button
                                type="button"
                                onClick={onEmail}
                                disabled={
                                    !owner?.email ||
                                    contactLoading !== null
                                }
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {contactLoading ===
                                "email" ? (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Mail
                                        size={17}
                                        aria-hidden="true"
                                    />
                                )}
                                Email owner
                            </button>
                        </div>
                    </>
                )}

                {owner?._id ? (
                    <Link
                        href={`/profile/${owner._id}`}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs font-black text-slate-500 transition hover:text-primary"
                    >
                        <UserCircle
                            size={16}
                            aria-hidden="true"
                        />
                        View full profile
                    </Link>
                ) : null}

                <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4">
                    {[
                        "Inspect before paying",
                        "Verify ownership documents",
                        "Use traceable payment methods",
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

function MobileContactBar({
                              property,
                              contactLoading,
                              onPhone,
                              onWhatsApp,
                          }: {
    property: PropertyRecord;
    contactLoading:
        | "phone"
        | "email"
        | "whatsapp"
        | null;
    onPhone: () => void;
    onWhatsApp: () => void;
}) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-[900] border-t border-slate-200 bg-white/95 p-3 shadow-[0_-16px_45px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
            <div className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
                <div className="min-w-0 px-1">
                    <p className="truncate text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Asking price
                    </p>
                    <p className="truncate text-lg font-black text-slate-950">
                        {formatPrice(
                            property.price,
                        )}
                    </p>
                </div>

                {property.userId?.phone ? (
                    <button
                        type="button"
                        onClick={onWhatsApp}
                        disabled={
                            contactLoading !== null
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#159C62] text-white disabled:opacity-60"
                        aria-label="WhatsApp owner"
                    >
                        {contactLoading ===
                        "whatsapp" ? (
                            <Loader2
                                size={17}
                                className="animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            <MessageCircle
                                size={18}
                                aria-hidden="true"
                            />
                        )}
                    </button>
                ) : null}

                <button
                    type="button"
                    onClick={onPhone}
                    disabled={
                        contactLoading !== null
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-black text-white shadow-lg shadow-primary/20 disabled:opacity-60"
                >
                    {contactLoading ===
                    "phone" ? (
                        <Loader2
                            size={16}
                            className="animate-spin"
                            aria-hidden="true"
                        />
                    ) : (
                        <Phone
                            size={16}
                            aria-hidden="true"
                        />
                    )}
                    Contact
                </button>
            </div>
        </div>
    );
}

function ImageViewer({
                         images,
                         address,
                         selectedIndex,
                         onClose,
                         onChange,
                     }: {
    images: string[];
    address: string;
    selectedIndex: number;
    onClose: () => void;
    onChange: (index: number) => void;
}) {
    function previous() {
        onChange(
            selectedIndex === 0
                ? images.length - 1
                : selectedIndex - 1,
        );
    }

    function next() {
        onChange(
            selectedIndex ===
            images.length - 1
                ? 0
                : selectedIndex + 1,
        );
    }

    return (
        <motion.div
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            exit={{
                opacity: 0,
            }}
            className="fixed inset-0 z-[10000] flex flex-col bg-slate-950/98"
            role="dialog"
            aria-modal="true"
            aria-label="Property photo gallery"
        >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-4 text-white sm:px-6">
                <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                        {address}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {selectedIndex + 1} of{" "}
                        {images.length}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white hover:text-slate-950"
                    aria-label="Close photo gallery"
                >
                    <X
                        size={19}
                        aria-hidden="true"
                    />
                </button>
            </div>

            <div className="relative min-h-0 flex-1">
                <div className="absolute inset-4 sm:inset-7">
                    <Image
                        src={images[selectedIndex]}
                        alt={`${address} photo ${selectedIndex + 1}`}
                        fill
                        priority
                        sizes="100vw"
                        className="object-contain"
                    />
                </div>

                {images.length > 1 ? (
                    <>
                        <button
                            type="button"
                            onClick={previous}
                            className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-slate-950 sm:left-6"
                            aria-label="Previous photo"
                        >
                            <ChevronLeft
                                size={23}
                                aria-hidden="true"
                            />
                        </button>

                        <button
                            type="button"
                            onClick={next}
                            className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-slate-950 sm:right-6"
                            aria-label="Next photo"
                        >
                            <ChevronRight
                                size={23}
                                aria-hidden="true"
                            />
                        </button>
                    </>
                ) : null}
            </div>

            {images.length > 1 ? (
                <div className="shrink-0 overflow-x-auto border-t border-white/10 px-4 py-4 sm:px-6">
                    <div className="mx-auto flex w-max gap-2">
                        {images.map(
                            (image, index) => (
                                <button
                                    key={`${image}-${index}`}
                                    type="button"
                                    onClick={() =>
                                        onChange(index)
                                    }
                                    className={`relative h-16 w-24 overflow-hidden rounded-xl border-2 transition ${
                                        index ===
                                        selectedIndex
                                            ? "border-teal-300"
                                            : "border-transparent opacity-55 hover:opacity-100"
                                    }`}
                                    aria-label={`View photo ${index + 1}`}
                                >
                                    <Image
                                        src={image}
                                        alt=""
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                </button>
                            ),
                        )}
                    </div>
                </div>
            ) : null}
        </motion.div>
    );
}
