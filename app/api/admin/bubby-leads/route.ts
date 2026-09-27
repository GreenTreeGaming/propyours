import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { connectDB } from "@/lib/mongoose";
import BubbyLead from "@/models/BubbyLead";
import Property from "@/models/Property";

export async function GET() {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    // Register the referenced model before Mongoose populates propertyIds.
    void Property;
    const leads = await BubbyLead.find()
        .sort({ createdAt: -1 })
        .limit(200)
        .populate({ path: "propertyIds", select: "address locality city" })
        .lean();
    return NextResponse.json({ leads }, { headers: { "Cache-Control": "no-store" } });
}
