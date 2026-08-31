"use client";

import {
    Suspense,
    useEffect,
    useMemo,
    useState,
} from "react";
import Link from "next/link";
import {
    useRouter,
    useSearchParams,
} from "next/navigation";
import {
    AnimatePresence,
    motion,
} from "framer-motion";
import {
    ArrowRight,
    BadgeCheck,
    BarChart3,
    Briefcase,
    Building2,
    Check,
    CheckCircle2,
    ChevronDown,
    Crown,
    Eye,
    Gem,
    HelpCircle,
    Info,
    LayoutDashboard,
    LineChart,
    ListChecks,
    Mail,
    MessageSquareText,
    Rocket,
    ShieldCheck,
    Sparkles,
    Star,
    Store,
    Target,
    UserRound,
    Users,
    X,
    Zap,
    type LucideIcon,
} from "lucide-react";

import type {
    AnalyticsLevel,
    PlanAudience,
    PlanDefinition,
    PlanTier,
    RankingLevel,
} from "@/lib/plan-catalog";
import {
    ownerComparison,
} from "@/data/pricing/ownerComparison";
import {
    developerComparison,
} from "@/data/pricing/developerComparison";
import type {
    ComparisonRow,
} from "@/types/pricing";
import RazorpayCheckoutButton from "@/components/payments/RazorpayCheckoutButton";

type FinderAnswers = Record<string, string>;

type FinderQuestion = {
    key: string;
    label: string;
    description: string;
    options: Array<{
        value: string;
        label: string;
        hint: string;
    }>;
};

type PlanTheme = {
    icon: LucideIcon;
    cardClass: string;
    topLineClass: string;
    iconClass: string;
    badgeClass: string;
    eyebrowClass: string;
    mutedClass: string;
    featureClass: string;
    checkClass: string;
    priceClass: string;
    dividerClass: string;
    primaryCtaClass: string;
    secondaryCtaClass: string;
};

type PricingPlan =
    Omit<
        PlanDefinition,
        "presentation"
    > & {
    presentation:
        Omit<
            PlanDefinition["presentation"],
            | "priceInPaise"
            | "originalPriceInPaise"
        > & {
        priceInPaise:
            number | null;

        originalPriceInPaise?:
            number | null;
    };

    priceLocked: boolean;
};

type PricingApiResponse = {
    plans: PricingPlan[];
    pricesLocked: boolean;
};

const OWNER_PLAN_TIERS = [
    "silver",
    "gold",
    "platinum",
] as const satisfies readonly PlanTier[];

const BUILDER_PLAN_TIERS = [
    "builder-starter",
    "builder-growth",
    "builder-elite",
] as const satisfies readonly PlanTier[];

const AGENT_PLAN_TIERS = [
    "agent-ruby",
    "agent-emerald",
    "agent-diamond",
] as const satisfies readonly PlanTier[];

const ANALYTICS_RANK: Record<AnalyticsLevel, number> = {
    none: 0,
    basic: 1,
    advanced: 2,
    project: 3,
    portfolio: 4,
};

const RANKING_RANK: Record<RankingLevel, number> = {
    standard: 0,
    featured: 1,
    priority: 2,
    top: 3,
};

const AUDIENCE_CONTENT = {
    owner: {
        eyebrow: "Pricing for property owners",
        title: "Choose how much visibility your property needs.",
        description:
            "Start with a free listing or choose a paid pack for longer duration, stronger placement and clearer performance insights.",
        billingSummary:
            "Pay once for the full validity of your selected pack. GST applies to paid plans.",
        icon: UserRound,
    },

    builder: {
        eyebrow: "Pricing for builders and developers",
        title: "Choose the portfolio tools that match your scale.",
        description:
            "Builder packs combine active project limits, listing visibility, profile treatment, promotion boosts and project analytics.",
        billingSummary:
            "Pay once for the full one-year builder pack. GST applies to paid plans.",
        icon: Building2,
    },

    agent: {
        eyebrow:
            "Pricing for property agents",

        title:
            "Choose the plan that matches your listings.",

        description:
            "Agent packs combine active listing capacity, flexible commission options, longer listing validity and stronger visibility.",

        billingSummary:
            "Pay once for the full validity of your selected agent pack. GST applies to paid plans.",

        icon: Briefcase,
    },
} satisfies Record<
    PlanAudience,
    {
        eyebrow: string;
        title: string;
        description: string;
        billingSummary: string;
        icon: LucideIcon;
    }
>;

const OWNER_FAQS = [
    {
        question: "Is the Silver owner plan really free?",
        answer:
            "Yes. Silver has no monthly charge. It supports one active property for 30 days, up to five images and the standard listing experience.",
    },
    {
        question: "Are Gold and Platinum billed monthly?",
        answer:
            "Yes. Gold and Platinum are monthly owner subscriptions. Their listing-duration limits describe how long an individual listing may remain active; that is separate from the subscription billing cycle.",
    },
    {
        question: "Why does a monthly plan have a 90-day or 180-day listing duration?",
        answer:
            "Billing controls access to the plan. Listing duration controls the maximum active window assigned to a property under that plan. They are two different product rules.",
    },
    {
        question: "How many properties can I keep active?",
        answer:
            "Silver and Gold support one active property. Platinum supports two active properties. Additional properties may need to remain inactive until capacity is available.",
    },
    {
        question: "What analytics are included?",
        answer:
            "Silver does not include performance analytics. Gold includes basic views, phone-click and favorite tracking. Platinum includes advanced daily performance and conversion-oriented insights.",
    },
    {
        question: "What happens when a listing reaches its duration limit?",
        answer:
            "The listing can become inactive and stop appearing in property discovery. You can review it from the property-management area and reactivate it when your plan and account flow permit.",
    },
];

const BUILDER_FAQS = [
    {
        question: "Are builder plans monthly or yearly?",
        answer:
            "Builder Starter, Builder Growth and Builder Elite are annual plans in the current catalog.",
    },
    {
        question:
            "How many active projects can each plan support?",
        answer:
            "Builder Starter supports 1 active project, Growth supports up to 3 and Elite supports up to 5.",
    },
    {
        question: "What are promote boosts?",
        answer:
            "Growth and Elite include monthly promote-boost allowances. These can be used by the existing promotion workflow to increase property visibility, subject to the plan balance.",
    },
    {
        question: "How do builder analytics differ?",
        answer:
            "Starter includes basic analytics, Growth includes project-level analytics and Elite includes portfolio-level analytics.",
    },
    {
        question: "Do builder plans include profile and listing treatment?",
        answer:
            "Yes. Higher builder tiers include stronger ranking, badge and comparison visibility entitlements, as defined by the plan catalog.",
    },
    {
        question: "How do I activate a builder plan?",
        answer:
            "The repository does not currently include a public builder checkout or registration route. Use the contact flow to discuss activation and onboarding.",
    },
];

function getPlansForAudience(
    allPlans: PricingPlan[],
    audience: PlanAudience,
): PricingPlan[] {
    const tiers =
        audience === "owner"
            ? OWNER_PLAN_TIERS
            : audience === "builder"
                ? BUILDER_PLAN_TIERS
                : AGENT_PLAN_TIERS;

    return tiers
        .map(
            (tier) =>
                allPlans.find(
                    (plan) =>
                        plan.tier === tier,
                ),
        )
        .filter(
            (
                plan,
            ): plan is PricingPlan =>
                Boolean(plan),
        );
}

function formatPrice(
    priceInPaise: number,
): string {
    if (priceInPaise === 0) {
        return "Free";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(priceInPaise / 100);
}

function formatCompactPrice(
    priceInPaise: number,
): string {
    if (priceInPaise === 0) {
        return "Free";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(priceInPaise / 100);
}

function getBillingLabel(
    plan: PricingPlan,
): string {
    if (
        plan.presentation
            .priceInPaise === 0
    ) {
        return "";
    }

    switch (plan.tier) {
        case "gold":
        case "agent-ruby":
            return "for 90 days";

        case "platinum":
        case "agent-emerald":
        case "agent-diamond":
            return "for 180 days";

        case "builder-starter":
        case "builder-growth":
        case "builder-elite":
            return "for 1 year";

        default:
            return "";
    }
}

function getBillingNote(
    plan: PricingPlan,
): string {
    if (plan.presentation.priceInPaise === 0) {
        return "Start without a paid pack";
    }

    return "One-time pack price · + 18% GST";
}

function getPlanSavings(
    plan: PricingPlan,
): number | null {
    const original =
        plan.presentation
            .originalPriceInPaise;

    const current =
        plan.presentation
            .priceInPaise;

    if (
        original === undefined ||
        original === null ||
        current === null ||
        original <= current
    ) {
        return null;
    }

    return original - current;
}

function getPlanDiscountPercentage(
    plan: PricingPlan,
): number | null {
    const original =
        plan.presentation
            .originalPriceInPaise;

    const current =
        plan.presentation
            .priceInPaise;

    if (
        original === undefined ||
        original === null ||
        current === null ||
        original <= current ||
        original <= 0
    ) {
        return null;
    }

    return Math.round(
        ((original - current) /
            original) *
        100,
    );
}

function toTitle(value: string): string {
    return value
        .split("-")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1),
        )
        .join(" ");
}

function getPlanTheme(
    plan: PricingPlan,
): PlanTheme {
    switch (plan.tier) {
        case "agent-ruby":
            return {
                icon: Gem,
                cardClass:
                    "border-2 border-rose-200 bg-[linear-gradient(180deg,#fff7f8_0%,#ffffff_42%)] text-slate-950 shadow-[0_28px_80px_rgba(225,29,72,0.10)] ring-1 ring-rose-100",
                topLineClass:
                    "bg-gradient-to-r from-rose-400 via-red-500 to-rose-400",
                iconClass:
                    "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
                badgeClass:
                    "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
                eyebrowClass:
                    "text-rose-700",
                mutedClass:
                    "text-slate-500",
                featureClass:
                    "text-slate-600",
                checkClass:
                    "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
                priceClass:
                    "border-rose-200 bg-rose-50/70",
                dividerClass:
                    "bg-rose-100",
                primaryCtaClass:
                    "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700",
                secondaryCtaClass:
                    "border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
            };

        case "agent-emerald":
            return {
                icon: Sparkles,
                cardClass:
                    "border-2 border-emerald-300 bg-[linear-gradient(180deg,#f0fdf8_0%,#ffffff_42%)] text-slate-950 shadow-[0_32px_90px_rgba(5,150,105,0.14)] ring-4 ring-emerald-500/5 lg:-translate-y-3",
                topLineClass:
                    "bg-gradient-to-r from-emerald-400 via-emerald-600 to-teal-400",
                iconClass:
                    "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20",
                badgeClass:
                    "bg-emerald-600 text-white shadow-sm",
                eyebrowClass:
                    "text-emerald-700",
                mutedClass:
                    "text-slate-500",
                featureClass:
                    "text-slate-600",
                checkClass:
                    "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
                priceClass:
                    "border-emerald-200 bg-emerald-50/80",
                dividerClass:
                    "bg-emerald-100",
                primaryCtaClass:
                    "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700",
                secondaryCtaClass:
                    "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50",
            };

        case "agent-diamond":
            return {
                icon: Gem,
                cardClass:
                    "border-2 border-cyan-300 bg-[linear-gradient(180deg,#ecfeff_0%,#ffffff_42%)] text-slate-950 shadow-[0_32px_90px_rgba(8,145,178,0.13)] ring-1 ring-cyan-100",
                topLineClass:
                    "bg-gradient-to-r from-cyan-300 via-sky-500 to-cyan-400",
                iconClass:
                    "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200",
                badgeClass:
                    "bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200",
                eyebrowClass:
                    "text-cyan-700",
                mutedClass:
                    "text-slate-500",
                featureClass:
                    "text-slate-600",
                checkClass:
                    "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200",
                priceClass:
                    "border-cyan-200 bg-cyan-50/80",
                dividerClass:
                    "bg-cyan-100",
                primaryCtaClass:
                    "bg-cyan-700 text-white shadow-lg shadow-cyan-700/20 hover:bg-cyan-800",
                secondaryCtaClass:
                    "border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50",
            };

        case "silver":
            return {
                icon: UserRound,
                cardClass:
                    "border-2 border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%)] text-slate-950 shadow-[0_26px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-100",
                topLineClass:
                    "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300",
                iconClass:
                    "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
                badgeClass:
                    "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
                eyebrowClass:
                    "text-slate-600",
                mutedClass:
                    "text-slate-500",
                featureClass:
                    "text-slate-600",
                checkClass:
                    "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
                priceClass:
                    "border-slate-200 bg-slate-50/80",
                dividerClass:
                    "bg-slate-100",
                primaryCtaClass:
                    "bg-slate-800 text-white shadow-lg shadow-slate-800/15 hover:bg-slate-900",
                secondaryCtaClass:
                    "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            };

        case "gold":
            return {
                icon: Sparkles,
                cardClass:
                    "border-2 border-amber-300 bg-[linear-gradient(180deg,#fffbeb_0%,#ffffff_42%)] text-slate-950 shadow-[0_32px_90px_rgba(217,119,6,0.13)] ring-4 ring-amber-500/5 lg:-translate-y-3",
                topLineClass:
                    "bg-gradient-to-r from-amber-300 via-amber-500 to-yellow-400",
                iconClass:
                    "bg-amber-500 text-white shadow-lg shadow-amber-500/20",
                badgeClass:
                    "bg-amber-500 text-white shadow-sm",
                eyebrowClass:
                    "text-amber-700",
                mutedClass:
                    "text-slate-500",
                featureClass:
                    "text-slate-600",
                checkClass:
                    "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
                priceClass:
                    "border-amber-200 bg-amber-50/80",
                dividerClass:
                    "bg-amber-100",
                primaryCtaClass:
                    "bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600",
                secondaryCtaClass:
                    "border-amber-200 bg-white text-amber-700 hover:bg-amber-50",
            };

        case "platinum":
            return {
                icon: Gem,
                cardClass:
                    "border-2 border-violet-300 bg-[linear-gradient(180deg,#f5f3ff_0%,#ffffff_42%)] text-slate-950 shadow-[0_34px_95px_rgba(109,40,217,0.14)] ring-1 ring-violet-100",
                topLineClass:
                    "bg-gradient-to-r from-violet-400 via-indigo-500 to-fuchsia-400",
                iconClass:
                    "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
                badgeClass:
                    "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
                eyebrowClass:
                    "text-violet-700",
                mutedClass:
                    "text-slate-500",
                featureClass:
                    "text-slate-600",
                checkClass:
                    "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
                priceClass:
                    "border-violet-200 bg-violet-50/80",
                dividerClass:
                    "bg-violet-100",
                primaryCtaClass:
                    "bg-violet-700 text-white shadow-lg shadow-violet-700/20 hover:bg-violet-800",
                secondaryCtaClass:
                    "border-violet-200 bg-white text-violet-700 hover:bg-violet-50",
            };

        case "builder-starter":
            return {
                icon: Building2,
                cardClass:
                    "border-2 border-teal-200 bg-[linear-gradient(180deg,#f0fdfa_0%,#ffffff_42%)] text-slate-950 shadow-[0_28px_80px_rgba(13,148,136,0.10)] ring-1 ring-teal-100",
                topLineClass:
                    "bg-gradient-to-r from-teal-300 via-teal-500 to-cyan-400",
                iconClass:
                    "bg-teal-100 text-teal-700 ring-1 ring-teal-200",
                badgeClass:
                    "bg-teal-100 text-teal-700 ring-1 ring-teal-200",
                eyebrowClass:
                    "text-teal-700",
                mutedClass:
                    "text-slate-500",
                featureClass:
                    "text-slate-600",
                checkClass:
                    "bg-teal-100 text-teal-700 ring-1 ring-teal-200",
                priceClass:
                    "border-teal-200 bg-teal-50/80",
                dividerClass:
                    "bg-teal-100",
                primaryCtaClass:
                    "bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700",
                secondaryCtaClass:
                    "border-teal-200 bg-white text-teal-700 hover:bg-teal-50",
            };

        case "builder-growth":
            return {
                icon: Rocket,
                cardClass:
                    "border-2 border-sky-300 bg-[linear-gradient(180deg,#f0f9ff_0%,#ffffff_42%)] text-slate-950 shadow-[0_32px_90px_rgba(2,132,199,0.13)] ring-4 ring-sky-500/5 lg:-translate-y-3",
                topLineClass:
                    "bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400",
                iconClass:
                    "bg-blue-600 text-white shadow-lg shadow-blue-600/20",
                badgeClass:
                    "bg-blue-600 text-white shadow-sm",
                eyebrowClass:
                    "text-blue-700",
                mutedClass:
                    "text-slate-500",
                featureClass:
                    "text-slate-600",
                checkClass:
                    "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
                priceClass:
                    "border-blue-200 bg-blue-50/80",
                dividerClass:
                    "bg-blue-100",
                primaryCtaClass:
                    "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700",
                secondaryCtaClass:
                    "border-blue-200 bg-white text-blue-700 hover:bg-blue-50",
            };

        case "builder-elite":
            return {
                icon: Crown,
                cardClass:
                    "border-2 border-indigo-300 bg-[linear-gradient(180deg,#eef2ff_0%,#ffffff_42%)] text-slate-950 shadow-[0_34px_95px_rgba(67,56,202,0.15)] ring-1 ring-indigo-100",
                topLineClass:
                    "bg-gradient-to-r from-indigo-400 via-violet-600 to-fuchsia-400",
                iconClass:
                    "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
                badgeClass:
                    "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200",
                eyebrowClass:
                    "text-indigo-700",
                mutedClass:
                    "text-slate-500",
                featureClass:
                    "text-slate-600",
                checkClass:
                    "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
                priceClass:
                    "border-indigo-200 bg-indigo-50/80",
                dividerClass:
                    "bg-indigo-100",
                primaryCtaClass:
                    "bg-indigo-700 text-white shadow-lg shadow-indigo-700/20 hover:bg-indigo-800",
                secondaryCtaClass:
                    "border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50",
            };

        default:
            return {
                icon:
                    plan.audience === "owner"
                        ? UserRound
                        : Building2,
                cardClass:
                    "border-slate-200 bg-white text-slate-950 shadow-sm",
                topLineClass: "bg-slate-200",
                iconClass:
                    "bg-slate-100 text-slate-700",
                badgeClass:
                    "bg-slate-100 text-slate-700",
                eyebrowClass: "text-slate-500",
                mutedClass: "text-slate-500",
                featureClass: "text-slate-600",
                checkClass:
                    "bg-slate-100 text-slate-600",
                priceClass:
                    "border-slate-200 bg-slate-50",
                dividerClass: "bg-slate-100",
                primaryCtaClass:
                    "bg-slate-950 text-white hover:bg-primary",
                secondaryCtaClass:
                    "border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary",
            };
    }
}

function buildPlanFeatures(
    plan: PricingPlan,
): string[] {
    const limits = plan.entitlements;
    const subject =
        plan.audience === "owner"
            ? limits.activeProperties === 1
                ? "active property"
                : "active properties"
            : limits.activeProperties === 1
                ? "active project"
                : "active projects";

    const features = [
        `${limits.activeProperties} ${subject}`,
        `${limits.listingDays}-day listing duration`,
        `Up to ${limits.maxImages} images`,
    ];

    if (limits.maxVideoLinks > 0) {
        features.push(
            `${limits.maxVideoLinks} video ${
                limits.maxVideoLinks === 1
                    ? "link"
                    : "links"
            }`,
        );
    }

    features.push(
        limits.verifiedLeadLimit === null
            ? "Unlimited verified leads"
            : `${limits.verifiedLeadLimit} verified ${
                limits.verifiedLeadLimit === 1
                    ? "lead"
                    : "leads"
            }`,
    );

    if (limits.rankingLevel !== "standard") {
        features.push(
            `${toTitle(limits.rankingLevel)} search ranking`,
        );
    }

    if (limits.homepageFeatured) {
        features.push("Homepage-featured eligibility");
    } else if (limits.featured) {
        features.push("Featured listing treatment");
    }

    if (limits.analyticsLevel !== "none") {
        features.push(
            `${toTitle(limits.analyticsLevel)} analytics`,
        );
    }

    if (limits.promoteBoostsPerMonth > 0) {
        features.push(
            `${limits.promoteBoostsPerMonth} promote boosts per month`,
        );
    }

    if (limits.leadNotifications) {
        features.push("Lead notifications");
    }

    return features.slice(0, 8);
}

function getPlanPositioning(
    plan: PricingPlan,
): string {
    switch (plan.tier) {
        case "silver":
            return "A simple place to begin";

        case "gold":
            return "Recommended for more visibility";

        case "platinum":
            return "Maximum visibility and insights";

        case "builder-starter":
            return "For smaller project portfolios";

        case "builder-growth":
            return "Recommended for growing builders";

        case "builder-elite":
            return "For established builder portfolios";

        case "agent-ruby":
            return "For individual property agents";

        case "agent-emerald":
            return "Recommended for active agents";

        case "agent-diamond":
            return "For larger agent portfolios";

        default:
            return "";
    }
}

function getPlanCta(
    plan: PricingPlan,
): {
    href: string;
    label: string;
    external?: boolean;
} {
    if (plan.audience === "builder") {
        return {
            href: "/contact",
            label: `Discuss ${plan.presentation.displayName}`,
        };
    }

    if (plan.tier === "silver") {
        return {
            href: "/post-property",
            label: "Start with Silver",
        };
    }

    return {
        href: `/post-property?plan=${plan.tier}`,
        label: `Choose ${plan.presentation.displayName}`,
    };
}

function getFinderQuestions(
    audience: PlanAudience,
): FinderQuestion[] {
    if (audience === "owner") {
        return [
            {
                key: "capacity",
                label: "How many properties need to stay active?",
                description:
                    "Choose the maximum number you expect to manage at once.",
                options: [
                    {
                        value: "1",
                        label: "1 project",
                        hint: "Builder Starter",
                    },
                    {
                        value: "3",
                        label: "Up to 3",
                        hint: "Builder Growth",
                    },
                    {
                        value: "5",
                        label: "Up to 5",
                        hint: "Builder Elite",
                    },
                ],
            },
            {
                key: "duration",
                label: "How long should each listing remain active?",
                description:
                    "Pick the minimum listing window you need.",
                options: [
                    {
                        value: "30",
                        label: "30 days",
                        hint: "Short initial listing",
                    },
                    {
                        value: "90",
                        label: "90 days",
                        hint: "Longer selling window",
                    },
                    {
                        value: "180",
                        label: "180 days",
                        hint: "Maximum owner duration",
                    },
                ],
            },
            {
                key: "analytics",
                label: "How much performance insight do you need?",
                description:
                    "Choose the minimum analytics level that would be useful.",
                options: [
                    {
                        value: "none",
                        label: "No analytics",
                        hint: "Listing access only",
                    },
                    {
                        value: "basic",
                        label: "Basic",
                        hint: "Views, calls and saves",
                    },
                    {
                        value: "advanced",
                        label: "Advanced",
                        hint: "Daily and conversion insights",
                    },
                ],
            },
        ];
    }

    return [
        {
            key: "capacity",
            label: "How many projects need to stay active?",
            description:
                "Choose the maximum active portfolio size you expect.",
            options: [
                {
                    value: "3",
                    label: "Up to 3",
                    hint: "Smaller builder portfolio",
                },
                {
                    value: "10",
                    label: "Up to 10",
                    hint: "Growing project portfolio",
                },
                {
                    value: "25",
                    label: "Up to 25",
                    hint: "Established portfolio",
                },
            ],
        },
        {
            key: "ranking",
            label: "What visibility level do you need?",
            description:
                "Choose the minimum search-ranking treatment you want.",
            options: [
                {
                    value: "standard",
                    label: "Standard",
                    hint: "Core directory presence",
                },
                {
                    value: "priority",
                    label: "Priority",
                    hint: "Stronger project placement",
                },
                {
                    value: "top",
                    label: "Top",
                    hint: "Highest catalog ranking",
                },
            ],
        },
        {
            key: "analytics",
            label: "How should performance be analysed?",
            description:
                "Choose the minimum analytics scope required by your team.",
            options: [
                {
                    value: "basic",
                    label: "Basic",
                    hint: "Core listing activity",
                },
                {
                    value: "project",
                    label: "Project",
                    hint: "Project-level trends",
                },
                {
                    value: "portfolio",
                    label: "Portfolio",
                    hint: "Portfolio-wide insights",
                },
            ],
        },
    ];
}

function recommendPlan(
    allPlans: PricingPlan[],
    audience: PlanAudience,
    answers: FinderAnswers,
): PricingPlan | null {
    const plans =
        getPlansForAudience(
            allPlans,
            audience,
        );

    if (plans.length === 0) {
        return null;
    }
    const requiredCapacity =
        Number.parseInt(answers.capacity ?? "0", 10) || 0;
    const requiredAnalytics =
        (answers.analytics ??
            (audience === "owner"
                ? "none"
                : "basic")) as AnalyticsLevel;

    const candidates = plans.filter((plan) => {
        const capacityMatches =
            plan.entitlements.activeProperties >=
            requiredCapacity;

        const analyticsMatches =
            ANALYTICS_RANK[
                plan.entitlements.analyticsLevel
                ] >= ANALYTICS_RANK[requiredAnalytics];

        if (audience === "owner") {
            const requiredDuration =
                Number.parseInt(
                    answers.duration ?? "0",
                    10,
                ) || 0;

            return (
                capacityMatches &&
                analyticsMatches &&
                plan.entitlements.listingDays >=
                requiredDuration
            );
        }

        const requiredRanking =
            (answers.ranking ??
                "standard") as RankingLevel;

        return (
            capacityMatches &&
            analyticsMatches &&
            RANKING_RANK[
                plan.entitlements.rankingLevel
                ] >= RANKING_RANK[requiredRanking]
        );
    });

    return (
        candidates[0] ??
        plans[plans.length - 1] ??
        null
    );
}

function getRecommendationReasons(
    plan: PricingPlan,
    audience: PlanAudience,
): string[] {
    const reasons = [
        `${plan.entitlements.activeProperties} active ${
            audience === "owner"
                ? plan.entitlements.activeProperties === 1
                    ? "property"
                    : "properties"
                : plan.entitlements.activeProperties === 1
                    ? "project"
                    : "projects"
        }`,
        `${plan.entitlements.listingDays}-day listing duration`,
        `${toTitle(
            plan.entitlements.analyticsLevel,
        )} analytics`,
    ];

    if (
        plan.entitlements.rankingLevel !==
        "standard"
    ) {
        reasons.push(
            `${toTitle(
                plan.entitlements.rankingLevel,
            )} search ranking`,
        );
    }

    return reasons;
}

function renderComparisonValue(
    value: string,
    variant: "default" | "highlighted" | "dark" = "default",
) {
    if (value === "✓") {
        return (
            <span
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                    variant === "dark"
                        ? "bg-white text-slate-950"
                        : variant === "highlighted"
                            ? "bg-primary text-white"
                            : "bg-teal-50 text-primary"
                }`}
                aria-label="Included"
            >
        <Check size={16} aria-hidden="true" />
      </span>
        );
    }

    if (value === "—") {
        return (
            <span
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                    variant === "dark"
                        ? "bg-white/10 text-slate-300"
                        : "bg-slate-100 text-slate-400"
                }`}
                aria-label="Not included"
            >
        <X size={14} aria-hidden="true" />
      </span>
        );
    }

    return (
        <span
            className={
                variant === "dark"
                    ? "font-semibold text-slate-100"
                    : variant === "highlighted"
                        ? "font-black text-primary"
                        : "font-semibold text-slate-700"
            }
        >
      {value}
    </span>
    );
}

function PlanCard({
                      plan,
                      index,
                  }: {
    plan: PricingPlan;
    index: number;
}) {
    const theme = getPlanTheme(plan);
    const Icon = theme.icon;
    const features = buildPlanFeatures(plan);
    const savings = getPlanSavings(plan);
    const cta = getPlanCta(plan);
    const isPremium =
        plan.tier === "platinum" ||
        plan.tier === "builder-elite" ||
        plan.tier === "agent-diamond";

    const isRecommended =
        plan.tier === "gold" ||
        plan.tier === "builder-growth" ||
        plan.tier === "agent-emerald";

    const discountPercentage =
        getPlanDiscountPercentage(plan);

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.45,
                delay: index * 0.08,
            }}
            className={`group relative isolate flex h-full flex-col overflow-hidden rounded-[2rem] border p-6 transition duration-300 hover:-translate-y-1 sm:p-7 ${theme.cardClass}`}
        >
            <div
                className={`absolute inset-x-0 top-0 h-1.5 ${theme.topLineClass}`}
                aria-hidden="true"
            />

            {isRecommended ? (
                <>
                    <div
                        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-200/45 blur-3xl"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
                        aria-hidden="true"
                    />
                </>
            ) : null}

            {isPremium ? (
                <>
                    <div
                        className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-teal-400/15 blur-3xl"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute right-7 top-28 h-24 w-24 rounded-full border-[18px] border-white/[0.025]"
                        aria-hidden="true"
                    />
                </>
            ) : null}

            <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
          <span
              className={`flex h-13 w-13 items-center justify-center rounded-2xl p-3.5 ${theme.iconClass}`}
          >
            <Icon size={23} aria-hidden="true" />
          </span>

                    {plan.presentation.badge ? (
                        <span
                            className={`rounded-full px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.12em] ${theme.badgeClass}`}
                        >
              {plan.presentation.badge}
            </span>
                    ) : null}
                </div>

                <p
                    className={`mt-7 text-[10px] font-black uppercase tracking-[0.15em] ${theme.eyebrowClass}`}
                >
                    {getPlanPositioning(plan)}
                </p>

                <h3 className="mt-2 text-2xl font-black tracking-tight">
                    {plan.presentation.displayName}
                </h3>

                <p
                    className={`mt-3 min-h-[4.5rem] text-sm leading-6 ${theme.mutedClass}`}
                >
                    {plan.presentation.description}
                </p>

                <div
                    className={`mt-6 rounded-2xl border p-4 ${theme.priceClass}`}
                >
                    <p
                        className={`text-[10px] font-black uppercase tracking-[0.12em] ${theme.mutedClass}`}
                    >
                        Plan price
                    </p>

                    {plan.priceLocked ? (
                        <div className="mt-3">
                            <div className="relative inline-flex items-center">
                <span
                    className="select-none text-3xl font-black tracking-tight opacity-50 blur-[6px]"
                    aria-hidden="true"
                >
                    ₹00,000
                </span>

                                <Link
                                    href={`/login?redirect=${encodeURIComponent(
                                        `/pricing?audience=${plan.audience}`,
                                    )}`}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                    <span className="whitespace-nowrap rounded-lg bg-slate-950 px-3 py-1.5 text-[10px] font-black text-white shadow-lg">
                        Login to view price
                    </span>
                                </Link>
                            </div>

                            <p
                                className={`mt-3 text-xs ${theme.mutedClass}`}
                            >
                                Sign in to reveal plan pricing
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-2 flex flex-wrap items-end gap-x-1.5 gap-y-1">
                                <p className="text-3xl font-black tracking-tight">
                                    {formatPrice(
                                        plan.presentation
                                            .priceInPaise ?? 0,
                                    )}
                                </p>

                                {(plan.presentation
                                    .priceInPaise ?? 0) >
                                0 ? (
                                    <p
                                        className={`pb-1 text-sm font-bold ${theme.mutedClass}`}
                                    >
                                        {getBillingLabel(
                                            plan,
                                        )}
                                    </p>
                                ) : null}
                            </div>

                            {(plan.presentation
                                .priceInPaise ?? 0) >
                            0 ? (
                                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                                    {plan.presentation
                                        .originalPriceInPaise ? (
                                        <span
                                            className={`text-xs line-through ${theme.mutedClass}`}
                                        >
                            {formatPrice(
                                plan.presentation
                                    .originalPriceInPaise,
                            )}
                        </span>
                                    ) : null}

                                    <span
                                        className={`text-xs font-semibold ${theme.mutedClass}`}
                                    >
                        + 18% GST
                    </span>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>

                <div
                    className={`my-7 h-px ${theme.dividerClass}`}
                    aria-hidden="true"
                />

                <p
                    className={`text-[10px] font-black uppercase tracking-[0.13em] ${theme.mutedClass}`}
                >
                    What is included
                </p>

                <ul className="mt-4 space-y-3 pb-2">
                    {features.map((feature) => (
                        <li
                            key={feature}
                            className={`flex items-start gap-3 text-sm leading-6 ${theme.featureClass}`}
                        >
              <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${theme.checkClass}`}
              >
                <Check size={12} aria-hidden="true" />
              </span>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-auto pt-8">
                    {plan.tier === "silver" ? (
                        <Link
                            href={cta.href}
                            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black transition duration-200 ${theme.primaryCtaClass}`}
                        >
                            {cta.label}

                            <ArrowRight
                                size={16}
                                className="transition-transform group-hover:translate-x-1"
                                aria-hidden="true"
                            />
                        </Link>
                    ) : (
                        <RazorpayCheckoutButton
                            plan={plan.tier}
                            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${theme.primaryCtaClass}`}
                        >
                            <>
                                {cta.label}

                                <ArrowRight
                                    size={16}
                                    aria-hidden="true"
                                />
                            </>
                        </RazorpayCheckoutButton>
                    )}

                    <Link
                        href="#compare-plans"
                        className={`mt-3 flex min-h-11 w-full items-center justify-center rounded-xl border px-5 py-3 text-xs font-black transition ${theme.secondaryCtaClass}`}
                    >
                        Compare every detail
                    </Link>
                </div>
            </div>
        </motion.article>
    );
}

function PricingPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const audienceParam =
        searchParams.get(
            "audience",
        );

    const queryAudience: PlanAudience =
        audienceParam === "builder"
            ? "builder"
            : audienceParam === "agent"
                ? "agent"
                : "owner";

    const [allPlans, setAllPlans] =
        useState<PricingPlan[]>([]);

    const [pricingLoading, setPricingLoading] =
        useState(true);

    useEffect(() => {
        const controller =
            new AbortController();

        async function loadPricing() {
            try {
                const response =
                    await fetch(
                        "/api/pricing",
                        {
                            cache:
                                "no-store",

                            credentials:
                                "include",

                            signal:
                            controller.signal,
                        },
                    );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load pricing.",
                    );
                }

                const data =
                    (await response.json()) as
                        PricingApiResponse;

                if (
                    !controller.signal
                        .aborted
                ) {
                    setAllPlans(
                        data.plans,
                    );
                }
            } catch (error) {
                if (
                    !controller.signal
                        .aborted
                ) {
                    console.error(
                        "Failed to load pricing:",
                        error,
                    );
                }
            } finally {
                if (
                    !controller.signal
                        .aborted
                ) {
                    setPricingLoading(
                        false,
                    );
                }
            }
        }

        void loadPricing();

        return () =>
            controller.abort();
    }, []);

    const [audience, setAudience] =
        useState<PlanAudience>(queryAudience);
    const [finderAnswers, setFinderAnswers] =
        useState<FinderAnswers>({});
    const [recommendedTier, setRecommendedTier] =
        useState<PlanTier | null>(null);

    const plans = useMemo(
        () =>
            getPlansForAudience(
                allPlans,
                audience,
            ),
        [
            allPlans,
            audience,
        ],
    );

    const comparisonRows: ComparisonRow[] =
        audience === "owner"
            ? ownerComparison
            : developerComparison;

    const finderQuestions =
        getFinderQuestions(audience);

    const finderComplete =
        finderQuestions.every(
            (question) =>
                Boolean(finderAnswers[question.key]),
        );

    const recommendedPlan =
        recommendedTier === null
            ? null
            : allPlans.find(
            (plan) =>
                plan.tier ===
                recommendedTier,
        ) ?? null;

    const content = AUDIENCE_CONTENT[audience];
    const ContentIcon = content.icon;
    const faqs =
        audience === "owner"
            ? OWNER_FAQS
            : BUILDER_FAQS;

    const audienceSnapshot =
        audience === "owner"
            ? [
                {
                    label:
                        "Free entry plan",
                    value:
                        "Silver",
                    icon:
                    UserRound,
                },
                {
                    label:
                        "Payment",
                    value:
                        "One-time",
                    icon:
                    Zap,
                },
                {
                    label:
                        "Listing windows",
                    value:
                        "30–180 days",
                    icon:
                    ListChecks,
                },
                {
                    label:
                        "Active capacity",
                    value:
                        "1–2 properties",
                    icon:
                    Store,
                },
            ]
            : audience === "builder"
                ? [
                    {
                        label:
                            "Payment",
                        value:
                            "One-time",
                        icon:
                        Building2,
                    },
                    {
                        label:
                            "Active capacity",
                        value:
                            "1–5 projects",
                        icon:
                        Store,
                    },
                    {
                        label:
                            "Validity",
                        value:
                            "1 year",
                        icon:
                        Rocket,
                    },
                    {
                        label:
                            "Analytics",
                        value:
                            "Basic–portfolio",
                        icon:
                        BarChart3,
                    },
                ]
                : [
                    {
                        label:
                            "Plans",
                        value:
                            "Ruby–Diamond",
                        icon:
                        Briefcase,
                    },
                    {
                        label:
                            "Active capacity",
                        value:
                            "1–10 listings",
                        icon:
                        Store,
                    },
                    {
                        label:
                            "Validity",
                        value:
                            "90–180 days",
                        icon:
                        ListChecks,
                    },
                    {
                        label:
                            "Commission",
                        value:
                            "Flexible",
                        icon:
                        BadgeCheck,
                    },
                ];

    const processSteps =
        audience === "owner"
            ? [
                {
                    number: "01",
                    title: "Choose visibility",
                    description:
                        "Compare the free and monthly owner plans.",
                    icon: Target,
                },
                {
                    number: "02",
                    title: "Create the listing",
                    description:
                        "Add property details, images and pricing.",
                    icon: ListChecks,
                },
                {
                    number: "03",
                    title: "Manage performance",
                    description:
                        "Edit the listing and open analytics when included.",
                    icon: LayoutDashboard,
                },
            ]
            : [
                {
                    number: "01",
                    title: "Choose portfolio scale",
                    description:
                        "Compare annual project capacity and visibility.",
                    icon: Building2,
                },
                {
                    number: "02",
                    title: "Discuss activation",
                    description:
                        "Use the contact flow for builder onboarding.",
                    icon: MessageSquareText,
                },
                {
                    number: "03",
                    title: "Manage projects",
                    description:
                        "Publish projects and use plan-aware analytics.",
                    icon: LineChart,
                },
            ];

    function selectAudience(
        nextAudience: PlanAudience,
    ) {
        setAudience(nextAudience);
        setFinderAnswers({});
        setRecommendedTier(null);

        const params = new URLSearchParams(
            searchParams.toString(),
        );

        if (
            nextAudience === "owner"
        ) {
            params.delete(
                "audience",
            );
        } else {
            params.set(
                "audience",
                nextAudience,
            );
        }

        const query = params.toString();

        router.replace(
            query
                ? `/pricing?${query}`
                : "/pricing",
            {
                scroll: false,
            },
        );
    }

    function handleRecommendation() {
        if (!finderComplete) {
            return;
        }

        const plan =
            recommendPlan(
                allPlans,
                audience,
                finderAnswers,
            );

        if (!plan) {
            return;
        }

        setRecommendedTier(
            plan.tier,
        );
    }

    function resetFinder() {
        setFinderAnswers({});
        setRecommendedTier(null);
    }

    return (
        <main className="min-h-screen bg-white pt-20 font-body text-slate-950">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.16),_transparent_35%),linear-gradient(180deg,#f7fbfa_0%,#ffffff_100%)]">
                <div
                    className="pointer-events-none absolute -left-48 top-40 h-96 w-96 rounded-full bg-amber-50 blur-3xl"
                    aria-hidden="true"
                />

                <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
                    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="mt-6 max-w-4xl font-heading text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-[4rem]">
                                Pricing that matches
                                <span className="block text-primary">
                  how you actually list.
                </span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                                Compare capacity, listing duration, media limits, visibility,
                                leads and analytics before choosing a plan.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                                {[
                                    "Catalog-backed limits",
                                    "Owner and builder plans",
                                    "Side-by-side comparison",
                                ].map((item) => (
                                    <span
                                        key={item}
                                        className="flex items-center gap-2 text-sm font-semibold text-slate-600"
                                    >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check size={13} aria-hidden="true" />
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
                            className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)] sm:p-8"
                        >
                            <div
                                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-500/25 blur-3xl"
                                aria-hidden="true"
                            />

                            <div className="relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-300">
                                            Current view
                                        </p>
                                        <h2 className="mt-2 text-2xl font-black tracking-tight">
                                            {audience === "owner"
                                                ? "Owner plans"
                                                : audience === "builder"
                                                    ? "Builder plans"
                                                    : "Agent plans"}
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {content.billingSummary}
                                        </p>
                                    </div>

                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-teal-300 ring-1 ring-white/10">
                    <ContentIcon size={22} aria-hidden="true" />
                  </span>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-3">
                                    {audienceSnapshot.map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <div
                                                key={item.label}
                                                className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                                            >
                                                <Icon
                                                    size={17}
                                                    className="text-teal-300"
                                                    aria-hidden="true"
                                                />
                                                <p className="mt-4 text-lg font-black">
                                                    {item.value}
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                                    {item.label}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Audience switch */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="relative z-20 mt-12 rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
                    >
                        <div
                            role="tablist"
                            aria-label="Pricing audience"
                            className="grid gap-3 md:grid-cols-3"
                        >
                            {(
                                [
                                    {
                                        value: "owner",
                                        label:
                                            "Property owners",
                                        description:
                                            "Free and paid packs for selling or renting.",
                                        icon: UserRound,
                                    },

                                    {
                                        value: "builder",
                                        label:
                                            "Builders & developers",
                                        description:
                                            "Annual packs for project portfolios and visibility.",
                                        icon: Building2,
                                    },

                                    {
                                        value: "agent",
                                        label:
                                            "Agents",
                                        description:
                                            "Listing packs for agents and property brokers.",
                                        icon: Briefcase,
                                    },
                                ] as const
                            ).map((option) => {
                                const Icon = option.icon;
                                const active =
                                    audience === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() =>
                                            selectAudience(option.value)
                                        }
                                        className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition sm:p-5 ${
                                            active
                                                ? "border-primary bg-teal-50 shadow-sm"
                                                : "border-slate-100 bg-slate-50 hover:border-teal-200 hover:bg-white"
                                        }`}
                                    >
                    <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${
                            active
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-white text-slate-500 shadow-sm"
                        }`}
                    >
                      <Icon size={21} aria-hidden="true" />
                    </span>

                                        <span className="min-w-0 flex-1">
                      <span
                          className={`block font-black ${
                              active
                                  ? "text-primary"
                                  : "text-slate-950"
                          }`}
                      >
                        {option.label}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-slate-500">
                        {option.description}
                      </span>
                    </span>

                                        <span
                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                                                active
                                                    ? "border-primary bg-primary text-white"
                                                    : "border-slate-200 bg-white text-transparent"
                                            }`}
                                        >
                      <Check size={14} aria-hidden="true" />
                    </span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Plan cards */}
            <section
                id="plans"
                className="relative overflow-hidden bg-[#f5f7f6]"
            >
                <div
                    className="pointer-events-none absolute -right-52 top-16 h-[520px] w-[520px] rounded-full bg-teal-100/50 blur-3xl"
                    aria-hidden="true"
                />

                <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`heading-${audience}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
                        >
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                                    {content.eyebrow}
                                </p>

                                <h2 className="mt-3 max-w-3xl font-heading text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                                    {content.title}
                                </h2>

                                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                                    {content.description}
                                </p>
                            </div>

                            <div className="inline-flex w-fit items-start gap-3 rounded-2xl border border-teal-100 bg-white px-4 py-3 shadow-sm">
                                <Info
                                    size={18}
                                    className="mt-0.5 shrink-0 text-primary"
                                    aria-hidden="true"
                                />
                                <p className="max-w-sm text-sm leading-6 text-slate-600">
                                    {audience === "owner"
                                        ? "Owner packs are priced for their full listing validity. GST applies to paid plans."
                                        : audience === "builder"
                                            ? "Builder pricing covers the full one-year pack. GST applies to paid plans."
                                            : "Agent pricing covers the full validity of each pack. GST applies to paid plans."}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`plans-${audience}`}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -18 }}
                            className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch"
                        >
                            {plans.map((plan, index) => (
                                <PlanCard
                                    key={plan.tier}
                                    plan={plan}
                                    index={index}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-9 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-primary">
                <BadgeCheck size={19} aria-hidden="true" />
              </span>

                            <div>
                                <p className="font-black text-slate-950">
                                    Every limit shown here comes from the plan catalog.
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    The comparison section below exposes the remaining
                                    visibility, media and analytics differences.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="#compare-plans"
                            className="inline-flex shrink-0 items-center gap-2 text-sm font-black text-primary hover:text-primary-dark"
                        >
                            Compare every feature
                            <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Plan finder */}
            <section className="relative overflow-hidden bg-white">
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
                    <div className="overflow-hidden rounded-[2.25rem] bg-slate-950 text-white shadow-[0_34px_100px_rgba(15,23,42,0.24)]">
                        <div className="grid lg:grid-cols-12">
                            <div className="relative overflow-hidden p-7 sm:p-10 lg:col-span-5 lg:p-12">
                                <div
                                    className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-500/22 blur-3xl"
                                    aria-hidden="true"
                                />

                                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-teal-300 ring-1 ring-white/10">
                    <Sparkles size={22} aria-hidden="true" />
                  </span>

                                    <p className="mt-8 text-xs font-black uppercase tracking-[0.14em] text-teal-300">
                                        Plan finder
                                    </p>

                                    <h2 className="mt-3 max-w-xl text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                                        Answer three questions. Get a catalog-backed recommendation.
                                    </h2>

                                    <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                                        The recommendation selects the lowest plan whose actual
                                        capacity, duration, ranking and analytics meet your stated
                                        needs.
                                    </p>

                                    <div className="mt-8 space-y-3">
                                        {[
                                            "No hidden scoring",
                                            "Uses real entitlement limits",
                                            "You can still choose any plan",
                                        ].map((item) => (
                                            <div
                                                key={item}
                                                className="flex items-center gap-3 text-sm font-semibold text-slate-300"
                                            >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-300/15 text-teal-300">
                          <Check size={14} aria-hidden="true" />
                        </span>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[linear-gradient(145deg,#f0fdfa_0%,#ffffff_68%)] p-6 text-slate-950 sm:p-9 lg:col-span-7 lg:p-10">
                                <AnimatePresence mode="wait">
                                    {recommendedPlan ? (
                                        <motion.div
                                            key={`recommendation-${recommendedPlan.tier}`}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            aria-live="polite"
                                        >
                                            <div className="flex items-start justify-between gap-5">
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                                                        Recommended plan
                                                    </p>
                                                    <h3 className="mt-2 text-3xl font-black tracking-tight">
                                                        {recommendedPlan.presentation.displayName}
                                                    </h3>
                                                </div>

                                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                          <Star size={22} aria-hidden="true" />
                        </span>
                                            </div>

                                            <div className="mt-7 rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
                                                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                                                    Price
                                                </p>

                                                {recommendedPlan.priceLocked ? (
                                                    <Link
                                                        href={`/login?redirect=${encodeURIComponent(
                                                            `/pricing?audience=${audience}`,
                                                        )}`}
                                                        className="mt-2 inline-flex rounded-lg bg-slate-950 px-3 py-1.5 text-[10px] font-black text-white"
                                                    >
                                                        Login to view price
                                                    </Link>
                                                ) : (
                                                    <div className="mt-2 flex items-end gap-1.5">
                                                        <p className="text-3xl font-black">
                                                            {formatPrice(
                                                                recommendedPlan
                                                                    .presentation
                                                                    .priceInPaise ?? 0,
                                                            )}
                                                        </p>

                                                        {(recommendedPlan
                                                            .presentation
                                                            .priceInPaise ?? 0) > 0 ? (
                                                            <p className="pb-1 text-sm font-bold text-slate-500">
                                                                {getBillingLabel(
                                                                    recommendedPlan,
                                                                )}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-7">
                                                <p className="text-sm font-black text-slate-950">
                                                    Why it matches
                                                </p>

                                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                    {getRecommendationReasons(
                                                        recommendedPlan,
                                                        audience,
                                                    ).map((reason) => (
                                                        <div
                                                            key={reason}
                                                            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
                                                        >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-primary">
                                <Check size={13} aria-hidden="true" />
                              </span>
                                                            <span className="text-sm font-semibold text-slate-700">
                                {reason}
                              </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                                <Link
                                                    href={getPlanCta(recommendedPlan).href}
                                                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark"
                                                >
                                                    {getPlanCta(recommendedPlan).label}
                                                    <ArrowRight size={16} aria-hidden="true" />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={resetFinder}
                                                    className="h-12 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                                >
                                                    Start again
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={`questions-${audience}`}
                                            initial={{ opacity: 0, x: 12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -12 }}
                                        >
                                            <div className="space-y-7">
                                                {finderQuestions.map(
                                                    (question, questionIndex) => (
                                                        <fieldset key={question.key}>
                                                            <legend className="flex items-start gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                                  {questionIndex + 1}
                                </span>

                                                                <span>
                                  <span className="block font-black text-slate-950">
                                    {question.label}
                                  </span>
                                  <span className="mt-1 block text-sm leading-6 text-slate-500">
                                    {question.description}
                                  </span>
                                </span>
                                                            </legend>

                                                            <div
                                                                className={`mt-4 grid gap-2 ${
                                                                    question.options.length === 2
                                                                        ? "sm:grid-cols-2"
                                                                        : "sm:grid-cols-3"
                                                                }`}
                                                            >
                                                                {question.options.map((option) => {
                                                                    const active =
                                                                        finderAnswers[question.key] ===
                                                                        option.value;

                                                                    return (
                                                                        <button
                                                                            key={option.value}
                                                                            type="button"
                                                                            aria-pressed={active}
                                                                            onClick={() =>
                                                                                setFinderAnswers((current) => ({
                                                                                    ...current,
                                                                                    [question.key]: option.value,
                                                                                }))
                                                                            }
                                                                            className={`rounded-2xl border p-4 text-left transition ${
                                                                                active
                                                                                    ? "border-primary bg-teal-50 shadow-sm"
                                                                                    : "border-slate-200 bg-white hover:border-teal-200"
                                                                            }`}
                                                                        >
                                      <span
                                          className={`block text-sm font-black ${
                                              active
                                                  ? "text-primary"
                                                  : "text-slate-950"
                                          }`}
                                      >
                                        {option.label}
                                      </span>
                                                                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                                        {option.hint}
                                      </span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </fieldset>
                                                    ),
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                disabled={!finderComplete}
                                                onClick={handleRecommendation}
                                                className={`mt-8 flex h-13 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-black transition ${
                                                    finderComplete
                                                        ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark"
                                                        : "cursor-not-allowed bg-slate-100 text-slate-400"
                                                }`}
                                            >
                                                Recommend a plan
                                                <ArrowRight size={16} aria-hidden="true" />
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison */}
            <section
                id="compare-plans"
                className="scroll-mt-24 border-y border-slate-200 bg-[#f5f7f6]"
            >
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                                Full comparison
                            </p>

                            <h2 className="mt-3 max-w-3xl font-heading text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                                Compare every limit before choosing.
                            </h2>

                            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                                Review capacity, media, ranking, badges, placement and
                                analytics across the current {audience} plans.
                            </p>
                        </div>

                        <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                            <button
                                type="button"
                                onClick={() => selectAudience("owner")}
                                className={`rounded-lg px-4 py-2.5 text-xs font-black transition ${
                                    audience === "owner"
                                        ? "bg-slate-950 text-white"
                                        : "text-slate-500 hover:text-slate-950"
                                }`}
                            >
                                Owner comparison
                            </button>
                            <button
                                type="button"
                                onClick={() => selectAudience("builder")}
                                className={`rounded-lg px-4 py-2.5 text-xs font-black transition ${
                                    audience === "builder"
                                        ? "bg-slate-950 text-white"
                                        : "text-slate-500 hover:text-slate-950"
                                }`}
                            >
                                Builder comparison
                            </button>
                        </div>
                    </div>

                    {/* Mobile comparison */}
                    <div className="mt-10 space-y-3 lg:hidden">
                        {comparisonRows.map((row) => (
                            <article
                                key={row.feature}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-slate-950">
                                        {row.feature}
                                    </h3>

                                    {row.tooltip ? (
                                        <span title={row.tooltip}>
                      <Info
                          size={14}
                          className="text-slate-400"
                          aria-label={row.tooltip}
                      />
                    </span>
                                    ) : null}
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    {[row.plan1, row.plan2, row.plan3].map(
                                        (value, index) => (
                                            <div
                                                key={`${row.feature}-${index}`}
                                                className={`rounded-xl border px-2 py-3 text-center ${
                                                    index === 1
                                                        ? "border-teal-200 bg-teal-50"
                                                        : index === 2
                                                            ? "border-slate-800 bg-slate-950 text-white"
                                                            : "border-slate-100 bg-slate-50"
                                                }`}
                                            >
                                                <p
                                                    className={`mb-2 truncate text-[9px] font-black uppercase tracking-wide ${
                                                        index === 2
                                                            ? "text-slate-400"
                                                            : "text-slate-400"
                                                    }`}
                                                >
                                                    {plans[index]?.presentation.displayName}
                                                </p>

                                                <div className="text-xs">
                                                    {renderComparisonValue(
                                                        value,
                                                        index === 1
                                                            ? "highlighted"
                                                            : index === 2
                                                                ? "dark"
                                                                : "default",
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Desktop comparison */}
                    <div className="mt-10 hidden overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[940px] border-collapse text-left">
                                <thead>
                                <tr className="border-b border-slate-200">
                                    <th
                                        scope="col"
                                        className="w-[31%] bg-white px-6 py-6 text-xs font-black uppercase tracking-[0.12em] text-slate-500"
                                    >
                                        Plan detail
                                    </th>

                                    {plans.map(
                                        (plan, index) => (
                                            <th
                                                key={plan.tier}
                                                scope="col"
                                                className={`px-5 py-6 text-center ${
                                                    index === 1
                                                        ? "bg-teal-50"
                                                        : index === 2
                                                            ? "bg-slate-950 text-white"
                                                            : "bg-slate-50"
                                                }`}
                                            >
                                                <p
                                                    className={`text-sm font-black ${
                                                        index === 2
                                                            ? "text-white"
                                                            : "text-slate-950"
                                                    }`}
                                                >
                                                    {
                                                        plan.presentation
                                                            .displayName
                                                    }
                                                </p>

                                                {plan.priceLocked ? (
                                                    <Link
                                                        href={`/login?redirect=${encodeURIComponent(
                                                            `/pricing?audience=${audience}`,
                                                        )}`}
                                                        className="mt-2 inline-flex rounded-lg bg-slate-950 px-3 py-1.5 text-[10px] font-black text-white"
                                                    >
                                                        Login to view price
                                                    </Link>
                                                ) : (
                                                    <div className="mt-2 flex items-end justify-center gap-1">
                    <span className="text-lg font-black">
                        {formatCompactPrice(
                            plan.presentation
                                .priceInPaise ?? 0,
                        )}
                    </span>

                                                        {(plan.presentation
                                                            .priceInPaise ?? 0) > 0 ? (
                                                            <span
                                                                className={`pb-0.5 text-[10px] font-bold ${
                                                                    index === 2
                                                                        ? "text-slate-400"
                                                                        : "text-slate-500"
                                                                }`}
                                                            >
                            {getBillingLabel(
                                plan,
                            )}
                        </span>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </th>
                                        ),
                                    )}
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 text-sm">
                                {comparisonRows.map((row) => (
                                    <tr
                                        key={row.feature}
                                        className="transition hover:bg-slate-50/60"
                                    >
                                        <th
                                            scope="row"
                                            className="px-6 py-5 font-bold text-slate-800"
                                        >
                        <span className="flex items-center gap-2">
                          {row.feature}
                            {row.tooltip ? (
                                <span title={row.tooltip}>
                              <Info
                                  size={14}
                                  className="text-slate-400"
                                  aria-label={row.tooltip}
                              />
                            </span>
                            ) : null}
                        </span>
                                        </th>

                                        {[row.plan1, row.plan2, row.plan3].map(
                                            (value, index) => (
                                                <td
                                                    key={`${row.feature}-${index}`}
                                                    className={`px-5 py-5 text-center ${
                                                        index === 1
                                                            ? "bg-teal-50/60"
                                                            : index === 2
                                                                ? "bg-slate-950 text-white"
                                                                : ""
                                                    }`}
                                                >
                                                    {renderComparisonValue(
                                                        value,
                                                        index === 1
                                                            ? "highlighted"
                                                            : index === 2
                                                                ? "dark"
                                                                : "default",
                                                    )}
                                                </td>
                                            ),
                                        )}
                                    </tr>
                                ))}
                                </tbody>

                                <tfoot>
                                <tr className="border-t border-slate-200">
                                    <td className="px-6 py-6 text-sm font-bold text-slate-500">
                                        Choose a plan when the limits match your needs.
                                    </td>

                                    {plans.map((plan, index) => {
                                        const cta = getPlanCta(plan);

                                        return (
                                            <td
                                                key={plan.tier}
                                                className={`px-5 py-6 ${
                                                    index === 1
                                                        ? "bg-teal-50"
                                                        : index === 2
                                                            ? "bg-slate-950"
                                                            : "bg-slate-50"
                                                }`}
                                            >
                                                <Link
                                                    href={cta.href}
                                                    className={`flex h-11 items-center justify-center rounded-xl px-4 text-xs font-black transition ${
                                                        index === 1
                                                            ? "bg-primary text-white hover:bg-primary-dark"
                                                            : index === 2
                                                                ? "bg-white text-slate-950 hover:bg-teal-200"
                                                                : "bg-slate-950 text-white hover:bg-primary"
                                                    }`}
                                                >
                                                    {cta.label}
                                                </Link>
                                            </td>
                                        );
                                    })}
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* After choosing */}
            <section className="relative overflow-hidden bg-white">
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
                    <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                                After you choose
                            </p>

                            <h2 className="mt-3 max-w-xl font-heading text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                                A plan should lead into a clear next step.
                            </h2>

                            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                                Pricing is only useful when customers understand what happens
                                after selection and where their listing or project is managed.
                            </p>

                            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <Link
                                    href={
                                        audience === "owner"
                                            ? "/post-property"
                                            : "/contact"
                                    }
                                    className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-primary sm:w-auto"
                                >
                                    {audience === "owner"
                                        ? "Start a property listing"
                                        : "Contact builder onboarding"}

                                    <ArrowRight
                                        size={16}
                                        className="shrink-0"
                                        aria-hidden="true"
                                    />
                                </Link>

                                <Link
                                    href={
                                        audience === "owner"
                                            ? "/manage-properties"
                                            : "/builders"
                                    }
                                    className="inline-flex min-h-12 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary sm:w-auto"
                                >
                                    {audience === "owner"
                                        ? "Manage properties"
                                        : "Browse builder directory"}
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {processSteps.map((step) => {
                                const Icon = step.icon;

                                return (
                                    <div
                                        key={step.number}
                                        className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        <Icon size={20} aria-hidden="true" />
                      </span>

                                            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Step {step.number}
                      </span>
                                        </div>

                                        <h3 className="mt-6 font-black text-slate-950">
                                            {step.title}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {step.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="border-y border-slate-200 bg-[#f7faf9]">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-24">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                            Pricing questions
                        </p>

                        <h2 className="mt-3 font-heading text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                            Understand the rules before choosing.
                        </h2>

                        <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
                            These answers reflect the current catalog and the workflows
                            available in the repository.
                        </p>

                        <Link
                            href="/contact"
                            className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-primary shadow-sm transition hover:border-primary"
                        >
                            Ask a pricing question
                            <Mail size={16} aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <details
                                key={faq.question}
                                className="group rounded-2xl border border-slate-200 bg-white shadow-sm"
                                open={index === 0}
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 font-black text-slate-950 sm:px-6">
                                    {faq.question}
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-primary transition group-open:rotate-180">
                    <ChevronDown size={17} aria-hidden="true" />
                  </span>
                                </summary>

                                <p className="px-5 pb-5 pr-16 text-sm leading-7 text-slate-600 sm:px-6 sm:pb-6 sm:pr-20">
                                    {faq.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#0f766e_0%,#0d9488_56%,#115e59_100%)] px-6 py-9 text-white shadow-[0_24px_70px_rgba(13,148,136,0.22)] sm:px-10 sm:py-10">
                        <div
                            className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[45px] border-white/5"
                            aria-hidden="true"
                        />

                        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex max-w-2xl items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/15">
                  <HelpCircle size={22} aria-hidden="true" />
                </span>

                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-100">
                                        Choose with confidence
                                    </p>

                                    <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                                        {audience === "owner"
                                            ? "Start free or choose the monthly visibility you need."
                                            : "Choose the annual portfolio capacity your team needs."}
                                    </h2>

                                    <p className="mt-3 max-w-xl text-sm leading-6 text-teal-50/85">
                                        Use the plan finder or compare every entitlement before
                                        continuing.
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                                <Link
                                    href="#plans"
                                    className="inline-flex h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white/15"
                                >
                                    Review plans
                                </Link>

                                <Link
                                    href={
                                        audience === "owner"
                                            ? "/post-property"
                                            : "/contact"
                                    }
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-slate-950 shadow-lg transition hover:bg-teal-50"
                                >
                                    {audience === "owner"
                                        ? "Start with Silver"
                                        : "Contact builder onboarding"}
                                    <ArrowRight size={16} aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function PricingPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6]">
                    <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-lg">
              <Sparkles
                  size={24}
                  className="animate-pulse"
                  aria-hidden="true"
              />
            </span>
                        <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            Loading pricing
                        </p>
                    </div>
                </div>
            }
        >
            <PricingPageContent />
        </Suspense>
    );
}