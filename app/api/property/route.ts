import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import { getPublicPropertyFilter } from "@/lib/property-filters";

const ALLOWED_FILTERS = new Set(["all", "featured"] as const);
const ALLOWED_SORTS = new Set([
    "default",
    "newest",
    "popular",
    "price-low",
    "price-high",
] as const);

type PropertyFilter = "all" | "featured";

type PropertySort =
    | "default"
    | "newest"
    | "popular"
    | "price-low"
    | "price-high";

export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        const requestedFilter = searchParams.get("filter") ?? "all";
        const requestedSort = searchParams.get("sort") ?? "default";

        const filter: PropertyFilter = ALLOWED_FILTERS.has(
            requestedFilter as PropertyFilter
        )
            ? (requestedFilter as PropertyFilter)
            : "all";

        const sort: PropertySort = ALLOWED_SORTS.has(
            requestedSort as PropertySort
        )
            ? (requestedSort as PropertySort)
            : "default";

        const now = new Date();
        const publicFilter = getPublicPropertyFilter();

        const matchFilter: Record<string, unknown> =
            filter === "featured"
                ? {
                    $and: [
                        publicFilter,
                        {
                            $or: [
                                { featured: true },
                                { promotedUntil: { $gt: now } },
                            ],
                        },
                    ],
                }
                : publicFilter;

        const properties = await Property.aggregate([
            {
                $match: matchFilter,
            },
            {
                $addFields: {
                    isPromoted: {
                        $gt: ["$promotedUntil", now],
                    },

                    visibilityRank: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$planSnapshot.rankingLevel",
                                            "top",
                                        ],
                                    },
                                    then: 30,
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$planSnapshot.rankingLevel",
                                            "priority",
                                        ],
                                    },
                                    then: 20,
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$planSnapshot.rankingLevel",
                                            "featured",
                                        ],
                                    },
                                    then: 10,
                                },
                            ],
                            default: 0,
                        },
                    },

                    popularityScore: {
                        $add: [
                            {
                                $ifNull: ["$analytics.views", 0],
                            },
                            {
                                $multiply: [
                                    {
                                        $ifNull: [
                                            "$analytics.favoritesCount",
                                            0,
                                        ],
                                    },
                                    5,
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $sort: getSortStage(sort),
            },
            {
                $unset: [
                    "popularityScore",
                    "visibilityRank",
                    "isPromoted",
                ],
            },
        ]);

        return NextResponse.json(properties);
    } catch (error) {
        console.error("Failed to fetch properties:", error);

        return NextResponse.json(
            { error: "Failed to fetch properties" },
            { status: 500 }
        );
    }
}

function getSortStage(
    sort: PropertySort
): Record<string, 1 | -1> {
    switch (sort) {
        case "newest":
            return {
                createdAt: -1,
                _id: -1,
            };

        case "popular":
            return {
                popularityScore: -1,
                createdAt: -1,
                _id: -1,
            };

        case "price-low":
            return {
                price: 1,
                createdAt: -1,
            };

        case "price-high":
            return {
                price: -1,
                createdAt: -1,
            };

        default:
            return {
                isPromoted: -1,
                visibilityRank: -1,
                featured: -1,
                createdAt: -1,
                _id: -1,
            };
    }
}