import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { connectDB } from "@/lib/mongoose";
import ContactInquiry from "@/models/ContactInquiry";

export async function GET() {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const inquiries = await ContactInquiry.find().sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({ inquiries }, { headers: { "Cache-Control": "no-store" } });
}
