import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            index: true,
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        viewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
            maxlength: 30,
        },

        email: {
            type: String,
            required: false,
            trim: true,
            lowercase: true,
            maxlength: 160,
        },

        message: {
            type: String,
            required: false,
            trim: true,
            maxlength: 1000,
        },

        source: {
            type: String,
            enum: ["phone", "email", "whatsapp", "favorite"],
            default: "form",
            index: true,
        },

        status: {
            type: String,
            enum: ["new", "verified", "invalid"],
            default: "verified",
            index: true,
        },

        delivered: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    { timestamps: true }
);

if (process.env.NODE_ENV === "development") {
    try {
        mongoose.deleteModel("Lead");
    } catch {
        // Model might not have been registered yet
    }
}

const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);

export default Lead;