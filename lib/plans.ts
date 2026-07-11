import {
    PLAN_CATALOG,
    isPlanTier,
    type PlanAudience,
    type PlanStatus,
    type PlanTier,
} from "@/lib/plan-catalog";

export type {
    AnalyticsLevel,
    BadgeLevel,
    CompareVisibility,
    PlanAudience,
    PlanStatus,
    PlanTier,
    RankingLevel,
} from "@/lib/plan-catalog";

export function getPlanTier(user: any): PlanTier {
    const tier = user?.plan?.tier;
    const status = user?.plan?.status as PlanStatus | undefined;

    if (!isPlanTier(tier)) {
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
    const plan = PLAN_CATALOG[tier];

    return {
        tier,
        audience: plan.audience,

        ...plan.entitlements,

        /**
         * Temporary compatibility aliases.
         * Existing code currently expects these property names.
         */
        promoteBoosts: plan.entitlements.promoteBoostsPerMonth,
    };
}