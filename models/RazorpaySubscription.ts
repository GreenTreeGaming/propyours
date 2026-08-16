import mongoose, {
    Schema,
    models,
} from "mongoose";

const RazorpaySubscriptionSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        planTier: {
            type: String,
            required: true,
            enum: [
                "gold",
                "platinum",
                "builder-starter",
                "builder-growth",
                "builder-elite",
            ],
        },

        razorpayPlanId: {
            type: String,
            required: true,
        },

        razorpaySubscriptionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        razorpayCustomerId: {
            type: String,
            required: false,
        },

        latestPaymentId: {
            type: String,
            required: false,
        },

        status: {
            type: String,
            enum: [
                "created",
                "authenticated",
                "active",
                "pending",
                "halted",
                "paused",
                "cancelled",
                "completed",
                "expired",
            ],
            default: "created",
            index: true,
        },

        currentStart: {
            type: Date,
            required: false,
        },

        currentEnd: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);

const RazorpaySubscription =
    models.RazorpaySubscription ||
    mongoose.model(
        "RazorpaySubscription",
        RazorpaySubscriptionSchema,
    );

export default RazorpaySubscription;