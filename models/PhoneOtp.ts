import mongoose, { Schema, models } from "mongoose";

const PhoneOtpSchema = new Schema(
    {
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        otpHash: {
            type: String,
            required: true,
        },

        attempts: {
            type: Number,
            default: 0,
        },

        verified: {
            type: Boolean,
            default: false,
        },

        verifiedAt: {
            type: Date,
            required: false,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 },
        },
    },
    { timestamps: true }
);

PhoneOtpSchema.index(
    {
        phone: 1,
    },
    {
        unique: true,
        name:
            "unique_phone_otp",
    },
);

if (process.env.NODE_ENV === "development") {
    try {
        mongoose.deleteModel("PhoneOtp");
    } catch (e) {
        // Model might not have been registered yet
    }
}

const PhoneOtp = models.PhoneOtp || mongoose.model("PhoneOtp", PhoneOtpSchema);

export default PhoneOtp;