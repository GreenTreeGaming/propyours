import crypto from "crypto";

import {
    NextRequest,
    NextResponse,
} from "next/server";

import { connectDB } from "@/lib/mongoose";
import {
    applyPlanChange,
} from "@/lib/apply-plan-change";

import RazorpaySubscription from "@/models/RazorpaySubscription";

type RazorpayWebhookPayload = {
    event?: string;

    payload?: {
        subscription?: {
            entity?: {
                id?: string;
                status?: string;
                current_start?: number | null;
                current_end?: number | null;
                customer_id?: string | null;
            };
        };

        payment?: {
            entity?: {
                id?: string;
            };
        };
    };
};

function getWebhookSecret(): string {
    const secret =
        process.env.RAZORPAY_WEBHOOK_SECRET;

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
        Buffer.from(expectedSignature);

    const receivedBuffer =
        Buffer.from(receivedSignature);

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

function unixToDate(
    value: number | null | undefined,
): Date | undefined {
    if (
        typeof value !== "number" ||
        !Number.isFinite(value)
    ) {
        return undefined;
    }

    return new Date(value * 1000);
}

export async function POST(
    request: NextRequest,
) {
    try {
        /*
         * IMPORTANT:
         * Razorpay webhook verification must use the raw
         * request body. Do not call request.json() first.
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

        const subscriptionEntity =
            event.payload
                ?.subscription
                ?.entity;

        const subscriptionId =
            subscriptionEntity?.id;

        if (!subscriptionId) {
            return NextResponse.json({
                received: true,
            });
        }

        await connectDB();

        const subscription =
            await RazorpaySubscription.findOne({
                razorpaySubscriptionId:
                subscriptionId,
            });

        /*
         * Razorpay may send a webhook before our local
         * record exists, or for an unrelated subscription.
         *
         * Return 200 so Razorpay does not endlessly retry
         * something we cannot process.
         */
        if (!subscription) {
            console.warn(
                "Received Razorpay webhook for unknown subscription:",
                subscriptionId,
            );

            return NextResponse.json({
                received: true,
            });
        }

        const currentStart =
            unixToDate(
                subscriptionEntity
                    ?.current_start,
            );

        const currentEnd =
            unixToDate(
                subscriptionEntity
                    ?.current_end,
            );

        const customerId =
            subscriptionEntity
                ?.customer_id;

        const paymentId =
            event.payload
                ?.payment
                ?.entity
                ?.id;

        if (currentStart) {
            subscription.currentStart =
                currentStart;
        }

        if (currentEnd) {
            subscription.currentEnd =
                currentEnd;
        }

        if (
            typeof customerId ===
            "string"
        ) {
            subscription.razorpayCustomerId =
                customerId;
        }

        if (
            typeof paymentId ===
            "string"
        ) {
            subscription.latestPaymentId =
                paymentId;
        }

        switch (event.event) {
            case "subscription.authenticated":
                subscription.status =
                    "authenticated";
                break;

            case "subscription.activated":
            case "subscription.charged":
            case "subscription.resumed": {
                subscription.status =
                    "active";

                await subscription.save();

                await applyPlanChange({
                    userId:
                        subscription.userId.toString(),

                    tier:
                    subscription.planTier,

                    status:
                        "active",

                    source:
                        "payment",

                    paymentId:
                        paymentId ??
                        subscription.latestPaymentId,

                    expiresAt:
                    currentEnd,
                });

                return NextResponse.json({
                    received: true,
                });
            }

            case "subscription.pending":
                subscription.status =
                    "pending";
                break;

            case "subscription.halted":
                subscription.status =
                    "halted";
                break;

            case "subscription.cancelled": {
                subscription.status =
                    "cancelled";

                await subscription.save();

                await applyPlanChange({
                    userId:
                        subscription.userId.toString(),

                    tier:
                    subscription.planTier,

                    status:
                        "cancelled",

                    source:
                        "payment",

                    paymentId:
                    subscription.latestPaymentId,
                });

                return NextResponse.json({
                    received: true,
                });
            }

            case "subscription.completed": {
                subscription.status =
                    "completed";

                await subscription.save();

                await applyPlanChange({
                    userId:
                        subscription.userId.toString(),

                    tier:
                    subscription.planTier,

                    status:
                        "expired",

                    source:
                        "payment",

                    paymentId:
                    subscription.latestPaymentId,
                });

                return NextResponse.json({
                    received: true,
                });
            }

            case "subscription.paused":
                subscription.status =
                    "paused";
                break;

            case "subscription.updated":
                break;

            default:
                break;
        }

        await subscription.save();

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