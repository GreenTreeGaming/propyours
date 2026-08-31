import mongoose from "mongoose";

const PropertySchema =
    new mongoose.Schema(
        {
            userId: {
                type:
                mongoose.Schema.Types
                    .ObjectId,
                ref: "User",
                required: true,
            },

            description: {
                type: String,
                maxlength: 2000,
            },

            /*
             * "Buy" remains in the schema only for
             * legacy records. New listing routes accept
             * Sell, Rent and PG/CO-Living.
             */
            purpose: {
                type: String,
                enum: [
                    "Buy",
                    "Sell",
                    "Rent",
                    "PG/CO-Living",
                ],
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

            /*
             * Commercial stays the public broad type.
             * This field identifies the exact business
             * property while preserving existing filters.
             */
            commercialType: {
                type: String,
                enum: [
                    "Office Space",
                    "Co-working Space",
                    "Business Centre",
                    "Commercial Building",
                    "Shop",
                    "Showroom",
                    "Restaurant / Cafe",
                    "Hotel / Resort",
                    "Warehouse / Godown",
                    "Industrial Shed",
                    "Factory",
                    "Clinic / Hospital",
                    "School / Institution",
                    "Commercial Land",
                ],
                default: null,
            },

            address: {
                type: String,
                required: true,
            },
            locality: String,
            city: {
                type: String,
                required: true,
            },
            state: String,
            landmark: String,

            size: {
                type: Number,
                required: true,
            },
            sizeUnit: {
                type: String,
                enum: [
                    "sqft",
                    "sqyd",
                    "sqm",
                    "acre",
                    "kanal",
                    "marla",
                ],
                default: "sqft",
            },
            uds: Number,
            dimensions: String,
            ownershipType: {
                type: String,
                enum: [
                    "Freehold",
                    "Leasehold",
                    "Co-operative",
                    "Power of Attorney",
                ],
            },

            /*
             * For Commercial listings, bathrooms is
             * presented as washrooms in the UI and
             * floors remains the total floor count.
             */
            bedrooms: Number,
            bathrooms: Number,
            floors: Number,

            price: {
                type: Number,
                required: true,
            },
            priceType: {
                type: String,
                enum: [
                    "Total",
                    "Per Sq Ft",
                ],
                default: "Total",
            },
            negotiable: {
                type: Boolean,
                default: true,
            },

            amenities: {
                type: [String],
                default: [],
            },

            status: {
                type: String,
                enum: [
                    "active",
                    "sold",
                    "inactive",
                ],
                default: "active",
            },

            featured: {
                type: Boolean,
                default: false,
            },

            zeroCommission: {
                type: Boolean,
                default: false,
            },

            commissionType: {
                type: String,
                enum: [
                    "zero",
                    "applicable",
                ],
                required: false,
            },

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

                        "agent-ruby",
                        "agent-emerald",
                        "agent-diamond",
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
                    enum: [
                        "standard",
                        "featured",
                        "priority",
                        "top",
                    ],
                    default: "standard",
                },
                compareVisibility: {
                    type: String,
                    enum: [
                        "standard",
                        "highlighted",
                        "priority",
                    ],
                    default: "standard",
                },
                badgeLevel: {
                    type: String,
                    enum: [
                        "none",
                        "verified",
                        "premium",
                    ],
                    default: "none",
                },
                analyticsLevel: {
                    type: String,
                    enum: [
                        "none",
                        "basic",
                        "advanced",
                        "project",
                        "portfolio",
                    ],
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

            analytics: {
                views: {
                    type: Number,
                    default: 0,
                },
                phoneClicks: {
                    type: Number,
                    default: 0,
                },
                favoritesCount: {
                    type: Number,
                    default: 0,
                },
                dailyStats: [
                    {
                        date: String,
                        views: {
                            type: Number,
                            default: 0,
                        },
                        phoneClicks: {
                            type: Number,
                            default: 0,
                        },
                    },
                ],
            },
        },
        {
            timestamps: true,
        },
    );

PropertySchema.index({
    status: 1,
    purpose: 1,
    city: 1,
    propertyType: 1,
    price: 1,
    createdAt: -1,
});

PropertySchema.index({
    status: 1,
    featured: 1,
    promotedUntil: -1,
    createdAt: -1,
});

PropertySchema.index({
    userId: 1,
    status: 1,
    createdAt: -1,
});

PropertySchema.index({
    status: 1,
    listingExpiresAt: 1,
});

PropertySchema.index({
    "planSnapshot.rankingLevel": 1,
    createdAt: -1,
});

const Property =
    mongoose.models.Property ||
    mongoose.model(
        "Property",
        PropertySchema,
    );

export default Property;
