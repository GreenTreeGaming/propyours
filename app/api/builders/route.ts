import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Property from "@/models/Property";
import { toPublicUserProfile } from "@/lib/public-user";
import {
    exactBuilderNameRegex,
    normalizedBuilderName,
} from "@/lib/builder-properties";

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
            .select("name role bio company companyWebsite reraNumber address city plan")
            .lean();

        const builderIds = builders.map((builder: any) => builder._id);

        const companyExpressions = builders
            .map((builder: any) => exactBuilderNameRegex(builder.company))
            .filter((value): value is RegExp => value !== null);

        const relatedProperties = builderIds.length
            ? await Property.find({
                $or: [
                    { userId: { $in: builderIds } },
                    ...(companyExpressions.length
                        ? [{ developerName: { $in: companyExpressions } }]
                        : []),
                ],
            })
                .select("userId developerName status featured analytics")
                .lean()
            : [];

        const companyOwners = new Map<string, string[]>();
        const statsByBuilderId = new Map<string, any>();

        for (const builder of builders as any[]) {
            const id = String(builder._id);
            const key = normalizedBuilderName(builder.company);
            statsByBuilderId.set(id, {
                projects: 0,
                activeProjects: 0,
                featuredProjects: 0,
                totalViews: 0,
                phoneClicks: 0,
                favorites: 0,
            });

            if (key) {
                companyOwners.set(key, [...(companyOwners.get(key) ?? []), id]);
            }
        }

        for (const property of relatedProperties as any[]) {
            const matchedBuilders = new Set<string>();
            const ownerId = String(property.userId ?? "");

            if (statsByBuilderId.has(ownerId)) {
                matchedBuilders.add(ownerId);
            }

            for (const builderId of companyOwners.get(
                normalizedBuilderName(property.developerName),
            ) ?? []) {
                matchedBuilders.add(builderId);
            }

            for (const builderId of matchedBuilders) {
                const stats = statsByBuilderId.get(builderId);
                stats.projects += 1;
                stats.activeProjects += property.status === "active" ? 1 : 0;
                stats.featuredProjects += property.featured === true ? 1 : 0;
                stats.totalViews += property.analytics?.views ?? 0;
                stats.phoneClicks += property.analytics?.phoneClicks ?? 0;
                stats.favorites += property.analytics?.favoritesCount ?? 0;
            }
        }

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
