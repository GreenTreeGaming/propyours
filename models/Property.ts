import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
    {
        // 👤 Owner
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        description: {
            type: String,
            maxlength: 2000,
        },

        purpose: {
            type: String,
            enum: ["Buy", "Sell", "Rent", "PG/CO-Living"],
            required: true,
        },

        propertyType: {
            type: String,
            enum: [
                "Apartment",
                "Independent House",
                "Independent Floor",
                "Duplex",
                "Villa",
                "Penthouse",
                "Plot",
                "Farm House",
                "Agricultural Land",
                "Commercial",
            ],
            required: true,
        },

        // 📍 Location
        address: { type: String, required: true },
        locality: String,
        city: { type: String, required: true },
        state: String,
        landmark: String,

        // 📐 Property Details
        size: { type: Number, required: true },
        sizeUnit: {
            type: String,
            enum: ["sqft", "sqyd", "sqm", "acre", "kanal", "marla"],
            default: "sqft"
        },
        uds: Number, // Undivided Share
        dimensions: String, // "50 x 50"
        ownershipType: {
            type: String,
            enum: ["Freehold", "Leasehold", "Co-operative", "Power of Attorney"],
        },

        bedrooms: Number,
        bathrooms: Number,
        floors: Number,

        // 💰 Pricing
        price: {
            type: Number,
            required: true,
        },

        priceType: {
            type: String,
            enum: ["Total", "Per Sq Ft"],
            default: "Total",
        },

        negotiable: {
            type: Boolean,
            default: true,
        },

        // ⭐ Extras (future-proofing)
        amenities: [String], // ["Parking", "Lift", "Gym"]

        status: {
            type: String,
            enum: ["active", "sold", "inactive"],
            default: "active",
        },

        featured: {
            type: Boolean,
            default: false,
        },

        // 🖼 Images (skip for now but keep placeholder)
        images: [String],

        // 📈 Analytics
        analytics: {
            views: { type: Number, default: 0 },
            phoneClicks: { type: Number, default: 0 },
            favoritesCount: { type: Number, default: 0 },
            dailyStats: [
                {
                    date: String, // "YYYY-MM-DD"
                    views: { type: Number, default: 0 },
                    phoneClicks: { type: Number, default: 0 },
                },
            ],
        },

        // 📅 Meta
        createdAt: {
            type: Date,
            default: Date.now,
        },

        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Force fresh model in development to reflect schema changes immediately
if (process.env.NODE_ENV === "development") {
    try {
        mongoose.deleteModel("Property");
    } catch (e) {
        // Model might not have been registered yet
    }
}

const Property = mongoose.models.Property || mongoose.model("Property", PropertySchema);

export default Property;