import { TAMIL_NADU_LOCATIONS } from "@/lib/locations";

export const PROPERTY_PURPOSES = [
    "Sell",
    "Rent",
    "PG/CO-Living",
] as const;

export type PropertyPurpose =
    (typeof PROPERTY_PURPOSES)[number];

export const PROPERTY_CATEGORIES = [
    {
        value: "residential",
        label: "Residential",
        description:
            "Apartments, houses, villas and other homes.",
    },
    {
        value: "land",
        label: "Land & plots",
        description:
            "Residential plots, farm land and agricultural land.",
    },
    {
        value: "commercial",
        label: "Commercial",
        description:
            "Offices, shops, showrooms, warehouses and business spaces.",
    },
] as const;

export type PropertyCategory =
    (typeof PROPERTY_CATEGORIES)[number]["value"];

export const RESIDENTIAL_PROPERTY_TYPES = [
    "Apartment",
    "Independent House",
    "Independent Floor",
    "Duplex",
    "Villa",
    "Penthouse",
    "Farm House",
] as const;

export const LAND_PROPERTY_TYPES = [
    "Plot",
    "Agricultural Land",
] as const;

export const COMMERCIAL_TYPE_GROUPS = [
    {
        label: "Office & workspaces",
        items: [
            {
                value: "Office Space",
                description:
                    "Private offices, corporate floors and managed office space.",
            },
            {
                value: "Co-working Space",
                description:
                    "Shared desks, cabins and flexible workspaces.",
            },
            {
                value: "Business Centre",
                description:
                    "Serviced offices and multi-business facilities.",
            },
            {
                value: "Commercial Building",
                description:
                    "Entire buildings designed for business use.",
            },
        ],
    },
    {
        label: "Retail & hospitality",
        items: [
            {
                value: "Shop",
                description:
                    "Retail units in streets, markets or commercial complexes.",
            },
            {
                value: "Showroom",
                description:
                    "High-visibility display and sales space.",
            },
            {
                value: "Restaurant / Cafe",
                description:
                    "Food-service premises and dining spaces.",
            },
            {
                value: "Hotel / Resort",
                description:
                    "Hospitality properties and lodging businesses.",
            },
        ],
    },
    {
        label: "Industrial & storage",
        items: [
            {
                value: "Warehouse / Godown",
                description:
                    "Storage, logistics and distribution premises.",
            },
            {
                value: "Industrial Shed",
                description:
                    "Production, assembly or heavy-use shed space.",
            },
            {
                value: "Factory",
                description:
                    "Industrial manufacturing property.",
            },
        ],
    },
    {
        label: "Special-use commercial",
        items: [
            {
                value: "Clinic / Hospital",
                description:
                    "Medical, diagnostic and healthcare premises.",
            },
            {
                value: "School / Institution",
                description:
                    "Educational, training and institutional buildings.",
            },
            {
                value: "Commercial Land",
                description:
                    "Land approved or intended for commercial development.",
            },
        ],
    },
] as const;

export const COMMERCIAL_TYPES =
    COMMERCIAL_TYPE_GROUPS.flatMap((group) =>
        group.items.map((item) => item.value),
    );

export type CommercialType =
    (typeof COMMERCIAL_TYPES)[number];

export const PROPERTY_TYPES = [
    ...RESIDENTIAL_PROPERTY_TYPES,
    ...LAND_PROPERTY_TYPES,
    "Commercial",
] as const;

export type PropertyType =
    (typeof PROPERTY_TYPES)[number];

export const SIZE_UNITS = [
    { value: "sqft", label: "Sq Ft" },
    { value: "sqyd", label: "Sq Yd" },
    { value: "sqm", label: "Sq M" },
    { value: "acre", label: "Acre" },
    { value: "kanal", label: "Kanal" },
    { value: "marla", label: "Marla" },
] as const;

export const OWNERSHIP_TYPES = [
    "Freehold",
    "Leasehold",
    "Co-operative / Society",
    "Power of Attorney",
] as const;

export const PRICE_TYPES = [
    "Total",
    "Per Sq Ft",
] as const;

export const RESIDENTIAL_AMENITY_CATEGORIES = [
    {
        name: "Security & safety",
        amenities: [
            "24x7 Security",
            "CCTV Surveillance",
            "Intercom Facility",
            "Fire Alarm System",
            "Gated Community",
            "Security Cabin",
        ],
    },
    {
        name: "Infrastructure & utility",
        amenities: [
            "Power Backup",
            "Lift",
            "Water Source (Borewell)",
            "Water Source (Corporation)",
            "Water Storage",
            "Rain Water Harvesting",
            "Sewage Treatment Plant",
            "Gas Pipeline",
        ],
    },
    {
        name: "Leisure & lifestyle",
        amenities: [
            "Clubhouse",
            "Gymnasium",
            "Swimming Pool",
            "Kids Play Area",
            "Jogging Track",
            "Party Hall",
            "Library",
            "Indoor Games",
        ],
    },
    {
        name: "Comfort & convenience",
        amenities: [
            "Covered Parking",
            "Visitor Parking",
            "Servant Room",
            "Vastu Compliant",
            "Internet/Wi-Fi",
            "Laundry Service",
        ],
    },
    {
        name: "Green & eco",
        amenities: [
            "Park/Garden",
            "Waste Disposal",
            "Organic Waste Converter",
            "Compound Wall",
        ],
    },
] as const;

/*
 * Backward-compatible alias for existing forms that
 * still import the original residential amenity list.
 */
export const AMENITY_CATEGORIES =
    RESIDENTIAL_AMENITY_CATEGORIES;

export const LAND_AMENITY_CATEGORIES = [
    {
        name: "Access & boundaries",
        amenities: [
            "Compound Wall",
            "Fencing",
            "Gated Entry",
            "Main Road Facing",
            "Corner Plot",
            "Internal Road Access",
        ],
    },
    {
        name: "Utilities",
        amenities: [
            "Electricity Connection",
            "Borewell",
            "Corporation Water",
            "Drainage Connection",
            "Street Lights",
        ],
    },
    {
        name: "Land features",
        amenities: [
            "Vastu Compliant",
            "Levelled Land",
            "Clear Approach Road",
            "Rain Water Harvesting",
            "Farm Access",
        ],
    },
] as const;

export const COMMERCIAL_AMENITY_CATEGORIES = [
    {
        name: "Access & safety",
        amenities: [
            "24x7 Access",
            "24x7 Security",
            "CCTV Surveillance",
            "Fire Safety System",
            "Emergency Exit",
            "Security Cabin",
        ],
    },
    {
        name: "Business infrastructure",
        amenities: [
            "Power Backup",
            "Central AC",
            "Lift",
            "Goods Lift",
            "High-Speed Internet",
            "Reception Area",
            "Conference Room",
            "Pantry",
        ],
    },
    {
        name: "Parking & logistics",
        amenities: [
            "Dedicated Parking",
            "Visitor Parking",
            "Loading Bay",
            "Service Entry",
            "Truck Access",
            "Main Road Facing",
        ],
    },
    {
        name: "Retail visibility",
        amenities: [
            "Ground Floor Access",
            "Display Window",
            "Signage Space",
            "Corner Property",
            "High Footfall Location",
            "Mall / Complex Location",
        ],
    },
    {
        name: "Utilities & compliance",
        amenities: [
            "Private Washroom",
            "Common Washroom",
            "Water Storage",
            "Gas Pipeline",
            "Sewage Treatment Plant",
            "Waste Disposal",
            "Vastu Compliant",
        ],
    },
] as const;

export const TAMIL_NADU_CITIES = Object.keys(
    TAMIL_NADU_LOCATIONS,
).sort((first, second) =>
    first.localeCompare(second),
);

export function getTamilNaduLocalities(
    city: string,
): string[] {
    const values =
        TAMIL_NADU_LOCATIONS[city] ?? [];

    return values
        .filter((value) => value !== "All")
        .sort((first, second) =>
            first.localeCompare(second),
        );
}

export function getPropertyCategory(
    propertyType: string,
): PropertyCategory {
    if (propertyType === "Commercial") {
        return "commercial";
    }

    if (
        (
            LAND_PROPERTY_TYPES as readonly string[]
        ).includes(propertyType)
    ) {
        return "land";
    }

    return "residential";
}

export function getPropertyTypesForCategory(
    category: PropertyCategory,
): readonly string[] {
    if (category === "land") {
        return LAND_PROPERTY_TYPES;
    }

    if (category === "commercial") {
        return ["Commercial"];
    }

    return RESIDENTIAL_PROPERTY_TYPES;
}

export function isLandPropertyType(
    propertyType: string,
): boolean {
    return (
        (
            LAND_PROPERTY_TYPES as readonly string[]
        ).includes(propertyType)
    );
}

export function isCommercialPropertyType(
    propertyType: string,
): boolean {
    return propertyType === "Commercial";
}

export function isCommercialType(
    value: unknown,
): value is CommercialType {
    return (
        typeof value === "string" &&
        (
            COMMERCIAL_TYPES as readonly string[]
        ).includes(value)
    );
}

export function getAmenityCategories(
    category: PropertyCategory,
) {
    if (category === "commercial") {
        return COMMERCIAL_AMENITY_CATEGORIES;
    }

    if (category === "land") {
        return LAND_AMENITY_CATEGORIES;
    }

    return RESIDENTIAL_AMENITY_CATEGORIES;
}
