import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import User from "@/models/User";

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
        await connectDB();
        const { id } = await params;

        const deletedProperty = await Property.findByIdAndDelete(id);

        if (!deletedProperty) {
            return NextResponse.json({ error: "Property not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Property deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
    }
}
