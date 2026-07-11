import mongoose, {
    Schema,
    models,
} from "mongoose";

const BoostTransactionSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: false,
            index: true,
        },

        type: {
            type: String,
            enum: [
                "monthly_reset",
                "boost_used",
                "plan_activated",
                "plan_upgraded",
                "plan_downgraded",
                "plan_expired",
                "admin_adjustment",
            ],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        balanceBefore: {
            type: Number,
            required: true,
        },

        balanceAfter: {
            type: Number,
            required: true,
        },

        planTier: {
            type: String,
            required: true,
        },

        metadata: {
            type: Schema.Types.Mixed,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

BoostTransactionSchema.index({
    userId: 1,
    createdAt: -1,
});

const BoostTransaction =
    models.BoostTransaction ||
    mongoose.model(
        "BoostTransaction",
        BoostTransactionSchema
    );

export default BoostTransaction;