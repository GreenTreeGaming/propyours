"use client";

import Image from "next/image";
import Link from "next/link";
import {
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    AnimatePresence,
    motion,
} from "framer-motion";
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    BarChart3,
    CalendarDays,
    Check,
    ChevronRight,
    Clock3,
    Eye,
    Heart,
    Info,
    Lightbulb,
    LineChart,
    Loader2,
    MapPin,
    PhoneCall,
    RefreshCw,
    Rocket,
    Sparkles,
    TrendingUp,
    X,
    Zap,
    type LucideIcon,
} from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type AnalyticsLevel =
    | "none"
    | "basic"
    | "advanced"
    | "project"
    | "portfolio";

type AnalyticsRange = "7" | "30" | "all";

interface DailyStat {
    date: string;
    views: number;
    phoneClicks: number;
}

interface PropertyAnalytics {
    level: AnalyticsLevel;
    views: number;
    phoneClicks: number;
    favoritesCount: number;
    dailyStats?: DailyStat[];
    conversionRate?: number;
    last7DaysViews?: number;
    last7DaysPhoneClicks?: number;
    last30DaysViews?: number;
    last30DaysPhoneClicks?: number;
    bestPerformingDay?: DailyStat | null;
}

interface AnalyticsProperty {
    _id: string;
    title?: string;
    address: string;
    locality?: string;
    city?: string;
    propertyType?: string;
    price?: number;
    images?: string[];
    planSnapshot?: {
        tier?: string;
        analyticsLevel?: AnalyticsLevel;
    };
}

interface PropertyAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: AnalyticsProperty | null;
}

interface AnalyticsErrorPayload {
    error?: string;
    analyticsLevel?: AnalyticsLevel;
}

interface Insight {
    title: string;
    description: string;
    icon: LucideIcon;
}

const FALLBACK_IMAGE = "/house1.jpeg";

const RANGE_OPTIONS: Array<{
    value: AnalyticsRange;
    label: string;
}> = [
    { value: "7", label: "7 days" },
    { value: "30", label: "30 days" },
    { value: "all", label: "All time" },
];

const ANALYTICS_LEVEL_COPY: Record<
    AnalyticsLevel,
    {
        label: string;
        description: string;
    }
> = {
    none: {
        label: "No analytics",
        description:
            "Analytics are not included in the current plan.",
    },
    basic: {
        label: "Basic analytics",
        description:
            "Total views, contact clicks and saves.",
    },
    advanced: {
        label: "Advanced analytics",
        description:
            "Daily trends and contact conversion.",
    },
    project: {
        label: "Project analytics",
        description:
            "Daily trends plus recent seven-day activity.",
    },
    portfolio: {
        label: "Portfolio analytics",
        description:
            "Seven-day and 30-day activity with the strongest recorded day.",
    },
};

function isAbortError(error: unknown): boolean {
    return (
        error instanceof Error &&
        error.name === "AbortError"
    );
}

function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        notation: value >= 1_000 ? "compact" : "standard",
        maximumFractionDigits: 1,
    }).format(value);
}

function formatPercent(value: number): string {
    if (!Number.isFinite(value)) {
        return "0%";
    }

    if (value > 0 && value < 0.1) {
        return "<0.1%";
    }

    return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
}

function formatPrice(price?: number): string | null {
    if (
        price === undefined ||
        !Number.isFinite(price)
    ) {
        return null;
    }

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

    return `₹${price.toLocaleString("en-IN")}`;
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

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatShortDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
    }).format(date);
}

function formatTooltipDate(value: unknown): string {
    return formatDate(String(value), String(value));
}

function getUpgradeHref(
    property: AnalyticsProperty,
): string {
    return property.planSnapshot?.tier?.startsWith(
        "builder-",
    )
        ? "/pricing?audience=builder"
        : "/pricing";
}

function getUpgradeCopy(
    level: AnalyticsLevel,
): {
    title: string;
    description: string;
} | null {
    switch (level) {
        case "none":
            return {
                title: "Unlock listing analytics",
                description:
                    "Choose a plan with analytics to see views, contact actions and saved-property activity.",
            };

        case "basic":
            return {
                title: "Unlock daily performance trends",
                description:
                    "Advanced analytics adds daily traffic history and contact-conversion visibility.",
            };

        case "advanced":
            return {
                title: "Unlock project-period summaries",
                description:
                    "Project analytics adds dedicated seven-day performance totals.",
            };

        case "project":
            return {
                title: "Unlock portfolio-level context",
                description:
                    "Portfolio analytics adds 30-day totals and the strongest recorded day.",
            };

        case "portfolio":
        default:
            return null;
    }
}

function buildInsights(
    analytics: PropertyAnalytics,
): Insight[] {
    const views = analytics.views || 0;
    const phoneClicks =
        analytics.phoneClicks || 0;
    const favorites =
        analytics.favoritesCount || 0;
    const contactRate =
        views > 0
            ? (phoneClicks / views) * 100
            : 0;

    if (views === 0) {
        return [
            {
                title: "No tracked audience yet",
                description:
                    "Confirm that the listing is active and publicly visible before assessing performance.",
                icon: Eye,
            },
            {
                title: "Strengthen the first impression",
                description:
                    "Review the cover image, title, locality and asking price before promoting the listing.",
                icon: Sparkles,
            },
        ];
    }

    const insights: Insight[] = [];

    if (
        views >= 10 &&
        phoneClicks === 0 &&
        favorites === 0
    ) {
        insights.push({
            title: "Views are not becoming actions",
            description:
                "Review the asking price, photo quality and whether the listing explains the property clearly enough.",
            icon: Lightbulb,
        });
    }

    if (
        favorites > 0 &&
        phoneClicks === 0
    ) {
        insights.push({
            title: "People are saving before contacting",
            description:
                "The listing is attracting consideration, but the enquiry path may need a clearer reason to act now.",
            icon: Heart,
        });
    }

    if (contactRate >= 5) {
        insights.push({
            title: "Contact activity is healthy",
            description:
                "A meaningful share of recorded views is reaching the phone-contact action.",
            icon: TrendingUp,
        });
    } else if (
        views >= 20 &&
        contactRate < 2
    ) {
        insights.push({
            title: "Contact rate is still low",
            description:
                "Compare the price and presentation with similar nearby listings before increasing promotion.",
            icon: PhoneCall,
        });
    }

    if (views < 20) {
        insights.push({
            title: "The sample is still small",
            description:
                "Avoid making major listing changes from limited traffic. Gather more views before drawing conclusions.",
            icon: Info,
        });
    }

    if (insights.length === 0) {
        insights.push({
            title: "Keep monitoring the listing",
            description:
                "The current totals do not point to one obvious issue. Use the trend chart as more activity is recorded.",
            icon: BarChart3,
        });
    }

    return insights.slice(0, 3);
}

function MetricCard({
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
            className={`relative overflow-hidden rounded-[1.5rem] border p-5 ${
                dark
                    ? "border-slate-950 bg-slate-950 text-white shadow-[0_22px_55px_rgba(15,23,42,0.22)]"
                    : "border-slate-200 bg-white text-slate-950 shadow-sm"
            }`}
        >
            {dark ? (
                <div
                    className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl"
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
          <Icon size={20} aria-hidden="true" />
        </span>

                <span
                    className={`text-[9px] font-black uppercase tracking-[0.13em] ${
                        dark
                            ? "text-slate-500"
                            : "text-slate-400"
                    }`}
                >
          Recorded
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

function FunnelStep({
                        label,
                        value,
                        rate,
                        icon: Icon,
                        last = false,
                    }: {
    label: string;
    value: number;
    rate?: number;
    icon: LucideIcon;
    last?: boolean;
}) {
    return (
        <div className="relative min-w-0 flex-1">
            <div className="relative z-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-primary">
            <Icon size={18} aria-hidden="true" />
          </span>

                    {rate !== undefined ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
              {formatPercent(rate)} of views
            </span>
                    ) : null}
                </div>

                <p className="mt-5 text-2xl font-black text-slate-950">
                    {formatCompactNumber(value)}
                </p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.1em] text-slate-400">
                    {label}
                </p>
            </div>

            {!last ? (
                <div
                    className="absolute left-[calc(100%-8px)] top-1/2 z-20 hidden w-8 -translate-y-1/2 items-center justify-center lg:flex"
                    aria-hidden="true"
                >
                    <ChevronRight
                        size={18}
                        className="text-slate-300"
                    />
                </div>
            ) : null}
        </div>
    );
}

function ModalSkeleton() {
    return (
        <div className="space-y-7">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map(
                    (_, index) => (
                        <div
                            key={index}
                            className="h-44 animate-pulse rounded-[1.5rem] bg-slate-100"
                        />
                    ),
                )}
            </div>

            <div className="h-56 animate-pulse rounded-[1.75rem] bg-slate-100" />
            <div className="h-96 animate-pulse rounded-[1.75rem] bg-slate-100" />
        </div>
    );
}

export default function PropertyAnalyticsModal({
                                                   isOpen,
                                                   onClose,
                                                   property,
                                               }: PropertyAnalyticsModalProps) {
    const gradientId = useId().replace(
        /:/g,
        "",
    );
    const closeButtonRef =
        useRef<HTMLButtonElement | null>(null);
    const previousFocusRef =
        useRef<HTMLElement | null>(null);

    const [analytics, setAnalytics] =
        useState<PropertyAnalytics | null>(null);
    const [loading, setLoading] =
        useState(false);
    const [error, setError] =
        useState("");
    const [lockedLevel, setLockedLevel] =
        useState<AnalyticsLevel | null>(null);
    const [requestKey, setRequestKey] =
        useState(0);
    const [range, setRange] =
        useState<AnalyticsRange>("30");

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        previousFocusRef.current =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        const previousOverflow =
            document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown,
        );

        window.setTimeout(() => {
            closeButtonRef.current?.focus();
        }, 0);

        return () => {
            document.body.style.overflow =
                previousOverflow;
            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );
            previousFocusRef.current?.focus();
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen || !property) {
            return;
        }

        const propertyId = property._id;
        const controller = new AbortController();

        async function fetchAnalytics() {
            setLoading(true);
            setError("");
            setLockedLevel(null);
            setAnalytics(null);

            try {
                const response = await fetch(
                    `/api/property/${propertyId}/analytics`,
                    {
                        credentials: "include",
                        cache: "no-store",
                        signal: controller.signal,
                    },
                );

                const payload: unknown =
                    await response.json();

                if (
                    controller.signal.aborted
                ) {
                    return;
                }

                if (!response.ok) {
                    const errorPayload =
                        typeof payload === "object" &&
                        payload !== null
                            ? (payload as AnalyticsErrorPayload)
                            : {};

                    if (
                        response.status === 403 &&
                        errorPayload.analyticsLevel ===
                        "none"
                    ) {
                        setLockedLevel("none");
                        return;
                    }

                    throw new Error(
                        errorPayload.error ||
                        "Unable to load property analytics.",
                    );
                }

                setAnalytics(
                    payload as PropertyAnalytics,
                );
            } catch (caughtError) {
                if (
                    controller.signal.aborted ||
                    isAbortError(caughtError)
                ) {
                    return;
                }

                setError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : "Unable to load property analytics.",
                );
            } finally {
                if (
                    !controller.signal.aborted
                ) {
                    setLoading(false);
                }
            }
        }

        void fetchAnalytics();

        return () => {
            controller.abort();
        };

        void fetchAnalytics();

        return () => controller.abort();
    }, [
        isOpen,
        property?._id,
        requestKey,
    ]);

    useEffect(() => {
        if (isOpen) {
            setRange("30");
        }
    }, [isOpen, property?._id]);

    const sortedDailyStats = useMemo(
        () =>
            [...(analytics?.dailyStats ?? [])].sort(
                (first, second) =>
                    new Date(first.date).getTime() -
                    new Date(second.date).getTime(),
            ),
        [analytics?.dailyStats],
    );

    const chartData = useMemo(() => {
        if (range === "all") {
            return sortedDailyStats;
        }

        const limit =
            range === "7" ? 7 : 30;

        return sortedDailyStats.slice(-limit);
    }, [range, sortedDailyStats]);

    const totals = useMemo(() => {
        const views =
            analytics?.views ?? 0;
        const phoneClicks =
            analytics?.phoneClicks ?? 0;
        const favorites =
            analytics?.favoritesCount ?? 0;

        return {
            views,
            phoneClicks,
            favorites,
            actions:
                phoneClicks + favorites,
            contactRate:
                views > 0
                    ? (phoneClicks / views) * 100
                    : 0,
            saveRate:
                views > 0
                    ? (favorites / views) * 100
                    : 0,
        };
    }, [analytics]);

    const rangeTotals = useMemo(
        () =>
            chartData.reduce(
                (current, stat) => ({
                    views:
                        current.views +
                        (stat.views || 0),
                    phoneClicks:
                        current.phoneClicks +
                        (stat.phoneClicks || 0),
                }),
                {
                    views: 0,
                    phoneClicks: 0,
                },
            ),
        [chartData],
    );

    const lastRecordedDate =
        chartData.length > 0
            ? chartData[chartData.length - 1]
                ?.date
            : null;

    const hasAdvancedAnalytics =
        analytics !== null &&
        [
            "advanced",
            "project",
            "portfolio",
        ].includes(analytics.level);

    const hasProjectAnalytics =
        analytics !== null &&
        ["project", "portfolio"].includes(
            analytics.level,
        );

    const hasPortfolioAnalytics =
        analytics?.level === "portfolio";

    const upgradeCopy = getUpgradeCopy(
        lockedLevel ??
        analytics?.level ??
        "none",
    );

    const insights = analytics
        ? buildInsights(analytics)
        : [];

    const propertyName =
        property?.title ||
        property?.address ||
        "Property listing";

    const propertyLocation = [
        property?.locality,
        property?.city,
    ]
        .filter(Boolean)
        .join(", ");

    const priceLabel = formatPrice(
        property?.price,
    );

    if (!property) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen ? (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6">
                    <motion.button
                        type="button"
                        aria-label="Close analytics"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="property-analytics-title"
                        aria-describedby="property-analytics-description"
                        initial={{
                            opacity: 0,
                            scale: 0.96,
                            y: 24,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.96,
                            y: 24,
                        }}
                        transition={{
                            duration: 0.22,
                        }}
                        className="relative z-10 flex max-h-[94dvh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] bg-[#f6f8f7] shadow-[0_40px_120px_rgba(15,23,42,0.45)]"
                    >
                        {/* Header */}
                        <header className="relative shrink-0 overflow-hidden bg-slate-950 text-white">
                            <div
                                className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl"
                                aria-hidden="true"
                            />

                            <div className="relative flex min-h-[132px] items-center gap-4 p-5 pr-16 sm:gap-5 sm:p-7 sm:pr-20">
                                <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-800 sm:block">
                                    <Image
                                        src={
                                            property.images?.[0] ||
                                            FALLBACK_IMAGE
                                        }
                                        alt=""
                                        fill
                                        sizes="128px"
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-teal-300">
                      <BarChart3
                          size={12}
                          aria-hidden="true"
                      />
                      Property performance
                    </span>

                                        {analytics ? (
                                            <span className="rounded-full bg-teal-300 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.11em] text-slate-950">
                        {
                            ANALYTICS_LEVEL_COPY[
                                analytics.level
                                ].label
                        }
                      </span>
                                        ) : null}
                                    </div>

                                    <h2
                                        id="property-analytics-title"
                                        className="mt-4 line-clamp-2 text-2xl font-black leading-tight tracking-[-0.03em] sm:text-3xl"
                                    >
                                        {propertyName}
                                    </h2>

                                    <div
                                        id="property-analytics-description"
                                        className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-400"
                                    >
                                        {propertyLocation ? (
                                            <span className="inline-flex items-center gap-1.5">
                        <MapPin
                            size={14}
                            className="text-teal-300"
                            aria-hidden="true"
                        />
                                                {propertyLocation}
                      </span>
                                        ) : null}

                                        {property.propertyType ? (
                                            <span>
                        {property.propertyType}
                      </span>
                                        ) : null}

                                        {priceLabel ? (
                                            <span className="font-black text-white">
                        {priceLabel}
                      </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={onClose}
                                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-300 transition hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-teal-300/30 sm:right-7 sm:top-7"
                                aria-label="Close analytics modal"
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </header>

                        {/* Scrollable content */}
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <div className="p-5 sm:p-7 lg:p-8">
                                {loading ? (
                                    <ModalSkeleton />
                                ) : error ? (
                                    <div className="overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-sm">
                                        <div className="p-7 text-center sm:p-10">
                      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <AlertTriangle
                            size={25}
                            aria-hidden="true"
                        />
                      </span>

                                            <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
                                                Analytics could not be loaded
                                            </h3>

                                            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                                                {error}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setRequestKey(
                                                        (current) =>
                                                            current + 1,
                                                    )
                                                }
                                                className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20"
                                            >
                                                <RefreshCw
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                                Try again
                                            </button>
                                        </div>
                                    </div>
                                ) : lockedLevel === "none" ? (
                                    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                        <div className="grid lg:grid-cols-[1fr_0.8fr]">
                                            <div className="p-7 sm:p-10">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-primary">
                          <LineChart
                              size={25}
                              aria-hidden="true"
                          />
                        </span>

                                                <p className="mt-7 text-xs font-black uppercase tracking-[0.14em] text-primary">
                                                    Analytics locked
                                                </p>

                                                <h3 className="mt-3 max-w-xl text-3xl font-black tracking-[-0.03em] text-slate-950">
                                                    Understand how people respond to this listing.
                                                </h3>

                                                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                                                    The current plan does not include property analytics.
                                                    Upgrade to see views, phone actions, saves and the
                                                    performance tools available at higher tiers.
                                                </p>

                                                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                                    <Link
                                                        href={getUpgradeHref(
                                                            property,
                                                        )}
                                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20"
                                                    >
                                                        Compare analytics plans
                                                        <ArrowRight
                                                            size={16}
                                                            aria-hidden="true"
                                                        />
                                                    </Link>

                                                    <Link
                                                        href={`/property/${property._id}`}
                                                        className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                                    >
                                                        View public listing
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="relative overflow-hidden bg-slate-950 p-7 text-white sm:p-10">
                                                <div
                                                    className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-500/20 blur-3xl"
                                                    aria-hidden="true"
                                                />

                                                <div className="relative">
                                                    <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-300">
                                                        What analytics can show
                                                    </p>

                                                    <div className="mt-7 space-y-4">
                                                        {[
                                                            {
                                                                label:
                                                                    "Listing views",
                                                                icon: Eye,
                                                            },
                                                            {
                                                                label:
                                                                    "Phone-contact actions",
                                                                icon: PhoneCall,
                                                            },
                                                            {
                                                                label:
                                                                    "Saved-property activity",
                                                                icon: Heart,
                                                            },
                                                            {
                                                                label:
                                                                    "Daily trends on eligible plans",
                                                                icon: TrendingUp,
                                                            },
                                                        ].map((item) => {
                                                            const Icon =
                                                                item.icon;

                                                            return (
                                                                <div
                                                                    key={item.label}
                                                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-4"
                                                                >
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal-300">
                                    <Icon
                                        size={18}
                                        aria-hidden="true"
                                    />
                                  </span>
                                                                    <span className="text-sm font-bold text-slate-300">
                                    {item.label}
                                  </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : analytics ? (
                                    <div className="space-y-7">
                                        {/* Metric cards */}
                                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                            <MetricCard
                                                label="Listing views"
                                                value={formatCompactNumber(
                                                    totals.views,
                                                )}
                                                description="Public property-page views recorded for this listing."
                                                icon={Eye}
                                                dark
                                            />

                                            <MetricCard
                                                label="Contact actions"
                                                value={formatCompactNumber(
                                                    totals.phoneClicks,
                                                )}
                                                description="Recorded phone-contact clicks from the listing."
                                                icon={PhoneCall}
                                            />

                                            <MetricCard
                                                label="Property saves"
                                                value={formatCompactNumber(
                                                    totals.favorites,
                                                )}
                                                description="Times the listing has been saved to favorites."
                                                icon={Heart}
                                            />

                                            <MetricCard
                                                label="Total actions"
                                                value={formatCompactNumber(
                                                    totals.actions,
                                                )}
                                                description="Phone-contact actions and saves combined."
                                                icon={Zap}
                                            />
                                        </div>

                                        {/* Funnel */}
                                        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                        Listing response
                                                    </p>
                                                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                                                        From discovery to action
                                                    </h3>
                                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                                        A simple view of recorded audience activity. Rates
                                                        use total views as the denominator.
                                                    </p>
                                                </div>

                                                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                          <BadgeCheck
                              size={13}
                              className="text-primary"
                              aria-hidden="true"
                          />
                                                    {
                                                        ANALYTICS_LEVEL_COPY[
                                                            analytics.level
                                                            ].label
                                                    }
                        </span>
                                            </div>

                                            <div className="mt-6 grid gap-3 lg:grid-cols-3">
                                                <FunnelStep
                                                    label="Views"
                                                    value={totals.views}
                                                    icon={Eye}
                                                />

                                                <FunnelStep
                                                    label="Saves"
                                                    value={
                                                        totals.favorites
                                                    }
                                                    rate={totals.saveRate}
                                                    icon={Heart}
                                                />

                                                <FunnelStep
                                                    label="Contact clicks"
                                                    value={
                                                        totals.phoneClicks
                                                    }
                                                    rate={
                                                        totals.contactRate
                                                    }
                                                    icon={PhoneCall}
                                                    last
                                                />
                                            </div>
                                        </section>

                                        {/* Advanced chart */}
                                        {hasAdvancedAnalytics ? (
                                            <section className="grid gap-6 xl:grid-cols-12">
                                                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-8">
                                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <TrendingUp
                                                                    size={19}
                                                                    className="text-primary"
                                                                    aria-hidden="true"
                                                                />
                                                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                                    Daily performance
                                                                </p>
                                                            </div>

                                                            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                                                                Views and contact activity
                                                            </h3>

                                                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                                                Daily activity recorded by the property
                                                                analytics endpoint.
                                                            </p>
                                                        </div>

                                                        <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
                                                            {RANGE_OPTIONS.map(
                                                                (option) => (
                                                                    <button
                                                                        key={
                                                                            option.value
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setRange(
                                                                                option.value,
                                                                            )
                                                                        }
                                                                        aria-pressed={
                                                                            range ===
                                                                            option.value
                                                                        }
                                                                        className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                                                                            range ===
                                                                            option.value
                                                                                ? "bg-white text-primary shadow-sm"
                                                                                : "text-slate-500 hover:text-slate-950"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 flex flex-wrap items-center gap-5 text-xs font-bold text-slate-500">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                              Views
                            </span>
                                                        <span className="inline-flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full bg-slate-950" />
                              Contact clicks
                            </span>
                                                    </div>

                                                    {chartData.length > 0 ? (
                                                        <div className="mt-4 h-[330px] w-full">
                                                            <ResponsiveContainer
                                                                width="100%"
                                                                height="100%"
                                                            >
                                                                <AreaChart
                                                                    data={chartData}
                                                                    margin={{
                                                                        top: 12,
                                                                        right: 8,
                                                                        left: -20,
                                                                        bottom: 0,
                                                                    }}
                                                                >
                                                                    <defs>
                                                                        <linearGradient
                                                                            id={`views-${gradientId}`}
                                                                            x1="0"
                                                                            y1="0"
                                                                            x2="0"
                                                                            y2="1"
                                                                        >
                                                                            <stop
                                                                                offset="5%"
                                                                                stopColor="#0d9488"
                                                                                stopOpacity={
                                                                                    0.22
                                                                                }
                                                                            />
                                                                            <stop
                                                                                offset="95%"
                                                                                stopColor="#0d9488"
                                                                                stopOpacity={
                                                                                    0
                                                                                }
                                                                            />
                                                                        </linearGradient>

                                                                        <linearGradient
                                                                            id={`contacts-${gradientId}`}
                                                                            x1="0"
                                                                            y1="0"
                                                                            x2="0"
                                                                            y2="1"
                                                                        >
                                                                            <stop
                                                                                offset="5%"
                                                                                stopColor="#0f172a"
                                                                                stopOpacity={
                                                                                    0.12
                                                                                }
                                                                            />
                                                                            <stop
                                                                                offset="95%"
                                                                                stopColor="#0f172a"
                                                                                stopOpacity={
                                                                                    0
                                                                                }
                                                                            />
                                                                        </linearGradient>
                                                                    </defs>

                                                                    <CartesianGrid
                                                                        strokeDasharray="4 4"
                                                                        vertical={false}
                                                                        stroke="#e2e8f0"
                                                                    />

                                                                    <XAxis
                                                                        dataKey="date"
                                                                        axisLine={false}
                                                                        tickLine={false}
                                                                        minTickGap={28}
                                                                        tick={{
                                                                            fill: "#64748b",
                                                                            fontSize: 11,
                                                                            fontWeight: 600,
                                                                        }}
                                                                        tickFormatter={
                                                                            formatShortDate
                                                                        }
                                                                    />

                                                                    <YAxis
                                                                        allowDecimals={
                                                                            false
                                                                        }
                                                                        axisLine={false}
                                                                        tickLine={false}
                                                                        tick={{
                                                                            fill: "#94a3b8",
                                                                            fontSize: 11,
                                                                            fontWeight: 600,
                                                                        }}
                                                                    />

                                                                    <Tooltip
                                                                        labelFormatter={
                                                                            formatTooltipDate
                                                                        }
                                                                        contentStyle={{
                                                                            borderRadius:
                                                                                "14px",
                                                                            border:
                                                                                "1px solid #e2e8f0",
                                                                            boxShadow:
                                                                                "0 16px 40px rgba(15,23,42,0.12)",
                                                                            fontSize:
                                                                                "12px",
                                                                            fontWeight:
                                                                                700,
                                                                        }}
                                                                    />

                                                                    <Area
                                                                        type="monotone"
                                                                        dataKey="views"
                                                                        name="Views"
                                                                        stroke="#0d9488"
                                                                        strokeWidth={3}
                                                                        fill={`url(#views-${gradientId})`}
                                                                        activeDot={{
                                                                            r: 5,
                                                                            strokeWidth: 0,
                                                                        }}
                                                                    />

                                                                    <Area
                                                                        type="monotone"
                                                                        dataKey="phoneClicks"
                                                                        name="Contact clicks"
                                                                        stroke="#0f172a"
                                                                        strokeWidth={2}
                                                                        fill={`url(#contacts-${gradientId})`}
                                                                        activeDot={{
                                                                            r: 4,
                                                                            strokeWidth: 0,
                                                                        }}
                                                                    />
                                                                </AreaChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-6 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                                <LineChart
                                    size={22}
                                    aria-hidden="true"
                                />
                              </span>
                                                            <h4 className="mt-5 font-black text-slate-950">
                                                                No daily history yet
                                                            </h4>
                                                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                                                Daily points will appear after public views or
                                                                phone-contact actions are recorded.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-4 xl:col-span-4">
                                                    <div className="relative overflow-hidden rounded-[1.75rem] bg-primary p-6 text-white shadow-[0_22px_55px_rgba(13,148,136,0.2)]">
                                                        <div
                                                            className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/15 blur-3xl"
                                                            aria-hidden="true"
                                                        />

                                                        <div className="relative">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-100">
                                                                Contact conversion
                                                            </p>
                                                            <p className="mt-4 text-5xl font-black tracking-tight">
                                                                {formatPercent(
                                                                    analytics.conversionRate ??
                                                                    totals.contactRate,
                                                                )}
                                                            </p>
                                                            <p className="mt-3 text-sm leading-6 text-teal-50/85">
                                                                Phone-contact clicks divided by total listing
                                                                views.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                                                            Selected period
                                                        </p>

                                                        <div className="mt-5 grid grid-cols-2 gap-3">
                                                            <div className="rounded-xl bg-slate-50 p-4">
                                                                <Eye
                                                                    size={16}
                                                                    className="text-primary"
                                                                    aria-hidden="true"
                                                                />
                                                                <p className="mt-3 text-2xl font-black text-slate-950">
                                                                    {formatCompactNumber(
                                                                        rangeTotals.views,
                                                                    )}
                                                                </p>
                                                                <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
                                                                    Views
                                                                </p>
                                                            </div>

                                                            <div className="rounded-xl bg-slate-50 p-4">
                                                                <PhoneCall
                                                                    size={16}
                                                                    className="text-primary"
                                                                    aria-hidden="true"
                                                                />
                                                                <p className="mt-3 text-2xl font-black text-slate-950">
                                                                    {formatCompactNumber(
                                                                        rangeTotals.phoneClicks,
                                                                    )}
                                                                </p>
                                                                <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
                                                                    Contacts
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                                                            <CalendarDays
                                                                size={17}
                                                                className="mt-0.5 shrink-0 text-primary"
                                                                aria-hidden="true"
                                                            />
                                                            <div>
                                                                <p className="text-xs font-black text-slate-950">
                                                                    Last recorded day
                                                                </p>
                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    {formatDate(
                                                                        lastRecordedDate,
                                                                        "No daily activity yet",
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        ) : null}

                                        {/* Project summaries */}
                                        {hasProjectAnalytics ? (
                                            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                <div className="flex items-start justify-between gap-5">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                            Recent performance
                                                        </p>
                                                        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                                                            Last seven days
                                                        </h3>
                                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                                            Dedicated seven-day totals returned by the
                                                            project analytics tier.
                                                        </p>
                                                    </div>

                                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-primary">
                            <Clock3
                                size={20}
                                aria-hidden="true"
                            />
                          </span>
                                                </div>

                                                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                                        <Eye
                                                            size={18}
                                                            className="text-primary"
                                                            aria-hidden="true"
                                                        />
                                                        <p className="mt-4 text-3xl font-black text-slate-950">
                                                            {formatCompactNumber(
                                                                analytics.last7DaysViews ??
                                                                0,
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">
                                                            Seven-day views
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                                        <PhoneCall
                                                            size={18}
                                                            className="text-primary"
                                                            aria-hidden="true"
                                                        />
                                                        <p className="mt-4 text-3xl font-black text-slate-950">
                                                            {formatCompactNumber(
                                                                analytics.last7DaysPhoneClicks ??
                                                                0,
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">
                                                            Seven-day contacts
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                                        <TrendingUp
                                                            size={18}
                                                            className="text-primary"
                                                            aria-hidden="true"
                                                        />
                                                        <p className="mt-4 text-3xl font-black text-slate-950">
                                                            {formatPercent(
                                                                (analytics.last7DaysViews ??
                                                                    0) > 0
                                                                    ? ((analytics.last7DaysPhoneClicks ??
                                                                            0) /
                                                                        (analytics.last7DaysViews ??
                                                                            1)) *
                                                                    100
                                                                    : 0,
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">
                                                            Seven-day contact rate
                                                        </p>
                                                    </div>
                                                </div>
                                            </section>
                                        ) : null}

                                        {/* Portfolio summaries */}
                                        {hasPortfolioAnalytics ? (
                                            <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                                                <div className="grid lg:grid-cols-[1fr_0.72fr]">
                                                    <div className="p-5 sm:p-6">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                            Portfolio context
                                                        </p>
                                                        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                                                            Last 30 days
                                                        </h3>
                                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                                            Portfolio analytics adds a wider activity window
                                                            and the strongest recorded day.
                                                        </p>

                                                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                                            <div className="rounded-2xl bg-slate-50 p-5">
                                                                <Eye
                                                                    size={18}
                                                                    className="text-primary"
                                                                    aria-hidden="true"
                                                                />
                                                                <p className="mt-4 text-3xl font-black text-slate-950">
                                                                    {formatCompactNumber(
                                                                        analytics.last30DaysViews ??
                                                                        0,
                                                                    )}
                                                                </p>
                                                                <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">
                                                                    30-day views
                                                                </p>
                                                            </div>

                                                            <div className="rounded-2xl bg-slate-50 p-5">
                                                                <PhoneCall
                                                                    size={18}
                                                                    className="text-primary"
                                                                    aria-hidden="true"
                                                                />
                                                                <p className="mt-4 text-3xl font-black text-slate-950">
                                                                    {formatCompactNumber(
                                                                        analytics.last30DaysPhoneClicks ??
                                                                        0,
                                                                    )}
                                                                </p>
                                                                <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">
                                                                    30-day contacts
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
                                                        <div
                                                            className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-teal-500/20 blur-3xl"
                                                            aria-hidden="true"
                                                        />

                                                        <div className="relative">
                              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-teal-300 ring-1 ring-white/10">
                                <Sparkles
                                    size={20}
                                    aria-hidden="true"
                                />
                              </span>

                                                            <p className="mt-7 text-[10px] font-black uppercase tracking-[0.14em] text-teal-300">
                                                                Strongest recorded day
                                                            </p>

                                                            <p className="mt-3 text-2xl font-black">
                                                                {formatDate(
                                                                    analytics
                                                                        .bestPerformingDay
                                                                        ?.date,
                                                                    "No activity yet",
                                                                )}
                                                            </p>

                                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                                {formatCompactNumber(
                                                                    analytics
                                                                        .bestPerformingDay
                                                                        ?.views ?? 0,
                                                                )}{" "}
                                                                views were recorded on that day.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        ) : null}

                                        {/* Recommendations and unlock */}
                                        <section className="grid gap-6 xl:grid-cols-12">
                                            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-7">
                                                <div className="flex items-start gap-4">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                            <Lightbulb
                                size={20}
                                aria-hidden="true"
                            />
                          </span>

                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">
                                                            Practical next checks
                                                        </p>
                                                        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                                                            What the current activity suggests
                                                        </h3>
                                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                                            These are directional checks based on recorded
                                                            actions, not guarantees about buyer intent.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-6 space-y-3">
                                                    {insights.map(
                                                        (insight) => {
                                                            const Icon =
                                                                insight.icon;

                                                            return (
                                                                <div
                                                                    key={
                                                                        insight.title
                                                                    }
                                                                    className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                                                >
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                                    <Icon
                                        size={18}
                                        aria-hidden="true"
                                    />
                                  </span>

                                                                    <div>
                                                                        <h4 className="text-sm font-black text-slate-950">
                                                                            {
                                                                                insight.title
                                                                            }
                                                                        </h4>
                                                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                                                            {
                                                                                insight.description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>

                                            <div className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(145deg,#0f766e_0%,#0d9488_58%,#115e59_100%)] p-6 text-white shadow-[0_22px_60px_rgba(13,148,136,0.2)] xl:col-span-5">
                                                <div
                                                    className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[35px] border-white/5"
                                                    aria-hidden="true"
                                                />

                                                <div className="relative">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/15">
                            {upgradeCopy ? (
                                <Rocket
                                    size={20}
                                    aria-hidden="true"
                                />
                            ) : (
                                <Check
                                    size={20}
                                    aria-hidden="true"
                                />
                            )}
                          </span>

                                                    <p className="mt-7 text-[10px] font-black uppercase tracking-[0.14em] text-teal-100">
                                                        {upgradeCopy
                                                            ? "Next analytics level"
                                                            : "Full analytics level"}
                                                    </p>

                                                    <h3 className="mt-3 text-2xl font-black tracking-tight">
                                                        {upgradeCopy?.title ??
                                                            "Portfolio analytics unlocked"}
                                                    </h3>

                                                    <p className="mt-3 text-sm leading-6 text-teal-50/85">
                                                        {upgradeCopy?.description ??
                                                            "This listing already has access to every analytics field returned by the current endpoint."}
                                                    </p>

                                                    {upgradeCopy ? (
                                                        <Link
                                                            href={getUpgradeHref(
                                                                property,
                                                            )}
                                                            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-slate-950 shadow-lg transition hover:bg-teal-50"
                                                        >
                                                            Compare plans
                                                            <ArrowRight
                                                                size={16}
                                                                aria-hidden="true"
                                                            />
                                                        </Link>
                                                    ) : (
                                                        <div className="mt-7 flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-4">
                                                            <BadgeCheck
                                                                size={19}
                                                                className="shrink-0 text-teal-100"
                                                                aria-hidden="true"
                                                            />
                                                            <p className="text-sm font-bold text-teal-50">
                                                                All available analytics sections are visible.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* Footer */}
                        <footer className="shrink-0 flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <p className="text-xs leading-5 text-slate-500">
                                Owner views are excluded by the analytics endpoint. Counts
                                reflect recorded public interactions.
                            </p>

                            <div className="flex shrink-0 gap-3">
                                <Link
                                    href={`/property/${property._id}`}
                                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                >
                                    View public listing
                                </Link>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-xs font-black text-white transition hover:bg-primary"
                                >
                                    Done
                                </button>
                            </div>
                        </footer>
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>
    );
}
