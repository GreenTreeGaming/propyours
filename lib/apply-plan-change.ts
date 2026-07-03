import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Property from "@/models/Property";
import {
    getPlanLimits,
    type PlanTier,
    type PlanStatus,
    type PlanAudience,
} from "@/lib/plans";

type ApplyPlanChangeArgs = {
    userId: string;
    tier: PlanTier;
    status: PlanStatus;
    audience?: PlanAudience;
    source?: "manual" | "payment" | "promo";
    paymentId?: string;
    expiresAt?: Date | null;
};

export async function applyPlanChange({
                                          userId,
                                          tier,
                                          status,
                                          audience,
                                          source = "manual",
                                          paymentId,
                                          expiresAt,
                                      }: ApplyPlanChangeArgs) {
    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const planUser = {
        ...user.toObject(),
        plan: {
            ...user.plan?.toObject?.(),
            tier,
            status,
            audience: audience || user.plan?.audience || "owner",
        },
    };

    const limits = getPlanLimits(planUser);

    user.plan = {
        ...user.plan,
        tier,
        status,
        audience: audience || limits.audience || user.plan?.audience || "owner",
        source,
        startedAt: new Date(),
        expiresAt: expiresAt || undefined,
        boostsRemaining: status === "active" ? limits.promoteBoosts : 0,
        ...(paymentId ? { paymentId } : {}),
    };

    await user.save();

    /**
     * If the user is no longer active, remove all paid visibility.
     * They keep the property records, but none appear publicly.
     */
    if (status !== "active") {
        await Property.updateMany(
            { userId },
            {
                $set: {
                    status: "inactive",
                },
                $unset: {
                    promotedUntil: "",
                },
            }
        );

        return {
            user,
            plan: limits,
            keptActive: 0,
            deactivated: "all",
            boostsRemaining: 0,
        };
    }

    /**
     * Active plan:
     * 1. Keep only the newest allowed number of active listings.
     * 2. Deactivate extras immediately.
     * 3. Cap listing expiry to the new plan duration.
     * 4. Remove boosts if the new plan has no boosts.
     */
    const activeProperties = await Property.find({
        userId,
        status: "active",
        $or: [
            { listingExpiresAt: { $exists: false } },
            { listingExpiresAt: { $gt: new Date() } },
        ],
    }).sort({ createdAt: -1 });

    const allowedActiveCount = limits.activeProperties;
    const propertiesToKeepActive = activeProperties.slice(0, allowedActiveCount);
    const propertiesToDeactivate = activeProperties.slice(allowedActiveCount);

    const keepActiveIds = propertiesToKeepActive.map((property) => property._id);
    const deactivateIds = propertiesToDeactivate.map((property) => property._id);

    if (deactivateIds.length > 0) {
        await Property.updateMany(
            { _id: { $in: deactivateIds } },
            {
                $set: {
                    status: "inactive",
                },
                $unset: {
                    promotedUntil: "",
                },
            }
        );
    }

    const cappedExpiry = new Date(
        Date.now() + limits.listingDays * 24 * 60 * 60 * 1000
    );

    for (const property of propertiesToKeepActive) {
        const setUpdates: Record<string, unknown> = {
            planSnapshot: {
                tier: limits.tier,
                listingDays: limits.listingDays,
                maxPhotos: limits.maxImages,
                maxVideoLinks: limits.maxVideoLinks,
                featured: limits.featured,
                analyticsLevel: limits.analyticsLevel,
            },
            featured: limits.featured,
        };

        const existingExpiry = property.listingExpiresAt
            ? new Date(property.listingExpiresAt)
            : null;

        if (!existingExpiry || existingExpiry.getTime() > cappedExpiry.getTime()) {
            setUpdates.listingExpiresAt = cappedExpiry;
        }

        await Property.updateOne(
            { _id: property._id },
            limits.promoteBoosts <= 0
                ? {
                    $set: setUpdates,
                    $unset: {
                        promotedUntil: "",
                    },
                }
                : {
                    $set: setUpdates,
                }
        );
    }

    /**
     * If new plan has no boosts, remove promotedUntil from every property,
     * not just active ones.
     */
    if (limits.promoteBoosts <= 0) {
        await Property.updateMany(
            { userId },
            {
                $unset: {
                    promotedUntil: "",
                },
            }
        );
    }

    return {
        user,
        plan: limits,
        keptActive: keepActiveIds.length,
        deactivated: deactivateIds.length,
        boostsRemaining: user.plan.boostsRemaining,
    };
}