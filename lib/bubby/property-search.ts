import Property from "@/models/Property";
import { connectDB } from "@/lib/mongoose";
import {
    getPublicPropertyFilter,
    publicPropertySort,
} from "@/lib/property-filters";

import type {
    BubbyPropertyResult,
    BubbySearchFilters,
    BubbySort,
} from "@/lib/bubby/types";

const MAX_RESULTS = 8;

interface RawProperty {
    _id?: unknown;
    propertyType?: unknown;
    commercialType?: unknown;
    address?: unknown;
    locality?: unknown;
    city?: unknown;
    state?: unknown;
    description?: unknown;
    price?: unknown;
    priceType?: unknown;
    negotiable?: unknown;
    bedrooms?: unknown;
    bathrooms?: unknown;
    size?: unknown;
    sizeUnit?: unknown;
    purpose?: unknown;
    featured?: unknown;
    images?: unknown;
    amenities?: unknown;
}

export interface BubbyPropertyMatch
    extends BubbyPropertyResult {
    description?: string;
}

export async function searchProperties(
    filters: BubbySearchFilters,
): Promise<BubbyPropertyMatch[]> {
    await connectDB();

    const clauses: Record<string, unknown>[] = [
        getPublicPropertyFilter(),
    ];

    addPurposeFilter(clauses, filters);
    addTextFilters(clauses, filters);
    addNumberFilters(clauses, filters);
    addAmenityFilters(clauses, filters);

    if (filters.propertyType) {
        clauses.push({
            propertyType: filters.propertyType,
        });
    }

    if (filters.commercialType) {
        clauses.push({
            commercialType: filters.commercialType,
        });
    }

    if (filters.negotiable !== null) {
        clauses.push({
            negotiable: filters.negotiable,
        });
    }

    const query =
        clauses.length === 1
            ? clauses[0]
            : {
                $and: clauses,
            };

    const rawProperties = (await Property.find(
        query,
    )
        .select({
            _id: 1,
            propertyType: 1,
            commercialType: 1,
            address: 1,
            locality: 1,
            city: 1,
            state: 1,
            description: 1,
            price: 1,
            priceType: 1,
            negotiable: 1,
            bedrooms: 1,
            bathrooms: 1,
            size: 1,
            sizeUnit: 1,
            purpose: 1,
            featured: 1,
            images: 1,
            amenities: 1,
            promotedUntil: 1,
            createdAt: 1,
        })
        .sort(getSort(filters.sort))
        .limit(MAX_RESULTS)
        .lean()
        .exec()) as unknown as RawProperty[];

    return rawProperties
        .map(toPropertyMatch)
        .filter(
            (
                property,
            ): property is BubbyPropertyMatch =>
                property !== null,
        );
}

function addPurposeFilter(
    clauses: Record<string, unknown>[],
    filters: BubbySearchFilters,
): void {
    switch (filters.listingPurpose) {
        case "sale":
            clauses.push({
                purpose: {
                    $in: ["Sell", "Buy"],
                },
            });
            break;

        case "rent":
            clauses.push({
                purpose: "Rent",
            });
            break;

        case "pg":
            clauses.push({
                purpose: "PG/CO-Living",
            });
            break;

        default:
            break;
    }
}

function addTextFilters(
    clauses: Record<string, unknown>[],
    filters: BubbySearchFilters,
): void {
    if (filters.city) {
        clauses.push({
            city: createSafeRegex(filters.city),
        });
    }

    if (filters.locality) {
        const localityRegex = createSafeRegex(
            filters.locality,
        );

        clauses.push({
            $or: [
                {
                    locality: localityRegex,
                },
                {
                    address: localityRegex,
                },
                {
                    landmark: localityRegex,
                },
            ],
        });
    }

    if (filters.searchText) {
        const searchRegex = createSafeRegex(
            filters.searchText,
        );

        clauses.push({
            $or: [
                {
                    address: searchRegex,
                },
                {
                    locality: searchRegex,
                },
                {
                    city: searchRegex,
                },
                {
                    state: searchRegex,
                },
                {
                    landmark: searchRegex,
                },
                {
                    description: searchRegex,
                },
                {
                    propertyType: searchRegex,
                },
                {
                    commercialType: searchRegex,
                },
            ],
        });
    }
}

function addNumberFilters(
    clauses: Record<string, unknown>[],
    filters: BubbySearchFilters,
): void {
    const priceRange: Record<string, number> = {};

    if (filters.minPrice !== null) {
        priceRange.$gte = filters.minPrice;
    }

    if (filters.maxPrice !== null) {
        priceRange.$lte = filters.maxPrice;
    }

    if (Object.keys(priceRange).length > 0) {
        clauses.push({
            price: priceRange,
        });
    }

    const bedroomRange: Record<string, number> = {};

    if (filters.minBedrooms !== null) {
        bedroomRange.$gte = filters.minBedrooms;
    }

    if (filters.maxBedrooms !== null) {
        bedroomRange.$lte = filters.maxBedrooms;
    }

    if (
        Object.keys(bedroomRange).length > 0
    ) {
        clauses.push({
            bedrooms: bedroomRange,
        });
    }

    const bathroomRange: Record<
        string,
        number
    > = {};

    if (filters.minBathrooms !== null) {
        bathroomRange.$gte =
            filters.minBathrooms;
    }

    if (filters.maxBathrooms !== null) {
        bathroomRange.$lte =
            filters.maxBathrooms;
    }

    if (
        Object.keys(bathroomRange).length > 0
    ) {
        clauses.push({
            bathrooms: bathroomRange,
        });
    }

    const sizeRange: Record<string, number> = {};

    if (filters.minSize !== null) {
        sizeRange.$gte = filters.minSize;
    }

    if (filters.maxSize !== null) {
        sizeRange.$lte = filters.maxSize;
    }

    if (Object.keys(sizeRange).length > 0) {
        clauses.push({
            size: sizeRange,
        });
    }
}

function addAmenityFilters(
    clauses: Record<string, unknown>[],
    filters: BubbySearchFilters,
): void {
    for (const amenity of filters.amenities.slice(
        0,
        5,
    )) {
        clauses.push({
            amenities: createSafeRegex(amenity),
        });
    }
}

function getSort(
    sort: BubbySort,
): Record<string, 1 | -1> {
    switch (sort) {
        case "newest":
            return {
                createdAt: -1,
                _id: -1,
            };

        case "price_low":
            return {
                price: 1,
                createdAt: -1,
            };

        case "price_high":
            return {
                price: -1,
                createdAt: -1,
            };

        default:
            return publicPropertySort;
    }
}

function createSafeRegex(value: string): RegExp {
    const escapedValue = value
        .trim()
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return new RegExp(escapedValue, "i");
}

function toPropertyMatch(
    raw: RawProperty,
): BubbyPropertyMatch | null {
    const id = toId(raw._id);
    const address = toRequiredString(raw.address);
    const city = toRequiredString(raw.city);

    if (!id || !address || !city) {
        return null;
    }

    const images = toStringArray(raw.images);
    const amenities = toStringArray(
        raw.amenities,
    ).slice(0, 12);

    return {
        id,
        propertyType:
            toOptionalString(raw.propertyType) ||
            "Property",
        commercialType: toOptionalString(
            raw.commercialType,
        ),
        address,
        locality: toOptionalString(raw.locality),
        city,
        state: toOptionalString(raw.state),
        description: truncate(
            toOptionalString(raw.description),
            500,
        ),
        price: toNumber(raw.price) ?? 0,
        priceType: toOptionalString(raw.priceType),
        negotiable: toBoolean(raw.negotiable),
        bedrooms: toNumber(raw.bedrooms),
        bathrooms: toNumber(raw.bathrooms),
        size: toNumber(raw.size),
        sizeUnit: toOptionalString(raw.sizeUnit),
        purpose:
            toOptionalString(raw.purpose) ||
            "Sell",
        featured: raw.featured === true,
        image: images[0],
        amenities,
        url: `/property/${id}`,
    };
}

function toId(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }

    if (
        value &&
        typeof value === "object" &&
        "toString" in value &&
        typeof value.toString === "function"
    ) {
        return value.toString();
    }

    return "";
}

function toRequiredString(
    value: unknown,
): string {
    return typeof value === "string"
        ? value.trim()
        : "";
}

function toOptionalString(
    value: unknown,
): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const trimmedValue = value.trim();

    return trimmedValue || undefined;
}

function toNumber(
    value: unknown,
): number | undefined {
    return typeof value === "number" &&
    Number.isFinite(value)
        ? value
        : undefined;
}

function toBoolean(
    value: unknown,
): boolean | undefined {
    return typeof value === "boolean"
        ? value
        : undefined;
}

function toStringArray(
    value: unknown,
): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            (item): item is string =>
                typeof item === "string",
        )
        .map((item) => item.trim())
        .filter(Boolean);
}

function truncate(
    value: string | undefined,
    maximumLength: number,
): string | undefined {
    if (!value) {
        return undefined;
    }

    return value.length <= maximumLength
        ? value
        : `${value.slice(0, maximumLength)}…`;
}