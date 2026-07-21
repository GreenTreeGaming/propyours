import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import {
    getAuthenticatedUser,
    isAuthError,
} from "@/lib/auth";
import {
    refreshBoostAllowanceIfNeeded,
} from "@/lib/refresh-boost-allowance";
import { getPlanLimits } from "@/lib/plans";

export async function GET() {
    const auth =
        await getAuthenticatedUser();

    if (isAuthError(auth)) {
        return auth;
    }

    await connectDB();

    const user =
        await User.findById(auth.userId);

    if (!user) {
        return NextResponse.json(
            {
                error: "User not found",
            },
            {
                status: 404,
            }
        );
    }

    await refreshBoostAllowanceIfNeeded(
        user
    );

    const limits = getPlanLimits(user);

    return NextResponse.json({
        tier: limits.tier,
        status: user.plan?.status,
        boostsRemaining:
            user.plan?.boostsRemaining ?? 0,
        boostsPerMonth:
        limits.promoteBoostsPerMonth,
        boostsResetAt:
            user.plan?.boostsResetAt ??
            null,
    });
}