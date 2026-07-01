import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";

export async function GET() {
    try {
        await connectDB();
        const properties = await Property.find({}).sort({ createdAt: -1 });

        return NextResponse.json(properties);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
    }
}
