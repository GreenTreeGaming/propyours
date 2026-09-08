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

/*
 * MongoDB/JavaScript still needs finite numbers for comparisons.
 *
 * This is effectively unlimited for application quotas without using
 * Infinity, which should not be persisted or passed into Mongo queries.
 */
const UNLIMITED_QUOTA = Number.MAX_SAFE_INTEGER;

export function hasUnlimitedAccess(user: any): boolean {
    return user?.plan?.unlimitedAccess === true;
}

export function getPlanTier(
    user: any,
    now = new Date(),
): PlanTier {
    const tier = user?.plan?.tier;
    const status = user?.plan?.status as PlanStatus | undefined;
    const expiresAt = user?.plan?.expiresAt
        ? new Date(user.plan.expiresAt)
        : null;

    /*
     * Unlimited access is an entitlement override.
     *
     * We still preserve the real underlying tier instead of creating
     * a fake public "unlimited" tier.
     */
    if (hasUnlimitedAccess(user) && isPlanTier(tier)) {
        return tier;
    }

    if (!isPlanTier(tier) || tier === "silver") {
        return "silver";
    }

    if (
        status !== "active" ||
        (
            expiresAt &&
            (
                !Number.isFinite(expiresAt.getTime()) ||
                expiresAt.getTime() <= now.getTime()
            )
        )
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

    if (hasUnlimitedAccess(user)) {
        return {
            tier,
            audience: plan.audience,

            unlimitedAccess: true,

            activeProperties: UNLIMITED_QUOTA,

            /*
             * Listing expiration is handled separately by callers when
             * unlimitedAccess is true.
             */
            listingDays: plan.entitlements.listingDays,

            maxImages: UNLIMITED_QUOTA,
            maxVideoLinks: UNLIMITED_QUOTA,

            verifiedLeadLimit: null,

            featured: true,
            homepageFeatured: true,

            rankingLevel: "top" as const,
            compareVisibility: "priority" as const,
            badgeLevel: "premium" as const,
            analyticsLevel: "portfolio" as const,

            promoteBoostsPerMonth: UNLIMITED_QUOTA,
            leadNotifications: true,
        };
    }

    return {
        tier,
        audience: plan.audience,

        unlimitedAccess: false,

        ...plan.entitlements,
    };
}