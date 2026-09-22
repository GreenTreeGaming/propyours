import mongoose from "mongoose";

const LeadPhoneOtpSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    tokenHash: { type: String, default: null },
    verifiedAt: { type: Date, default: null },
    usedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

export default mongoose.models.LeadPhoneOtp || mongoose.model("LeadPhoneOtp", LeadPhoneOtpSchema);
