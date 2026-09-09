import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import {
    getPublicPropertyFilter,
} from "@/lib/property-filters";

import {
    propertySearchQuerySchema,
    type PropertySearchQuery,
} from "@/lib/validation/property-search";

import Property from "@/models/Property";

type SortDirection = 1 | -1;

type PropertySearchResponse = {
    properties: Record<
        string,
        unknown
    >[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

function escapeRegularExpression(
    value: string,
): string {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
    );
}

function createExactCaseInsensitiveMatch(
    value: string,
) {
    return {
        $regex: `^${escapeRegularExpression(
            value,
        )}$`,
        $options: "i",
    };
}

function createSearchMatch(
    value: string,
) {
    return {
        $regex:
            escapeRegularExpression(value),
        $options: "i",
    };
}

function getSortStage(
    sort: PropertySearchQuery["sort"],
): Record<string, SortDirection> {
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
                startingPrice: 1,
                createdAt: -1,
                _id: -1,
            };

        case "price-high":
            return {
                startingPrice: -1,
                createdAt: -1,
                _id: -1,
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

function getDerivedPropertyFields() {
    return {
        availableBHKs: {
            $setUnion: [
                {
                    $map: {
                        input: {
                            $ifNull: [
                                "$unitConfigurations",
                                [],
                            ],
                        },
                        as: "unit",
                        in: "$$unit.bedrooms",
                    },
                },
                [],
            ],
        },

        startingPrice: {
            $cond: [
                {
                    $gt: [
                        {
                            $size: {
                                $ifNull: [
                                    "$unitConfigurations",
                                    [],
                                ],
                            },
                        },
                        0,
                    ],
                },

                {
                    $min: {
                        $map: {
                            input: "$unitConfigurations",
                            as: "unit",
                            in: "$$unit.price",
                        },
                    },
                },

                "$price",
            ],
        },

        hasUnitConfigurations: {
            $gt: [
                {
                    $size: {
                        $ifNull: [
                            "$unitConfigurations",
                            [],
                        ],
                    },
                },
                0,
            ],
        },
    };
}

function buildPropertyMatch(
    query: PropertySearchQuery,
    now: Date,
): Record<string, unknown> {
    const conditions: Record<
        string,
        unknown
    >[] = [
        getPublicPropertyFilter(),
    ];

    if (query.purpose === "rent") {
        conditions.push({
            purpose: "Rent",
        });
    }

    if (
        query.purpose === "commercial"
    ) {
        conditions.push({
            propertyType: "Commercial",
        });
    }

    if (query.purpose === "buy") {
        conditions.push({
            purpose: {
                $nin: [
                    "Rent",
                    "PG/CO-Living",
                ],
            },
        });
    }

    if (query.city) {
        conditions.push({
            city:
                createExactCaseInsensitiveMatch(
                    query.city,
                ),
        });
    }

    if (query.location) {
        const searchMatch =
            createSearchMatch(
                query.location,
            );

        conditions.push({
            $or: [
                {
                    address: searchMatch,
                },
                {
                    locality: searchMatch,
                },
                {
                    city: searchMatch,
                },
                {
                    propertyType:
                    searchMatch,
                },
                {
                    commercialType:
                    searchMatch,
                },
            ],
        });
    }

    if (
        query.type &&
        query.type !== "All"
    ) {
        conditions.push({
            propertyType:
                createExactCaseInsensitiveMatch(
                    query.type,
                ),
        });
    }

    if (query.bhk === "Studio") {
        conditions.push({
            $or: [
                {
                    bedrooms: {
                        $in: [
                            0,
                            null,
                        ],
                    },
                },
                {
                    "unitConfigurations.bedrooms": 0,
                },
            ],
        });
    } else if (query.bhk === "4+") {
        conditions.push({
            $or: [
                {
                    bedrooms: {
                        $gte: 4,
                    },
                },
                {
                    "unitConfigurations.bedrooms": {
                        $gte: 4,
                    },
                },
            ],
        });
    } else if (
        query.bhk !== "All"
    ) {
        const requestedBedrooms =
            Number.parseInt(
                query.bhk,
                10,
            );

        conditions.push({
            $or: [
                {
                    bedrooms:
                    requestedBedrooms,
                },
                {
                    "unitConfigurations.bedrooms":
                    requestedBedrooms,
                },
            ],
        });
    }

    if (
        query.filter === "featured"
    ) {
        conditions.push({
            $or: [
                {
                    featured: true,
                },
                {
                    promotedUntil: {
                        $gt: now,
                    },
                },
            ],
        });
    }

    if (
        query.filter === "zero-commission"
    ) {
        conditions.push({
            $or: [
                {
                    zeroCommission: true,
                },
                {
                    commissionType: "zero",
                },
            ],
        });
    }

    return {
        $and: conditions,
    };
}

export async function GET(
    request: Request,
) {
    try {
        const {
            searchParams,
        } = new URL(request.url);

        const rawQuery =
            Object.fromEntries(
                searchParams.entries(),
            );

        const validation =
            propertySearchQuerySchema.safeParse(
                rawQuery,
            );

        if (!validation.success) {
            return NextResponse.json(
                {
                    error:
                        "Invalid property search parameters.",
                    issues:
                        validation.error.issues.map(
                            (issue) => ({
                                field:
                                    issue.path.join(
                                        ".",
                                    ),
                                message:
                                issue.message,
                            }),
                        ),
                },
                {
                    status: 400,
                },
            );
        }

        const query = validation.data;

        await connectDB();

        const now = new Date();

        const matchFilter =
            buildPropertyMatch(
                query,
                now,
            );

        const skip =
            (query.page - 1) *
            query.limit;

        const aggregation =
            await Property.aggregate<{
                properties: Record<
                    string,
                    unknown
                >[];
                metadata: Array<{
                    total: number;
                }>;
            }>([
                {
                    $match: matchFilter,
                },

                {
                    $addFields: {
                        ...getDerivedPropertyFields(),

                        isPromoted: {
                            $gt: [
                                "$promotedUntil",
                                now,
                            ],
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
                                    $ifNull: [
                                        "$analytics.views",
                                        0,
                                    ],
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
                    $match: {
                        ...(query.minPrice !== undefined ||
                        query.maxPrice !== undefined
                            ? {
                                startingPrice: {
                                    ...(query.minPrice !==
                                    undefined
                                        ? {
                                            $gte:
                                            query.minPrice,
                                        }
                                        : {}),

                                    ...(query.maxPrice !==
                                    undefined
                                        ? {
                                            $lte:
                                            query.maxPrice,
                                        }
                                        : {}),
                                },
                            }
                            : {}),
                    },
                },

                {
                    $sort:
                        getSortStage(
                            query.sort,
                        ),
                },

                {
                    $facet: {
                        properties: [
                            {
                                $skip: skip,
                            },
                            {
                                $limit:
                                query.limit,
                            },
                            {
                                $unset: [
                                    "popularityScore",
                                    "visibilityRank",
                                    "isPromoted",
                                ],
                            },
                        ],

                        metadata: [
                            {
                                $count: "total",
                            },
                        ],
                    },
                },
            ]);

        const result =
            aggregation[0] ?? {
                properties: [],
                metadata: [],
            };

        const total =
            result.metadata[0]?.total ??
            0;

        const totalPages =
            total === 0
                ? 0
                : Math.ceil(
                    total /
                    query.limit,
                );

        const properties =
            result.properties.map(
                (property) => ({
                    ...property,
                    priceLocked: false,
                }),
            );

        const response:
            PropertySearchResponse = {
            properties,

            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages,

                hasNextPage:
                    query.page <
                    totalPages,

                hasPreviousPage:
                    query.page > 1,
            },
        };

        return NextResponse.json(
            response,
        );
    } catch (error) {
        console.error(
            "Failed to fetch properties:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Failed to fetch properties",
            },
            {
                status: 500,
            },
        );
    }
}