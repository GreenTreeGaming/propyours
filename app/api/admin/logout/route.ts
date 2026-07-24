import {
    NextResponse,
} from "next/server";

import {
    getAuthenticatedAdmin,
} from "@/lib/admin/auth";
import {
    writeAdminAudit,
} from "@/lib/admin/audit";
import {
    hasTrustedOrigin,
} from "@/lib/security/trusted-origin";

export async function POST(
    request: Request,
) {
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

    const admin =
        await getAuthenticatedAdmin();

    if (admin) {
        await writeAdminAudit({
            request,
            actorUserId:
            admin.userId,
            actorRole:
            admin.role,
            action:
                "admin.logout",
        });
    }

    const response =
        NextResponse.json({
            message:
                "Logged out.",
        });

    response.cookies.set({
        name:
            "admin-token",
        value: "",
        httpOnly: true,
        secure:
            process.env
                .NODE_ENV ===
            "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });

    return response;
}