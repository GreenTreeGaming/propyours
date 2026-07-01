import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";

export async function GET() {
    try {
        const auth = await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        await connectDB();

        const user = await User.findById(auth.userId).select("-password");

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}