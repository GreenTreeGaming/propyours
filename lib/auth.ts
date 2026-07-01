import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export type AuthUser = {
    userId: string;
};

type JwtPayload = {
    userId: string;
};

export async function getAuthenticatedUser(): Promise<AuthUser | NextResponse> {
    const cookieStore = await cookies();

    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error("JWT_SECRET is not configured");

        return NextResponse.json(
            { error: "Server authentication is not configured" },
            { status: 500 }
        );
    }

    try {
        const payload = jwt.verify(token, secret) as JwtPayload;

        if (!payload.userId) {
            return NextResponse.json(
                { error: "Invalid session" },
                { status: 401 }
            );
        }

        return {
            userId: payload.userId,
        };
    } catch {
        return NextResponse.json(
            { error: "Invalid or expired session" },
            { status: 401 }
        );
    }
}

export function isAuthError(
    value: AuthUser | NextResponse
): value is NextResponse {
    return value instanceof NextResponse;
}