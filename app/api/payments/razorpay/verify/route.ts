import crypto from "crypto";

import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getAuthenticatedUser,
    isAuthError,
} from "@/lib/auth";

import {
    connectDB,
} from "@/lib/mongoose";

import {
    applyPlanChange,
} from "@/lib/apply-plan-change";

import {
    PLAN_CATALOG,
} from "@/lib/plan-catalog";

import RazorpayOrder from "@/models/RazorpayOrder";

type VerificationBody = {
    razorpay_payment_id?: unknown;
    razorpay_order_id?: unknown;
    razorpay_signature?: unknown;
};

function getRazorpaySecret(): string {
    const secret =
        process.env
            .RAZORPAY_KEY_SECRET;

    if (!secret) {
        throw new Error(
            "RAZORPAY_KEY_SECRET is not configured.",
        );
    }

    return secret;
}

function signaturesMatch(
    expected: string,
    received: string,
): boolean {
    const expectedBuffer =
        Buffer.from(expected);

    const receivedBuffer =
        Buffer.from(received);

    if (
        expectedBuffer.length !==
        receivedBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer,
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

        const body =
            (await request.json()) as
                VerificationBody;

        const paymentId =
            body.razorpay_payment_id;

        const orderId =
            body.razorpay_order_id;

        const signature =
            body.razorpay_signature;

        if (
            typeof paymentId !==
            "string" ||
            typeof orderId !==
            "string" ||
            typeof signature !==
            "string"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Missing payment verification fields.",
                },
                {
                    status: 400,
                },
            );
        }

        await connectDB();

        const order =
            await RazorpayOrder.findOne({
                userId:
                auth.userId,

                razorpayOrderId:
                orderId,
            });

        if (!order) {
            return NextResponse.json(
                {
                    error:
                        "Payment order was not found.",
                },
                {
                    status: 404,
                },
            );
        }

        /*
         * Razorpay Orders signature:
         *
         * order_id|payment_id
         */
        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    getRazorpaySecret(),
                )
                .update(
                    `${orderId}|${paymentId}`,
                )
                .digest("hex");

        if (
            !signaturesMatch(
                expectedSignature,
                signature,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid payment signature.",
                },
                {
                    status: 400,
                },
            );
        }

        /*
         * Idempotency:
         * don't activate the same
         * purchase twice.
         */
        if (
            order.status === "paid"
        ) {
            return NextResponse.json({
                success: true,
                alreadyProcessed: true,
            });
        }

        const planTier =
            order.planTier as keyof typeof PLAN_CATALOG;

        const plan =
            PLAN_CATALOG[
                planTier
                ];

        if (!plan) {
            return NextResponse.json(
                {
                    error:
                        "Purchased plan no longer exists.",
                },
                {
                    status: 400,
                },
            );
        }

        /*
         * Plan validity starts when
         * payment succeeds.
         */
        const now =
            new Date();

        const expiresAt =
            new Date(
                now.getTime() +
                plan.entitlements
                    .listingDays *
                24 *
                60 *
                60 *
                1000,
            );

        await applyPlanChange({
            userId:
            auth.userId,

            tier:
            planTier,

            audience:
            plan.audience,

            status:
                "active",

            source:
                "payment",

            paymentId,

            expiresAt,
        });

        order.razorpayPaymentId =
            paymentId;

        order.status =
            "paid";

        order.paidAt =
            now;

        await order.save();

        return NextResponse.json({
            success: true,

            plan: {
                tier:
                order.planTier,

                expiresAt,
            },
        });
    } catch (error) {
        console.error(
            "Unable to verify Razorpay payment:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to verify payment.",
            },
            {
                status: 500,
            },
        );
    }
}