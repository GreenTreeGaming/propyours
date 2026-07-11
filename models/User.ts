import mongoose, { Schema, models } from "mongoose";

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
        },

        password: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            required: false,
        },

        role: {
            type: String,
            enum: ["User", "Admin", "Agent", "Builder", "Property Owner"],
            default: "User",
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