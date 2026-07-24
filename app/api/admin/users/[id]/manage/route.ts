import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { writeAdminAudit } from "@/lib/admin/audit";
import { connectDB } from "@/lib/mongoose";
import { hasTrustedOrigin } from "@/lib/security/trusted-origin";
import { parseJsonBody } from "@/lib/validation/api";

import Lead from "@/models/Lead";
import Property from "@/models/Property";
import User from "@/models/User";

const actionSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("revoke-sessions"),
    }).strict(),

    z.object({
        action: z.literal("set-plan"),
        audience: z.enum(["owner", "builder"]),
        tier: z.enum([
            "silver",
            "gold",
            "platinum",
            "builder-starter",
            "builder-growth",
            "builder-elite",
        ]),
        status: z.enum([
            "free",
            "active",
            "expired",
            "cancelled",
        ]),
        expiresAt: z.string().datetime().nullable(),
        boostsRemaining: z.number().int().min(0).max(10_000),
    }).strict(),

    z.object({
        action: z.literal("set-property"),
        propertyId: z.string().min(1),
        status: z.enum(["active", "sold", "inactive"]),
        featured: z.boolean(),
        promotedUntil: z.string().datetime().nullable(),
    }).strict(),

    z.object({
        action: z.literal("set-lead"),
        leadId: z.string().min(1),
        status: z.enum(["new", "verified", "invalid"]),
        delivered: z.boolean(),
    }).strict(),
]);

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

function isValidObjectId(value: string): boolean {
    return mongoose.Types.ObjectId.isValid(value);
}

export async function PATCH(
    request: Request,
    context: RouteContext,
) {
    if (!hasTrustedOrigin(request)) {
        return NextResponse.json(
            { error: "Invalid request origin." },
            { status: 403 },
        );
    }

    const admin = await getAuthenticatedAdmin();

    if (!admin) {
        return NextResponse.json(
            { error: "Unauthorized." },
            { status: 401 },
        );
    }

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
        return NextResponse.json(
            { error: "Invalid user ID." },
            { status: 400 },
        );
    }

    const parsed = await parseJsonBody(request, actionSchema);

    if (!parsed.success) {
        return parsed.response;
    }

    await connectDB();

    const target = await User.findById(id).select(
        "name email role plan +tokenVersion",
    );

    if (!target) {
        return NextResponse.json(
            { error: "User not found." },
            { status: 404 },
        );
    }

    if (
        target.role === "SuperAdmin" &&
        admin.role !== "SuperAdmin"
    ) {
        return NextResponse.json(
            {
                error:
                    "Only a SuperAdmin can manage another SuperAdmin.",
            },
            { status: 403 },
        );
    }

    const action = parsed.data;

    if (action.action === "revoke-sessions") {
        if (admin.userId === id) {
            return NextResponse.json(
                {
                    error:
                        "Use the sign-out button to end your own session.",
                },
                { status: 400 },
            );
        }

        target.tokenVersion = (target.tokenVersion ?? 0) + 1;
        await target.save();

        await writeAdminAudit({
            request,
            actorUserId: admin.userId,
            actorRole: admin.role,
            action: "user.sessions.revoke",
            targetUserId: id,
        });

        return NextResponse.json({
            message:
                "All active sessions for this account have been revoked.",
        });
    }

    if (action.action === "set-plan") {
        const ownerTier = [
            "silver",
            "gold",
            "platinum",
        ].includes(action.tier);

        const builderTier = action.tier.startsWith("builder-");

        if (
            (action.audience === "owner" && !ownerTier) ||
            (action.audience === "builder" && !builderTier)
        ) {
            return NextResponse.json(
                {
                    error:
                        "The selected tier does not match the plan audience.",
                },
                { status: 400 },
            );
        }

        const previousPlan =
            target.plan?.toObject?.() ?? target.plan ?? null;

        target.plan = {
            ...(target.plan?.toObject?.() ?? target.plan ?? {}),
            audience: action.audience,
            tier: action.tier,
            status: action.status,
            expiresAt: action.expiresAt
                ? new Date(action.expiresAt)
                : undefined,
            boostsRemaining: action.boostsRemaining,
            source: "manual",
        };

        await target.save();

        await writeAdminAudit({
            request,
            actorUserId: admin.userId,
            actorRole: admin.role,
            action: "user.plan.change",
            targetUserId: id,
            metadata: {
                previousPlan,
                nextPlan: {
                    audience: action.audience,
                    tier: action.tier,
                    status: action.status,
                    expiresAt: action.expiresAt,
                    boostsRemaining: action.boostsRemaining,
                },
            },
        });

        return NextResponse.json({
            message: "Plan updated.",
            plan: target.plan,
        });
    }

    if (action.action === "set-property") {
        if (!isValidObjectId(action.propertyId)) {
            return NextResponse.json(
                { error: "Invalid property ID." },
                { status: 400 },
            );
        }

        const property = await Property.findOne({
            _id: action.propertyId,
            userId: id,
        });

        if (!property) {
            return NextResponse.json(
                {
                    error:
                        "Property not found for this account.",
                },
                { status: 404 },
            );
        }

        const previousState = {
            status: property.status,
            featured: property.featured,
            promotedUntil: property.promotedUntil ?? null,
        };

        property.status = action.status;
        property.featured = action.featured;
        property.promotedUntil = action.promotedUntil
            ? new Date(action.promotedUntil)
            : undefined;

        await property.save();

        await writeAdminAudit({
            request,
            actorUserId: admin.userId,
            actorRole: admin.role,
            action: "property.admin.change",
            targetUserId: id,
            metadata: {
                propertyId: property._id.toString(),
                previousState,
                nextState: {
                    status: property.status,
                    featured: property.featured,
                    promotedUntil: property.promotedUntil ?? null,
                },
            },
        });

        return NextResponse.json({
            message: "Property updated.",
            property,
        });
    }

    if (!isValidObjectId(action.leadId)) {
        return NextResponse.json(
            { error: "Invalid lead ID." },
            { status: 400 },
        );
    }

    const lead = await Lead.findOne({
        _id: action.leadId,
        $or: [
            { ownerId: id },
            { viewerId: id },
        ],
    });

    if (!lead) {
        return NextResponse.json(
            {
                error:
                    "Lead not found for this account.",
            },
            { status: 404 },
        );
    }

    const previousState = {
        status: lead.status,
        delivered: lead.delivered,
    };

    lead.status = action.status;
    lead.delivered = action.delivered;
    await lead.save();

    await writeAdminAudit({
        request,
        actorUserId: admin.userId,
        actorRole: admin.role,
        action: "lead.admin.change",
        targetUserId: id,
        metadata: {
            leadId: lead._id.toString(),
            previousState,
            nextState: {
                status: lead.status,
                delivered: lead.delivered,
            },
        },
    });

    return NextResponse.json({
        message: "Lead updated.",
        lead,
    });
}
