import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        await connectDB();
        const { userId } = await params;
        const properties = await Property.find({ userId }).sort({ createdAt: -1 });

        return NextResponse.json(properties);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user properties" }, { status: 500 });
    }
}
