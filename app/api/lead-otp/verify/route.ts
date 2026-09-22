import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { hashLeadToken, normalizeLeadPhone } from "@/lib/lead-phone";
import { hasTrustedOrigin } from "@/lib/security/trusted-origin";
import { createRateLimitResponse, enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import LeadPhoneOtp from "@/models/LeadPhoneOtp";

export async function POST(request: Request) {
    if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    try {
        const body = await request.json();
        const phone = normalizeLeadPhone(typeof body.phone === "string" ? body.phone : "");
        const otp = typeof body.otp === "string" ? body.otp.trim() : "";
        if (!phone || !/^\d{6}$/.test(otp)) return NextResponse.json({ error: "Enter a valid phone number and six-digit code." }, { status: 400 });
        await enforceRateLimit(request, { namespace: "lead-otp-verify-ip", windowMs: 15 * 60 * 1000, maximumRequests: 20 });
        await enforceRateLimit(request, { namespace: "lead-otp-verify-phone", windowMs: 15 * 60 * 1000, maximumRequests: 8, subject: phone });
        await connectDB();
        const record = await LeadPhoneOtp.findOne({ phone, expiresAt: { $gt: new Date() }, verified: false, attempts: { $lt: 5 } });
        if (!record) return NextResponse.json({ error: "Code expired or unavailable. Request a new one." }, { status: 400 });
        if (!(await bcrypt.compare(otp, record.otpHash))) {
            await LeadPhoneOtp.updateOne({ _id: record._id, verified: false }, { $inc: { attempts: 1 } });
            return NextResponse.json({ error: "That code is incorrect." }, { status: 400 });
        }
        const token = randomBytes(32).toString("base64url");
        const updated = await LeadPhoneOtp.findOneAndUpdate({ _id: record._id, verified: false, expiresAt: { $gt: new Date() } }, { $set: { verified: true, tokenHash: hashLeadToken(token), verifiedAt: new Date() } });
        if (!updated) return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
        return NextResponse.json({ verified: true, token });
    } catch (error) {
        if (error instanceof RateLimitError) return createRateLimitResponse(error);
        return NextResponse.json({ error: "Unable to verify the code." }, { status: 500 });
    }
}
