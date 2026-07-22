import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import {
    NextResponse,
} from "next/server";

import {
    connectDB,
} from "@/lib/mongoose";
import {
    createRateLimitResponse,
    enforceRateLimit,
    RateLimitError,
} from "@/lib/rate-limit";
import {
    parseJsonBody,
} from "@/lib/validation/api";
import {
    signupSchema,
} from "@/lib/validation/auth";

import PhoneOtp from "@/models/PhoneOtp";
import User from "@/models/User";

export async function POST(
    request: Request,
) {
    try {
        const parsed =
            await parseJsonBody(
                request,
                signupSchema,
            );

        if (!parsed.success) {
            return parsed.response;
        }

        const {
            name,
            email,
            phone,
            password,
        } = parsed.data;

        await enforceRateLimit(
            request,
            {
                namespace:
                    "auth-signup-ip",
                windowMs:
                    60 * 60 * 1_000,
                maximumRequests: 8,
            },
        );

        await enforceRateLimit(
            request,
            {
                namespace:
                    "auth-signup-email",
                windowMs:
                    60 * 60 * 1_000,
                maximumRequests: 3,
                subject: email,
            },
        );

        await connectDB();

        const hashedPassword =
            await bcrypt.hash(
                password,
                12,
            );

        const session =
            await mongoose.startSession();

        try {
            await session.withTransaction(
                async () => {
                    const existingUser =
                        await User.findOne({
                            $or: [
                                {
                                    email,
                                },
                                {
                                    phone,
                                },
                            ],
                        })
                            .session(
                                session,
                            )
                            .lean();

                    if (existingUser) {
                        throw new SignupConflictError();
                    }

                    const consumedOtp =
                        await PhoneOtp.findOneAndDelete(
                            {
                                phone,
                                verified: true,
                                expiresAt: {
                                    $gt:
                                        new Date(),
                                },
                            },
                            {
                                session,
                            },
                        );

                    if (!consumedOtp) {
                        throw new OtpRequiredError();
                    }

                    await User.create(
                        [
                            {
                                name,
                                email,
                                phone,
                                password:
                                hashedPassword,
                                role: "User",
                                tokenVersion:
                                    0,
                            },
                        ],
                        {
                            session,
                        },
                    );
                },
            );
        } finally {
            await session.endSession();
        }

        return NextResponse.json(
            {
                message:
                    "Account created successfully",
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        if (
            error instanceof
            RateLimitError
        ) {
            return createRateLimitResponse(
                error,
            );
        }

        if (
            error instanceof
            SignupConflictError
        ) {
            return NextResponse.json(
                {
                    error:
                        "An account already exists with that email or phone number.",
                },
                {
                    status: 409,
                },
            );
        }

        if (
            error instanceof
            OtpRequiredError
        ) {
            return NextResponse.json(
                {
                    error:
                        "Verify your phone number before creating an account.",
                },
                {
                    status: 403,
                },
            );
        }

        if (
            isMongoDuplicateError(
                error,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "An account already exists with that email or phone number.",
                },
                {
                    status: 409,
                },
            );
        }

        console.error(
            "Signup Error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to create account",
            },
            {
                status: 500,
            },
        );
    }
}

class SignupConflictError
    extends Error {}

class OtpRequiredError
    extends Error {}

function isMongoDuplicateError(
    error: unknown,
): error is {
    code: number;
} {
    return (
        typeof error ===
        "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
    );
}