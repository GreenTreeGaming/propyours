import mongoose, {
    Schema,
    models,
} from "mongoose";

const AnalyticsEventSchema =
    new Schema(
        {
            _id: {
                type: String,
                required: true,
            },

            propertyId: {
                type:
                mongoose.Schema
                    .Types
                    .ObjectId,
                ref: "Property",
                required: true,
            },

            eventType: {
                type: String,
                enum: [
                    "view",
                    "phoneClick",
                ],
                required: true,
            },

            expiresAt: {
                type: Date,
                required: true,
            },
        },
        {
            timestamps: true,
            _id: false,
        },
    );

AnalyticsEventSchema.index(
    {
        expiresAt: 1,
    },
    {
        expireAfterSeconds: 0,
        name:
            "analytics_event_ttl",
    },
);

AnalyticsEventSchema.index(
    {
        propertyId: 1,
        eventType: 1,
        createdAt: -1,
    },
);
const AnalyticsEvent =
    models.AnalyticsEvent ||
    mongoose.model(
        "AnalyticsEvent",
        AnalyticsEventSchema,
    );

export default AnalyticsEvent;