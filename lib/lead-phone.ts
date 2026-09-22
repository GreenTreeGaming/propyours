import { createHash } from "node:crypto";
import LeadPhoneOtp from "@/models/LeadPhoneOtp";

export function normalizeLeadPhone(value: string): string | null {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91") && /^[6-9]/.test(digits.slice(2))) return `+${digits}`;
    return null;
}

export function hashLeadToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

export async function consumeVerifiedLeadPhone(phone: string, token: string): Promise<boolean> {
    if (!token || token.length > 200) return false;
    const result = await LeadPhoneOtp.findOneAndUpdate(
        { phone, verified: true, tokenHash: hashLeadToken(token), expiresAt: { $gt: new Date() } },
        { $set: { verified: false, tokenHash: null, usedAt: new Date() } },
    );
    return Boolean(result);
}
