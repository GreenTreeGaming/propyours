import bcrypt from "bcryptjs";

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
    verifyEmailOtpSchema,
} from "@/lib/validation/auth";

import EmailOtp from "@/models/EmailOtp";

const MAX_OTP_ATTEMPTS =
    5;

export async function POST(
    request: Request,
) {
    try {
        const parsed =
            await parseJsonBody(
                request,
                verifyEmailOtpSchema,
            );

        if (!parsed.success) {
            return parsed.response;
        }

        const {
            email,
            otp,
        } = parsed.data;

        await enforceRateLimit(
            request,
            {
                namespace:
                    "verify-email-otp-ip",

                windowMs:
                    15 *
                    60 *
                    1_000,

                maximumRequests:
                    20,
            },
        );

        await enforceRateLimit(
            request,
            {
                namespace:
                    "verify-email-otp-email",

                windowMs:
                    15 *
                    60 *
                    1_000,

                maximumRequests:
                    8,

                subject:
                email,
            },
        );

        await connectDB();

        const record =
            await EmailOtp.findOne({
                email,

                expiresAt: {
                    $gt:
                        new Date(),
                },

                verified:
                    false,

                attempts: {
                    $lt:
                    MAX_OTP_ATTEMPTS,
                },
            });

        if (!record) {
            return NextResponse.json(
                {
                    error:
                        "Verification code not found, expired, or locked.",
                },
                {
                    status: 400,
                },
            );
        }

        const isValid =
            await bcrypt.compare(
                otp,
                record.otpHash,
            );

        if (!isValid) {
            const updated =
                await EmailOtp.findOneAndUpdate(
                    {
                        _id:
                        record._id,

                        verified:
                            false,

                        attempts: {
                            $lt:
                            MAX_OTP_ATTEMPTS,
                        },
                    },

                    {
                        $inc: {
                            attempts:
                                1,
                        },
                    },

                    {
                        new: true,
                    },
                );

            const attempts =
                updated?.attempts ??
                MAX_OTP_ATTEMPTS;

            if (
                attempts >=
                MAX_OTP_ATTEMPTS
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Too many incorrect attempts. Request a new email verification code.",
                    },
                    {
                        status: 429,
                    },
                );
            }

            return NextResponse.json(
                {
                    error:
                        "Invalid verification code",

                    attemptsRemaining:
                        MAX_OTP_ATTEMPTS -
                        attempts,
                },
                {
                    status: 400,
                },
            );
        }

        const verified =
            await EmailOtp.findOneAndUpdate(
                {
                    _id:
                    record._id,

                    verified:
                        false,

                    expiresAt: {
                        $gt:
                            new Date(),
                    },
                },

                {
                    $set: {
                        verified:
                            true,

                        verifiedAt:
                            new Date(),
                    },
                },

                {
                    new: true,
                },
            );

        if (!verified) {
            return NextResponse.json(
                {
                    error:
                        "Email could not be verified.",
                },
                {
                    status: 409,
                },
            );
        }

        return NextResponse.json({
            message:
                "Email verified successfully",
        });
    } catch (error) {
        if (
            error instanceof
            RateLimitError
        ) {
            return createRateLimitResponse(
                error,
            );
        }

        console.error(
            "Verify Email OTP Error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to verify email",
            },
            {
                status: 500,
            },
        );
    }
}