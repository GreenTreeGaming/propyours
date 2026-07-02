import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import { getPublicPropertyFilter } from "@/lib/property-filters";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;

        const property = await Property.findOne(
            getPublicPropertyFilter({ _id: id })
        ).populate("userId", "name email role bio company city phone");

        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(property);
    } catch (error) {
        console.error("Failed to fetch property:", error);

        return NextResponse.json(
            { error: "Failed to fetch property" },
            { status: 500 }
        );
    }
}