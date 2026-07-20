export const BUBBY_PROPERTY_TYPES = [
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
] as const;

export const BUBBY_COMMERCIAL_TYPES = [
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
] as const;

export const BUBBY_LISTING_PURPOSES = [
    "sale",
    "rent",
    "pg",
] as const;

export const BUBBY_SORT_OPTIONS = [
    "recommended",
    "newest",
    "price_low",
    "price_high",
] as const;

export type BubbyPropertyType =
    (typeof BUBBY_PROPERTY_TYPES)[number];

export type BubbyCommercialType =
    (typeof BUBBY_COMMERCIAL_TYPES)[number];

export type BubbyListingPurpose =
    (typeof BUBBY_LISTING_PURPOSES)[number];

export type BubbySort =
    (typeof BUBBY_SORT_OPTIONS)[number];

export type BubbyIntent =
    | "property_search"
    | "site_help"
    | "out_of_scope";

export type BubbyChatRole = "user" | "assistant";

export interface BubbyChatMessage {
    role: BubbyChatRole;
    content: string;
}

export interface BubbySearchFilters {
    listingPurpose: BubbyListingPurpose | null;
    propertyType: BubbyPropertyType | null;
    commercialType: BubbyCommercialType | null;
    city: string | null;
    locality: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    minBedrooms: number | null;
    maxBedrooms: number | null;
    minSize: number | null;
    maxSize: number | null;
    amenities: string[];
    negotiable: boolean | null;
    sort: BubbySort;
    searchText: string | null;
}

export interface BubbyAnalysis {
    intent: BubbyIntent;
    filters: BubbySearchFilters;
}

export interface BubbyPropertyResult {
    id: string;
    propertyType: string;
    commercialType?: string;
    address: string;
    locality?: string;
    city: string;
    state?: string;
    price: number;
    priceType?: string;
    negotiable?: boolean;
    bedrooms?: number;
    bathrooms?: number;
    size?: number;
    sizeUnit?: string;
    purpose: string;
    featured: boolean;
    image?: string;
    amenities: string[];
    url: string;
}

export interface BubbyActionLink {
    label: string;
    href: string;
    description?: string;
}

export interface BubbyApiResponse {
    reply: string;
    properties: BubbyPropertyResult[];
    actions: BubbyActionLink[];
}