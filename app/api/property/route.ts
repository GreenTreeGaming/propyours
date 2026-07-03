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

        const properties = await Property.aggregate([
            {
                $match: getPublicPropertyFilter(),
            },
            {
                $addFields: {
                    isPromoted: {
                        $gt: ["$promotedUntil", new Date()],
                    },
                },
            },
            {
                $sort: {
                    isPromoted: -1,
                    featured: -1,
                    createdAt: -1,
                },
            },
        ]);

        return NextResponse.json(properties);
    } catch (error) {
        console.error("Failed to fetch properties:", error);

        return NextResponse.json(
            { error: "Failed to fetch properties" },
            { status: 500 }
        );
    }
}