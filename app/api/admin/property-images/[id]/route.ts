import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import { hasTrustedOrigin } from "@/lib/security/trusted-origin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    if (body.status !== "approved" && body.status !== "rejected") {
        return NextResponse.json({ error: "Choose approve or reject." }, { status: 400 });
    }
    await connectDB();
    const property = await Property.findOneAndUpdate(
        { _id: id, imageReviewStatus: "pending" },
        { $set: {
            imageReviewStatus: body.status,
            imageReviewNote: typeof body.note === "string" ? body.note.trim().slice(0, 500) : "",
            imageReviewedAt: new Date(),
            imageReviewedBy: admin.userId,
        } },
        { new: true },
    );
    if (!property) return NextResponse.json({ error: "Pending listing not found." }, { status: 404 });
    return NextResponse.json({ success: true });
}
