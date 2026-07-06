export type PlanTier =
    | "silver"
    | "gold"
    | "platinum"
    | "builder-starter"
    | "builder-growth"
    | "builder-elite";

export type PlanStatus = "free" | "active" | "expired" | "cancelled";

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

export type PlanLimits = {
    audience: PlanAudience;

    activeProperties: number;
    listingDays: number;

    maxImages: number;
    maxVideoLinks: number;

    verifiedLeadLimit: number | null;

    featured: boolean;
    homepageFeatured: boolean;

    rankingLevel: RankingLevel;
    compareVisibility: CompareVisibility;
    badgeLevel: BadgeLevel;

    analyticsLevel: AnalyticsLevel;

    promoteBoosts: number;
    scheduledBoosts: boolean;

    leadNotifications: boolean;
    leadExport: boolean;
    buyerDemographics: boolean;
    whatsappSmsAlerts: boolean;
    prioritySupport: boolean;
};

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
    silver: {
        audience: "owner",
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
        promoteBoosts: 0,
        scheduledBoosts: false,
        leadNotifications: false,
        leadExport: false,
        buyerDemographics: false,
        whatsappSmsAlerts: false,
        prioritySupport: false,
    },

    gold: {
        audience: "owner",
        activeProperties: 1,
        listingDays: 90,
        maxImages: 20,
        maxVideoLinks: 1,
        verifiedLeadLimit: 25,
        featured: true,
        homepageFeatured: false,
        rankingLevel: "featured",
        compareVisibility: "highlighted",
        badgeLevel: "verified",
        analyticsLevel: "basic",
        promoteBoosts: 0,
        scheduledBoosts: false,
        leadNotifications: true,
        leadExport: false,
        buyerDemographics: false,
        whatsappSmsAlerts: false,
        prioritySupport: false,
    },

    platinum: {
        audience: "owner",
        activeProperties: 2,
        listingDays: 180,
        maxImages: 30,
        maxVideoLinks: 2,
        verifiedLeadLimit: null,
        featured: true,
        homepageFeatured: true,
        rankingLevel: "priority",
        compareVisibility: "priority",
        badgeLevel: "verified",
        analyticsLevel: "advanced",
        promoteBoosts: 0,
        scheduledBoosts: false,
        leadNotifications: true,
        leadExport: true,
        buyerDemographics: true,
        whatsappSmsAlerts: true,
        prioritySupport: true,
    },

    "builder-starter": {
        audience: "builder",
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
        promoteBoosts: 0,
        scheduledBoosts: false,
        leadNotifications: false,
        leadExport: false,
        buyerDemographics: false,
        whatsappSmsAlerts: false,
        prioritySupport: false,
    },

    "builder-growth": {
        audience: "builder",
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
        promoteBoosts: 5,
        scheduledBoosts: false,
        leadNotifications: true,
        leadExport: false,
        buyerDemographics: false,
        whatsappSmsAlerts: false,
        prioritySupport: false,
    },

    "builder-elite": {
        audience: "builder",
        activeProperties: 25,
        listingDays: 365,
        maxImages: 40,
        maxVideoLinks: 3,
        verifiedLeadLimit: null,
        featured: true,
        homepageFeatured: true,
        rankingLevel: "top",
        compareVisibility: "priority",
        badgeLevel: "premium",
        analyticsLevel: "portfolio",
        promoteBoosts: 15,
        scheduledBoosts: true,
        leadNotifications: true,
        leadExport: false,
        buyerDemographics: false,
        whatsappSmsAlerts: false,
        prioritySupport: true,
    },
};

export function getPlanTier(user: any): PlanTier {
    const tier = user?.plan?.tier as PlanTier | undefined;
    const status = user?.plan?.status as PlanStatus | undefined;

    if (!tier || !PLAN_LIMITS[tier]) {
        return "silver";
    }

    if (tier === "silver") {
        return "silver";
    }

    if (status !== "active") {
        return "silver";
    }

    return tier;
}

export function getPlanLimits(user: any) {
    const tier = getPlanTier(user);

    return {
        tier,
        ...PLAN_LIMITS[tier],
    };
}