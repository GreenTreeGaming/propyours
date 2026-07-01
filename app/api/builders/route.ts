import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Property from "@/models/Property";

export async function GET() {
    try {
        await connectDB();

        // Fetch users with role 'Builder'
        const builders = await User.find({ role: "Builder" })
            .select("-password")
            .lean();

        // For each builder, count their properties
        const buildersWithCounts = await Promise.all(builders.map(async (builder: any) => {
            const projectCount = await Property.countDocuments({ userId: builder._id });
            return {
                ...builder,
                projects: projectCount
            };
        }));

        return NextResponse.json(buildersWithCounts);
    } catch (error) {
        console.error("Error fetching builders:", error);
        return NextResponse.json(
            { error: "Failed to fetch builders" },
            { status: 500 }
        );
    }
}
