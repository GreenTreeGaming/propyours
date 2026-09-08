import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import {
    getAuthenticatedUser,
    isAuthError,
} from "@/lib/auth";
import { getPlanLimits } from "@/lib/plans";
import {
    refreshBoostAllowanceIfNeeded,
} from "@/lib/refresh-boost-allowance";

import User from "@/models/User";
import Property from "@/models/Property";
import BoostTransaction from "@/models/BoostTransaction";

const BOOST_DURATION_DAYS = 7;

class PromotePropertyError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);

        this.name =
            "PromotePropertyError";
    }
}

export async function POST(
    _request: Request,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    },
) {
    const auth =
        await getAuthenticatedUser();

    if (isAuthError(auth)) {
        return auth;
    }

    await connectDB();

    const { id } = await params;

    if (
        !mongoose.isValidObjectId(id)
    ) {
        return NextResponse.json(
            {
                error:
                    "Invalid property ID.",
            },
            {
                status: 400,
            },
        );
    }

    const session =
        await mongoose.startSession();

    try {
        let responseData:
            | {
            property: Record<
                string,
                unknown
            >;

            boostsRemaining: number;

            boostsResetAt:
                | Date
                | null;

            promotedUntil: Date;
        }
            | undefined;

        await session.withTransaction(
            async () => {
                const now = new Date();

                const user =
                    await User.findById(
                        auth.userId,
                    ).session(session);

                if (!user) {
                    throw new PromotePropertyError(
                        "User not found.",
                        404,
                    );
                }

                /*
                 * Lazy monthly reset for normal paid accounts.
                 *
                 * For an unlimited account this also guarantees the
                 * effective unlimited balance is initialized before
                 * the property promotion is processed.
                 */
                await refreshBoostAllowanceIfNeeded(
                    user,
                    {
                        now,
                        session,
                        save: true,
                    },
                );

                const limits =
                    getPlanLimits(
                        user,
                        now,
                    );

                const planExpiresAt =
                    user.plan?.expiresAt
                        ? new Date(
                            user.plan
                                .expiresAt,
                        )
                        : null;

                /*
                 * Normal subscriptions must be active and unexpired.
                 *
                 * Internal unlimited access deliberately bypasses that
                 * lifecycle because it is an administrator entitlement,
                 * not a customer subscription.
                 */
                if (
                    !limits.unlimitedAccess &&
                    (
                        user.plan?.status !==
                        "active" ||
                        (
                            planExpiresAt &&
                            planExpiresAt.getTime() <=
                            now.getTime()
                        )
                    )
                ) {
                    throw new PromotePropertyError(
                        "Your plan is not active.",
                        403,
                    );
                }

                if (
                    limits.promoteBoostsPerMonth <=
                    0
                ) {
                    throw new PromotePropertyError(
                        "Promote boosts are not included in your current plan.",
                        403,
                    );
                }

                const property =
                    await Property.findOne(
                        {
                            _id: id,

                            userId:
                            auth.userId,

                            status:
                                "active",

                            $or: [
                                {
                                    listingExpiresAt:
                                        {
                                            $exists:
                                                false,
                                        },
                                },
                                {
                                    listingExpiresAt:
                                        {
                                            $gt: now,
                                        },
                                },
                            ],
                        },
                    ).session(
                        session,
                    );

                if (!property) {
                    throw new PromotePropertyError(
                        "Active property not found.",
                        404,
                    );
                }

                if (
                    property.promotedUntil &&
                    new Date(
                        property.promotedUntil,
                    ).getTime() >
                    now.getTime()
                ) {
                    throw new PromotePropertyError(
                        "This property is already boosted.",
                        400,
                    );
                }

                const balanceBefore =
                    user.plan
                        ?.boostsRemaining ??
                    0;

                if (
                    balanceBefore <= 0
                ) {
                    throw new PromotePropertyError(
                        "No boost tokens remaining on your account.",
                        403,
                    );
                }

                const promotedUntil =
                    new Date(
                        now.getTime() +
                        BOOST_DURATION_DAYS *
                        24 *
                        60 *
                        60 *
                        1000,
                    );

                /*
                 * The unlimited account is replenished back to its
                 * effective maximum by refreshBoostAllowanceIfNeeded()
                 * before each use. Normal plans continue consuming
                 * their real token balance normally.
                 */
                user.plan.boostsRemaining =
                    balanceBefore - 1;

                property.promotedUntil =
                    promotedUntil;

                await user.save({
                    session,
                });

                await property.save({
                    session,
                });

                await BoostTransaction.create(
                    [
                        {
                            userId:
                            user._id,

                            propertyId:
                            property._id,

                            type:
                                "boost_used",

                            amount: -1,

                            balanceBefore,

                            balanceAfter:
                                balanceBefore -
                                1,

                            planTier:
                            limits.tier,

                            metadata: {
                                promotedUntil,

                                durationDays:
                                BOOST_DURATION_DAYS,

                                unlimitedAccess:
                                limits.unlimitedAccess,
                            },
                        },
                    ],
                    {
                        session,
                    },
                );

                responseData = {
                    property:
                        property.toObject(),

                    boostsRemaining:
                    user.plan
                        .boostsRemaining,

                    boostsResetAt:
                        user.plan
                            .boostsResetAt ??
                        null,

                    promotedUntil,
                };
            },
        );

        if (!responseData) {
            throw new Error(
                "Promotion transaction did not complete",
            );
        }

        return NextResponse.json({
            success: true,
            ...responseData,
        });
    } catch (error) {
        if (
            error instanceof
            PromotePropertyError
        ) {
            return NextResponse.json(
                {
                    error:
                    error.message,
                },
                {
                    status:
                    error.status,
                },
            );
        }

        console.error(
            "Failed to promote property:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Failed to promote property.",
            },
            {
                status: 500,
            },
        );
    } finally {
        await session.endSession();
    }
}