import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import {
    getAuthenticatedUser,
    isAuthError,
} from "@/lib/auth";
import { getPlanLimits } from "@/lib/plans";
import {
    createActiveListing,
    ListingCapacityError,
} from "@/lib/listing-capacity";
import {
    findInappropriateField,
} from "@/lib/content-moderation";
import {
    COMMERCIAL_TYPES,
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

function cleanText(
    value: unknown,
    maxLength: number,
): string {
    return typeof value === "string"
        ? value.trim().slice(0, maxLength)
        : "";
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

function isPositiveNumber(
    value: unknown,
): value is number {
    return (
        typeof value === "number" &&
        Number.isFinite(value) &&
        value > 0
    );
}

function isOptionalNonNegativeNumber(
    value: unknown,
): boolean {
    return (
        value === null ||
        value === undefined ||
        (typeof value === "number" &&
            Number.isFinite(value) &&
            value >= 0)
    );
}

export async function POST(
    req: Request,
) {
    try {
        const auth =
            await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        await connectDB();

        const user = await User.findById(
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

        const body: Record<
            string,
            unknown
        > = await req.json();

        if (
            typeof body.purpose !==
            "string" ||
            !(
                PROPERTY_PURPOSES as readonly string[]
            ).includes(body.purpose)
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

        if (
            typeof body.propertyType !==
            "string" ||
            !(
                PROPERTY_TYPES as readonly string[]
            ).includes(body.propertyType)
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

        const isCommercial =
            body.propertyType ===
            "Commercial";

        let commercialType:
            | string
            | null = null;

        if (isCommercial) {
            if (
                !isCommercialType(
                    body.commercialType,
                )
            ) {
                return NextResponse.json(
                    {
                        error: `Select a valid commercial property type. Supported values: ${COMMERCIAL_TYPES.join(
                            ", ",
                        )}.`,
                    },
                    {
                        status: 400,
                    },
                );
            }

            commercialType =
                body.commercialType;
        }

        const isLand = (
            LAND_PROPERTY_TYPES as readonly string[]
        ).includes(body.propertyType);

        if (
            body.purpose ===
            "PG/CO-Living" &&
            (isLand || isCommercial)
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

        const address = cleanText(
            body.address,
            300,
        );
        const locality = cleanText(
            body.locality,
            120,
        );
        const city = cleanText(
            body.city,
            120,
        );

        if (
            !address ||
            !locality ||
            !city
        ) {
            return NextResponse.json(
                {
                    error:
                        "Address, locality and city are required.",
                },
                {
                    status: 400,
                },
            );
        }

        const inappropriateField =
            findInappropriateField({
                description:
                body.description,
                address,
                locality,
                city,
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

        if (
            body.state !== "Tamil Nadu"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Properties can currently be listed only in Tamil Nadu.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            !isPositiveNumber(body.size)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Enter a valid property size.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            !isPositiveNumber(body.price)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Enter a valid asking price.",
                },
                {
                    status: 400,
                },
            );
        }

        for (const [
            field,
            value,
        ] of [
            ["uds", body.uds],
            ["bedrooms", body.bedrooms],
            ["bathrooms", body.bathrooms],
            ["floors", body.floors],
        ] as const) {
            if (
                !isOptionalNonNegativeNumber(
                    value,
                )
            ) {
                return NextResponse.json(
                    {
                        error: `${field} must be a valid non-negative number.`,
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        if (
            body.negotiable !==
            undefined &&
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

        const isDeveloper =
            user.role === "Builder" ||
            user.plan?.audience ===
            "builder";
        const limits =
            getPlanLimits(user);

        const images =
            cleanStringArray(body.images);

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
            cleanStringArray(
                body.videoLinks,
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
            | undefined;

        if (body.brochure != null) {
            if (!isDeveloper) {
                return NextResponse.json(
                    {
                        error:
                            "Only developers can attach property brochures.",
                    },
                    {
                        status: 403,
                    },
                );
            }

            if (
                typeof body.brochure !==
                "object" ||
                body.brochure === null ||
                !(
                    "url" in body.brochure
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
                    .fileName === "string"
                    ? body.brochure.fileName.trim()
                    : "";

            brochure = {
                url: body.brochure.url,
                fileName:
                    fileName.slice(0, 200) ||
                    "Property brochure.pdf",
            };
        }

        const listingExpiresAt =
            new Date();
        listingExpiresAt.setDate(
            listingExpiresAt.getDate() +
            limits.listingDays,
        );

        const property =
            await createActiveListing(
                auth.userId,
                {
                userId: auth.userId,
                purpose: body.purpose,
                propertyType:
                body.propertyType,
                commercialType,
                description: cleanText(
                    body.description,
                    2000,
                ),
                address,
                locality,
                city,
                state: "Tamil Nadu",
                landmark: cleanText(
                    body.landmark,
                    200,
                ),
                uds: body.uds,
                size: body.size,
                sizeUnit: body.sizeUnit,
                dimensions: cleanText(
                    body.dimensions,
                    100,
                ),
                ownershipType:
                body.ownershipType,
                price: body.price,
                priceType: body.priceType,
                negotiable:
                    typeof body.negotiable ===
                    "boolean"
                        ? body.negotiable
                        : true,
                bedrooms: isLand
                    ? null
                    : body.bedrooms,
                bathrooms: isLand
                    ? null
                    : body.bathrooms,
                floors: isLand
                    ? null
                    : body.floors,
                amenities: cleanStringArray(
                    body.amenities,
                ),
                images,
                videoLinks,
                brochure,
                featured: limits.featured,
                listingExpiresAt,
                planSnapshot: {
                    tier: limits.tier,
                    listingDays:
                    limits.listingDays,
                    maxPhotos:
                    limits.maxImages,
                    maxVideoLinks:
                    limits.maxVideoLinks,
                    featured: limits.featured,
                    homepageFeatured:
                    limits.homepageFeatured,
                    rankingLevel:
                    limits.rankingLevel,
                    compareVisibility:
                    limits.compareVisibility,
                    badgeLevel:
                    limits.badgeLevel,
                    analyticsLevel:
                    limits.analyticsLevel,
                },
            },
        );

        return NextResponse.json({
            success: true,
            property,
        });
    } catch (error) {
        if (error instanceof ListingCapacityError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status },
            );
        }

        console.error(
            "Failed to create property:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Failed to create property",
            },
            {
                status: 500,
            },
        );
    }
}
