import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import User from "@/models/User";
import { getPublicPropertyFilter } from "@/lib/property-filters";
import { toPublicUserProfile } from "@/lib/public-user";
import {
    getAuthenticatedUser,
    getOptionalAuthenticatedUser,
    isAuthError,
} from "@/lib/auth";
import { getPlanLimits } from "@/lib/plans";
import {
    deleteListing,
    ListingCapacityError,
} from "@/lib/listing-capacity";
import {
    deleteUploadThingFilesByUrls,
} from "@/lib/uploadthing-storage";
import {
    findInappropriateField,
} from "@/lib/content-moderation";
import {
    LAND_PROPERTY_TYPES,
    PROPERTY_PURPOSES,
    PROPERTY_TYPES,
    isCommercialType,
} from "@/lib/property-form-options";

function cleanStringArray(
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

function isValidImageUrl(url: string) {
    return (
        url.startsWith("https://") &&
        (url.includes("utfs.io") ||
            url.includes("uploadthing") ||
            url.includes("ufs.sh"))
    );
}

function isValidVideoUrl(url: string) {
    try {
        const parsed = new URL(url);

        return [
            "youtube.com",
            "www.youtube.com",
            "youtu.be",
            "vimeo.com",
            "www.vimeo.com",
        ].includes(parsed.hostname);
    } catch {
        return false;
    }
}

function isValidUploadThingUrl(
    url: string,
) {
    try {
        const parsed = new URL(url);

        return (
            parsed.protocol === "https:" &&
            (parsed.hostname.endsWith(
                    "utfs.io",
                ) ||
                parsed.hostname.endsWith(
                    "ufs.sh",
                ) ||
                parsed.hostname.includes(
                    "uploadthing",
                ))
        );
    } catch {
        return false;
    }
}

const ALLOWED_SIZE_UNITS = [
    "sqft",
    "sqyd",
    "sqm",
    "acre",
    "kanal",
    "marla",
] as const;

interface SanitizedUnitConfiguration {
    bedrooms: number;
    size: number;
    sizeUnit:
        (typeof ALLOWED_SIZE_UNITS)[number];
    uds: number | null;
    price: number;
}

function parseUnitConfigurations(
    value: unknown,
):
    | {
    success: true;
    units: SanitizedUnitConfiguration[];
}
    | {
    success: false;
    error: string;
} {
    if (!Array.isArray(value)) {
        return {
            success: false,
            error:
                "Unit configurations must be an array.",
        };
    }

    if (value.length > 50) {
        return {
            success: false,
            error:
                "A property can have at most 50 unit configurations.",
        };
    }

    const units:
        SanitizedUnitConfiguration[] =
        [];

    for (const configuration of value) {
        if (
            typeof configuration !==
            "object" ||
            configuration === null
        ) {
            return {
                success: false,
                error:
                    "One or more unit configurations are invalid.",
            };
        }

        const record =
            configuration as Record<
                string,
                unknown
            >;

        const bedrooms =
            record.bedrooms;

        const size =
            record.size;

        const sizeUnit =
            record.sizeUnit;

        const uds =
            record.uds;

        const price =
            record.price;

        if (
            typeof bedrooms !== "number" ||
            !Number.isFinite(
                bedrooms,
            ) ||
            !Number.isInteger(
                bedrooms,
            ) ||
            bedrooms < 0 ||
            bedrooms > 20
        ) {
            return {
                success: false,
                error:
                    "BHK must be a whole number between 0 and 20.",
            };
        }

        if (
            typeof size !== "number" ||
            !Number.isFinite(size) ||
            size <= 0
        ) {
            return {
                success: false,
                error:
                    "Every unit must have a valid built-up size.",
            };
        }

        if (
            typeof sizeUnit !==
            "string" ||
            !(
                ALLOWED_SIZE_UNITS as readonly string[]
            ).includes(sizeUnit)
        ) {
            return {
                success: false,
                error:
                    "Every unit must have a valid size unit.",
            };
        }

        const normalizedUds =
            uds === null ||
            uds === undefined ||
            uds === ""
                ? null
                : uds;

        if (
            normalizedUds !== null &&
            (
                typeof normalizedUds !==
                "number" ||
                !Number.isFinite(
                    normalizedUds,
                ) ||
                normalizedUds < 0 ||
                normalizedUds > 100
            )
        ) {
            return {
                success: false,
                error:
                    "Unit UDS must be between 0% and 100%.",
            };
        }

        if (
            typeof price !== "number" ||
            !Number.isFinite(price) ||
            price <= 0
        ) {
            return {
                success: false,
                error:
                    "Every unit must have a valid asking price.",
            };
        }

        units.push({
            bedrooms,
            size,

            sizeUnit:
                sizeUnit as SanitizedUnitConfiguration["sizeUnit"],

            uds:
                normalizedUds === null
                    ? null
                    : normalizedUds,

            price,
        });
    }

    return {
        success: true,
        units,
    };
}


async function getUnreferencedMediaUrls(
    values: Array<
        string | null | undefined
    >,
    excludedPropertyId?: string,
): Promise<string[]> {
    const urls = Array.from(
        new Set(
            values.filter(
                (value): value is string =>
                    typeof value === "string" &&
                    value.trim().length > 0,
            ),
        ),
    );

    if (urls.length === 0) {
        return [];
    }

    const query: Record<
        string,
        unknown
    > = {
        $or: [
            {
                images: {
                    $in: urls,
                },
            },
            {
                "brochure.url": {
                    $in: urls,
                },
            },
        ],
    };

    if (excludedPropertyId) {
        query._id = {
            $ne: excludedPropertyId,
        };
    }

    const references =
        await Property.find(query)
            .select("images brochure.url")
            .lean();

    const referencedUrls =
        new Set<string>();

    for (const reference of references) {
        for (const image of
        reference.images ?? []) {
            if (urls.includes(image)) {
                referencedUrls.add(image);
            }
        }

        const brochureUrl =
            reference.brochure?.url;

        if (
            brochureUrl &&
            urls.includes(brochureUrl)
        ) {
            referencedUrls.add(
                brochureUrl,
            );
        }
    }

    return urls.filter(
        (url) =>
            !referencedUrls.has(url),
    );
}

async function cleanUpPropertyMedia(
    values: Array<
        string | null | undefined
    >,
    excludedPropertyId?: string,
) {
    const unreferencedUrls =
        await getUnreferencedMediaUrls(
            values,
            excludedPropertyId,
        );

    return deleteUploadThingFilesByUrls(
        unreferencedUrls,
    );
}

export async function GET(
    req: Request,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    },
) {
    try {
        await connectDB();

        const viewer =
            await getOptionalAuthenticatedUser();

        const canViewPrice =
            viewer !== null;

        const { id } = await params;

        const property =
            await Property.findOne(
                getPublicPropertyFilter({
                    _id: id,
                }),
            ).populate(
                "userId",
                "name role bio company city plan",
            );

        if (!property) {
            return NextResponse.json(
                {
                    error:
                        "Property not found",
                },
                {
                    status: 404,
                },
            );
        }

        const responseProperty =
            property.toObject();

        if (!canViewPrice) {
            responseProperty.price =
                null;

            (
                responseProperty as Record<
                    string,
                    unknown
                >
            ).priceLocked =
                true;
        } else {
            (
                responseProperty as Record<
                    string,
                    unknown
                >
            ).priceLocked =
                false;
        }

        if (
            responseProperty.userId &&
            typeof responseProperty.userId === "object"
        ) {
            responseProperty.userId =
                toPublicUserProfile(responseProperty.userId);
        }

        return NextResponse.json(responseProperty);
    } catch (error) {
        console.error(
            "Failed to fetch property:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Failed to fetch property",
            },
            {
                status: 500,
            },
        );
    }
}

export async function PUT(
    req: Request,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    },
) {
    try {
        const auth =
            await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        await connectDB();

        const { id } = await params;
        const body: Record<
            string,
            unknown
        > = await req.json();

        const inappropriateField =
            findInappropriateField({
                description:
                body.description,
                address:
                body.address,
                locality:
                body.locality,
                city:
                body.city,
                landmark:
                body.landmark,
                dimensions:
                body.dimensions,
            });

        if (inappropriateField) {
            return NextResponse.json(
                {
                    error:
                        "Your listing contains language that is not permitted. Please revise it and try again.",
                    field:
                    inappropriateField,
                },
                {
                    status: 400,
                },
            );
        }

        const property =
            await Property.findById(id);

        if (!property) {
            return NextResponse.json(
                {
                    error:
                        "Property not found",
                },
                {
                    status: 404,
                },
            );
        }

        if (
            property.userId.toString() !==
            auth.userId
        ) {
            return NextResponse.json(
                {
                    error:
                        "You are not allowed to update this property.",
                },
                {
                    status: 403,
                },
            );
        }

        const previousImages =
            cleanStringArray(
                property.images,
            );
        const previousBrochureUrl =
            typeof property.brochure?.url ===
            "string"
                ? property.brochure.url
                : null;

        const user =
            await User.findById(
                auth.userId,
            );

        if (!user) {
            return NextResponse.json(
                {
                    error: "User not found",
                },
                {
                    status: 404,
                },
            );
        }

        const nextPurpose =
            typeof body.purpose ===
            "string"
                ? body.purpose
                : property.purpose;

        const allowedPurposes: readonly string[] =
            property.purpose === "Buy"
                ? [...PROPERTY_PURPOSES, "Buy"]
                : PROPERTY_PURPOSES;

        if (
            !allowedPurposes.includes(
                nextPurpose,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Select a valid listing purpose.",
                },
                {
                    status: 400,
                },
            );
        }

        const nextPropertyType =
            typeof body.propertyType ===
            "string"
                ? body.propertyType
                : property.propertyType;

        if (
            !(
                PROPERTY_TYPES as readonly string[]
            ).includes(nextPropertyType)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Select a valid property type.",
                },
                {
                    status: 400,
                },
            );
        }

        let commercialType:
            | string
            | null
            | undefined;

        if (
            nextPropertyType ===
            "Commercial"
        ) {
            const candidate =
                "commercialType" in body
                    ? body.commercialType
                    : property.commercialType;

            const isLegacyCommercialWithoutSubtype =
                property.propertyType ===
                "Commercial" &&
                !("commercialType" in body) &&
                (candidate === null ||
                    candidate === undefined ||
                    candidate === "");

            if (
                isLegacyCommercialWithoutSubtype
            ) {
                commercialType = undefined;
            } else {
                if (
                    !isCommercialType(
                        candidate,
                    )
                ) {
                    return NextResponse.json(
                        {
                            error:
                                "Select a valid commercial property type.",
                        },
                        {
                            status: 400,
                        },
                    );
                }

                commercialType = candidate;
            }
        } else if (
            "commercialType" in body ||
            property.propertyType ===
            "Commercial"
        ) {
            commercialType = null;
        }

        const isLand = (
            LAND_PROPERTY_TYPES as readonly string[]
        ).includes(nextPropertyType);

        if (
            nextPurpose ===
            "PG/CO-Living" &&
            (isLand ||
                nextPropertyType ===
                "Commercial")
        ) {
            return NextResponse.json(
                {
                    error:
                        "PG/CO-Living is only available for residential properties.",
                },
                {
                    status: 400,
                },
            );
        }

        const isCommercial =
            nextPropertyType ===
            "Commercial";

        let unitConfigurations:
            | SanitizedUnitConfiguration[]
            | undefined;

        if (isLand || isCommercial) {
            /*
             * Residential-only data must not
             * survive after changing the property
             * to land or commercial.
             */
            unitConfigurations = [];
        } else if (
            "unitConfigurations" in body
        ) {
            const parsedUnits =
                parseUnitConfigurations(
                    body.unitConfigurations,
                );

            if (!parsedUnits.success) {
                return NextResponse.json(
                    {
                        error:
                        parsedUnits.error,
                    },
                    {
                        status: 400,
                    },
                );
            }

            unitConfigurations =
                parsedUnits.units;
        }

        if ("uds" in body) {
            const uds = body.uds;

            if (
                uds !== null &&
                uds !== undefined &&
                (
                    typeof uds !== "number" ||
                    !Number.isFinite(uds) ||
                    uds < 0 ||
                    uds > 100
                )
            ) {
                return NextResponse.json(
                    {
                        error:
                            "UDS must be between 0% and 100%.",
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        if (
            "negotiable" in body &&
            typeof body.negotiable !==
            "boolean"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Negotiable must be either true or false.",
                },
                {
                    status: 400,
                },
            );
        }

        const limits =
            getPlanLimits(user);

        const images =
            "images" in body
                ? cleanStringArray(
                    body.images,
                )
                : previousImages;

        if (images.length === 0) {
            return NextResponse.json(
                {
                    error:
                        "Add at least one property image.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            images.length >
            limits.maxImages
        ) {
            return NextResponse.json(
                {
                    error: `Your ${limits.tier} plan allows up to ${limits.maxImages} image(s).`,
                },
                {
                    status: 403,
                },
            );
        }

        if (
            images.some(
                (url) =>
                    !isValidImageUrl(url),
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "One or more image URLs are invalid.",
                },
                {
                    status: 400,
                },
            );
        }

        const videoLinks =
            "videoLinks" in body
                ? cleanStringArray(
                    body.videoLinks,
                )
                : cleanStringArray(
                    property.videoLinks,
                );

        if (
            videoLinks.length >
            limits.maxVideoLinks
        ) {
            return NextResponse.json(
                {
                    error: `Your ${limits.tier} plan allows up to ${limits.maxVideoLinks} video link(s).`,
                },
                {
                    status: 403,
                },
            );
        }

        if (
            videoLinks.some(
                (url) =>
                    !isValidVideoUrl(url),
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Only YouTube and Vimeo video links are allowed.",
                },
                {
                    status: 400,
                },
            );
        }

        type BrochureData = {
            url: string;
            fileName: string;
        };

        let brochure:
            | BrochureData
            | null
            | undefined;

        if ("brochure" in body) {
            if (body.brochure === null) {
                brochure = null;
            } else {

                if (
                    typeof body.brochure !==
                    "object" ||
                    body.brochure === null ||
                    !(
                        "url" in
                        body.brochure
                    ) ||
                    typeof body.brochure
                        .url !== "string" ||
                    !isValidUploadThingUrl(
                        body.brochure.url,
                    )
                ) {
                    return NextResponse.json(
                        {
                            error:
                                "Invalid brochure.",
                        },
                        {
                            status: 400,
                        },
                    );
                }

                const fileName =
                    "fileName" in
                    body.brochure &&
                    typeof body.brochure
                        .fileName ===
                    "string"
                        ? body.brochure.fileName.trim()
                        : "";

                brochure = {
                    url: body.brochure.url,
                    fileName:
                        fileName.slice(0, 200) ||
                        "Property brochure.pdf",
                };
            }
        }

        const nextBrochureUrl =
            brochure === undefined
                ? previousBrochureUrl
                : brochure?.url ?? null;

        const allowedUpdates: Record<
            string,
            unknown
        > = {
            purpose: body.purpose,
            propertyType:
            body.propertyType,
            commercialType,
            description:
            body.description,
            address: body.address,
            locality: body.locality,
            city: body.city,
            state: body.state,
            landmark: body.landmark,

            developerName:
                typeof body.developerName === "string"
                    ? body.developerName
                        .trim()
                        .slice(0, 150)
                    : undefined,

            uds: body.uds,

            size: body.size,

            sizeUnit:
            body.sizeUnit,

            unitConfigurations,

            dimensions:
            body.dimensions,
            ownershipType:
            body.ownershipType,
            price: body.price,
            priceType:
            body.priceType,
            negotiable:
            body.negotiable,
            bedrooms: isLand
                ? null
                : body.bedrooms,
            bathrooms: isLand
                ? null
                : body.bathrooms,
            floors: isLand
                ? null
                : body.floors,
            amenities: Array.isArray(
                body.amenities,
            )
                ? body.amenities
                : undefined,
            images,
            videoLinks,
            brochure,
        };

        Object.keys(
            allowedUpdates,
        ).forEach((key) => {
            if (
                allowedUpdates[key] ===
                undefined
            ) {
                delete allowedUpdates[key];
            }
        });

        const updatedProperty =
            await Property.findByIdAndUpdate(
                id,
                {
                    $set: allowedUpdates,
                },
                {
                    new: true,
                    runValidators: true,
                },
            );

        const removedMediaUrls = [
            ...previousImages.filter(
                (url) =>
                    !images.includes(url),
            ),
            previousBrochureUrl &&
            previousBrochureUrl !==
            nextBrochureUrl
                ? previousBrochureUrl
                : null,
        ];

        let mediaCleanup:
            | {
            deletedCount: number;
            ignoredUrls: string[];
        }
            | {
            deletedCount: 0;
            warning: string;
        };

        try {
            const cleanupResult =
                await cleanUpPropertyMedia(
                    removedMediaUrls,
                    id,
                );

            mediaCleanup = {
                deletedCount:
                cleanupResult.deletedCount,
                ignoredUrls:
                cleanupResult.ignoredUrls,
            };
        } catch (cleanupError) {
            console.error(
                "Property updated, but old UploadThing media could not be deleted:",
                cleanupError,
            );

            mediaCleanup = {
                deletedCount: 0,
                warning:
                    "The property was updated, but some old media may still require cleanup.",
            };
        }

        return NextResponse.json({
            success: true,
            property:
            updatedProperty,
            mediaCleanup,
        });
    } catch (error) {
        console.error(
            "Failed to update property:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Failed to update property",
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(
    req: Request,
    {
        params,
    }: {
        params: Promise<{
            id: string;
        }>;
    },
) {
    try {
        const auth =
            await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        await connectDB();

        const { id } = await params;
        const property =
            await Property.findById(id);

        if (!property) {
            return NextResponse.json(
                {
                    error:
                        "Property not found",
                },
                {
                    status: 404,
                },
            );
        }

        if (
            property.userId.toString() !==
            auth.userId
        ) {
            return NextResponse.json(
                {
                    error:
                        "You are not allowed to delete this property.",
                },
                {
                    status: 403,
                },
            );
        }

        const propertyMediaUrls = [
            ...cleanStringArray(
                property.images,
            ),
            typeof property.brochure?.url ===
            "string"
                ? property.brochure.url
                : null,
        ];

        await deleteListing(
            auth.userId,
            id,
        );

        let mediaCleanup:
            | {
            deletedCount: number;
            ignoredUrls: string[];
        }
            | {
            deletedCount: 0;
            warning: string;
        };

        try {
            const cleanupResult =
                await cleanUpPropertyMedia(
                    propertyMediaUrls,
                );

            mediaCleanup = {
                deletedCount:
                cleanupResult.deletedCount,
                ignoredUrls:
                cleanupResult.ignoredUrls,
            };
        } catch (cleanupError) {
            console.error(
                "Property deleted, but UploadThing media cleanup failed:",
                cleanupError,
            );

            mediaCleanup = {
                deletedCount: 0,
                warning:
                    "The property was deleted, but some media may still require cleanup.",
            };
        }

        return NextResponse.json({
            success: true,
            message:
                "Property deleted successfully.",
            mediaCleanup,
        });
    } catch (error) {
        if (error instanceof ListingCapacityError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status },
            );
        }

        console.error(
            "Failed to delete property:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Failed to delete property",
            },
            {
                status: 500,
            },
        );
    }
}
