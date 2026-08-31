interface SendEmailOtpOptions {
    email: string;
    otp: string;
}

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

export async function sendEmailOtp({
                                       email,
                                       otp,
                                   }: SendEmailOtpOptions): Promise<void> {
    if (!shouldSendRealEmails()) {
        console.info(
            "Development email OTP requested.",
            {
                emailDomain:
                    email.split(
                        "@",
                    )[1] ??
                    "unknown",
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
            "MSG91_EMAIL_OTP_TEMPLATE_ID",
        );

    const fromEmail =
        getRequiredEnv(
            "MSG91_EMAIL_FROM",
        );

    const domain =
        getRequiredEnv(
            "MSG91_EMAIL_DOMAIN",
        );

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
                                email,
                            },
                        ],

                        variables: {
                            otp,
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
        // Some provider errors may
        // return a non-JSON body.
    }

    if (!response.ok) {
        console.error(
            "MSG91 email send failed.",
            {
                status:
                response.status,

                message:
                payload?.message,
            },
        );

        throw new Error(
            "Email delivery failed.",
        );
    }
}