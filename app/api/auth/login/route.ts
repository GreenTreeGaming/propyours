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
    createSessionToken,
} from "@/lib/session";
import {
    parseJsonBody,
} from "@/lib/validation/api";
import {
    loginSchema,
} from "@/lib/validation/auth";

import User from "@/models/User";

export async function POST(
    request: Request,
) {
    try {
        const parsed =
            await parseJsonBody(
                request,
                loginSchema,
            );

        if (!parsed.success) {
            return parsed.response;
        }

        const {
            email,
            password,
        } = parsed.data;

        await enforceRateLimit(
            request,
            {
                namespace:
                    "auth-login-ip",
                windowMs:
                    15 * 60 * 1_000,
                maximumRequests: 20,
            },
        );

        await enforceRateLimit(
            request,
            {
                namespace:
                    "auth-login-account",
                windowMs:
                    15 * 60 * 1_000,
                maximumRequests: 8,
                subject: email,
            },
        );

        await connectDB();

        const user =
            await User.findOne({
                email,
            }).select(
                "+password +tokenVersion",
            );

        const invalidCredentials =
            () =>
                NextResponse.json(
                    {
                        error:
                            "Invalid credentials",
                    },
                    {
                        status: 401,
                    },
                );

        if (!user) {
            // Perform a dummy comparison so missing accounts
            // and incorrect passwords have more similar timing.
            await bcrypt.compare(
                password,
                "$2b$12$Q9vJT2F5TScM8kKlZ1j5qeZNU88tONAFNlgN5rqOgrqP0vPr7PKXu",
            );

            return invalidCredentials();
        }

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password,
            );

        if (!passwordMatches) {
            return invalidCredentials();
        }

        const token =
            createSessionToken({
                userId:
                    user._id.toString(),

                tokenVersion:
                    user.tokenVersion ??
                    0,
            });

        const response =
            NextResponse.json({
                message:
                    "Login successful",

                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone:
                        user.phone ||
                        "",
                    favorites:
                        user.favorites ||
                        [],
                    plan: user.plan,
                },
            });

        response.cookies.set({
            name:
                "auth-token",
            value: token,
            httpOnly: true,
            secure:
                process.env
                    .NODE_ENV ===
                "production",
            sameSite: "lax",
            path: "/",
            maxAge:
                60 *
                60 *
                24 *
                7,
            priority: "high",
        });

        return response;
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
            "Login failed:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Login failed",
            },
            {
                status: 500,
            },
        );
    }
}