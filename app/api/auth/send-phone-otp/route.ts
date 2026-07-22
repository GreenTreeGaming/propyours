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
    sendSms,
} from "@/lib/send-sms";
import {
    parseJsonBody,
} from "@/lib/validation/api";
import {
    sendPhoneOtpSchema,
} from "@/lib/validation/auth";

import PhoneOtp from "@/models/PhoneOtp";
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
                sendPhoneOtpSchema,
            );

        if (!parsed.success) {
            return parsed.response;
        }

        const {
            phone,
            email,
        } = parsed.data;

        await enforceRateLimit(
            request,
            {
                namespace:
                    "send-phone-otp-ip",
                windowMs:
                    60 * 60 * 1_000,
                maximumRequests: 10,
            },
        );

        await enforceRateLimit(
            request,
            {
                namespace:
                    "send-phone-otp-phone",
                windowMs:
                    15 * 60 * 1_000,
                maximumRequests: 3,
                subject: phone,
            },
        );

        await connectDB();

        if (email) {
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
        }

        const existingPhoneUser =
            await User.exists({
                phone,
            });

        if (existingPhoneUser) {
            return NextResponse.json(
                {
                    error:
                        "Phone number is already registered",
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

        await PhoneOtp.findOneAndUpdate(
            {
                phone,
            },
            {
                $set: {
                    otpHash,
                    attempts: 0,
                    verified: false,
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

        await sendSms(
            phone,
            `Your PROPYOURS verification code is ${otp}. It expires in 10 minutes.`,
        );

        return NextResponse.json({
            message:
                "OTP sent successfully",
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
            "Send Phone OTP Error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to send OTP",
            },
            {
                status: 500,
            },
        );
    }
}