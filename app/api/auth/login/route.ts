import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        await connectDB();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        return NextResponse.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                favorites: user.favorites || [],
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}