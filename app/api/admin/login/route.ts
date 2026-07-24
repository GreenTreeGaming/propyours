import bcrypt from "bcryptjs";
import {
    NextResponse,
} from "next/server";
import {
    z,
} from "zod";

import {
    connectDB,
} from "@/lib/mongoose";
import {
    createAdminSessionToken,
} from "@/lib/admin/session";
import {
    isAdminRole,
} from "@/lib/admin/roles";
import {
    writeAdminAudit,
} from "@/lib/admin/audit";
import {
    hasTrustedOrigin,
} from "@/lib/security/trusted-origin";
import {
    createRateLimitResponse,
    enforceRateLimit,
    RateLimitError,
} from "@/lib/rate-limit";
import {
    parseJsonBody,
} from "@/lib/validation/api";

import User from "@/models/User";

const adminLoginSchema =
    z.object({
        email: z
            .string()
            .trim()
            .toLowerCase()
            .email()
            .max(160),

        password: z
            .string()
            .min(8)
            .max(200),
    }).strict();

export async function POST(
    request: Request,
) {
    try {
        if (
            !hasTrustedOrigin(
                request,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid request origin.",
                },
                {
                    status: 403,
                },
            );
        }

        const parsed =
            await parseJsonBody(
                request,
                adminLoginSchema,
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
                    "admin-login-ip",
                windowMs:
                    15 * 60 * 1_000,
                maximumRequests: 10,
            },
        );

        await enforceRateLimit(
            request,
            {
                namespace:
                    "admin-login-account",
                windowMs:
                    15 * 60 * 1_000,
                maximumRequests: 5,
                subject: email,
            },
        );

        await connectDB();

        const user =
            await User.findOne({
                email,
            }).select(
                "name email role +password +tokenVersion",
            );

        const invalidCredentials =
            () =>
                NextResponse.json(
                    {
                        error:
                            "Invalid credentials.",
                    },
                    {
                        status: 401,
                    },
                );

        if (!user) {
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

        if (
            !passwordMatches ||
            !isAdminRole(user.role)
        ) {
            return invalidCredentials();
        }

        const token =
            createAdminSessionToken({
                adminId:
                    user._id.toString(),
                tokenVersion:
                    user.tokenVersion ??
                    0,
            });

        const response =
            NextResponse.json(
                {
                    admin: {
                        id:
                        user._id,
                        name:
                        user.name,
                        email:
                        user.email,
                        role:
                        user.role,
                    },
                },
                {
                    headers: {
                        "Cache-Control":
                            "no-store",
                    },
                },
            );

        response.cookies.set({
            name:
                "admin-token",
            value: token,
            httpOnly: true,
            secure:
                process.env
                    .NODE_ENV ===
                "production",
            sameSite: "strict",
            path: "/",
            maxAge: 30 * 60,
            priority: "high",
        });

        await writeAdminAudit({
            request,
            actorUserId:
                user._id.toString(),
            actorRole:
            user.role,
            action:
                "admin.login",
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
            "Admin login failed:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Admin login failed.",
            },
            {
                status: 500,
            },
        );
    }
}