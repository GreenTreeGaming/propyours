import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Property from "@/models/Property";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        // Fetch user basic info
        const user = await User.findById(id).select("-password -favorites");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch user's property listings
        const properties = await Property.find({ userId: id }).sort({ createdAt: -1 });

        return NextResponse.json({
            user,
            properties
        });
    } catch (error) {
        console.error("Public Profile API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
