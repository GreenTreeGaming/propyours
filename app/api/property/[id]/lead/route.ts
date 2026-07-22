import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import User from "@/models/User";
import Lead from "@/models/Lead";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";
import { getPlanLimits } from "@/lib/plans";
import { sendLeadNotificationEmail } from "@/lib/send-lead-notification";

import {
    createRateLimitResponse,
    enforceRateLimit,
    RateLimitError,
} from "@/lib/rate-limit";

type LeadSource = "phone" | "email" | "whatsapp" | "favorite";

function cleanString(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

function isValidLeadSource(value: unknown): value is LeadSource {
    return ["phone", "email", "whatsapp", "favorite"].includes(String(value));
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await req.json();

        const property = await Property.findById(id);

        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        if (property.status !== "active") {
            return NextResponse.json(
                { error: "This property is not accepting leads." },
                { status: 400 }
            );
        }

        if (
            property.listingExpiresAt &&
            new Date(property.listingExpiresAt).getTime() <= Date.now()
        ) {
            return NextResponse.json(
                { error: "This listing has expired." },
                { status: 400 }
            );
        }

        const owner = await User.findById(property.userId);

        if (!owner) {
            return NextResponse.json(
                { error: "Property owner not found" },
                { status: 404 }
            );
        }

        let viewerUserId: string | null = null;

        try {
            const auth = await getAuthenticatedUser();

            if (!isAuthError(auth)) {
                viewerUserId = auth.userId;
            }
        } catch {
            viewerUserId = null;
        }

        if (!viewerUserId) {
            return NextResponse.json(
                { error: "Please log in to contact this seller." },
                { status: 401 }
            );
        }

        await enforceRateLimit(
            req,
            {
                namespace:
                    "property-lead-ip",
                windowMs:
                    15 * 60 * 1_000,
                maximumRequests: 20,
            },
        );

        await enforceRateLimit(
            req,
            {
                namespace:
                    "property-lead-user",
                windowMs:
                    60 * 60 * 1_000,
                maximumRequests: 30,
                subject:
                viewerUserId,
            },
        );

        if (property.userId.toString() === viewerUserId) {
            return NextResponse.json(
                { error: "You cannot create a lead for your own property." },
                { status: 400 }
            );
        }

        const viewer = await User.findById(viewerUserId);

        if (!viewer) {
            return NextResponse.json(
                { error: "Viewer account not found" },
                { status: 404 }
            );
        }

        const source = isValidLeadSource(body.source) ? body.source : "phone";

        const deliveredLeadCount = await Lead.countDocuments({
            ownerId: property.userId,
            status: "verified",
            delivered: true,
        });

        const ownerLimits = getPlanLimits(owner);
        const leadLimit = ownerLimits.verifiedLeadLimit;
        const shouldDeliverLead =
            leadLimit === null || deliveredLeadCount < leadLimit;

        const existingLead = await Lead.findOne({
            propertyId: property._id,
            ownerId: property.userId,
            viewerId: viewer._id,
            source,
        });

        if (existingLead) {
            return NextResponse.json({
                success: true,
                delivered: existingLead.delivered,
                duplicate: true,
                lead: existingLead,
            });
        }

        const lead = await Lead.create({
            propertyId: property._id,
            ownerId: property.userId,
            viewerId: viewer._id,
            name: viewer.name || cleanString(body.name) || "Interested Buyer",
            phone: viewer.phone || cleanString(body.phone) || "Not provided",
            email: viewer.email || cleanString(body.email) || undefined,
            message:
                source === "favorite"
                    ? "This person favorited your property on PropYours."
                    : "This person is interested in your property on PropYours.",
            source,
            status: "verified",
            delivered: shouldDeliverLead,
        });

        if (shouldDeliverLead && ownerLimits.leadNotifications && owner.email) {
            try {
                await sendLeadNotificationEmail({
                    ownerEmail: owner.email,
                    ownerName: owner.name,
                    buyerName: lead.name,
                    buyerEmail: lead.email,
                    buyerPhone: lead.phone,
                    propertyId: property._id.toString(),
                    propertyAddress: property.address,
                    source,
                });
            } catch (emailError) {
                console.error("Failed to send lead notification email:", emailError);
            }
        }

        // Email notification will go here next.
        // For now, the lead is saved and plan limits are enforced.

        return NextResponse.json(
            {
                success: true,
                delivered: shouldDeliverLead,
                lead,
            },
            { status: 201 }
        );
    } catch (error) {
        if (
            error instanceof
            RateLimitError
        ) {
            return createRateLimitResponse(
                error,
            );
        }

        if (
            typeof error ===
            "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            return NextResponse.json({
                success: true,
                duplicate: true,
            });
        }

        console.error(
            "Failed to create lead:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Failed to create lead",
            },
            {
                status: 500,
            },
        );
    }
}