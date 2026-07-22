import {
    cookies,
} from "next/headers";
import {
    NextResponse,
} from "next/server";

import {
    connectDB,
} from "@/lib/mongoose";
import {
    verifySessionToken,
} from "@/lib/session";

import User from "@/models/User";

export type AuthUser = {
    userId: string;
};

export async function getAuthenticatedUser():
    Promise<
        AuthUser |
        NextResponse
    > {
    const cookieStore =
        await cookies();

    const token =
        cookieStore.get(
            "auth-token",
        )?.value;

    if (!token) {
        return NextResponse.json(
            {
                error:
                    "Unauthorized",
            },
            {
                status: 401,
            },
        );
    }

    try {
        const payload =
            verifySessionToken(
                token,
            );

        await connectDB();

        const user =
            await User.findById(
                payload.userId,
            )
                .select(
                    "+tokenVersion",
                )
                .lean();

        if (!user) {
            return NextResponse.json(
                {
                    error:
                        "Invalid session",
                },
                {
                    status: 401,
                },
            );
        }

        const currentTokenVersion =
            user.tokenVersion ?? 0;

        if (
            currentTokenVersion !==
            payload.tokenVersion
        ) {
            return NextResponse.json(
                {
                    error:
                        "Session has been revoked.",
                },
                {
                    status: 401,
                },
            );
        }

        return {
            userId:
                user._id.toString(),
        };
    } catch {
        return NextResponse.json(
            {
                error:
                    "Invalid or expired session",
            },
            {
                status: 401,
            },
        );
    }
}

export function isAuthError(
    value:
        | AuthUser
        | NextResponse,
): value is NextResponse {
    return (
        value instanceof
        NextResponse
    );
}