import {
    cookies,
} from "next/headers";

import {
    connectDB,
} from "@/lib/mongoose";
import {
    verifyAdminSessionToken,
} from "@/lib/admin/session";
import {
    type AdminRole,
    isAdminRole,
} from "@/lib/admin/roles";

import User from "@/models/User";

export type AuthenticatedAdmin = {
    userId: string;
    name: string;
    email: string;
    role: AdminRole;
};

export async function getAuthenticatedAdmin():
    Promise<
        AuthenticatedAdmin | null
    > {
    const cookieStore =
        await cookies();

    const token =
        cookieStore.get(
            "admin-token",
        )?.value;

    if (!token) {
        return null;
    }

    try {
        const payload =
            verifyAdminSessionToken(
                token,
            );

        await connectDB();

        const user =
            await User.findById(
                payload.adminId,
            )
                .select(
                    "name email role +tokenVersion",
                )
                .lean();

        if (
            !user ||
            !isAdminRole(user.role)
        ) {
            return null;
        }

        if (
            (user.tokenVersion ?? 0) !==
            payload.tokenVersion
        ) {
            return null;
        }

        return {
            userId:
                user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        };
    } catch {
        return null;
    }
}