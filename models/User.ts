import mongoose, { Schema, models } from "mongoose";
import {
    USER_ROLES,
} from "@/lib/admin/roles";

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        phone: {
            type: String,
            required: false,
            trim: true,
        },

        tokenVersion: {
            type: Number,
            default: 0,
            min: 0,
            select: false,
        },

        role: {
            type: String,
            enum: USER_ROLES,
            default: "User",
            index: true,
        },

        bio: {
            type: String,
            required: false,
        },

        company: {
            type: String,
            required: false,
        },

        address: {
            type: String,
            required: false,
        },

        city: {
            type: String,
            required: false,
        },

        favorites: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Property",
                },
            ],
            default: [],
        },

        plan: {
            audience: {
                type: String,
                enum: ["owner", "builder"],
                default: "owner",
            },

            tier: {
                type: String,
                enum: [
                    "silver",
                    "gold",
                    "platinum",
                    "builder-starter",
                    "builder-growth",
                    "builder-elite",
                ],
                default: "silver",
            },

            status: {
                type: String,
                enum: ["free", "active", "expired", "cancelled"],
                default: "free",
            },

            startedAt: {
                type: Date,
                default: Date.now,
            },

            expiresAt: {
                type: Date,
                required: false,
            },

            source: {
                type: String,
                enum: ["manual", "payment", "promo"],
                default: "manual",
            },

            boostsRemaining: {
                type: Number,
                default: 0,
                min: 0,
            },

            boostsResetAt: {
                type: Date,
                required: false,
            },

            lastBoostResetAt: {
                type: Date,
                required: false,
            },

            paymentId: {
                type: String,
                required: false,
            },
        },
    },
    { timestamps: true }
);

UserSchema.index(
    {
        phone: 1,
    },
    {
        unique: true,
        sparse: true,
        name:
            "unique_user_phone",
    },
);

UserSchema.index(
    {
        email: 1,
    },
    {
        unique: true,
        name:
            "unique_user_email",
    },
);

// Force fresh model in development to reflect schema changes immediately
if (process.env.NODE_ENV === "development") {
    try {
        mongoose.deleteModel("User");
    } catch (e) {
        // Model might not have been registered yet
    }
}

const User = models.User || mongoose.model("User", UserSchema);

export default User;