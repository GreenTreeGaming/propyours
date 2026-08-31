import {
    randomInt,
} from "node:crypto";

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
    sendEmailOtp,
} from "@/lib/send-email";

import {
    parseJsonBody,
} from "@/lib/validation/api";

import {
    sendEmailOtpSchema,
} from "@/lib/validation/auth";

import EmailOtp from "@/models/EmailOtp";
import User from "@/models/User";

function generateOtp(): string {
    if (
        process.env.NODE_ENV !==
        "production"
    ) {
        return "123456";
    }

    return randomInt(
        100_000,
        1_000_000,
    ).toString();
}

export async function POST(
    request: Request,
) {
    try {
        const parsed =
            await parseJsonBody(
                request,
                sendEmailOtpSchema,
            );

        if (!parsed.success) {
            return parsed.response;
        }

        const {
            email,
        } = parsed.data;

        await enforceRateLimit(
            request,
            {
                namespace:
                    "send-email-otp-ip",

                windowMs:
                    60 *
                    60 *
                    1_000,

                maximumRequests:
                    10,
            },
        );

        await enforceRateLimit(
            request,
            {
                namespace:
                    "send-email-otp-email",

                windowMs:
                    15 *
                    60 *
                    1_000,

                maximumRequests:
                    3,

                subject:
                email,
            },
        );

        await connectDB();

        const existingUser =
            await User.exists({
                email,
            });

        if (existingUser) {
            return NextResponse.json(
                {
                    error:
                        "Account already exists",
                },
                {
                    status: 409,
                },
            );
        }

        const otp =
            generateOtp();

        const otpHash =
            await bcrypt.hash(
                otp,
                12,
            );

        await EmailOtp.findOneAndUpdate(
            {
                email,
            },

            {
                $set: {
                    otpHash,

                    attempts: 0,

                    verified:
                        false,

                    verifiedAt:
                        null,

                    expiresAt:
                        new Date(
                            Date.now() +
                            10 *
                            60 *
                            1_000,
                        ),
                },
            },

            {
                upsert: true,

                new: true,

                setDefaultsOnInsert:
                    true,
            },
        );

        try {
            await sendEmailOtp({
                email,
                otp,
            });
        } catch (error) {
            await EmailOtp.deleteOne({
                email,
            });

            throw error;
        }

        return NextResponse.json({
            message:
                "Email verification code sent successfully",
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
            "Send Email OTP Error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to send email verification code",
            },
            {
                status: 500,
            },
        );
    }
}