import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import User from "@/models/User";
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

        if (
            property.promotedUntil &&
            new Date(property.promotedUntil).getTime() > Date.now()
        ) {
            return NextResponse.json(
                { error: "This property is already boosted." },
                { status: 400 }
            );
        }

        const user = await User.findById(auth.userId);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const boostsRemaining = user.plan?.boostsRemaining || 0;

        if (boostsRemaining <= 0) {
            return NextResponse.json(
                { error: "No boost tokens remaining on your account." },
                { status: 403 }
            );
        }

        user.plan.boostsRemaining = boostsRemaining - 1;

        property.promotedUntil = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await user.save();
        await property.save();

        return NextResponse.json({
            success: true,
            property,
            boostsRemaining: user.plan.boostsRemaining,
        });
    } catch (error) {
        console.error("Failed to promote property:", error);

        return NextResponse.json(
            { error: "Failed to promote property" },
            { status: 500 }
        );
    }
}