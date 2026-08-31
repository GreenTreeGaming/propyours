import crypto from "crypto";

import {
    NextRequest,
    NextResponse,
} from "next/server";

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

type RazorpayWebhookPayload = {
    event?: string;

    payload?: {
        payment?: {
            entity?: {
                id?: string;
                order_id?: string;
                status?: string;
            };
        };

        order?: {
            entity?: {
                id?: string;
                status?: string;
            };
        };
    };
};

function getWebhookSecret(): string {
    const secret =
        process.env
            .RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
        throw new Error(
            "RAZORPAY_WEBHOOK_SECRET is not configured.",
        );
    }

    return secret;
}

function verifyWebhookSignature(
    body: string,
    receivedSignature: string,
): boolean {
    const expectedSignature =
        crypto
            .createHmac(
                "sha256",
                getWebhookSecret(),
            )
            .update(body)
            .digest("hex");

    const expectedBuffer =
        Buffer.from(
            expectedSignature,
        );

    const receivedBuffer =
        Buffer.from(
            receivedSignature,
        );

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
        /*
         * Razorpay webhook verification
         * must use the raw request body.
         */
        const rawBody =
            await request.text();

        const signature =
            request.headers.get(
                "x-razorpay-signature",
            );

        if (!signature) {
            return NextResponse.json(
                {
                    error:
                        "Missing webhook signature.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            !verifyWebhookSignature(
                rawBody,
                signature,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid webhook signature.",
                },
                {
                    status: 400,
                },
            );
        }

        const event =
            JSON.parse(
                rawBody,
            ) as RazorpayWebhookPayload;

        const payment =
            event.payload
                ?.payment
                ?.entity;

        const paymentId =
            payment?.id;

        const orderId =
            payment?.order_id ??
            event.payload
                ?.order
                ?.entity
                ?.id;

        if (
            typeof orderId !==
            "string"
        ) {
            return NextResponse.json({
                received: true,
            });
        }

        await connectDB();

        const order =
            await RazorpayOrder.findOne({
                razorpayOrderId:
                orderId,
            });

        /*
         * Webhooks can arrive for orders
         * unrelated to this application.
         */
        if (!order) {
            console.warn(
                "Received Razorpay webhook for unknown order:",
                orderId,
            );

            return NextResponse.json({
                received: true,
            });
        }

        /*
         * payment.captured is the key
         * successful one-time payment event.
         */
        if (
            event.event ===
            "payment.captured"
        ) {
            /*
             * Idempotency:
             * Razorpay may send the same
             * webhook more than once.
             */
            if (
                order.status ===
                "paid"
            ) {
                return NextResponse.json({
                    received: true,
                    alreadyProcessed: true,
                });
            }

            if (
                typeof paymentId !==
                "string"
            ) {
                return NextResponse.json({
                    received: true,
                });
            }

            const planTier =
                order.planTier as keyof typeof PLAN_CATALOG;

            const plan =
                PLAN_CATALOG[
                    planTier
                    ];

            if (!plan) {
                console.error(
                    "Razorpay order references unknown plan:",
                    order.planTier,
                );

                return NextResponse.json({
                    received: true,
                });
            }

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

            /*
             * Activate first.
             * Mark paid only after the
             * account update succeeds.
             */
            await applyPlanChange({
                userId:
                    order.userId.toString(),

                tier:
                order.planTier,

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
                received: true,
            });
        }

        /*
         * A failed payment attempt should
         * not activate anything.
         */
        if (
            event.event ===
            "payment.failed"
        ) {
            if (
                order.status !==
                "paid"
            ) {
                order.status =
                    "failed";

                if (
                    typeof paymentId ===
                    "string"
                ) {
                    order.razorpayPaymentId =
                        paymentId;
                }

                await order.save();
            }

            return NextResponse.json({
                received: true,
            });
        }

        /*
         * Other Razorpay events don't
         * require action here.
         */
        return NextResponse.json({
            received: true,
        });
    } catch (error) {
        console.error(
            "Unable to process Razorpay webhook:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to process webhook.",
            },
            {
                status: 500,
            },
        );
    }
}