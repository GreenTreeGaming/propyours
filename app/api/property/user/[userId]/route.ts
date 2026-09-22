import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        await connectDB();
        const { userId } = await params;
        const auth = await getAuthenticatedUser();
        if (isAuthError(auth)) return auth;
        if (auth.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const properties = await Property.find({ userId }).sort({ createdAt: -1 });

        return NextResponse.json(properties);
    } catch {
        return NextResponse.json({ error: "Failed to fetch user properties" }, { status: 500 });
    }
}
