import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import { getPublicPropertyFilter } from "@/lib/property-filters";

const HOMEPAGE_PROPERTY_LIMIT = 4;

export async function GET() {
    try {
        await connectDB();

        const properties = await Property.aggregate([
            {
                $match: getPublicPropertyFilter(),
            },
            {
                $addFields: {
                    isPromoted: {
                        $gt: ["$promotedUntil", new Date()],
                    },
                    isHomepageFeatured: {
                        $eq: ["$planSnapshot.homepageFeatured", true],
                    },
                    visibilityRank: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: ["$planSnapshot.rankingLevel", "top"],
                                    },
                                    then: 30,
                                },
                                {
                                    case: {
                                        $eq: ["$planSnapshot.rankingLevel", "priority"],
                                    },
                                    then: 20,
                                },
                                {
                                    case: {
                                        $eq: ["$planSnapshot.rankingLevel", "featured"],
                                    },
                                    then: 10,
                                },
                            ],
                            default: 0,
                        },
                    },
                },
            },
            {
                $sort: {
                    isHomepageFeatured: -1,
                    isPromoted: -1,
                    visibilityRank: -1,
                    featured: -1,
                    createdAt: -1,
                },
            },
            {
                $limit: HOMEPAGE_PROPERTY_LIMIT,
            },
        ]);

        return NextResponse.json(properties);
    } catch (error) {
        console.error("Failed to fetch homepage featured properties:", error);

        return NextResponse.json(
            { error: "Failed to fetch homepage featured properties" },
            { status: 500 }
        );
    }
}