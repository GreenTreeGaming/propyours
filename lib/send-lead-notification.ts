type LeadSource =
    | "phone"
    | "email"
    | "whatsapp"
    | "favorite";

type SendLeadNotificationInput = {
    ownerEmail: string;
    ownerName?: string;
    buyerName: string;
    buyerEmail?: string;
    buyerPhone?: string;
    propertyId: string;
    propertyAddress: string;
    source: LeadSource;
};

interface Msg91EmailResponse {
    type?: string;
    message?: string;
    request_id?: string;
}

function getRequiredEnv(
    name: string,
): string {
    const value =
        process.env[name]?.trim();

    if (!value) {
        throw new Error(
            `${name} is not configured.`,
        );
    }

    return value;
}

function shouldSendRealEmails(): boolean {
    return (
        process.env.NODE_ENV ===
        "production" ||
        process.env.SEND_REAL_EMAILS ===
        "true"
    );
}

function getActionText(
    source: LeadSource,
): string {
    if (source === "phone") {
        return "clicked Show Phone Number";
    }

    if (source === "email") {
        return "clicked Email Seller";
    }

    if (source === "favorite") {
        return "favorited your property";
    }

    if (source === "whatsapp") {
        return "clicked WhatsApp";
    }

    return "showed interest in your property";
}

export async function sendLeadNotificationEmail({
                                                    ownerEmail,
                                                    ownerName,
                                                    buyerName,
                                                    buyerEmail,
                                                    buyerPhone,
                                                    propertyId,
                                                    propertyAddress,
                                                    source,
                                                }: SendLeadNotificationInput): Promise<void> {
    if (!shouldSendRealEmails()) {
        console.info(
            "Development lead notification requested.",
            {
                ownerEmailDomain:
                    ownerEmail.split(
                        "@",
                    )[1] ??
                    "unknown",

                source,
                propertyId,
            },
        );

        return;
    }

    const authKey =
        getRequiredEnv(
            "MSG91_AUTH_KEY",
        );

    const templateId =
        getRequiredEnv(
            "MSG91_LEAD_TEMPLATE_ID",
        );

    const fromEmail =
        getRequiredEnv(
            "MSG91_EMAIL_FROM",
        );

    const domain =
        getRequiredEnv(
            "MSG91_EMAIL_DOMAIN",
        );

    const appUrl =
        process.env
            .NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

    const propertyUrl =
        `${appUrl}/property/${propertyId}`;

    const actionText =
        getActionText(source);

    const response = await fetch(
        "https://control.msg91.com/api/v5/email/send",
        {
            method: "POST",

            headers: {
                accept:
                    "application/json",

                authkey:
                authKey,

                "content-type":
                    "application/json",
            },

            body: JSON.stringify({
                recipients: [
                    {
                        to: [
                            {
                                email:
                                ownerEmail,
                            },
                        ],

                        variables: {
                            owner_name:
                                ownerName ||
                                "there",

                            buyer_name:
                            buyerName,

                            action_text:
                            actionText,

                            property_address:
                            propertyAddress,

                            buyer_email:
                                buyerEmail ||
                                "Not provided",

                            buyer_phone:
                                buyerPhone ||
                                "Not provided",

                            property_url:
                            propertyUrl,
                        },
                    },
                ],

                from: {
                    name:
                        "PropYours",

                    email:
                    fromEmail,
                },

                domain,

                template_id:
                templateId,
            }),
        },
    );

    let payload:
        | Msg91EmailResponse
        | null = null;

    try {
        payload =
            (await response.json()) as
                Msg91EmailResponse;
    } catch {
        // Provider may return
        // a non-JSON error response.
    }

    if (!response.ok) {
        console.error(
            "MSG91 lead email failed.",
            {
                status:
                response.status,

                message:
                payload?.message,

                propertyId,
                source,
            },
        );

        throw new Error(
            "Lead notification delivery failed.",
        );
    }
}