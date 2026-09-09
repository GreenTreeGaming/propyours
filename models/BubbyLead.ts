import mongoose, {
    Schema,
    models,
} from "mongoose";

const BubbyLeadSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        mobile: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20,
            index: true,
        },

        propertyIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Property",
                required: true,
            },
        ],

        searchFilters: {
            type: Schema.Types.Mixed,
            required: false,
        },

        source: {
            type: String,
            enum: ["bubby"],
            default: "bubby",
            required: true,
        },

        status: {
            type: String,
            enum: [
                "new",
                "contacted",
                "qualified",
                "closed",
            ],
            default: "new",
            index: true,
        },

        consentedAt: {
            type: Date,
            required: true,
        },

        /*
         * Used only to prevent accidental duplicate submissions
         * for the exact same Bubby result set.
         */
        dedupeKey: {
            type: String,
            required: true,
            index: true,
        },

        submissionCount: {
            type: Number,
            default: 1,
            min: 1,
        },
    },
    {
        timestamps: true,
    },
);

BubbyLeadSchema.index({
    createdAt: -1,
});

BubbyLeadSchema.index({
    mobile: 1,
    createdAt: -1,
});

BubbyLeadSchema.index({
    status: 1,
    createdAt: -1,
});

const BubbyLead =
    models.BubbyLead ||
    mongoose.model(
        "BubbyLead",
        BubbyLeadSchema,
    );

export default BubbyLead;