import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getAuthenticatedUser,
    isAuthError,
} from "@/lib/auth";

import {
    PLAN_CATALOG,
    isPlanTier,
    type PlanTier,
} from "@/lib/plan-catalog";

import {
    connectDB,
} from "@/lib/mongoose";

import {
    razorpay,
} from "@/lib/razorpay";

import User from "@/models/User";
import RazorpayOrder from "@/models/RazorpayOrder";

type PaidPlanTier =
    Exclude<PlanTier, "silver">;

const GST_RATE = 0.18;

function isPaidPlanTier(
    value: unknown,
): value is PaidPlanTier {
    return (
        isPlanTier(value) &&
        value !== "silver"
    );
}

export async function POST(
    request: NextRequest,
) {
    try {
        const auth =
            await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        const body: unknown =
            await request.json();

        if (
            !body ||
            typeof body !== "object" ||
            !("plan" in body)
        ) {
            return NextResponse.json(
                {
                    error:
                        "A plan is required.",
                },
                {
                    status: 400,
                },
            );
        }

        const requestedPlan =
            (
                body as {
                    plan?: unknown;
                }
            ).plan;

        if (
            !isPaidPlanTier(
                requestedPlan,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid paid plan.",
                },
                {
                    status: 400,
                },
            );
        }

        const plan =
            PLAN_CATALOG[
                requestedPlan
                ];

        if (
            plan.presentation
                .billingType !==
            "one-time"
        ) {
            return NextResponse.json(
                {
                    error:
                        "This plan is not available as a one-time purchase.",
                },
                {
                    status: 400,
                },
            );
        }

        await connectDB();

        const user =
            await User.findById(
                auth.userId,
            ).select(
                "name email phone role plan",
            );

        if (!user) {
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

        /*
         * Prevent someone from buying a plan
         * for the wrong account type.
         */
        const expectedAudience =
            user.role === "Builder"
                ? "builder"
                : user.role ===
                "Agent"
                    ? "agent"
                    : "owner";

        if (
            plan.audience !==
            expectedAudience
        ) {
            return NextResponse.json(
                {
                    error:
                        "This plan is not available for your account type.",
                },
                {
                    status: 403,
                },
            );
        }

        /*
         * Prices always come from the
         * server-side catalog.
         */
        const subtotalInPaise =
            plan.presentation
                .priceInPaise;

        const gstInPaise =
            Math.round(
                subtotalInPaise *
                GST_RATE,
            );

        const totalInPaise =
            subtotalInPaise +
            gstInPaise;

        if (
            subtotalInPaise <= 0 ||
            totalInPaise <= 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid plan price.",
                },
                {
                    status: 400,
                },
            );
        }

        const receipt =
            `py_${auth.userId}_${Date.now()}`
                .slice(0, 40);

        const order =
            await razorpay.orders.create(
                {
                    amount:
                    totalInPaise,

                    currency:
                        "INR",

                    receipt,

                    notes: {
                        userId:
                        auth.userId,

                        planTier:
                        requestedPlan,

                        subtotalInPaise:
                            String(
                                subtotalInPaise,
                            ),

                        gstInPaise:
                            String(
                                gstInPaise,
                            ),
                    },
                },
            );

        await RazorpayOrder.create({
            userId:
            auth.userId,

            planTier:
            requestedPlan,

            razorpayOrderId:
            order.id,

            subtotalInPaise,

            gstInPaise,

            totalInPaise,

            currency:
                order.currency ??
                "INR",

            status:
                "created",
        });

        return NextResponse.json({
            orderId:
            order.id,

            keyId:
            process.env
                .NEXT_PUBLIC_RAZORPAY_KEY_ID,

            amount:
            totalInPaise,

            currency:
                "INR",

            plan: {
                tier:
                requestedPlan,

                name:
                plan.presentation
                    .displayName,

                subtotal:
                subtotalInPaise,

                gst:
                gstInPaise,

                total:
                totalInPaise,
            },

            customer: {
                name:
                    user.name ??
                    "",

                email:
                    user.email ??
                    "",

                contact:
                    user.phone ??
                    "",
            },
        });
    } catch (error) {
        console.error(
            "Unable to create Razorpay order:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    process.env
                        .NODE_ENV ===
                    "development"
                        ? error instanceof
                        Error
                            ? error.message
                            : "Unknown Razorpay error"
                        : "Unable to start checkout. Please try again.",
            },
            {
                status: 500,
            },
        );
    }
}