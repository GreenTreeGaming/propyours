export async function sendSms(phone: string, message: string) {
    // TODO: Replace with Twilio/Fast2SMS/Textlocal later.
    console.log(`SMS to ${phone}: ${message}`);

    return {
        success: true,
    };
}