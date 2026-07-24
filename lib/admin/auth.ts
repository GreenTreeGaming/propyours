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
        console.error(
            "Admin authentication failed: admin-token cookie is missing.",
        );

        return null;
    }

    try {
        const payload =
            verifyAdminSessionToken(
                token,
            );

        console.log(
            "Admin token verified for:",
            payload.adminId,
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

        if (!user) {
            console.error(
                "Admin authentication failed: user does not exist.",
            );

            return null;
        }

        if (
            !isAdminRole(
                user.role,
            )
        ) {
            console.error(
                "Admin authentication failed: account role is not administrative:",
                user.role,
            );

            return null;
        }

        const currentTokenVersion =
            user.tokenVersion ?? 0;

        if (
            currentTokenVersion !==
            payload.tokenVersion
        ) {
            console.error(
                "Admin authentication failed: token version mismatch.",
                {
                    stored:
                    currentTokenVersion,
                    token:
                    payload.tokenVersion,
                },
            );

            return null;
        }

        return {
            userId:
                user._id.toString(),
            name:
            user.name,
            email:
            user.email,
            role:
            user.role,
        };
    } catch (error) {
        console.error(
            "Admin session validation failed:",
            error,
        );

        return null;
    }
}