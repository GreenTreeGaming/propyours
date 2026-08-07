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

export function getPlanTier(
    user: any,
    now = new Date(),
): PlanTier {
    const tier = user?.plan?.tier;
    const status = user?.plan?.status as PlanStatus | undefined;
    const expiresAt = user?.plan?.expiresAt
        ? new Date(user.plan.expiresAt)
        : null;

    if (!isPlanTier(tier) || tier === "silver") {
        return "silver";
    }

    if (
        status !== "active" ||
        (expiresAt &&
            (!Number.isFinite(expiresAt.getTime()) ||
                expiresAt.getTime() <= now.getTime()))
    ) {
        return "silver";
    }

    return tier;
}

export function getPlanLimits(
    user: any,
    now = new Date(),
) {
    const tier = getPlanTier(user, now);
    const plan = PLAN_CATALOG[tier];

    return {
        tier,
        audience: plan.audience,

        ...plan.entitlements,
    };
}