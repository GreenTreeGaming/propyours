import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { connectDB } from "@/lib/mongoose";
import BubbyLead from "@/models/BubbyLead";
import { hasTrustedOrigin } from "@/lib/security/trusted-origin";

const STATUSES = ["new", "contacted", "qualified", "closed"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const body = await request.json().catch(() => null);
    if (!body || !STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid lead status" }, { status: 400 });
    await connectDB();
    const lead = await BubbyLead.findByIdAndUpdate(id, { $set: { status: body.status } }, { new: true }).select("status").lean();
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json({ success: true, status: lead.status });
}
