import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const property = await Property.findById(id).populate("userId", "name email role bio company city phone");

        if (!property) {
            return NextResponse.json({ error: "Property not found" }, { status: 404 });
        }

        return NextResponse.json(property);
    } catch (error) {
        console.error("Error fetching property:", error);
        return NextResponse.json({ error: "Failed to fetch property", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function DELETE(
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

        // Only the owner can delete
        if (property.userId.toString() !== auth.userId) {
            return NextResponse.json(
                { error: "You are not allowed to delete this property." },
                { status: 403 }
            );
        }

        await property.deleteOne();

        return NextResponse.json({
            success: true,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to delete property" },
            { status: 500 }
        );
    }
}