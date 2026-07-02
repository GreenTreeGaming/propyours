import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        await connectDB();

        const { id } = await params;

        const property = await Property.findById(id);

        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        if (property.userId.toString() !== auth.userId) {
            return NextResponse.json(
                { error: "You are not allowed to promote this property." },
                { status: 403 }
            );
        }

        if ((property.promoteBoostsRemaining || 0) <= 0) {
            return NextResponse.json(
                { error: "No promote boosts remaining on your current plan." },
                { status: 403 }
            );
        }

        property.promoteBoostsRemaining =
            (property.promoteBoostsRemaining || 0) - 1;

        property.promotedUntil = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await property.save();

        return NextResponse.json({
            success: true,
            property,
        });
    } catch (error) {
        console.error("Failed to promote property:", error);

        return NextResponse.json(
            { error: "Failed to promote property" },
            { status: 500 }
        );
    }
}