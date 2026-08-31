"use client";

import {
    useState,
} from "react";

type PaidPlanTier =
    | "gold"
    | "platinum"
    | "builder-starter"
    | "builder-growth"
    | "builder-elite"
    | "agent-ruby"
    | "agent-emerald"
    | "agent-diamond";

type CreateOrderResponse = {
    orderId: string;

    keyId: string;

    amount: number;

    currency: string;

    plan: {
        tier:
            PaidPlanTier;

        name: string;

        subtotal: number;

        gst: number;

        total: number;
    };

    customer: {
        name: string;
        email: string;
        contact: string;
    };
};

type RazorpaySuccessResponse = {
    razorpay_payment_id: string;

    razorpay_order_id: string;

    razorpay_signature: string;
};

declare global {
    interface Window {
        Razorpay?: new (
            options:
            Record<
                string,
                unknown
            >,
        ) => {
            open: () => void;

            on: (
                event: string,
                handler: (
                    response:
                    unknown,
                ) => void,
            ) => void;
        };
    }
}

function loadRazorpayScript():
    Promise<boolean> {
    return new Promise(
        (resolve) => {
            if (
                window.Razorpay
            ) {
                resolve(true);
                return;
            }

            const existingScript =
                document.querySelector<HTMLScriptElement>(
                    'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
                );

            if (
                existingScript
            ) {
                existingScript.addEventListener(
                    "load",
                    () =>
                        resolve(
                            true,
                        ),
                    {
                        once: true,
                    },
                );

                existingScript.addEventListener(
                    "error",
                    () =>
                        resolve(
                            false,
                        ),
                    {
                        once: true,
                    },
                );

                return;
            }

            const script =
                document.createElement(
                    "script",
                );

            script.src =
                "https://checkout.razorpay.com/v1/checkout.js";

            script.async =
                true;

            script.onload =
                () =>
                    resolve(
                        true,
                    );

            script.onerror =
                () =>
                    resolve(
                        false,
                    );

            document.body.appendChild(
                script,
            );
        },
    );
}

export default function RazorpayCheckoutButton({
                                                   plan,
                                                   className = "",
                                                   children,
                                               }: {
    plan: PaidPlanTier;
    className?: string;
    children?:
        React.ReactNode;
}) {
    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(null);

    async function startCheckout() {
        if (loading) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const scriptLoaded =
                await loadRazorpayScript();

            if (
                !scriptLoaded
            ) {
                throw new Error(
                    "Unable to load Razorpay Checkout.",
                );
            }

            const response =
                await fetch(
                    "/api/payments/razorpay/create-order",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify(
                                {
                                    plan,
                                },
                            ),
                    },
                );

            const data =
                (await response.json()) as
                    | CreateOrderResponse
                    | {
                    error?: string;
                };

            if (
                !response.ok
            ) {
                throw new Error(
                    "error" in
                    data &&
                    typeof data.error ===
                    "string"
                        ? data.error
                        : "Unable to start checkout.",
                );
            }

            const checkout =
                data as
                    CreateOrderResponse;

            if (
                !window.Razorpay
            ) {
                throw new Error(
                    "Razorpay Checkout is unavailable.",
                );
            }

            const razorpay =
                new window.Razorpay(
                    {
                        key:
                        checkout.keyId,

                        order_id:
                        checkout.orderId,

                        amount:
                        checkout.amount,

                        currency:
                        checkout.currency,

                        name:
                            "PropYours",

                        description:
                            `${checkout.plan.name} one-time pack`,

                        prefill: {
                            name:
                            checkout
                                .customer
                                .name,

                            email:
                            checkout
                                .customer
                                .email,

                            contact:
                            checkout
                                .customer
                                .contact,
                        },

                        notes: {
                            plan:
                            checkout
                                .plan
                                .tier,
                        },

                        theme: {
                            color:
                                "#0d9488",
                        },

                        modal: {
                            ondismiss:
                                () => {
                                    setLoading(
                                        false,
                                    );
                                },
                        },

                        handler:
                            async (
                                payment:
                                RazorpaySuccessResponse,
                            ) => {
                                try {
                                    const verifyResponse =
                                        await fetch(
                                            "/api/payments/razorpay/verify",
                                            {
                                                method:
                                                    "POST",

                                                headers:
                                                    {
                                                        "Content-Type":
                                                            "application/json",
                                                    },

                                                body:
                                                    JSON.stringify(
                                                        {
                                                            razorpay_payment_id:
                                                            payment.razorpay_payment_id,

                                                            razorpay_order_id:
                                                            payment.razorpay_order_id,

                                                            razorpay_signature:
                                                            payment.razorpay_signature,
                                                        },
                                                    ),
                                            },
                                        );

                                    const verifyData =
                                        await verifyResponse.json();

                                    if (
                                        !verifyResponse.ok
                                    ) {
                                        throw new Error(
                                            verifyData.error ??
                                            "Payment verification failed.",
                                        );
                                    }

                                    window.location.href =
                                        "/dashboard";
                                } catch (
                                    verificationError
                                    ) {
                                    setError(
                                        verificationError instanceof
                                        Error
                                            ? verificationError.message
                                            : "Payment verification failed.",
                                    );
                                } finally {
                                    setLoading(
                                        false,
                                    );
                                }
                            },
                    },
                );

            razorpay.on(
                "payment.failed",
                () => {
                    setError(
                        "Payment failed. Please try again.",
                    );

                    setLoading(
                        false,
                    );
                },
            );

            razorpay.open();
        } catch (
            checkoutError
            ) {
            setError(
                checkoutError instanceof
                Error
                    ? checkoutError.message
                    : "Unable to start checkout.",
            );

            setLoading(
                false,
            );
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={
                    startCheckout
                }
                disabled={
                    loading
                }
                className={
                    className
                }
            >
                {loading
                    ? "Opening checkout..."
                    : children ??
                    "Continue to payment"}
            </button>

            {error ? (
                <p className="mt-2 text-sm font-semibold text-red-600">
                    {error}
                </p>
            ) : null}
        </div>
    );
}