export type PlanTier =
    | "silver"
    | "gold"
    | "platinum"
    | "builder-starter"
    | "builder-growth"
    | "builder-elite";

export type PlanStatus =
    | "free"
    | "active"
    | "expired"
    | "cancelled";

export type PlanAudience = "owner" | "builder";

export type AnalyticsLevel =
    | "none"
    | "basic"
    | "advanced"
    | "project"
    | "portfolio";

export type RankingLevel =
    | "standard"
    | "featured"
    | "priority"
    | "top";

export type CompareVisibility =
    | "standard"
    | "highlighted"
    | "priority";

export type BadgeLevel =
    | "none"
    | "verified"
    | "premium";

export type BillingType =
    | "free"
    | "monthly"
    | "yearly";

export type PlanEntitlements = {
    activeProperties: number;
    listingDays: number;

    maxImages: number;
    maxVideoLinks: number;

    /**
     * null means unlimited.
     */
    verifiedLeadLimit: number | null;

    featured: boolean;
    homepageFeatured: boolean;

    rankingLevel: RankingLevel;
    compareVisibility: CompareVisibility;
    badgeLevel: BadgeLevel;
    analyticsLevel: AnalyticsLevel;

    promoteBoostsPerMonth: number;
    leadNotifications: boolean;
};

export type PlanPresentation = {
    displayName: string;
    priceInPaise: number;
    originalPriceInPaise?: number;
    billingType: BillingType;
    billingLabel: string;

    description: string;
    ctaText: string;
    ctaLink: string;

    badge?: string;
    badgeType?: "popular" | "premium" | "standard";

    iconKey:
        | "user"
        | "crown"
        | "gem"
        | "building"
        | "briefcase";

    analyticsHighlight: string;
};

export type PlanDefinition = {
    tier: PlanTier;
    audience: PlanAudience;
    presentation: PlanPresentation;
    entitlements: PlanEntitlements;
};

export const PLAN_CATALOG = {
    silver: {
        tier: "silver",
        audience: "owner",

        presentation: {
            displayName: "Silver",
            priceInPaise: 0,
            billingType: "free",
            billingLabel: "Forever Free",

            description:
                "Perfect for owners selling or renting a single property for the first time.",

            ctaText: "List for Free",
            ctaLink: "/post-property",

            iconKey: "user",
            analyticsHighlight: "No analytics",
        },

        entitlements: {
            activeProperties: 1,
            listingDays: 30,

            maxImages: 5,
            maxVideoLinks: 0,
            verifiedLeadLimit: 1,

            featured: false,
            homepageFeatured: false,

            rankingLevel: "standard",
            compareVisibility: "standard",
            badgeLevel: "none",
            analyticsLevel: "none",

            promoteBoostsPerMonth: 0,

            leadNotifications: false,
        },
    },

    gold: {
        tier: "gold",
        audience: "owner",

        presentation: {
            displayName: "Gold",
            priceInPaise: 249900,
            originalPriceInPaise: 299900,
            billingType: "monthly",
            billingLabel: "per month",

            description:
                "Boost your property's visibility and receive more qualified enquiries.",

            ctaText: "Choose Gold",
            ctaLink: "/post-property?plan=gold",

            badge: "Most Popular",
            badgeType: "popular",
            iconKey: "crown",

            analyticsHighlight:
                "Views, phone clicks and favorites tracking",
        },

        entitlements: {
            activeProperties: 1,
            listingDays: 90,

            maxImages: 20,
            maxVideoLinks: 1,
            verifiedLeadLimit: 25,

            featured: true,
            homepageFeatured: false,

            rankingLevel: "featured",
            compareVisibility: "highlighted",

            // Legacy internal value.
// This currently represents a paid featured-listing label,
// not identity or document verification.
            badgeLevel: "verified",
            analyticsLevel: "basic",

            promoteBoostsPerMonth: 0,

            leadNotifications: true,
        },
    },

    platinum: {
        tier: "platinum",
        audience: "owner",

        presentation: {
            displayName: "Platinum",
            priceInPaise: 599900,
            originalPriceInPaise: 699900,
            billingType: "monthly",
            billingLabel: "per month",

            description:
                "Maximum exposure with premium placement, unlimited leads and advanced insights.",

            ctaText: "Choose Platinum",
            ctaLink: "/post-property?plan=platinum",

            badge: "Best Value",
            badgeType: "premium",
            iconKey: "gem",

            analyticsHighlight:
                "Daily performance, views, phone clicks, favorites and conversion tracking",
        },

        entitlements: {
            activeProperties: 2,
            listingDays: 180,

            maxImages: 30,
            maxVideoLinks: 2,
            verifiedLeadLimit: null,

            featured: true,
            homepageFeatured: true,

            rankingLevel: "priority",
            compareVisibility: "priority",

            // Legacy internal value.
// This currently represents a paid featured-listing label,
// not identity or document verification.
            badgeLevel: "verified",
            analyticsLevel: "advanced",

            promoteBoostsPerMonth: 0,

            leadNotifications: true,
        },
    },

    "builder-starter": {
        tier: "builder-starter",
        audience: "builder",

        presentation: {
            displayName: "Builder Starter",
            priceInPaise: 999900,
            billingType: "yearly",
            billingLabel: "per year",

            description:
                "For small builders who want a professional profile and basic project visibility.",

            ctaText: "Choose Builder Starter",
            ctaLink: "/builders/register?plan=starter",

            iconKey: "building",

            analyticsHighlight:
                "Views, phone clicks and favorites count",
        },

        entitlements: {
            activeProperties: 3,
            listingDays: 365,

            maxImages: 10,
            maxVideoLinks: 0,
            verifiedLeadLimit: null,

            featured: false,
            homepageFeatured: false,

            rankingLevel: "standard",
            compareVisibility: "standard",
            badgeLevel: "none",
            analyticsLevel: "basic",

            promoteBoostsPerMonth: 0,

            leadNotifications: false,
        },
    },

    "builder-growth": {
        tier: "builder-growth",
        audience: "builder",

        presentation: {
            displayName: "Builder Growth",
            priceInPaise: 2499900,
            originalPriceInPaise: 2999900,
            billingType: "yearly",
            billingLabel: "per year",

            description:
                "For growing builders who want better visibility, stronger trust signals, and more project exposure.",

            ctaText: "Choose Builder Growth",
            ctaLink: "/builders/register?plan=growth",

            badge: "Most Popular",
            badgeType: "popular",
            iconKey: "briefcase",

            analyticsHighlight:
                "Views, contact clicks, favorites and daily performance trends",
        },

        entitlements: {
            activeProperties: 10,
            listingDays: 365,

            maxImages: 25,
            maxVideoLinks: 1,
            verifiedLeadLimit: null,

            featured: true,
            homepageFeatured: false,

            rankingLevel: "priority",
            compareVisibility: "highlighted",
            badgeLevel: "verified",
            analyticsLevel: "project",

            promoteBoostsPerMonth: 5,

            leadNotifications: true,
        },
    },

    "builder-elite": {
        tier: "builder-elite",
        audience: "builder",

        presentation: {
            displayName: "Builder Elite",
            priceInPaise: 4999900,
            originalPriceInPaise: 5999900,
            billingType: "yearly",
            billingLabel: "per year",

            description:
                "For established builders who want the strongest visibility across builder listings and property discovery.",

            ctaText: "Choose Builder Elite",
            ctaLink: "/builders/register?plan=elite",

            badge: "Enterprise",
            badgeType: "premium",
            iconKey: "crown",

            analyticsHighlight:
                "Portfolio views, contact clicks, favorites and 30-day performance",
        },

        entitlements: {
            activeProperties: 25,
            listingDays: 365,

            maxImages: 40,

            // This is now the authoritative value.
            maxVideoLinks: 3,

            verifiedLeadLimit: null,

            featured: true,
            homepageFeatured: true,

            rankingLevel: "top",
            compareVisibility: "priority",
            badgeLevel: "premium",
            analyticsLevel: "portfolio",

            promoteBoostsPerMonth: 15,
            leadNotifications: true,
        },
    },
} as const satisfies Record<PlanTier, PlanDefinition>;

export function getPlanDefinition(tier: PlanTier): PlanDefinition {
    return PLAN_CATALOG[tier];
}

export function getPlansForAudience(
    audience: PlanAudience
): PlanDefinition[] {
    return Object.values(PLAN_CATALOG).filter(
        (plan) => plan.audience === audience
    );
}

export function isPlanTier(value: unknown): value is PlanTier {
    return (
        typeof value === "string" &&
        Object.prototype.hasOwnProperty.call(PLAN_CATALOG, value)
    );
}