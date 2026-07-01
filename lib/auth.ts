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

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as JwtPayload;

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