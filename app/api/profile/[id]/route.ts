import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Property from "@/models/Property";
import { getPublicPropertyFilter } from "@/lib/property-filters";
import { toPublicUserProfile } from "@/lib/public-user";

const BUILDER_PLAN_RANK: Record<string, number> = {
    "builder-elite": 3,
    "builder-growth": 2,
    "builder-starter": 1,
};

function isActiveBuilderPlan(plan: any) {
    if (!plan || plan.audience !== "builder" || plan.status !== "active") {
        return false;
    }

    if (!plan.expiresAt) {
        return true;
    }

    return new Date(plan.expiresAt).getTime() > Date.now();
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: "Invalid user id" },
                { status: 400 }
            );
        }

        const user = await User.findById(id)
            .select("name role bio company city plan")
            .lean();

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const properties = await Property.aggregate([
            {
                $match: getPublicPropertyFilter({
                    userId: new mongoose.Types.ObjectId(id),
                }),
            },
            {
                $addFields: {
                    isPromoted: {
                        $gt: ["$promotedUntil", new Date()],
                    },
                },
            },
            {
                $sort: {
                    isPromoted: -1,
                    featured: -1,
                    createdAt: -1,
                },
            },
        ]);

        const stats = properties.reduce(
            (acc, property) => {
                acc.totalListings += 1;

                if (property.status === "active") {
                    acc.activeListings += 1;
                }

                if (property.featured) {
                    acc.featuredListings += 1;
                }

                acc.totalViews += property.analytics?.views ?? 0;
                acc.phoneClicks += property.analytics?.phoneClicks ?? 0;
                acc.favorites += property.analytics?.favoritesCount ?? 0;

                return acc;
            },
            {
                totalListings: 0,
                activeListings: 0,
                featuredListings: 0,
                totalViews: 0,
                phoneClicks: 0,
                favorites: 0,
            }
        );

        const hasActiveBuilderPlan = isActiveBuilderPlan((user as any).plan);
        const planTier = hasActiveBuilderPlan ? (user as any).plan.tier : null;

        return NextResponse.json({
            user: {
                ...toPublicUserProfile(user),
                builderPlan: {
                    tier: planTier,
                    isActive: hasActiveBuilderPlan,
                    rank: planTier ? BUILDER_PLAN_RANK[planTier] ?? 0 : 0,
                },
            },
            properties,
            stats,
        });
    } catch (error) {
        console.error("Public Profile API Error:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}