import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { normalizeLeadPhone } from "@/lib/lead-phone";
import { sendSms } from "@/lib/send-sms";
import { hasTrustedOrigin } from "@/lib/security/trusted-origin";
import { createRateLimitResponse, enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import LeadPhoneOtp from "@/models/LeadPhoneOtp";

export async function POST(request: Request) {
    if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    try {
        const body = await request.json();
        const phone = normalizeLeadPhone(typeof body.phone === "string" ? body.phone : "");
        if (!phone) return NextResponse.json({ error: "Enter a valid Indian mobile number." }, { status: 400 });
        await enforceRateLimit(request, { namespace: "lead-otp-ip", windowMs: 60 * 60 * 1000, maximumRequests: 10 });
        await enforceRateLimit(request, { namespace: "lead-otp-phone", windowMs: 15 * 60 * 1000, maximumRequests: 3, subject: phone });
        const otp = process.env.TEST_PHONE_OTP?.trim() || (process.env.NODE_ENV === "production" ? String(randomInt(100000, 1000000)) : "123456");
        await connectDB();
        await LeadPhoneOtp.findOneAndUpdate({ phone }, { $set: { otpHash: await bcrypt.hash(otp, 12), attempts: 0, verified: false, tokenHash: null, expiresAt: new Date(Date.now() + 10 * 60 * 1000) } }, { upsert: true, new: true });
        await sendSms({ phone, otp });
        return NextResponse.json({ success: true, message: "Verification code sent." });
    } catch (error) {
        if (error instanceof RateLimitError) return createRateLimitResponse(error);
        return NextResponse.json({ error: "Unable to send the verification code." }, { status: 500 });
    }
}
