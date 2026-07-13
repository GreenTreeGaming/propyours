import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { getAuthenticatedUser, isAuthError } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

type UpdateAccountBody = {
    name?: unknown;
    email?: unknown;
    bio?: unknown;
    company?: unknown;
    address?: unknown;
    city?: unknown;
    oldPassword?: unknown;
    newPassword?: unknown;
};

function cleanOptionalString(
    value: unknown,
    maxLength: number,
): string | undefined {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== "string") {
        return undefined;
    }

    return value.trim().slice(0, maxLength);
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { error: "Invalid user ID." },
                { status: 400 },
            );
        }

        if (auth.userId !== id) {
            return NextResponse.json(
                { error: "You may only update your own account." },
                { status: 403 },
            );
        }

        let body: UpdateAccountBody;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body." },
                { status: 400 },
            );
        }

        await connectDB();

        // Password is selected by default in your current schema.
        // If you later add select: false, use .select("+password").
        const user = await User.findById(auth.userId);

        if (!user) {
            return NextResponse.json(
                { error: "User not found." },
                { status: 404 },
            );
        }

        const updateData: Record<string, string> = {};

        const name = cleanOptionalString(body.name, 100);
        const bio = cleanOptionalString(body.bio, 1_000);
        const company = cleanOptionalString(body.company, 150);
        const address = cleanOptionalString(body.address, 300);
        const city = cleanOptionalString(body.city, 100);

        if (body.name !== undefined) {
            if (!name) {
                return NextResponse.json(
                    { error: "Name cannot be empty." },
                    { status: 400 },
                );
            }

            updateData.name = name;
        }

        if (bio !== undefined) {
            updateData.bio = bio;
        }

        if (company !== undefined) {
            updateData.company = company;
        }

        if (address !== undefined) {
            updateData.address = address;
        }

        if (city !== undefined) {
            updateData.city = city;
        }

        const requestedEmail =
            typeof body.email === "string"
                ? body.email.toLowerCase().trim()
                : undefined;

        const requestedPassword =
            typeof body.newPassword === "string"
                ? body.newPassword
                : undefined;

        const emailIsChanging =
            requestedEmail !== undefined &&
            requestedEmail !== user.email;

        const passwordIsChanging =
            requestedPassword !== undefined &&
            requestedPassword.length > 0;

        if (emailIsChanging || passwordIsChanging) {
            if (
                typeof body.oldPassword !== "string" ||
                body.oldPassword.length === 0
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Your current password is required for sensitive account changes.",
                    },
                    { status: 400 },
                );
            }

            const passwordMatches = await bcrypt.compare(
                body.oldPassword,
                user.password,
            );

            if (!passwordMatches) {
                return NextResponse.json(
                    { error: "Current password is incorrect." },
                    { status: 401 },
                );
            }
        }

        if (emailIsChanging && requestedEmail) {
            if (!isValidEmail(requestedEmail)) {
                return NextResponse.json(
                    { error: "Enter a valid email address." },
                    { status: 400 },
                );
            }

            const emailTaken = await User.exists({
                email: requestedEmail,
                _id: { $ne: user._id },
            });

            if (emailTaken) {
                return NextResponse.json(
                    { error: "Email address is already in use." },
                    { status: 409 },
                );
            }

            updateData.email = requestedEmail;
        }

        if (passwordIsChanging && requestedPassword) {
            if (requestedPassword.length < 12) {
                return NextResponse.json(
                    {
                        error:
                            "New password must be at least 12 characters long.",
                    },
                    { status: 400 },
                );
            }

            updateData.password = await bcrypt.hash(
                requestedPassword,
                12,
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            auth.userId,
            {
                $set: updateData,
            },
            {
                new: true,
                runValidators: true,
            },
        ).select("-password");

        return NextResponse.json({
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update account error:", error);

        return NextResponse.json(
            { error: "Unable to update account." },
            { status: 500 },
        );
    }
}