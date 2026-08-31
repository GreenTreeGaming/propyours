import mongoose, {
    Schema,
    models,
} from "mongoose";

const EmailOtpSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
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
            index: {
                expires: 0,
            },
        },
    },
    {
        timestamps: true,
    },
);

EmailOtpSchema.index(
    {
        email: 1,
    },
    {
        unique: true,
        name: "unique_email_otp",
    },
);

const EmailOtp =
    models.EmailOtp ||
    mongoose.model(
        "EmailOtp",
        EmailOtpSchema,
    );

export default EmailOtp;