import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Property from "@/models/Property";
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

export async function GET() {
    try {
        await connectDB();

        const builders = await User.find({ role: "Builder" })
            .select("name role bio company city plan")
            .lean();

        const builderIds = builders.map((builder: any) => builder._id);

        const propertyStats = await Property.aggregate([
            {
                $match: {
                    userId: { $in: builderIds },
                },
            },
            {
                $group: {
                    _id: "$userId",
                    projects: { $sum: 1 },
                    activeProjects: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "active"] }, 1, 0],
                        },
                    },
                    featuredProjects: {
                        $sum: {
                            $cond: [{ $eq: ["$featured", true] }, 1, 0],
                        },
                    },
                    totalViews: { $sum: "$analytics.views" },
                    phoneClicks: { $sum: "$analytics.phoneClicks" },
                    favorites: { $sum: "$analytics.favoritesCount" },
                },
            },
        ]);

        const statsByBuilderId = new Map(
            propertyStats.map((stats) => [String(stats._id), stats])
        );

        const buildersWithStats = builders
            .map((builder: any) => {
                const stats = statsByBuilderId.get(String(builder._id));
                const hasActiveBuilderPlan = isActiveBuilderPlan(builder.plan);
                const planTier = hasActiveBuilderPlan ? builder.plan.tier : null;

                return {
                    ...toPublicUserProfile(builder),
                    projects: stats?.projects ?? 0,
                    activeProjects: stats?.activeProjects ?? 0,
                    featuredProjects: stats?.featuredProjects ?? 0,
                    totalViews: stats?.totalViews ?? 0,
                    phoneClicks: stats?.phoneClicks ?? 0,
                    favorites: stats?.favorites ?? 0,
                    builderPlan: {
                        tier: planTier,
                        isActive: hasActiveBuilderPlan,
                        rank: planTier ? BUILDER_PLAN_RANK[planTier] ?? 0 : 0,
                    },
                };
            })
            .sort((a: any, b: any) => {
                return (
                    b.builderPlan.rank - a.builderPlan.rank ||
                    b.featuredProjects - a.featuredProjects ||
                    b.activeProjects - a.activeProjects
                );
            });

        return NextResponse.json(buildersWithStats);
    } catch (error) {
        console.error("Error fetching builders:", error);

        return NextResponse.json(
            { error: "Failed to fetch builders" },
            { status: 500 }
        );
    }
}