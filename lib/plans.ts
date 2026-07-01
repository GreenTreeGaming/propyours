export type PlanTier =
    | "silver"
    | "gold"
    | "platinum"
    | "builder-starter"
    | "builder-growth"
    | "builder-elite";

export const PLAN_LIMITS: Record<
    PlanTier,
    {
        audience: "owner" | "builder";
        activeProperties: number;
        listingDays: number;
        maxImages: number;
        maxVideoLinks: number;
        featured: boolean;
        analyticsLevel: "none" | "basic" | "advanced" | "project" | "portfolio";
        promoteBoosts: number;
    }
> = {
    silver: {
        audience: "owner",
        activeProperties: 1,
        listingDays: 30,
        maxImages: 5,
        maxVideoLinks: 0,
        featured: false,
        analyticsLevel: "none",
        promoteBoosts: 0,
    },

    gold: {
        audience: "owner",
        activeProperties: 1,
        listingDays: 90,
        maxImages: 20,
        maxVideoLinks: 1,
        featured: true,
        analyticsLevel: "basic",
        promoteBoosts: 0,
    },

    platinum: {
        audience: "owner",
        activeProperties: 2,
        listingDays: 180,
        maxImages: 30,
        maxVideoLinks: 2,
        featured: true,
        analyticsLevel: "advanced",
        promoteBoosts: 0,
    },

    "builder-starter": {
        audience: "builder",
        activeProperties: 3,
        listingDays: 365,
        maxImages: 10,
        maxVideoLinks: 0,
        featured: false,
        analyticsLevel: "basic",
        promoteBoosts: 0,
    },

    "builder-growth": {
        audience: "builder",
        activeProperties: 10,
        listingDays: 365,
        maxImages: 25,
        maxVideoLinks: 1,
        featured: true,
        analyticsLevel: "project",
        promoteBoosts: 5,
    },

    "builder-elite": {
        audience: "builder",
        activeProperties: 25,
        listingDays: 365,
        maxImages: 40,
        maxVideoLinks: 3,
        featured: true,
        analyticsLevel: "portfolio",
        promoteBoosts: 15,
    },
};

export function getPlanTier(user: any): PlanTier {
    const tier = user?.plan?.tier as PlanTier | undefined;
    const status = user?.plan?.status;

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