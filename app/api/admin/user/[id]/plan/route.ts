import { NextResponse } from "next/server";
import { applyPlanChange } from "@/lib/apply-plan-change";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";
import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";
import type { PlanTier, PlanStatus, PlanAudience } from "@/lib/plans";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        await connectDB();

        const adminUser = await User.findById(auth.userId);

        if (!adminUser || adminUser.role !== "Admin") {
            return NextResponse.json(
                { error: "Admin access required." },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await req.json();

        const tier = body.tier as PlanTier;
        const status = body.status as PlanStatus;
        const audience = body.audience as PlanAudience | undefined;

        if (!tier || !status) {
            return NextResponse.json(
                { error: "tier and status are required." },
                { status: 400 }
            );
        }

        const result = await applyPlanChange({
            userId: id,
            tier,
            status,
            audience,
            source: "manual",
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        });

        return NextResponse.json({
            success: true,
            user: result.user,
            keptActive: result.keptActive,
            deactivated: result.deactivated,
            boostsRemaining: result.boostsRemaining,
        });
    } catch (error) {
        console.error("Failed to apply plan change:", error);

        return NextResponse.json(
            { error: "Failed to apply plan change." },
            { status: 500 }
        );
    }
}