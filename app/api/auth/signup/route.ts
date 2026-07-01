import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import PhoneOtp from "@/models/PhoneOtp";

export async function POST(req: Request) {
    try {
        const { name, email, phone, password, role } = await req.json();

        if (!name || !email || !phone || !password) {
            return NextResponse.json(
                { error: "Name, email, phone, and password are required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedPhone = phone.trim();

        await connectDB();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return NextResponse.json(
                { error: "Account already exists" },
                { status: 409 }
            );
        }

        const existingPhoneUser = await User.findOne({ phone: normalizedPhone });

        if (existingPhoneUser) {
            return NextResponse.json(
                { error: "Phone number is already registered" },
                { status: 409 }
            );
        }

        const verifiedOtp = await PhoneOtp.findOne({
            phone: normalizedPhone,
            verified: true,
            expiresAt: { $gt: new Date() },
        });

        if (!verifiedOtp) {
            return NextResponse.json(
                { error: "Please verify your phone number before creating an account" },
                { status: 403 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            password: hashedPassword,
            role: role || "User",
        });

        await PhoneOtp.deleteMany({ phone: normalizedPhone });

        return NextResponse.json(
            { message: "Account created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup Error:", error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}