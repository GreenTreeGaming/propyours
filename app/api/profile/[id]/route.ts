import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import {
    getPublicPropertyFilter,
} from "@/lib/property-filters";
import {
    toPublicUserProfile,
} from "@/lib/public-user";

import User from "@/models/User";
import Property from "@/models/Property";
import DeveloperProfile from "@/models/DeveloperProfile";
import { screenPropertyImages } from "@/lib/public-property-images";
import { exactBuilderNameRegex, getBuilderPropertyAssociation } from "@/lib/builder-properties";

const BUILDER_PLAN_RANK: Record<
    string,
    number
> = {
    "builder-elite": 3,
    "builder-growth": 2,
    "builder-starter": 1,
};

function isActiveBuilderPlan(
    plan: any,
) {
    if (
        !plan ||
        plan.audience !== "builder" ||
        plan.status !== "active"
    ) {
        return false;
    }

    if (!plan.expiresAt) {
        return true;
    }

    return (
        new Date(
            plan.expiresAt,
        ).getTime() > Date.now()
    );
}

export async function GET(
    _req: Request,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    },
) {
    try {
        await connectDB();

        const { id } = await params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid user id",
                },
                {
                    status: 400,
                },
            );
        }

        let user: any =
            await User.findById(id)
                .select(
                    "name role bio company companyWebsite reraNumber address city plan",
                )
                .lean();

        let propertyAssociation: Record<string, unknown>;

        if (user) {
            propertyAssociation = getBuilderPropertyAssociation(
                new mongoose.Types.ObjectId(id),
                user.role === "Builder" ? user.company : "",
            );
        } else {
            const developerProfile: any = await DeveloperProfile.findById(id).lean();
            const nameExpression = exactBuilderNameRegex(developerProfile?.name);

            if (!developerProfile || !nameExpression) {
                return NextResponse.json({ error: "Profile not found" }, { status: 404 });
            }

            user = {
                _id: developerProfile._id,
                name: developerProfile.name,
                role: "Builder",
                company: developerProfile.name,
                bio: developerProfile.bio ?? "",
                companyWebsite: developerProfile.companyWebsite ?? "",
                reraNumber: developerProfile.reraNumber ?? "",
                address: developerProfile.address ?? "",
                city: developerProfile.city ?? "",
            };
            propertyAssociation = { developerName: nameExpression };
        }

        const now = new Date();

        const properties =
            await Property.aggregate([
                {
                    $match:
                        getPublicPropertyFilter(
                            {
                                $and: [
                                    propertyAssociation,
                                ],
                            },
                        ),
                },

                /*
                 * Keep the profile listing data consistent with
                 * the search/homepage property cards.
                 *
                 * These derived values are used by:
                 * - getPropertyDisplayTitle()
                 * - getPropertyDisplayPrice()
                 */
                {
                    $addFields: {
                        availableBHKs: {
                            $setUnion: [
                                {
                                    $map: {
                                        input: {
                                            $ifNull:
                                                [
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
                                                $ifNull:
                                                    [
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
                                            input:
                                                "$unitConfigurations",

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
                                        $ifNull:
                                            [
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

                        isPromoted: {
                            $gt: [
                                "$promotedUntil",
                                now,
                            ],
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

                /*
                 * isPromoted is only needed for sorting and does not
                 * need to be exposed in the public API response.
                 */
                {
                    $unset:
                        "isPromoted",
                },
            ]);

        const stats =
            properties.reduce(
                (
                    acc,
                    property,
                ) => {
                    acc.totalListings +=
                        1;

                    if (
                        property.status ===
                        "active"
                    ) {
                        acc.activeListings +=
                            1;
                    }

                    if (
                        property.featured
                    ) {
                        acc.featuredListings +=
                            1;
                    }

                    acc.totalViews +=
                        property.analytics
                            ?.views ?? 0;

                    acc.phoneClicks +=
                        property.analytics
                            ?.phoneClicks ??
                        0;

                    acc.favorites +=
                        property.analytics
                            ?.favoritesCount ??
                        0;

                    return acc;
                },
                {
                    totalListings: 0,
                    activeListings: 0,
                    featuredListings: 0,
                    totalViews: 0,
                    phoneClicks: 0,
                    favorites: 0,
                },
            );

        if (!user.city && properties[0]?.city) {
            user.city = properties[0].city;
        }

        const hasActiveBuilderPlan =
            isActiveBuilderPlan(
                (user as any).plan,
            );

        const planTier =
            hasActiveBuilderPlan
                ? (user as any).plan
                    .tier
                : null;

        return NextResponse.json({
            user: {
                ...toPublicUserProfile(
                    user,
                ),

                builderPlan: {
                    tier:
                    planTier,

                    isActive:
                    hasActiveBuilderPlan,

                    rank:
                        planTier
                            ? BUILDER_PLAN_RANK[
                            planTier
                            ] ?? 0
                            : 0,
                },
            },

            properties: properties.map(screenPropertyImages),
            stats,
        });
    } catch (error) {
        console.error(
            "Public Profile API Error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Internal Server Error",
            },
            {
                status: 500,
            },
        );
    }
}
