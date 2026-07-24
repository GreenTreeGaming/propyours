import mongoose from "mongoose";
import {
    NextResponse,
} from "next/server";

import {
    getAuthenticatedAdmin,
} from "@/lib/admin/auth";
import {
    connectDB,
} from "@/lib/mongoose";

import User from "@/models/User";
import Property from "@/models/Property";

function escapeRegex(
    value: string,
): string {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
    );
}

export async function GET(
    request: Request,
) {
    const admin =
        await getAuthenticatedAdmin();

    if (!admin) {
        return NextResponse.json(
            {
                error:
                    "Unauthorized.",
            },
            {
                status: 401,
            },
        );
    }

    await connectDB();

    const url =
        new URL(request.url);

    const page =
        Math.max(
            1,
            Number(
                url.searchParams.get(
                    "page",
                ) ?? 1,
            ) || 1,
        );

    const limit =
        Math.min(
            50,
            Math.max(
                1,
                Number(
                    url.searchParams.get(
                        "limit",
                    ) ?? 20,
                ) || 20,
            ),
        );

    const query =
        (
            url.searchParams.get(
                "q",
            ) ?? ""
        )
            .trim()
            .slice(0, 100);

    const filter:
        Record<string, unknown> = {};

    if (query) {
        const expression =
            new RegExp(
                escapeRegex(query),
                "i",
            );

        filter.$or = [
            {
                name:
                expression,
            },
            {
                email:
                expression,
            },
            {
                phone:
                expression,
            },
            {
                company:
                expression,
            },
        ];
    }

    const [
        users,
        total,
    ] = await Promise.all([
        User.find(filter)
            .select(
                [
                    "name",
                    "email",
                    "phone",
                    "role",
                    "company",
                    "city",
                    "plan",
                    "favorites",
                    "createdAt",
                    "updatedAt",
                ].join(" "),
            )
            .sort({
                createdAt: -1,
            })
            .skip(
                (page - 1) *
                limit,
            )
            .limit(limit)
            .lean(),

        User.countDocuments(
            filter,
        ),
    ]);

    const userIds =
        users.map(
            (user) =>
                user._id,
        );

    const propertyCounts =
        userIds.length === 0
            ? []
            : await Property.aggregate<{
                _id:
                    mongoose.Types.ObjectId;
                count: number;
            }>([
                {
                    $match: {
                        userId: {
                            $in:
                            userIds,
                        },
                    },
                },
                {
                    $group: {
                        _id:
                            "$userId",
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ]);

    const countMap =
        new Map(
            propertyCounts.map(
                (entry) => [
                    entry._id.toString(),
                    entry.count,
                ],
            ),
        );

    return NextResponse.json(
        {
            users:
                users.map(
                    (user) => ({
                        id:
                        user._id,
                        name:
                        user.name,
                        email:
                        user.email,
                        phone:
                            user.phone ??
                            "",
                        role:
                        user.role,
                        company:
                            user.company ??
                            "",
                        city:
                            user.city ??
                            "",
                        plan:
                        user.plan,
                        favoritesCount:
                            Array.isArray(
                                user.favorites,
                            )
                                ? user
                                    .favorites
                                    .length
                                : 0,
                        propertyCount:
                            countMap.get(
                                user._id.toString(),
                            ) ?? 0,
                        createdAt:
                        user.createdAt,
                        updatedAt:
                        user.updatedAt,
                    }),
                ),

            pagination: {
                page,
                limit,
                total,
                pages:
                    Math.max(
                        1,
                        Math.ceil(
                            total /
                            limit,
                        ),
                    ),
            },
        },
        {
            headers: {
                "Cache-Control":
                    "no-store",
            },
        },
    );
}