import crypto from "crypto";

import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getAuthenticatedUser,
    isAuthError,
} from "@/lib/auth";

import { connectDB } from "@/lib/mongoose";

import {
    applyPlanChange,
} from "@/lib/apply-plan-change";

import RazorpaySubscription from "@/models/RazorpaySubscription";

type VerificationBody = {
    razorpay_payment_id?: unknown;
    razorpay_subscription_id?: unknown;
    razorpay_signature?: unknown;
};

function getRazorpaySecret(): string {
    const secret =
        process.env.RAZORPAY_KEY_SECRET;

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

        const subscriptionId =
            body.razorpay_subscription_id;

        const signature =
            body.razorpay_signature;

        if (
            typeof paymentId !== "string" ||
            typeof subscriptionId !==
            "string" ||
            typeof signature !== "string"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Missing payments verification fields.",
                },
                {
                    status: 400,
                },
            );
        }

        await connectDB();

        const subscription =
            await RazorpaySubscription.findOne({
                userId:
                auth.userId,

                razorpaySubscriptionId:
                subscriptionId,
            });

        if (!subscription) {
            return NextResponse.json(
                {
                    error:
                        "Subscription was not found.",
                },
                {
                    status: 404,
                },
            );
        }

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    getRazorpaySecret(),
                )
                .update(
                    `${paymentId}|${subscriptionId}`,
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
                        "Invalid payments signature.",
                },
                {
                    status: 400,
                },
            );
        }

        subscription.latestPaymentId =
            paymentId;

        subscription.status =
            "active";

        await subscription.save();

        await applyPlanChange({
            userId:
            auth.userId,

            tier:
            subscription.planTier,

            status:
                "active",

            source:
                "payment",

            paymentId,
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(
            "Unable to verify Razorpay payments:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to verify payments.",
            },
            {
                status: 500,
            },
        );
    }
}