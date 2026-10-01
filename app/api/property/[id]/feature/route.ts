import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await getAuthenticatedUser();
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid property." }, { status: 400 });
        const body = await request.json().catch(() => ({}));
        if (typeof body.featured !== "boolean") return NextResponse.json({ error: "Choose whether this property is featured." }, { status: 400 });

        await connectDB();
        const property = await Property.findOne({ _id: id, userId: auth.userId });
        if (!property) return NextResponse.json({ error: "Property not found." }, { status: 404 });

        if (body.featured && !property.ownerFeatured) {
            const selectedCount = await Property.countDocuments({ userId: auth.userId, ownerFeatured: true, status: "active" });
            if (selectedCount >= 5) return NextResponse.json({ error: "You can feature up to 5 active properties at a time." }, { status: 400 });
        }

        property.ownerFeatured = body.featured;
        await property.save();
        return NextResponse.json({ property });
    } catch (error) {
        console.error("Unable to update owner featured property:", error);
        return NextResponse.json({ error: "Unable to update featured property." }, { status: 500 });
    }
}
