import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import {
    PLAN_CATALOG,
    isPlanTier,
} from "@/lib/plan-catalog";
import {
    type PlanTier,
    type PlanStatus,
    type PlanAudience,
} from "@/lib/plans";
import { addCalendarMonth } from "@/lib/boost-dates";

import User from "@/models/User";
import Property from "@/models/Property";
import BoostTransaction from "@/models/BoostTransaction";

type ApplyPlanChangeArgs = {
    userId: string;
    tier: PlanTier;
    status: PlanStatus;
    audience?: PlanAudience;
    source?: "manual" | "payment" | "promo";
    paymentId?: string;
    expiresAt?: Date | null;
};

type PlanChangeType =
    | "plan_activated"
    | "plan_upgraded"
    | "plan_downgraded"
    | "plan_expired";

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

    const session = await mongoose.startSession();

    try {
        let result:
            | {
            user: any;
            plan: {
                tier: PlanTier;
                audience: PlanAudience;
                activeProperties: number;
                listingDays: number;
                maxImages: number;
                maxVideoLinks: number;
                verifiedLeadLimit: number | null;
                featured: boolean;
                homepageFeatured: boolean;
                rankingLevel: string;
                compareVisibility: string;
                badgeLevel: string;
                analyticsLevel: string;
                promoteBoostsPerMonth: number;
                leadNotifications: boolean;
            };
            keptActive: number;
            deactivated: number | "all";
            boostsRemaining: number;
            boostsResetAt: Date | null;
        }
            | undefined;

        await session.withTransaction(async () => {
            const user = await User.findById(userId).session(session);

            if (!user) {
                throw new Error("User not found");
            }

            const now = new Date();
            const targetPlan = PLAN_CATALOG[tier];

            const limits = {
                tier,
                audience: targetPlan.audience,
                ...targetPlan.entitlements,
            };

            const previousTier = isPlanTier(user.plan?.tier)
                ? user.plan.tier
                : "silver";

            const previousStatus = user.plan?.status as
                | PlanStatus
                | undefined;

            const previousBalance =
                user.plan?.boostsRemaining ?? 0;

            const previousMonthlyAllowance =
                PLAN_CATALOG[previousTier].entitlements
                    .promoteBoostsPerMonth;

            const newMonthlyAllowance =
                status === "active"
                    ? limits.promoteBoostsPerMonth
                    : 0;

            const isActivation =
                status === "active" &&
                previousStatus !== "active";

            const isTierChange =
                status === "active" &&
                previousTier !== tier;

            /*
             * Only grant a fresh allowance when:
             * - activating a plan;
             * - upgrading;
             * - downgrading.
             *
             * Calling applyPlanChange repeatedly for the same active
             * plan must not refill the user's credits.
             */
            const shouldResetBoostAllowance =
                isActivation || isTierChange;

            let nextBoostBalance = previousBalance;
            let boostsResetAt = user.plan?.boostsResetAt
                ? new Date(user.plan.boostsResetAt)
                : undefined;

            let lastBoostResetAt =
                user.plan?.lastBoostResetAt
                    ? new Date(user.plan.lastBoostResetAt)
                    : undefined;

            if (status !== "active") {
                nextBoostBalance = 0;
                boostsResetAt = undefined;
                lastBoostResetAt = undefined;
            } else if (newMonthlyAllowance <= 0) {
                nextBoostBalance = 0;
                boostsResetAt = undefined;
                lastBoostResetAt = undefined;
            } else if (shouldResetBoostAllowance) {
                nextBoostBalance = newMonthlyAllowance;
                lastBoostResetAt = now;
                boostsResetAt = addCalendarMonth(now);
            } else if (!boostsResetAt) {
                /*
                 * Existing active plan missing a reset date.
                 * Establish the schedule without granting extra credits.
                 */
                boostsResetAt = addCalendarMonth(
                    user.plan?.startedAt
                        ? new Date(user.plan.startedAt)
                        : now
                );

                while (
                    boostsResetAt.getTime() <= now.getTime()
                    ) {
                    boostsResetAt =
                        addCalendarMonth(boostsResetAt);
                }
            }

            const resolvedAudience =
                audience ??
                targetPlan.audience ??
                user.plan?.audience ??
                "owner";

            user.plan = {
                ...user.plan?.toObject?.(),
                tier,
                status,
                audience: resolvedAudience,
                source,

                /*
                 * Start a new plan period for activation/tier changes.
                 * Preserve the existing date for an idempotent update.
                 */
                startedAt:
                    isActivation || isTierChange
                        ? now
                        : user.plan?.startedAt ?? now,

                /*
                 * Passing null explicitly clears expiry.
                 * Omitting expiresAt preserves its current value.
                 */
                expiresAt:
                    expiresAt === null
                        ? undefined
                        : expiresAt ??
                        user.plan?.expiresAt ??
                        undefined,

                boostsRemaining: nextBoostBalance,
                boostsResetAt,
                lastBoostResetAt,

                paymentId:
                    paymentId ??
                    user.plan?.paymentId ??
                    undefined,
            };

            await user.save({ session });

            const shouldRecordPlanChange =
                previousTier !== tier ||
                previousStatus !== status ||
                previousBalance !== nextBoostBalance;

            if (shouldRecordPlanChange) {
                const transactionType =
                    getPlanChangeType({
                        previousStatus,
                        newStatus: status,
                        previousTier,
                        newTier: tier,
                        previousMonthlyAllowance,
                        newMonthlyAllowance,
                    });

                await BoostTransaction.create(
                    [
                        {
                            userId: user._id,
                            type: transactionType,
                            amount:
                                nextBoostBalance -
                                previousBalance,
                            balanceBefore: previousBalance,
                            balanceAfter: nextBoostBalance,
                            planTier: tier,
                            metadata: {
                                previousTier,
                                previousStatus,
                                source,
                                boostsResetAt:
                                    boostsResetAt ?? null,
                            },
                        },
                    ],
                    { session }
                );
            }

            /*
             * Expired/cancelled plans:
             * deactivate all properties and remove promotions.
             */
            if (status !== "active") {
                await Property.updateMany(
                    { userId: user._id },
                    {
                        $set: {
                            status: "inactive",
                        },
                        $unset: {
                            promotedUntil: "",
                        },
                    },
                    { session }
                );

                result = {
                    user: user.toObject(),
                    plan: limits,
                    keptActive: 0,
                    deactivated: "all",
                    boostsRemaining: 0,
                    boostsResetAt: null,
                };

                return;
            }

            const activeProperties = await Property.find({
                userId: user._id,
                status: "active",
                $or: [
                    {
                        listingExpiresAt: {
                            $exists: false,
                        },
                    },
                    {
                        listingExpiresAt: {
                            $gt: now,
                        },
                    },
                ],
            })
                .sort({ createdAt: -1 })
                .session(session);

            const allowedActiveCount =
                limits.activeProperties;

            const propertiesToKeepActive =
                activeProperties.slice(
                    0,
                    allowedActiveCount
                );

            const propertiesToDeactivate =
                activeProperties.slice(
                    allowedActiveCount
                );

            const keepActiveIds =
                propertiesToKeepActive.map(
                    (property) => property._id
                );

            const deactivateIds =
                propertiesToDeactivate.map(
                    (property) => property._id
                );

            if (deactivateIds.length > 0) {
                await Property.updateMany(
                    {
                        _id: {
                            $in: deactivateIds,
                        },
                    },
                    {
                        $set: {
                            status: "inactive",
                        },
                        $unset: {
                            promotedUntil: "",
                        },
                    },
                    { session }
                );
            }

            const cappedExpiry = new Date(
                now.getTime() +
                limits.listingDays *
                24 *
                60 *
                60 *
                1000
            );

            for (const property of propertiesToKeepActive) {
                const setUpdates: Record<
                    string,
                    unknown
                > = {
                    planSnapshot: {
                        tier: limits.tier,
                        listingDays:
                        limits.listingDays,
                        maxPhotos:
                        limits.maxImages,
                        maxVideoLinks:
                        limits.maxVideoLinks,
                        featured:
                        limits.featured,
                        homepageFeatured:
                        limits.homepageFeatured,
                        rankingLevel:
                        limits.rankingLevel,
                        compareVisibility:
                        limits.compareVisibility,
                        badgeLevel:
                        limits.badgeLevel,
                        analyticsLevel:
                        limits.analyticsLevel,
                    },

                    featured:
                    limits.featured,
                };

                const existingExpiry =
                    property.listingExpiresAt
                        ? new Date(
                            property.listingExpiresAt
                        )
                        : null;

                if (
                    !existingExpiry ||
                    existingExpiry.getTime() >
                    cappedExpiry.getTime()
                ) {
                    setUpdates.listingExpiresAt =
                        cappedExpiry;
                }

                const update =
                    limits.promoteBoostsPerMonth <= 0
                        ? {
                            $set: setUpdates,
                            $unset: {
                                promotedUntil: "",
                            },
                        }
                        : {
                            $set: setUpdates,
                        };

                await Property.updateOne(
                    {
                        _id: property._id,
                    },
                    update,
                    { session }
                );
            }

            /*
             * A plan without boosts cannot retain active promotions.
             */
            if (
                limits.promoteBoostsPerMonth <= 0
            ) {
                await Property.updateMany(
                    {
                        userId: user._id,
                    },
                    {
                        $unset: {
                            promotedUntil: "",
                        },
                    },
                    { session }
                );
            }

            result = {
                user: user.toObject(),
                plan: limits,
                keptActive: keepActiveIds.length,
                deactivated:
                deactivateIds.length,
                boostsRemaining:
                    user.plan.boostsRemaining ?? 0,
                boostsResetAt:
                    user.plan.boostsResetAt ??
                    null,
            };
        });

        if (!result) {
            throw new Error(
                "Plan change did not complete"
            );
        }

        return result;
    } finally {
        await session.endSession();
    }
}

function getPlanChangeType({
                               previousStatus,
                               newStatus,
                               previousTier,
                               newTier,
                               previousMonthlyAllowance,
                               newMonthlyAllowance,
                           }: {
    previousStatus?: PlanStatus;
    newStatus: PlanStatus;
    previousTier: PlanTier;
    newTier: PlanTier;
    previousMonthlyAllowance: number;
    newMonthlyAllowance: number;
}): PlanChangeType {
    if (newStatus !== "active") {
        return "plan_expired";
    }

    if (previousStatus !== "active") {
        return "plan_activated";
    }

    if (previousTier !== newTier) {
        return newMonthlyAllowance >=
        previousMonthlyAllowance
            ? "plan_upgraded"
            : "plan_downgraded";
    }

    return "plan_activated";
}