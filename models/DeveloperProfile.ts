import mongoose, { Schema, models } from "mongoose";

const DeveloperProfileSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 160 },
        normalizedName: { type: String, required: true, unique: true, index: true },
        bio: { type: String, default: "", trim: true, maxlength: 3000 },
        companyWebsite: { type: String, default: "", trim: true, maxlength: 300 },
        reraNumber: { type: String, default: "", trim: true, maxlength: 100 },
        address: { type: String, default: "", trim: true, maxlength: 500 },
        city: { type: String, default: "", trim: true, maxlength: 120 },
        source: { type: String, enum: ["listing", "admin"], default: "listing" },
    },
    { timestamps: true },
);

export default models.DeveloperProfile ||
    mongoose.model("DeveloperProfile", DeveloperProfileSchema);
