import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { getAuthenticatedUser, isAuthError } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import {
    deleteUploadThingFilesByUrls,
} from "@/lib/uploadthing-storage";

import BoostTransaction from "@/models/BoostTransaction";
import Lead from "@/models/Lead";
import PhoneOtp from "@/models/PhoneOtp";
import Property from "@/models/Property";
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

type PropertyForDeletion = {
    _id: mongoose.Types.ObjectId;
    images?: unknown;
    brochure?: {
        url?: unknown;
    };
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

export async function GET(
    _request: Request,
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
                {
                    error:
                        "You may only view your own account.",
                },
                { status: 403 },
            );
        }

        await connectDB();

        const user = await User.findById(id)
            .select("-password")
            .lean();

        if (!user) {
            return NextResponse.json(
                { error: "User not found." },
                { status: 404 },
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Fetch account error:", error);

        return NextResponse.json(
            { error: "Unable to fetch account." },
            { status: 500 },
        );
    }
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

        const rawBody = body as Record<string, unknown>;

        const forbiddenFields = [
            "role",
            "plan",
            "favorites",
            "phone",
            "tokenVersion",
            "createdAt",
            "updatedAt",
        ];

        const forbiddenField = forbiddenFields.find(
            (field) => field in rawBody,
        );

        if (forbiddenField) {
            return NextResponse.json(
                {
                    error: `${forbiddenField} cannot be changed through this endpoint.`,
                },
                { status: 400 },
            );
        }

        await connectDB();

        const user = await User.findById(
            auth.userId,
        ).select(
            "+password +tokenVersion",
        );

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

        const currentEmail =
            typeof user.email === "string"
                ? user.email.toLowerCase().trim()
                : "";

        const emailIsChanging =
            requestedEmail !== undefined &&
            requestedEmail !== currentEmail;

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

        const updateOperations: {
            $set: Record<
                string,
                string
            >;
            $inc?: {
                tokenVersion: number;
            };
        } = {
            $set: updateData,
        };

        if (passwordIsChanging) {
            updateOperations.$inc = {
                tokenVersion: 1,
            };
        }

        const updatedUser =
            await User.findByIdAndUpdate(
                auth.userId,
                updateOperations,
                {
                    new: true,
                    runValidators: true,
                },
            ).select(
                "-password -tokenVersion",
            );

        const response =
            NextResponse.json({
                success: true,
                user: updatedUser,

                ...(passwordIsChanging
                    ? {
                        message:
                            "Password updated successfully. Please sign in again.",
                        requiresLogin:
                            true,
                    }
                    : {}),
            });

        if (passwordIsChanging) {
            response.cookies.set({
                name:
                    "auth-token",
                value: "",
                path: "/",
                maxAge: 0,
                httpOnly: true,
                secure:
                    process.env
                        .NODE_ENV ===
                    "production",
                sameSite: "lax",
            });
        }

        return response;
    } catch (error) {
        console.error("Update account error:", error);

        return NextResponse.json(
            { error: "Unable to update account." },
            { status: 500 },
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    let session: mongoose.ClientSession | null = null;

    try {
        // 1. Require authentication.
        const auth = await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        // 2. Validate the target user ID.
        const { id } = await params;

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { error: "Invalid user ID." },
                { status: 400 },
            );
        }

        // 3. Users may only delete their own account.
        if (auth.userId !== id) {
            return NextResponse.json(
                {
                    error:
                        "You may only delete your own account.",
                },
                { status: 403 },
            );
        }

        // 4. Read and validate the request body.
        let body: {
            currentPassword?: unknown;
        };

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body." },
                { status: 400 },
            );
        }

        if (
            typeof body.currentPassword !== "string" ||
            body.currentPassword.length === 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "Your current password is required to delete your account.",
                },
                { status: 400 },
            );
        }

        // 5. Connect before starting the MongoDB session.
        await connectDB();

        const user =
            await User.findById(
                auth.userId,
            ).select(
                "+password",
            );

        if (!user) {
            return NextResponse.json(
                { error: "User not found." },
                { status: 404 },
            );
        }

        // 6. Confirm the current password.
        const passwordMatches = await bcrypt.compare(
            body.currentPassword,
            user.password,
        );

        if (!passwordMatches) {
            return NextResponse.json(
                {
                    error:
                        "Current password is incorrect.",
                },
                { status: 401 },
            );
        }

        // 7. Collect the user's properties and uploaded-media URLs.
        const properties =
            (await Property.find({
                userId: user._id,
            })
                .select("_id images brochure.url")
                .lean()) as PropertyForDeletion[];

        const propertyIds = properties.map(
            (property) => property._id,
        );

        const mediaUrls: string[] = properties.flatMap(
            (property) => {
                const urls: string[] = [];

                if (Array.isArray(property.images)) {
                    const imageUrls = property.images.filter(
                        (url: unknown): url is string =>
                            typeof url === "string" &&
                            url.trim().length > 0,
                    );

                    urls.push(...imageUrls);
                }

                const brochureUrl =
                    property.brochure?.url;

                if (
                    typeof brochureUrl === "string" &&
                    brochureUrl.trim().length > 0
                ) {
                    urls.push(brochureUrl);
                }

                return urls;
            },
        );

        // 8. Start the transaction only after connecting.
        session = await mongoose.startSession();
        const activeSession = session;

        await activeSession.withTransaction(
            async () => {
                // Delete leads where the user was either
                // the property owner or prospective buyer.
                await Lead.deleteMany({
                    $or: [
                        { ownerId: user._id },
                        { viewerId: user._id },
                    ],
                }).session(activeSession);

                // Delete boost records belonging to the user
                // or referring to one of their properties.
                await BoostTransaction.deleteMany({
                    $or: [
                        { userId: user._id },
                        {
                            propertyId: {
                                $in: propertyIds,
                            },
                        },
                    ],
                }).session(activeSession);

                // Remove deleted property IDs from every
                // other user's favorites.
                if (propertyIds.length > 0) {
                    await User.updateMany(
                        {
                            favorites: {
                                $in: propertyIds,
                            },
                        },
                        {
                            $pull: {
                                favorites: {
                                    $in: propertyIds,
                                },
                            },
                        },
                        {
                            session: activeSession,
                        },
                    );
                }

                // Remove any remaining OTP records associated
                // with the account's phone number.
                if (
                    typeof user.phone === "string" &&
                    user.phone.length > 0
                ) {
                    await PhoneOtp.deleteMany({
                        phone: user.phone,
                    }).session(activeSession);
                }

                // Delete the user's properties.
                await Property.deleteMany({
                    userId: user._id,
                }).session(activeSession);

                // Delete the account last.
                const deleteResult =
                    await User.deleteOne({
                        _id: user._id,
                    }).session(activeSession);

                if (deleteResult.deletedCount !== 1) {
                    throw new Error(
                        "Account deletion did not complete.",
                    );
                }
            },
        );

        // 9. External file storage cannot participate in the
        // MongoDB transaction, so clean it up after commit.
        let mediaCleanupWarning:
            | string
            | undefined;

        if (mediaUrls.length > 0) {
            try {
                await deleteUploadThingFilesByUrls(
                    mediaUrls,
                );
            } catch (cleanupError) {
                console.error(
                    "Account deleted, but uploaded-media cleanup failed:",
                    cleanupError,
                );

                mediaCleanupWarning =
                    "The account was deleted, but some uploaded files may require manual cleanup.";
            }
        }

        // 10. Clear the user's authentication cookie.
        const response = NextResponse.json({
            success: true,
            message:
                "Account deleted successfully.",
            ...(mediaCleanupWarning
                ? {
                    warning:
                    mediaCleanupWarning,
                }
                : {}),
        });

        response.cookies.set({
            name: "auth-token",
            value: "",
            path: "/",
            maxAge: 0,
            httpOnly: true,
            secure:
                process.env.NODE_ENV ===
                "production",
            sameSite: "lax",
        });

        return response;
    } catch (error) {
        console.error(
            "Delete account error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to delete account.",
            },
            { status: 500 },
        );
    } finally {
        if (session) {
            await session.endSession();
        }
    }
}