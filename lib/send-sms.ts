const MSG91_API_URL =
    "https://control.msg91.com/api/v5/flow";

interface SendSmsOptions {
    phone: string;
    otp: string;
}

interface Msg91Response {
    type?: string;
    message?: string;
}

function normalizeIndianPhone(
    phone: string,
): string {
    const digits = phone.replace(
        /\D/g,
        "",
    );

    if (digits.length === 10) {
        return `91${digits}`;
    }

    if (
        digits.length === 12 &&
        digits.startsWith("91")
    ) {
        return digits;
    }

    throw new Error(
        "Invalid Indian mobile number.",
    );
}

export async function sendSms({
                                  phone,
                                  otp,
                              }: SendSmsOptions) {
    const authKey =
        process.env.MSG91_AUTH_KEY;

    const flowId =
        process.env.MSG91_FLOW_ID;

    const senderId =
        process.env.MSG91_SENDER_ID;

    if (
        !authKey ||
        !flowId ||
        !senderId
    ) {
        throw new Error(
            "MSG91 SMS configuration is missing.",
        );
    }

    const mobile =
        normalizeIndianPhone(phone);

    const response = await fetch(
        MSG91_API_URL,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
                accept:
                    "application/json",
                authkey: authKey,
            },
            body: JSON.stringify({
                flow_id: flowId,
                sender: senderId,
                recipients: [
                    {
                        mobiles:
                        mobile,
                        otp,
                        minutes:
                            "10",
                    },
                ],
            }),
        },
    );

    let payload: Msg91Response = {};

    try {
        payload =
            (await response.json()) as
                Msg91Response;
    } catch {
        // MSG91 may return a non-JSON body
        // for some upstream errors.
    }

    if (
        !response.ok ||
        payload.type === "error"
    ) {
        console.error(
            "MSG91 send failed:",
            {
                status:
                response.status,
                type:
                payload.type,
                message:
                payload.message,
            },
        );

        throw new Error(
            payload.message ||
            "Unable to send OTP SMS.",
        );
    }

    return {
        success: true,
        messageId:
        payload.message,
    };
}