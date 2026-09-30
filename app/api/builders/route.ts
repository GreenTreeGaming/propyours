import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Property from "@/models/Property";
import { toPublicUserProfile } from "@/lib/public-user";
import { normalizedBuilderName } from "@/lib/builder-properties";
import { syncDeveloperProfilesFromListings } from "@/lib/sync-developer-profiles";

const BUILDER_PLAN_RANK: Record<string, number> = {
    "builder-elite": 3, "builder-growth": 2, "builder-starter": 1,
};

function isActiveBuilderPlan(plan: any) {
    return Boolean(plan && plan.audience === "builder" && plan.status === "active" &&
        (!plan.expiresAt || new Date(plan.expiresAt).getTime() > Date.now()));
}

type BuilderStats = {
    projects: number; activeProjects: number; featuredProjects: number;
    totalViews: number; phoneClicks: number; favorites: number;
};
const emptyStats = (): BuilderStats => ({
    projects: 0, activeProjects: 0, featuredProjects: 0,
    totalViews: 0, phoneClicks: 0, favorites: 0,
});
function addProperty(stats: BuilderStats, property: any) {
    stats.projects += 1;
    stats.activeProjects += property.status === "active" ? 1 : 0;
    stats.featuredProjects += property.featured === true ? 1 : 0;
    stats.totalViews += property.analytics?.views ?? 0;
    stats.phoneClicks += property.analytics?.phoneClicks ?? 0;
    stats.favorites += property.analytics?.favoritesCount ?? 0;
}

export async function GET() {
    try {
        await connectDB();
        const [builders, developerProfiles, properties] = await Promise.all([
            User.find({ role: "Builder" })
                .select("name role bio company companyWebsite reraNumber address city plan").lean(),
            syncDeveloperProfilesFromListings(),
            Property.find({ developerName: { $type: "string", $ne: "" } })
                .select("userId developerName city status featured analytics").lean(),
        ]);

        const statsByName = new Map<string, BuilderStats>();
        for (const property of properties as any[]) {
            const key = normalizedBuilderName(property.developerName);
            if (key) {
                const stats = statsByName.get(key) ?? emptyStats();
                addProperty(stats, property);
                statsByName.set(key, stats);
            }
        }

        const claimedNames = new Set((builders as any[])
            .map((builder) => normalizedBuilderName(builder.company)).filter(Boolean));
        const accountBuilders = (builders as any[]).map((builder) => {
            const planActive = isActiveBuilderPlan(builder.plan);
            const tier = planActive ? builder.plan.tier : null;
            const stats = emptyStats();
            const builderId = String(builder._id);
            const companyKey = normalizedBuilderName(builder.company);
            for (const property of properties as any[]) {
                if (
                    String(property.userId ?? "") === builderId ||
                    (companyKey && normalizedBuilderName(property.developerName) === companyKey)
                ) {
                    addProperty(stats, property);
                }
            }
            return {
                ...toPublicUserProfile(builder), ...stats,
                builderPlan: { tier, isActive: planActive, rank: tier ? BUILDER_PLAN_RANK[tier] ?? 0 : 0 },
            };
        });
        const listingBuilders = (developerProfiles as any[])
            .filter((profile) => !claimedNames.has(profile.normalizedName))
            .map((profile) => {
                const matching = (properties as any[]).filter((property) =>
                    normalizedBuilderName(property.developerName) === profile.normalizedName);
                return {
                    _id: String(profile._id), id: String(profile._id), name: profile.name,
                    company: profile.name, role: "Builder", bio: profile.bio ?? "",
                    companyWebsite: profile.companyWebsite ?? "", reraNumber: profile.reraNumber ?? "",
                    city: profile.city || matching.find((property) => property.city)?.city || "",
                    ...(statsByName.get(profile.normalizedName) ?? emptyStats()),
                    builderPlan: { tier: null, isActive: false, rank: 0 }, profileSource: "listing",
                };
            });

        return NextResponse.json([...accountBuilders, ...listingBuilders].sort((a: any, b: any) =>
            b.builderPlan.rank - a.builderPlan.rank || b.featuredProjects - a.featuredProjects ||
            b.activeProjects - a.activeProjects || String(a.company).localeCompare(String(b.company))));
    } catch (error) {
        console.error("Error fetching builders:", error);
        return NextResponse.json({ error: "Failed to fetch builders" }, { status: 500 });
    }
}
