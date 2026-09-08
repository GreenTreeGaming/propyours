import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import {
    PLAN_CATALOG,
    isPlanTier,
} from "@/lib/plan-catalog";
import {
    getPlanLimits,
    type PlanTier,
    type PlanStatus,
    type PlanAudience,
} from "@/lib/plans";
import { addCalendarMonth } from "@/lib/boost-dates";

import User from "@/models/User";
import Property from "@/models/Property";
import BoostTransaction from "@/models/BoostTransaction";
import {
    setListingCapacity,
} from "@/lib/listing-capacity";

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
                unlimitedAccess: boolean;
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
            const user = await User.findById(userId).session(
                session,
            );

            if (!user) {
                throw new Error("User not found");
            }

            const now = new Date();
            const targetPlan = PLAN_CATALOG[tier];

            const expectedAudience: PlanAudience =
                user.role === "Builder"
                    ? "builder"
                    : user.role === "Agent"
                        ? "agent"
                        : "owner";

            if (
                targetPlan.audience !==
                expectedAudience
            ) {
                throw new Error(
                    "This plan is not available for this account type.",
                );
            }

            const catalogLimits = {
                tier,
                audience: targetPlan.audience,
                unlimitedAccess: false,
                ...targetPlan.entitlements,
            };

            const previousTier = isPlanTier(
                user.plan?.tier,
            )
                ? user.plan.tier
                : "silver";

            const previousStatus =
                user.plan?.status as
                    | PlanStatus
                    | undefined;

            const previousBalance =
                user.plan?.boostsRemaining ?? 0;

            /*
             * Preserve the internal entitlement override independently
             * of the underlying public/customer plan.
             */
            const unlimitedAccess =
                user.plan?.unlimitedAccess === true;

            /*
             * Unlimited accounts receive an effectively unlimited boost
             * balance regardless of the underlying subscription status.
             */
            const newMonthlyAllowance =
                unlimitedAccess
                    ? Number.MAX_SAFE_INTEGER
                    : status === "active"
                        ? catalogLimits.promoteBoostsPerMonth
                        : 0;

            const isActivation =
                status === "active" &&
                previousStatus !== "active";

            const isTierChange =
                status === "active" &&
                previousTier !== tier;

            const shouldResetBoostAllowance =
                isActivation || isTierChange;

            let nextBoostBalance = previousBalance;

            let boostsResetAt =
                user.plan?.boostsResetAt
                    ? new Date(
                        user.plan.boostsResetAt,
                    )
                    : undefined;

            let lastBoostResetAt =
                user.plan?.lastBoostResetAt
                    ? new Date(
                        user.plan.lastBoostResetAt,
                    )
                    : undefined;

            /*
             * Unlimited accounts do not depend on the normal monthly
             * subscription lifecycle.
             */
            if (unlimitedAccess) {
                nextBoostBalance =
                    Number.MAX_SAFE_INTEGER;
                boostsResetAt = undefined;
                lastBoostResetAt = undefined;
            } else if (status !== "active") {
                nextBoostBalance = 0;
                boostsResetAt = undefined;
                lastBoostResetAt = undefined;
            } else if (newMonthlyAllowance <= 0) {
                nextBoostBalance = 0;
                boostsResetAt = undefined;
                lastBoostResetAt = undefined;
            } else if (shouldResetBoostAllowance) {
                nextBoostBalance =
                    newMonthlyAllowance;

                lastBoostResetAt = now;

                boostsResetAt =
                    addCalendarMonth(now);
            } else if (!boostsResetAt) {
                /*
                 * Existing active plan missing a reset date.
                 * Establish the schedule without granting an
                 * additional duplicate balance.
                 */
                boostsResetAt = addCalendarMonth(
                    user.plan?.startedAt
                        ? new Date(
                            user.plan.startedAt,
                        )
                        : now,
                );

                while (
                    boostsResetAt.getTime() <=
                    now.getTime()
                    ) {
                    boostsResetAt =
                        addCalendarMonth(
                            boostsResetAt,
                        );
                }
            }

            const resolvedAudience =
                audience ??
                targetPlan.audience ??
                user.plan?.audience ??
                "owner";

            user.plan = {
                ...user.plan?.toObject?.(),

                unlimitedAccess,

                tier,
                status,
                audience: resolvedAudience,
                source,

                /*
                 * Start a new normal plan period for an activation or
                 * tier change. Unlimited access remains independent.
                 */
                startedAt:
                    isActivation || isTierChange
                        ? now
                        : user.plan?.startedAt ??
                        now,

                /*
                 * Passing null explicitly clears expiry.
                 * Omitting expiresAt preserves the existing expiry.
                 */
                expiresAt:
                    expiresAt === null
                        ? undefined
                        : expiresAt ??
                        user.plan?.expiresAt ??
                        undefined,

                boostsRemaining:
                nextBoostBalance,

                boostsResetAt,
                lastBoostResetAt,

                paymentId:
                    paymentId ??
                    user.plan?.paymentId ??
                    undefined,
            };

            await user.save({ session });

            /*
             * Calculate the real effective entitlements after the plan
             * has been written. This is important because unlimitedAccess
             * overrides the underlying catalog tier.
             */
            const effectiveLimits =
                getPlanLimits(user, now);

            const shouldRecordPlanChange =
                previousTier !== tier ||
                previousStatus !== status ||
                previousBalance !==
                nextBoostBalance;

            if (shouldRecordPlanChange) {
                const transactionType =
                    getPlanChangeType({
                        previousStatus,
                        newStatus: status,
                        previousTier,
                        newTier: tier,
                    });

                await BoostTransaction.create(
                    [
                        {
                            userId: user._id,
                            type: transactionType,

                            amount:
                                nextBoostBalance -
                                previousBalance,

                            balanceBefore:
                            previousBalance,

                            balanceAfter:
                            nextBoostBalance,

                            planTier: tier,

                            metadata: {
                                previousTier,
                                previousStatus,
                                source,

                                unlimitedAccess,

                                boostsResetAt:
                                    boostsResetAt ??
                                    null,
                            },
                        },
                    ],
                    { session },
                );
            }

            /*
             * Normal inactive plans have zero active capacity.
             *
             * The internal unlimited override remains usable even if its
             * underlying customer-facing plan is expired/free/cancelled.
             */
            const {
                kept: propertiesToKeepActive,
                deactivated:
                    propertiesToDeactivate,
            } = await setListingCapacity(
                user,
                unlimitedAccess
                    ? effectiveLimits.activeProperties
                    : status === "active"
                        ? effectiveLimits.activeProperties
                        : 0,
                session,
            );

            if (
                status !== "active" &&
                !unlimitedAccess
            ) {
                result = {
                    user: user.toObject(),
                    plan: effectiveLimits,
                    keptActive: 0,
                    deactivated: "all",
                    boostsRemaining: 0,
                    boostsResetAt: null,
                };

                return;
            }

            const cappedExpiry =
                unlimitedAccess
                    ? null
                    : new Date(
                        now.getTime() +
                        effectiveLimits.listingDays *
                        24 *
                        60 *
                        60 *
                        1000,
                    );

            for (
                const property of
                propertiesToKeepActive
                ) {
                const setUpdates: Record<
                    string,
                    unknown
                > = {
                    planSnapshot: {
                        tier:
                        effectiveLimits.tier,

                        listingDays:
                        effectiveLimits.listingDays,

                        maxPhotos:
                        effectiveLimits.maxImages,

                        maxVideoLinks:
                        effectiveLimits.maxVideoLinks,

                        featured:
                        effectiveLimits.featured,

                        homepageFeatured:
                        effectiveLimits.homepageFeatured,

                        rankingLevel:
                        effectiveLimits.rankingLevel,

                        compareVisibility:
                        effectiveLimits.compareVisibility,

                        badgeLevel:
                        effectiveLimits.badgeLevel,

                        analyticsLevel:
                        effectiveLimits.analyticsLevel,
                    },

                    featured:
                    effectiveLimits.featured,
                };

                const unsetUpdates: Record<
                    string,
                    string
                > = {};

                if (unlimitedAccess) {
                    /*
                     * Unlimited listings never expire.
                     */
                    unsetUpdates.listingExpiresAt =
                        "";
                } else {
                    const existingExpiry =
                        property.listingExpiresAt
                            ? new Date(
                                property.listingExpiresAt,
                            )
                            : null;

                    if (
                        !existingExpiry ||
                        (
                            cappedExpiry &&
                            existingExpiry.getTime() >
                            cappedExpiry.getTime()
                        )
                    ) {
                        setUpdates.listingExpiresAt =
                            cappedExpiry;
                    }
                }

                if (
                    effectiveLimits
                        .promoteBoostsPerMonth <= 0
                ) {
                    unsetUpdates.promotedUntil =
                        "";
                }

                const update =
                    Object.keys(unsetUpdates)
                        .length > 0
                        ? {
                            $set: setUpdates,
                            $unset:
                            unsetUpdates,
                        }
                        : {
                            $set: setUpdates,
                        };

                await Property.updateOne(
                    {
                        _id: property._id,
                    },
                    update,
                    { session },
                );
            }

            /*
             * A normal plan without boosts cannot retain an active
             * promotion. Unlimited accounts never enter this branch.
             */
            if (
                effectiveLimits
                    .promoteBoostsPerMonth <= 0
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
                    { session },
                );
            }

            result = {
                user: user.toObject(),
                plan: effectiveLimits,

                keptActive:
                propertiesToKeepActive.length,

                deactivated:
                propertiesToDeactivate.length,

                boostsRemaining:
                    user.plan
                        .boostsRemaining ?? 0,

                boostsResetAt:
                    user.plan
                        .boostsResetAt ?? null,
            };
        });

        if (!result) {
            throw new Error(
                "Plan change did not complete",
            );
        }

        return result;
    } finally {
        await session.endSession();
    }
}

const PLAN_RANK: Record<
    PlanTier,
    number
> = {
    silver: 1,
    gold: 2,
    platinum: 3,

    "builder-starter": 1,
    "builder-growth": 2,
    "builder-elite": 3,

    "agent-ruby": 1,
    "agent-emerald": 2,
    "agent-diamond": 3,
};

function getPlanChangeType({
                               previousStatus,
                               newStatus,
                               previousTier,
                               newTier,
                           }: {
    previousStatus?: PlanStatus;
    newStatus: PlanStatus;
    previousTier: PlanTier;
    newTier: PlanTier;
}): PlanChangeType {
    if (newStatus !== "active") {
        return "plan_expired";
    }

    if (previousStatus !== "active") {
        return "plan_activated";
    }

    if (
        PLAN_RANK[newTier] >
        PLAN_RANK[previousTier]
    ) {
        return "plan_upgraded";
    }

    if (
        PLAN_RANK[newTier] <
        PLAN_RANK[previousTier]
    ) {
        return "plan_downgraded";
    }

    return "plan_activated";
}