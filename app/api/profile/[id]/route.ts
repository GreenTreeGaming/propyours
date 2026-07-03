import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Property from "@/models/Property";
import { getPublicPropertyFilter } from "@/lib/property-filters";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const user = await User.findById(id).select("-password -favorites");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const properties = await Property.aggregate([
            {
                $match: getPublicPropertyFilter({
                    userId: new mongoose.Types.ObjectId(id),
                }),
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

        return NextResponse.json({
            user,
            properties,
        });
    } catch (error) {
        console.error("Public Profile API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}