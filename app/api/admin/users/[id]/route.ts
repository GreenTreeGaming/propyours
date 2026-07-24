import mongoose from "mongoose";
import {
    NextResponse,
} from "next/server";

import {
    getAuthenticatedAdmin,
} from "@/lib/admin/auth";
import {
    writeAdminAudit,
} from "@/lib/admin/audit";
import {
    connectDB,
} from "@/lib/mongoose";

import User from "@/models/User";
import Property from "@/models/Property";
import Lead from "@/models/Lead";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

function parsePage(
    value: string | null,
): number {
    return Math.max(
        1,
        Number(value ?? 1) || 1,
    );
}

export async function GET(
    request: Request,
    context: RouteContext,
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

    const {
        id,
    } = await context.params;

    if (
        !mongoose.Types
            .ObjectId
            .isValid(id)
    ) {
        return NextResponse.json(
            {
                error:
                    "Invalid user ID.",
            },
            {
                status: 400,
            },
        );
    }

    await connectDB();

    const url =
        new URL(request.url);

    const propertyPage =
        parsePage(
            url.searchParams.get(
                "propertyPage",
            ),
        );

    const leadPage =
        parsePage(
            url.searchParams.get(
                "leadPage",
            ),
        );

    const limit = 25;

    const user =
        await User.findById(id)
            .select(
                [
                    "name",
                    "email",
                    "phone",
                    "role",
                    "bio",
                    "company",
                    "address",
                    "city",
                    "favorites",
                    "plan",
                    "createdAt",
                    "updatedAt",
                ].join(" "),
            )
            .lean();

    if (!user) {
        return NextResponse.json(
            {
                error:
                    "User not found.",
            },
            {
                status: 404,
            },
        );
    }

    const leadFilter = {
        $or: [
            {
                ownerId: id,
            },
            {
                viewerId: id,
            },
        ],
    };

    const [
        properties,
        propertyTotal,
        leads,
        leadTotal,
    ] = await Promise.all([
        Property.find({
            userId: id,
        })
            .sort({
                createdAt: -1,
            })
            .skip(
                (propertyPage - 1) *
                limit,
            )
            .limit(limit)
            .lean(),

        Property.countDocuments({
            userId: id,
        }),

        Lead.find(
            leadFilter,
        )
            .select(
                [
                    "propertyId",
                    "ownerId",
                    "viewerId",
                    "name",
                    "phone",
                    "email",
                    "message",
                    "source",
                    "status",
                    "delivered",
                    "createdAt",
                    "updatedAt",
                ].join(" "),
            )
            .sort({
                createdAt: -1,
            })
            .skip(
                (leadPage - 1) *
                limit,
            )
            .limit(limit)
            .lean(),

        Lead.countDocuments(
            leadFilter,
        ),
    ]);

    await writeAdminAudit({
        request,
        actorUserId:
        admin.userId,
        actorRole:
        admin.role,
        action:
            "user.view",
        targetUserId: id,
    });

    return NextResponse.json(
        {
            user,

            properties: {
                items:
                properties,
                total:
                propertyTotal,
                page:
                propertyPage,
                limit,
            },

            leads: {
                items:
                leads,
                total:
                leadTotal,
                page:
                leadPage,
                limit,
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