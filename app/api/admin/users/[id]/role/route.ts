import mongoose from "mongoose";
import {
    NextResponse,
} from "next/server";
import {
    z,
} from "zod";

import {
    getAuthenticatedAdmin,
} from "@/lib/admin/auth";
import {
    writeAdminAudit,
} from "@/lib/admin/audit";
import {
    USER_ROLES,
} from "@/lib/admin/roles";
import {
    connectDB,
} from "@/lib/mongoose";
import {
    hasTrustedOrigin,
} from "@/lib/security/trusted-origin";
import {
    parseJsonBody,
} from "@/lib/validation/api";

import User from "@/models/User";

const roleSchema =
    z.object({
        role:
            z.enum(
                USER_ROLES,
            ),
    }).strict();

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(
    request: Request,
    context: RouteContext,
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

    if (!admin) {
        return NextResponse.json(
            {
                error:
                    "Unauthorized.",
            },
            {
                status: 401,
            },
        );
    }

    const {
        id,
    } = await context.params;

    if (
        !mongoose.Types
            .ObjectId
            .isValid(id)
    ) {
        return NextResponse.json(
            {
                error:
                    "Invalid user ID.",
            },
            {
                status: 400,
            },
        );
    }

    if (
        admin.userId === id
    ) {
        return NextResponse.json(
            {
                error:
                    "You cannot change your own role.",
            },
            {
                status: 400,
            },
        );
    }

    const parsed =
        await parseJsonBody(
            request,
            roleSchema,
        );

    if (!parsed.success) {
        return parsed.response;
    }

    const nextRole =
        parsed.data.role;

    await connectDB();

    const target =
        await User.findById(id)
            .select(
                "name email role +tokenVersion",
            );

    if (!target) {
        return NextResponse.json(
            {
                error:
                    "User not found.",
            },
            {
                status: 404,
            },
        );
    }

    const touchesSuperAdmin =
        target.role ===
        "SuperAdmin" ||
        nextRole ===
        "SuperAdmin";

    if (
        touchesSuperAdmin &&
        admin.role !==
        "SuperAdmin"
    ) {
        return NextResponse.json(
            {
                error:
                    "Only a SuperAdmin can manage SuperAdmin accounts.",
            },
            {
                status: 403,
            },
        );
    }

    const demotesExistingAdmin =
        target.role === "Admin" &&
        nextRole !== "Admin";

    if (
        demotesExistingAdmin &&
        admin.role !==
        "SuperAdmin"
    ) {
        return NextResponse.json(
            {
                error:
                    "Only a SuperAdmin can demote another administrator.",
            },
            {
                status: 403,
            },
        );
    }

    if (
        target.role ===
        "SuperAdmin" &&
        nextRole !==
        "SuperAdmin"
    ) {
        const superAdminCount =
            await User.countDocuments({
                role:
                    "SuperAdmin",
            });

        if (
            superAdminCount <= 1
        ) {
            return NextResponse.json(
                {
                    error:
                        "The final SuperAdmin cannot be demoted.",
                },
                {
                    status: 409,
                },
            );
        }
    }

    const previousRole =
        target.role;

    target.role =
        nextRole;

    target.tokenVersion =
        (
            target.tokenVersion ??
            0
        ) + 1;

    await target.save();

    await writeAdminAudit({
        request,
        actorUserId:
        admin.userId,
        actorRole:
        admin.role,
        action:
            "user.role.change",
        targetUserId: id,
        metadata: {
            previousRole,
            nextRole,
        },
    });

    return NextResponse.json({
        user: {
            id:
            target._id,
            name:
            target.name,
            email:
            target.email,
            role:
            target.role,
        },
    });
}