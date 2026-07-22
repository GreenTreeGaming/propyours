export async function sendSms(phone: string, message: string) {
    // TODO: Replace with Twilio/Fast2SMS/Textlocal later.
    if (
        process.env.NODE_ENV !==
        "production"
    ) {
        console.info(
            "Development SMS requested.",
            {
                phoneSuffix:
                    phone.slice(-4),
            },
        );
    }

    return {
        success: true,
    };
}