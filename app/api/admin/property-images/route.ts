import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";

export async function GET() {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const properties = await Property.find({ imageReviewStatus: "pending", images: { $exists: true, $ne: [] } })
        .select("address locality city images userId createdAt")
        .sort({ createdAt: 1 }).limit(100).lean();
    return NextResponse.json({ properties }, { headers: { "Cache-Control": "no-store" } });
}
