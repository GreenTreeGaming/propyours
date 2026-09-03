import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import User from "@/models/User";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";
import { getPlanLimits } from "@/lib/plans";

import {
    createHash,
} from "node:crypto";
import mongoose from "mongoose";

import {
    getHashedClientIdentifier,
} from "@/lib/request-identity";
import {
    createRateLimitResponse,
    enforceRateLimit,
    RateLimitError,
} from "@/lib/rate-limit";
import {
    parseJsonBody,
} from "@/lib/validation/api";
import {
    analyticsEventSchema,
} from "@/lib/validation/analytics";

import AnalyticsEvent from "@/models/AnalyticsEvent";

type AnalyticsEventType = "view" | "phoneClick";

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function getAllowedAnalytics(property: any, analyticsLevel: string) {
    const analytics = property.analytics || {};
    const dailyStats = analytics.dailyStats || [];

    const basicAnalytics = {
        level: analyticsLevel,
        views: analytics.views || 0,
        phoneClicks: analytics.phoneClicks || 0,
        favoritesCount: analytics.favoritesCount || 0,
    };

    if (analyticsLevel === "basic") {
        return basicAnalytics;
    }

    const advancedAnalytics = {
        ...basicAnalytics,
        dailyStats,
        conversionRate:
            analytics.views > 0
                ? Math.round(((analytics.phoneClicks || 0) / analytics.views) * 100)
                : 0,
    };

    if (analyticsLevel === "advanced") {
        return advancedAnalytics;
    }

    const projectAnalytics = {
        ...advancedAnalytics,
        last7DaysViews: dailyStats
            .slice(-7)
            .reduce((total: number, stat: any) => total + (stat.views || 0), 0),
        last7DaysPhoneClicks: dailyStats
            .slice(-7)
            .reduce((total: number, stat: any) => total + (stat.phoneClicks || 0), 0),
    };

    if (analyticsLevel === "project") {
        return projectAnalytics;
    }

    return {
        ...projectAnalytics,
        last30DaysViews: dailyStats
            .slice(-30)
            .reduce((total: number, stat: any) => total + (stat.views || 0), 0),
        last30DaysPhoneClicks: dailyStats
            .slice(-30)
            .reduce((total: number, stat: any) => total + (stat.phoneClicks || 0), 0),
        bestPerformingDay: dailyStats.reduce((best: any, stat: any) => {
            if (!best || (stat.views || 0) > (best.views || 0)) {
                return stat;
            }

            return best;
        }, null),
    };
}

function getAnalyticsWindowMs(
    eventType:
        | "view"
        | "phoneClick",
): number {
    return eventType === "view"
        ? 30 * 60 * 1_000
        : 5 * 60 * 1_000;
}

function createAnalyticsDedupeId({
                                     propertyId,
                                     eventType,
                                     clientIdentifier,
                                     windowStart,
                                 }: {
    propertyId: string;
    eventType:
        | "view"
        | "phoneClick";
    clientIdentifier: string;
    windowStart: number;
}): string {
    return createHash("sha256")
        .update(
            [
                propertyId,
                eventType,
                clientIdentifier,
                windowStart,
            ].join(":"),
        )
        .digest("hex");
}

function isDuplicateKeyError(
    error: unknown,
): error is {
    code: number;
} {
    return (
        typeof error ===
        "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
    );
}

export async function POST(
    request: Request,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    },
) {
    try {
        const parsed =
            await parseJsonBody(
                request,
                analyticsEventSchema,
            );

        if (!parsed.success) {
            return parsed.response;
        }

        const {
            type: eventType,
        } = parsed.data;

        await enforceRateLimit(
            request,
            {
                namespace:
                    "property-analytics",
                windowMs:
                    60 * 1_000,
                maximumRequests: 60,
            },
        );

        const {
            id,
        } = await params;

        if (
            !mongoose.isValidObjectId(
                id,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid property ID",
                },
                {
                    status: 400,
                },
            );
        }

        await connectDB();

        const property =
            await Property.findById(
                id,
            )
                .select(
                    "_id userId status listingExpiresAt",
                )
                .lean();

        if (!property) {
            return NextResponse.json(
                {
                    error:
                        "Property not found",
                },
                {
                    status: 404,
                },
            );
        }

        if (
            property.status !==
            "active"
        ) {
            return NextResponse.json(
                {
                    success: true,
                    skipped:
                        "inactive_property",
                },
            );
        }

        if (
            property.listingExpiresAt &&
            new Date(
                property.listingExpiresAt,
            ).getTime() <=
            Date.now()
        ) {
            return NextResponse.json(
                {
                    success: true,
                    skipped:
                        "expired_property",
                },
            );
        }

        let viewerUserId:
            string | null = null;

        try {
            const auth =
                await getAuthenticatedUser();

            if (
                !isAuthError(auth)
            ) {
                viewerUserId =
                    auth.userId;
            }
        } catch {
            viewerUserId = null;
        }

        if (
            viewerUserId &&
            property.userId.toString() ===
            viewerUserId
        ) {
            return NextResponse.json(
                {
                    success: true,
                    skipped:
                        "owner_activity",
                },
            );
        }

        const clientIdentifier =
            viewerUserId
                ? `user:${viewerUserId}`
                : `client:${getHashedClientIdentifier(
                    request,
                )}`;

        const windowMs =
            getAnalyticsWindowMs(
                eventType,
            );

        const now = Date.now();

        const windowStart =
            Math.floor(
                now / windowMs,
            ) * windowMs;

        const dedupeId =
            createAnalyticsDedupeId({
                propertyId: id,
                eventType,
                clientIdentifier,
                windowStart,
            });

        try {
            await AnalyticsEvent.create({
                _id: dedupeId,
                propertyId:
                property._id,
                eventType,
                expiresAt:
                    new Date(
                        windowStart +
                        windowMs *
                        2,
                    ),
            });
        } catch (error) {
            if (
                isDuplicateKeyError(
                    error,
                )
            ) {
                return NextResponse.json({
                    success: true,
                    skipped:
                        "duplicate_event",
                });
            }

            throw error;
        }

        const today =
            getTodayKey();

        const totalField =
            eventType === "view"
                ? "analytics.views"
                : "analytics.phoneClicks";

        const dailyField =
            eventType === "view"
                ? "views"
                : "phoneClicks";

        await Property.updateOne(
            {
                _id: property._id,
            },
            [
                {
                    $set: {
                        [totalField]: {
                            $add: [
                                {
                                    $ifNull: [
                                        `$${totalField}`,
                                        0,
                                    ],
                                },
                                1,
                            ],
                        },

                        "analytics.dailyStats": {
                            $let: {
                                vars: {
                                    stats: {
                                        $ifNull: [
                                            "$analytics.dailyStats",
                                            [],
                                        ],
                                    },
                                },

                                in: {
                                    $cond: [
                                        {
                                            $in: [
                                                today,
                                                "$$stats.date",
                                            ],
                                        },

                                        {
                                            $map: {
                                                input: "$$stats",
                                                as: "stat",

                                                in: {
                                                    $cond: [
                                                        {
                                                            $eq: [
                                                                "$$stat.date",
                                                                today,
                                                            ],
                                                        },

                                                        {
                                                            $mergeObjects: [
                                                                "$$stat",

                                                                {
                                                                    [dailyField]: {
                                                                        $add: [
                                                                            {
                                                                                $ifNull: [
                                                                                    `$$stat.${dailyField}`,
                                                                                    0,
                                                                                ],
                                                                            },
                                                                            1,
                                                                        ],
                                                                    },
                                                                },
                                                            ],
                                                        },

                                                        "$$stat",
                                                    ],
                                                },
                                            },
                                        },

                                        {
                                            $concatArrays: [
                                                "$$stats",

                                                [
                                                    {
                                                        date: today,
                                                        views:
                                                            eventType ===
                                                            "view"
                                                                ? 1
                                                                : 0,
                                                        phoneClicks:
                                                            eventType ===
                                                            "phoneClick"
                                                                ? 1
                                                                : 0,
                                                    },
                                                ],
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            ],
            {
                updatePipeline: true,
            },
        );

        return NextResponse.json({
            success: true,
            recorded: true,
        });
    } catch (error) {
        if (
            error instanceof
            RateLimitError
        ) {
            return createRateLimitResponse(
                error,
            );
        }

        console.error(
            "Failed to record analytics:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Failed to record analytics",
            },
            {
                status: 500,
            },
        );
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        await connectDB();

        const { id } = await params;

        const property = await Property.findById(id);

        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        if (property.userId.toString() !== auth.userId) {
            return NextResponse.json(
                { error: "You are not allowed to view analytics for this property." },
                { status: 403 }
            );
        }

        const user = await User.findById(auth.userId);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const limits = getPlanLimits(user);

        if (limits.analyticsLevel === "none") {
            return NextResponse.json(
                {
                    error: "Analytics are not included in your current plan.",
                    analyticsLevel: limits.analyticsLevel,
                },
                { status: 403 }
            );
        }

        return NextResponse.json(
            getAllowedAnalytics(property, limits.analyticsLevel)
        );
    } catch (error) {
        console.error("Failed to fetch analytics:", error);

        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}