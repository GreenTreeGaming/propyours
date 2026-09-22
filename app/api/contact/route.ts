import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongoose";
import { hasTrustedOrigin } from "@/lib/security/trusted-origin";
import { enforceRateLimit, createRateLimitResponse, RateLimitError } from "@/lib/rate-limit";
import ContactInquiry from "@/models/ContactInquiry";

const schema = z.object({
    name: z.string().trim().min(2).max(120),
    email: z.email().max(160),
    phone: z.string().trim().min(8).max(30),
    message: z.string().trim().min(10).max(2000),
});

export async function POST(request: Request) {
    if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    try {
        await enforceRateLimit(request, { namespace: "contact-inquiry", windowMs: 60 * 60 * 1000, maximumRequests: 5 });
        const result = schema.safeParse(await request.json());
        if (!result.success) return NextResponse.json({ error: "Please complete all contact fields." }, { status: 400 });
        await connectDB();
        await ContactInquiry.create(result.data);
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        if (error instanceof RateLimitError) return createRateLimitResponse(error);
        return NextResponse.json({ error: "Unable to save your enquiry." }, { status: 500 });
    }
}
