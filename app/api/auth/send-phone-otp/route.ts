import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import PhoneOtp from "@/models/PhoneOtp";
import { sendSms } from "@/lib/send-sms";

function generateOtp() {
    if (process.env.NODE_ENV !== "production") {
        return "123456";
    }

    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
    try {
        const { phone, email } = await req.json();

        if (!phone) {
            return NextResponse.json(
                { error: "Phone number is required" },
                { status: 400 }
            );
        }

        const normalizedPhone = phone.trim();
        const normalizedEmail = email ? email.toLowerCase().trim() : "";

        await connectDB();

        if (normalizedEmail) {
            const existingUser = await User.findOne({ email: normalizedEmail });

            if (existingUser) {
                return NextResponse.json(
                    { error: "Account already exists" },
                    { status: 409 }
                );
            }
        }

        const existingPhoneUser = await User.findOne({ phone: normalizedPhone });

        if (existingPhoneUser) {
            return NextResponse.json(
                { error: "Phone number is already registered" },
                { status: 409 }
            );
        }

        const otp = generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);

        await PhoneOtp.deleteMany({ phone: normalizedPhone });

        await PhoneOtp.create({
            phone: normalizedPhone,
            otpHash,
            attempts: 0,
            verified: false,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        await sendSms(
            normalizedPhone,
            `Your PROPYOURS verification code is ${otp}. It expires in 10 minutes.`
        );

        return NextResponse.json(
            { message: "OTP sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Send Phone OTP Error:", error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}