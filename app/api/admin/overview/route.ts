import {
    NextResponse,
} from "next/server";

import {
    getAuthenticatedAdmin,
} from "@/lib/admin/auth";
import {
    ADMIN_ROLES,
} from "@/lib/admin/roles";
import {
    connectDB,
} from "@/lib/mongoose";

import User from "@/models/User";
import Property from "@/models/Property";
import Lead from "@/models/Lead";

export async function GET() {
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

    await connectDB();

    const [
        userCount,
        adminCount,
        propertyCount,
        activePropertyCount,
        leadCount,
    ] = await Promise.all([
        User.countDocuments(),

        User.countDocuments({
            role: {
                $in: [
                    ...ADMIN_ROLES,
                ],
            },
        }),

        Property.countDocuments(),

        Property.countDocuments({
            status: "active",
        }),

        Lead.countDocuments(),
    ]);

    return NextResponse.json(
        {
            admin,
            counts: {
                users:
                userCount,
                admins:
                adminCount,
                properties:
                propertyCount,
                activeProperties:
                activePropertyCount,
                leads:
                leadCount,
            },
        },
        {
            headers: {
                "Cache-Control":
                    "no-store",
            },
        },
    );
}