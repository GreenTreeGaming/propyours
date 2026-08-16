import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getAuthenticatedUser,
    isAuthError,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { razorpay } from "@/lib/razorpay";
import {
    getRazorpayPlan,
    isPaidPlanTier,
} from "@/lib/razorpay-plans";

import User from "@/models/User";
import RazorpaySubscription from "@/models/RazorpaySubscription";

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

        const plan = (
            body as {
                plan?: unknown;
            }
        ).plan;

        if (!isPaidPlanTier(plan)) {
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

        await connectDB();

        const user =
            await User.findById(
                auth.userId,
            ).select(
                "name email phone plan",
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

        const configuration =
            getRazorpayPlan(plan);

        const subscription =
            await razorpay.subscriptions.create({
                plan_id:
                configuration.razorpayPlanId,

                total_count:
                configuration.totalCount,

                quantity: 1,

                customer_notify: true,

                notes: {
                    userId:
                    auth.userId,
                    planTier:
                    plan,
                },
            });

        await RazorpaySubscription.create({
            userId:
            auth.userId,

            planTier:
            plan,

            razorpayPlanId:
            configuration.razorpayPlanId,

            razorpaySubscriptionId:
            subscription.id,

            status:
                subscription.status ??
                "created",
        });

        return NextResponse.json({
            subscriptionId:
            subscription.id,

            keyId:
            process.env
                .NEXT_PUBLIC_RAZORPAY_KEY_ID,

            plan: {
                tier:
                configuration
                    .internalPlan.tier,

                name:
                configuration
                    .internalPlan
                    .presentation
                    .displayName,

                amount:
                configuration
                    .internalPlan
                    .presentation
                    .priceInPaise,

                currency:
                    "INR",
            },

            customer: {
                name:
                    user.name ?? "",

                email:
                    user.email ?? "",

                contact:
                    user.phone ?? "",
            },
        });
    } catch (error) {
        console.error(
            "Unable to create Razorpay subscription:",
            error,
        );

        const message =
            error instanceof Error
                ? error.message
                : "Unknown Razorpay error";

        return NextResponse.json(
            {
                error:
                    process.env.NODE_ENV === "development"
                        ? message
                        : "Unable to start checkout. Please try again.",
            },
            {
                status: 500,
            },
        );
    }
}