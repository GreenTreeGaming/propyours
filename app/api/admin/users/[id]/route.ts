import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { writeAdminAudit } from "@/lib/admin/audit";
import { connectDB } from "@/lib/mongoose";

import AdminAuditLog from "@/models/AdminAuditLog";
import Lead from "@/models/Lead";
import Property from "@/models/Property";
import User from "@/models/User";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(
    request: Request,
    context: RouteContext,
) {
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
        return NextResponse.json(
            { error: "Unauthorized." },
            { status: 401 },
        );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
            { error: "Invalid user ID." },
            { status: 400 },
        );
    }

    await connectDB();

    const user = await User.findById(id)
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
            { error: "User not found." },
            { status: 404 },
        );
    }

    const leadFilter = {
        $or: [
            { ownerId: id },
            { viewerId: id },
        ],
    };

    const [properties, leads, auditLogs] = await Promise.all([
        Property.find({ userId: id })
            .select(
                [
                    "purpose",
                    "propertyType",
                    "commercialType",
                    "address",
                    "locality",
                    "city",
                    "state",
                    "size",
                    "sizeUnit",
                    "bedrooms",
                    "bathrooms",
                    "price",
                    "priceType",
                    "negotiable",
                    "status",
                    "featured",
                    "images",
                    "listingExpiresAt",
                    "promotedUntil",
                    "analytics",
                    "createdAt",
                    "updatedAt",
                ].join(" "),
            )
            .sort({ createdAt: -1 })
            .limit(100)
            .lean(),

        Lead.find(leadFilter)
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
            .sort({ createdAt: -1 })
            .limit(100)
            .lean(),

        AdminAuditLog.find({ targetUserId: id })
            .select(
                [
                    "actorUserId",
                    "actorRole",
                    "action",
                    "metadata",
                    "createdAt",
                ].join(" "),
            )
            .populate("actorUserId", "name email")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean(),
    ]);

    await writeAdminAudit({
        request,
        actorUserId: admin.userId,
        actorRole: admin.role,
        action: "user.view",
        targetUserId: id,
    });

    return NextResponse.json(
        {
            user: {
                ...user,
                favoritesCount: Array.isArray(user.favorites)
                    ? user.favorites.length
                    : 0,
            },
            properties: {
                items: properties,
                total: properties.length,
            },
            leads: {
                items: leads,
                total: leads.length,
            },
            auditLogs,
        },
        {
            headers: {
                "Cache-Control": "no-store",
            },
        },
    );
}
