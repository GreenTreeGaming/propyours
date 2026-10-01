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
import { screenPropertyImages } from "@/lib/public-property-images";
import { syncPropyoursZeroBrokerageListings } from "@/lib/propyours-listings";

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

function normalizeSearchTerm(
    value: string,
): string {
    const normalized =
        value.trim().toLowerCase();

    const aliases: Record<
        string,
        string
    > = {
        plots: "plot",
        apartments: "apartment",
        villas: "villa",
        penthouses: "penthouse",
        shops: "shop",
        showrooms: "showroom",
        warehouses: "warehouse",
        factories: "factory",
    };

    return (
        aliases[normalized] ??
        normalized
    );
}

function createSearchMatch(
    value: string,
) {
    const normalizedValue =
        normalizeSearchTerm(
            value,
        );

    return {
        $regex:
            escapeRegularExpression(
                normalizedValue,
            ),
        $options: "i",
    };
}

const KEYWORD_TEXT_FIELDS = [
    "projectName",
    "developerName",
    "description",
    "address",
    "locality",
    "city",
    "state",
    "landmark",
    "propertyType",
    "commercialType",
    "ownershipType",
    "amenities",
    "dimensions",
] as const;

const SEARCH_STOP_WORDS = new Set([
    "a",
    "all",
    "and",
    "any",
    "for",
    "find",
    "in",
    "me",
    "of",
    "property",
    "properties",
    "show",
    "the",
    "with",
]);

function textKeywordCondition(value: string) {
    const searchMatch = createSearchMatch(value);

    return {
        $or: KEYWORD_TEXT_FIELDS.map((field) => ({
            [field]: searchMatch,
        })),
    };
}

function buildKeywordCondition(value: string): Record<string, unknown> | null {
    let remaining = value.trim().toLowerCase();
    const clauses: Record<string, unknown>[] = [];

    const bhkMatch = remaining.match(
        /\b(\d{1,2})\s*\+?\s*(?:bhk|bed(?:room)?s?)\b/i,
    );

    if (bhkMatch) {
        const bedrooms = Number.parseInt(bhkMatch[1], 10);
        const range = bhkMatch[0].includes("+")
            ? { $gte: bedrooms }
            : bedrooms;

        clauses.push({
            $or: [
                { bedrooms: range },
                { "unitConfigurations.bedrooms": range },
            ],
        });
        remaining = remaining.replace(bhkMatch[0], " ");
    }

    const bathroomMatch = remaining.match(
        /\b(\d{1,2})\s*(?:t|bath(?:room)?s?|washrooms?)\b/i,
    );

    if (bathroomMatch) {
        const bathrooms = Number.parseInt(bathroomMatch[1], 10);
        clauses.push({
            $or: [
                { bathrooms },
                { "unitConfigurations.toilets": bathrooms },
            ],
        });
        remaining = remaining.replace(bathroomMatch[0], " ");
    }

    const floorMatch = remaining.match(/\b(\d{1,3})\s*floors?\b/i);

    if (floorMatch) {
        clauses.push({ floors: Number.parseInt(floorMatch[1], 10) });
        remaining = remaining.replace(floorMatch[0], " ");
    }

    const budgetMatch = remaining.match(
        /\b(?:under|below|up\s*to|maximum|max)\s*₹?\s*(\d+(?:\.\d+)?)\s*(crores?|cr|lakhs?|lacs?|lac|l)\b/i,
    );

    if (budgetMatch) {
        const amount = Number.parseFloat(budgetMatch[1]);
        const unit = budgetMatch[2].toLowerCase();
        const multiplier =
            unit.startsWith("cr") || unit.startsWith("crore")
                ? 10_000_000
                : 100_000;
        const maximumPrice = amount * multiplier;

        clauses.push({
            $or: [
                { price: { $lte: maximumPrice } },
                { "unitConfigurations.price": { $lte: maximumPrice } },
            ],
        });
        remaining = remaining.replace(budgetMatch[0], " ");
    }

    const areaMatch = remaining.match(
        /\b(\d+(?:\.\d+)?)\s*(sq\s*ft|sqft|sq\s*yd|sqyd|sq\s*m|sqm|acre|ground|cent|kanal|marla)\b/i,
    );

    if (areaMatch) {
        const size = Number.parseFloat(areaMatch[1]);
        const unitAliases: Record<string, string> = {
            "sq ft": "sqft",
            sqft: "sqft",
            "sq yd": "sqyd",
            sqyd: "sqyd",
            "sq m": "sqm",
            sqm: "sqm",
        };
        const rawUnit = areaMatch[2].toLowerCase().replace(/\s+/g, " ");
        const sizeUnit = unitAliases[rawUnit] ?? rawUnit;

        clauses.push({
            $or: [
                { size, sizeUnit },
                {
                    unitConfigurations: {
                        $elemMatch: { size, sizeUnit },
                    },
                },
                {
                    plotSizes: {
                        $elemMatch: { size, sizeUnit },
                    },
                },
            ],
        });
        remaining = remaining.replace(areaMatch[0], " ");
    }

    const structuredPhrases: Array<{
        pattern: RegExp;
        condition: Record<string, unknown>;
    }> = [
        {
            pattern: /\bzero\s+(?:brokerage|commission)\b/i,
            condition: {
                $or: [
                    { zeroCommission: true },
                    { commissionType: "zero" },
                ],
            },
        },
        {
            pattern: /\bunder\s+construction\b/i,
            condition: { condition: "under_construction" },
        },
        {
            pattern: /\bready\s+(?:to\s+occupy|possession)\b/i,
            condition: { condition: "ready_to_occupy" },
        },
        {
            pattern: /\bnegotiable\b/i,
            condition: { negotiable: true },
        },
        {
            pattern: /\b(?:rent|rental)\b/i,
            condition: { purpose: "Rent" },
        },
        {
            pattern: /\b(?:sale|sell|buy)\b/i,
            condition: { purpose: { $in: ["Sell", "Buy"] } },
        },
    ];

    for (const phrase of structuredPhrases) {
        if (phrase.pattern.test(remaining)) {
            clauses.push(phrase.condition);
            remaining = remaining.replace(phrase.pattern, " ");
        }
    }

    const tokens = remaining
        .split(/[^a-z0-9]+/i)
        .map((token) => token.trim())
        .filter(
            (token) =>
                token.length > 1 &&
                !SEARCH_STOP_WORDS.has(token),
        );

    for (const token of tokens) {
        clauses.push(textKeywordCondition(token));
    }

    if (clauses.length === 0) {
        return null;
    }

    return clauses.length === 1 ? clauses[0] : { $and: clauses };
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

                {
                    $cond: [
                        { $gt: [{ $size: { $ifNull: ["$plotSizes", []] } }, 0] },
                        { $min: { $map: { input: "$plotSizes", as: "plot", in: { $ifNull: ["$$plot.totalPrice", "$price"] } } } },
                        "$price",
                    ],
                },
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

        hasPlotPricing: {
            $gt: [
                { $size: { $filter: { input: { $ifNull: ["$plotSizes", []] }, as: "plot", cond: { $gt: [{ $ifNull: ["$$plot.totalPrice", 0] }, 0] } } } },
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
        const keywordCondition = buildKeywordCondition(query.location);

        if (keywordCondition) {
            conditions.push(keywordCondition);
        }
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
    } else if (query.bhk === "4+" || query.bhk === "5+") {
        const minimumBedrooms = query.bhk === "5+" ? 5 : 4;
        conditions.push({
            $or: [
                {
                    bedrooms: {
                        $gte: minimumBedrooms,
                    },
                },
                {
                    "unitConfigurations.bedrooms": {
                        $gte: minimumBedrooms,
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
        await syncPropyoursZeroBrokerageListings();

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
                    ...screenPropertyImages(property),
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
