import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import User from "@/models/User";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";
import { getPlanLimits } from "@/lib/plans";

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

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const eventType = body.type as AnalyticsEventType;

        if (!["view", "phoneClick"].includes(eventType)) {
            return NextResponse.json(
                { error: "Invalid analytics event type" },
                { status: 400 }
            );
        }

        const today = getTodayKey();

        const property = await Property.findById(id);

        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        let viewerUserId: string | null = null;

        try {
            const auth = await getAuthenticatedUser();

            if (!isAuthError(auth)) {
                viewerUserId = auth.userId;
            }
        } catch {
            viewerUserId = null;
        }

        if (viewerUserId && property.userId.toString() === viewerUserId) {
            return NextResponse.json({
                success: true,
                skipped: "owner_view",
            });
        }

        if (eventType === "view") {
            property.analytics.views = (property.analytics.views || 0) + 1;

            const existingDay = property.analytics.dailyStats.find(
                (stat: any) => stat.date === today
            );

            if (existingDay) {
                existingDay.views = (existingDay.views || 0) + 1;
            } else {
                property.analytics.dailyStats.push({
                    date: today,
                    views: 1,
                    phoneClicks: 0,
                });
            }
        }

        if (eventType === "phoneClick") {
            property.analytics.phoneClicks =
                (property.analytics.phoneClicks || 0) + 1;

            const existingDay = property.analytics.dailyStats.find(
                (stat: any) => stat.date === today
            );

            if (existingDay) {
                existingDay.phoneClicks = (existingDay.phoneClicks || 0) + 1;
            } else {
                property.analytics.dailyStats.push({
                    date: today,
                    views: 0,
                    phoneClicks: 1,
                });
            }
        }

        await property.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to record analytics:", error);

        return NextResponse.json(
            { error: "Failed to record analytics" },
            { status: 500 }
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