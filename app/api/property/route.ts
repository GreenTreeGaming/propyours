import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import {
    getPublicPropertyFilter,
    publicPropertySort,
} from "@/lib/property-filters";

export async function GET() {
    try {
        await connectDB();

        const properties = await Property.find(getPublicPropertyFilter()).sort(
            publicPropertySort
        );

        return NextResponse.json(properties);
    } catch (error) {
        console.error("Failed to fetch properties:", error);

        return NextResponse.json(
            { error: "Failed to fetch properties" },
            { status: 500 }
        );
    }
}