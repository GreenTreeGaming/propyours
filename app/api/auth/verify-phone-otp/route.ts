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
    verifyPhoneOtpSchema,
} from "@/lib/validation/auth";

import PhoneOtp from "@/models/PhoneOtp";

const MAX_OTP_ATTEMPTS = 5;

export async function POST(
    request: Request,
) {
    try {
        const parsed =
            await parseJsonBody(
                request,
                verifyPhoneOtpSchema,
            );

        if (!parsed.success) {
            return parsed.response;
        }

        const {
            phone,
            otp,
        } = parsed.data;

        await enforceRateLimit(
            request,
            {
                namespace:
                    "verify-phone-otp-ip",
                windowMs:
                    15 * 60 * 1_000,
                maximumRequests: 20,
            },
        );

        await enforceRateLimit(
            request,
            {
                namespace:
                    "verify-phone-otp-phone",
                windowMs:
                    15 * 60 * 1_000,
                maximumRequests: 8,
                subject: phone,
            },
        );

        await connectDB();

        const record =
            await PhoneOtp.findOne({
                phone,
                expiresAt: {
                    $gt: new Date(),
                },
                verified: false,
                attempts: {
                    $lt:
                    MAX_OTP_ATTEMPTS,
                },
            });

        if (!record) {
            return NextResponse.json(
                {
                    error:
                        "OTP not found, expired, or locked.",
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
                await PhoneOtp.findOneAndUpdate(
                    {
                        _id:
                        record._id,
                        verified: false,
                        attempts: {
                            $lt:
                            MAX_OTP_ATTEMPTS,
                        },
                    },
                    {
                        $inc: {
                            attempts: 1,
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
                            "Too many incorrect attempts. Request a new OTP.",
                    },
                    {
                        status: 429,
                    },
                );
            }

            return NextResponse.json(
                {
                    error:
                        "Invalid OTP",

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
            await PhoneOtp.findOneAndUpdate(
                {
                    _id: record._id,
                    verified: false,
                    expiresAt: {
                        $gt: new Date(),
                    },
                },
                {
                    $set: {
                        verified: true,
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
                        "OTP could not be verified.",
                },
                {
                    status: 409,
                },
            );
        }

        return NextResponse.json({
            message:
                "Phone verified successfully",
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
            "Verify Phone OTP Error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to verify OTP",
            },
            {
                status: 500,
            },
        );
    }
}