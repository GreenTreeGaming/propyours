import mongoose, {
    Schema,
    models,
} from "mongoose";

import type {
    PlanTier,
} from "@/lib/plan-catalog";

const RazorpayOrderSchema =
    new Schema(
        {
            userId: {
                type:
                Schema.Types
                    .ObjectId,
                ref: "User",
                required: true,
                index: true,
            },

            planTier: {
                type: String,
                required: true,
            },

            razorpayOrderId: {
                type: String,
                required: true,
                unique: true,
                index: true,
            },

            razorpayPaymentId: {
                type: String,
                required: false,
                index: true,
            },

            subtotalInPaise: {
                type: Number,
                required: true,
            },

            gstInPaise: {
                type: Number,
                required: true,
            },

            totalInPaise: {
                type: Number,
                required: true,
            },

            currency: {
                type: String,
                default: "INR",
            },

            status: {
                type: String,
                enum: [
                    "created",
                    "paid",
                    "failed",
                ],
                default: "created",
                index: true,
            },

            paidAt: {
                type: Date,
                required: false,
            },
        },
        {
            timestamps: true,
        },
    );

export type RazorpayOrderDocument = {
    userId:
        mongoose.Types.ObjectId;

    planTier:
        Exclude<
            PlanTier,
            "silver"
        >;

    razorpayOrderId: string;

    razorpayPaymentId?: string;

    subtotalInPaise: number;

    gstInPaise: number;

    totalInPaise: number;

    currency: string;

    status:
        | "created"
        | "paid"
        | "failed";

    paidAt?: Date;
};

const RazorpayOrder =
    models.RazorpayOrder ||
    mongoose.model(
        "RazorpayOrder",
        RazorpayOrderSchema,
    );

export default RazorpayOrder;