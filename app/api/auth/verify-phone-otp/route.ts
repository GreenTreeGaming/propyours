import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import PhoneOtp from "@/models/PhoneOtp";

export async function POST(req: Request) {
    try {
        const { phone, otp } = await req.json();

        if (!phone || !otp) {
            return NextResponse.json(
                { error: "Phone number and OTP are required" },
                { status: 400 }
            );
        }

        const normalizedPhone = phone.trim();
        const normalizedOtp = otp.trim();

        await connectDB();

        const record = await PhoneOtp.findOne({ phone: normalizedPhone });

        if (!record) {
            return NextResponse.json(
                { error: "OTP not found or expired" },
                { status: 400 }
            );
        }

        if (record.expiresAt < new Date()) {
            await PhoneOtp.deleteOne({ _id: record._id });

            return NextResponse.json(
                { error: "OTP has expired" },
                { status: 400 }
            );
        }

        if (record.attempts >= 5) {
            await PhoneOtp.deleteOne({ _id: record._id });

            return NextResponse.json(
                { error: "Too many incorrect attempts. Please request a new OTP." },
                { status: 429 }
            );
        }

        const isValid = await bcrypt.compare(normalizedOtp, record.otpHash);

        if (!isValid) {
            record.attempts += 1;
            await record.save();

            return NextResponse.json(
                { error: "Invalid OTP" },
                { status: 400 }
            );
        }

        record.verified = true;
        await record.save();

        return NextResponse.json(
            { message: "Phone verified successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verify Phone OTP Error:", error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}