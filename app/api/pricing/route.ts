import {
    NextResponse,
} from "next/server";

import {
    getOptionalAuthenticatedUser,
} from "@/lib/auth";

import {
    PLAN_CATALOG,
} from "@/lib/plan-catalog";

export async function GET() {
    try {
        const viewer =
            await getOptionalAuthenticatedUser();

        const canViewPrices =
            viewer !== null;

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