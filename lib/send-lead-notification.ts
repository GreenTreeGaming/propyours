import { Resend } from "resend";

type LeadSource = "phone" | "email" | "whatsapp" | "favorite";

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

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

function getActionText(source: LeadSource) {
    if (source === "phone") return "clicked Show Phone Number";
    if (source === "email") return "clicked Email Seller";
    if (source === "favorite") return "favorited your property";
    if (source === "whatsapp") return "clicked WhatsApp";

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
                                                }: SendLeadNotificationInput) {
    if (!resend) {
        console.warn("RESEND_API_KEY is missing. Skipping lead notification email.");
        return;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const propertyUrl = `${appUrl}/property/${propertyId}`;
    const actionText = getActionText(source);

    await resend.emails.send({
        from: process.env.LEAD_EMAIL_FROM || "PropYours <leads@propyours.com>",
        to: ownerEmail,
        subject: "New lead for your property on PropYours",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
                <h2>Someone is interested in your property</h2>

                <p>Hi ${ownerName || "there"},</p>

                <p><strong>${buyerName}</strong> ${actionText} on PropYours.</p>

                <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; margin: 20px 0;">
                    <p><strong>Property:</strong> ${propertyAddress}</p>
                    <p><strong>Lead name:</strong> ${buyerName}</p>
                    ${buyerEmail ? `<p><strong>Email:</strong> ${buyerEmail}</p>` : ""}
                    ${buyerPhone ? `<p><strong>Phone:</strong> ${buyerPhone}</p>` : ""}
                </div>

                <p>
                    <a href="${propertyUrl}" style="display: inline-block; background: #0f766e; color: white; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: bold;">
                        View Property
                    </a>
                </p>

                <p style="font-size: 12px; color: #6b7280;">
                    This notification was sent because someone interacted with your property listing on PropYours.
                </p>
            </div>
        `,
        text: `
Hi ${ownerName || "there"},

${buyerName} ${actionText} on PropYours.

Property: ${propertyAddress}
Lead name: ${buyerName}
${buyerEmail ? `Email: ${buyerEmail}` : ""}
${buyerPhone ? `Phone: ${buyerPhone}` : ""}

View property: ${propertyUrl}
        `.trim(),
    });
}