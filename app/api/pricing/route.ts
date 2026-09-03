import {
    NextResponse,
} from "next/server";

import {
    getOptionalAuthenticatedUser,
} from "@/lib/auth";

import {
    PLAN_CATALOG,
    type PlanAudience,
} from "@/lib/plan-catalog";

import {
    connectDB,
} from "@/lib/mongoose";

import User from "@/models/User";

export async function GET() {
    try {
        const viewer =
            await getOptionalAuthenticatedUser();

        const canViewPrices =
            viewer !== null;

        let accountAudience:
            PlanAudience | null = null;

        if (viewer) {
            await connectDB();

            const user =
                await User.findById(
                    viewer.userId,
                )
                    .select("role")
                    .lean();

            if (user) {
                accountAudience =
                    user.role === "Builder"
                        ? "builder"
                        : user.role === "Agent"
                            ? "agent"
                            : "owner";
            }
        }

        const plans =
            Object.values(
                PLAN_CATALOG,
            ).map((plan) => {
                if (canViewPrices) {
                    return {
                        ...plan,
                        priceLocked: false,
                    };
                }

                return {
                    ...plan,

                    presentation: {
                        ...plan.presentation,

                        priceInPaise:
                            null,

                        originalPriceInPaise:
                            null,
                    },

                    priceLocked:
                        true,
                };
            });

        return NextResponse.json({
            plans,

            pricesLocked:
                !canViewPrices,

            accountAudience,
        });
    } catch (error) {
        console.error(
            "Failed to load pricing:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Failed to load pricing.",
            },
            {
                status: 500,
            },
        );
    }
}