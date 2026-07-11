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
            default: "sqft",
        },
        uds: Number,
        dimensions: String,
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

        // ⭐ Extras
        amenities: {
            type: [String],
            default: [],
        },

        status: {
            type: String,
            enum: ["active", "sold", "inactive"],
            default: "active",
        },

        featured: {
            type: Boolean,
            default: false,
        },

        // 🖼 Images
        images: {
            type: [String],
            default: [],
        },

        videoLinks: {
            type: [String],
            default: [],
        },

        brochure: {
            url: {
                type: String,
                required: false,
            },
            fileName: {
                type: String,
                required: false,
                maxlength: 200,
            },
        },

        // 💳 Plan Snapshot
        planSnapshot: {
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
            listingDays: {
                type: Number,
                default: 30,
            },
            maxPhotos: {
                type: Number,
                default: 5,
            },
            maxVideoLinks: {
                type: Number,
                default: 0,
            },
            featured: {
                type: Boolean,
                default: false,
            },

            homepageFeatured: {
                type: Boolean,
                default: false,
            },

            rankingLevel: {
                type: String,
                enum: ["standard", "featured", "priority", "top"],
                default: "standard",
            },

            compareVisibility: {
                type: String,
                enum: ["standard", "highlighted", "priority"],
                default: "standard",
            },

            badgeLevel: {
                type: String,
                enum: ["none", "verified", "premium"],
                default: "none",
            },

            analyticsLevel: {
                type: String,
                enum: ["none", "basic", "advanced", "project", "portfolio"],
                default: "none",
            },
        },

        listingExpiresAt: {
            type: Date,
            required: false,
        },

        promotedUntil: {
            type: Date,
            required: false,
        },

        // 📈 Analytics
        analytics: {
            views: { type: Number, default: 0 },
            phoneClicks: { type: Number, default: 0 },
            favoritesCount: { type: Number, default: 0 },
            dailyStats: [
                {
                    date: String,
                    views: { type: Number, default: 0 },
                    phoneClicks: { type: Number, default: 0 },
                },
            ],
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