import {
    createHash,
} from "node:crypto";

import mongoose from "mongoose";
import {
    NextResponse,
} from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/mongoose";

import {
    hasTrustedOrigin,
} from "@/lib/security/trusted-origin";

import {
    parseJsonBody,
} from "@/lib/validation/api";

import {
    BubbyRateLimitError,
    enforceBubbyRateLimit,
} from "@/lib/bubby/rate-limit";

import {
    BUBBY_COMMERCIAL_TYPES,
    BUBBY_LISTING_PURPOSES,
    BUBBY_PROPERTY_TYPES,
    BUBBY_SORT_OPTIONS,
} from "@/lib/bubby/types";

import {
    getPublicPropertyFilter,
} from "@/lib/property-filters";

import BubbyLead from "@/models/BubbyLead";
import Property from "@/models/Property";

export const runtime = "nodejs";

const DUPLICATE_WINDOW_MS =
    24 * 60 * 60 * 1000;

const searchFiltersSchema =
    z.object({
        listingPurpose:
            z.enum(
                BUBBY_LISTING_PURPOSES,
            ).nullable(),

        propertyType:
            z.enum(
                BUBBY_PROPERTY_TYPES,
            ).nullable(),

        commercialType:
            z.enum(
                BUBBY_COMMERCIAL_TYPES,
            ).nullable(),

        city:
            z.string()
                .trim()
                .max(120)
                .nullable(),

        locality:
            z.string()
                .trim()
                .max(120)
                .nullable(),

        minPrice:
            z.number()
                .nonnegative()
                .nullable(),

        maxPrice:
            z.number()
                .nonnegative()
                .nullable(),

        minBedrooms:
            z.number()
                .nonnegative()
                .nullable(),

        maxBedrooms:
            z.number()
                .nonnegative()
                .nullable(),

        minBathrooms:
            z.number()
                .nonnegative()
                .nullable(),

        maxBathrooms:
            z.number()
                .nonnegative()
                .nullable(),

        minSize:
            z.number()
                .nonnegative()
                .nullable(),

        maxSize:
            z.number()
                .nonnegative()
                .nullable(),

        amenities:
            z.array(
                z.string()
                    .trim()
                    .min(1)
                    .max(100),
            )
                .max(20),

        negotiable:
            z.boolean()
                .nullable(),

        sort:
            z.enum(
                BUBBY_SORT_OPTIONS,
            ),

        searchText:
            z.string()
                .trim()
                .max(200)
                .nullable(),
    })
        .strict();

const leadSchema =
    z.object({
        name:
            z.string()
                .trim()
                .min(
                    2,
                    "Enter your name.",
                )
                .max(
                    100,
                    "Name is too long.",
                ),

        mobile:
            z.string()
                .trim()
                .min(
                    8,
                    "Enter a valid mobile number.",
                )
                .max(
                    25,
                    "Enter a valid mobile number.",
                ),

        propertyIds:
            z.array(
                z.string().min(1),
            )
                .min(
                    1,
                    "At least one property is required.",
                )
                .max(8),

        searchFilters:
            searchFiltersSchema
                .nullable(),

        consent:
            z.literal(true),
    })
        .strict();

export async function POST(
    request: Request,
) {
    try {
        if (
            !hasTrustedOrigin(request)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid request origin.",
                },
                {
                    status: 403,
                },
            );
        }

        /*
         * Reuse Bubby's existing rate limiter so this public form
         * cannot be spammed indefinitely.
         */
        await enforceBubbyRateLimit(
            request,
        );

        const parsed =
            await parseJsonBody(
                request,
                leadSchema,
            );

        if (!parsed.success) {
            return parsed.response;
        }

        const {
            name,
            mobile,
            propertyIds,
            searchFilters,
        } = parsed.data;

        const normalizedMobile =
            normalizeMobileNumber(
                mobile,
            );

        if (!normalizedMobile) {
            return NextResponse.json(
                {
                    error:
                        "Enter a valid mobile number.",
                },
                {
                    status: 400,
                },
            );
        }

        const uniquePropertyIds =
            Array.from(
                new Set(
                    propertyIds,
                ),
            );

        if (
            !uniquePropertyIds.every(
                (id) =>
                    mongoose.Types.ObjectId.isValid(
                        id,
                    ),
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "One or more property IDs are invalid.",
                },
                {
                    status: 400,
                },
            );
        }

        await connectDB();

        /*
         * Do not trust property IDs supplied by the client.
         *
         * Only retain properties that are currently publicly
         * available through the normal marketplace filter.
         */
        const validProperties =
            await Property.find({
                $and: [
                    getPublicPropertyFilter(),

                    {
                        _id: {
                            $in:
                                uniquePropertyIds.map(
                                    (id) =>
                                        new mongoose.Types.ObjectId(
                                            id,
                                        ),
                                ),
                        },
                    },
                ],
            })
                .select("_id")
                .lean();

        if (
            validProperties.length ===
            0
        ) {
            return NextResponse.json(
                {
                    error:
                        "These properties are no longer available.",
                },
                {
                    status: 400,
                },
            );
        }

        const validPropertyIds =
            validProperties
                .map(
                    (property) =>
                        property._id.toString(),
                )
                .sort();

        /*
         * Build a deterministic identifier for the same mobile
         * number + same result set.
         *
         * This prevents double-clicks and refreshes from flooding
         * your database with duplicate leads.
         */
        const dedupeKey =
            createHash("sha256")
                .update(
                    JSON.stringify({
                        mobile:
                        normalizedMobile,

                        propertyIds:
                        validPropertyIds,
                    }),
                )
                .digest("hex");

        const duplicateCutoff =
            new Date(
                Date.now() -
                DUPLICATE_WINDOW_MS,
            );

        const existingLead =
            await BubbyLead.findOne({
                dedupeKey,

                createdAt: {
                    $gte:
                    duplicateCutoff,
                },
            });

        if (existingLead) {
            /*
             * Keep the newest provided name in case the user
             * corrected it and record the repeated interest.
             */
            existingLead.name = name;

            existingLead.submissionCount =
                (
                    existingLead.submissionCount ??
                    1
                ) + 1;

            existingLead.searchFilters =
                searchFilters ?? undefined;

            await existingLead.save();

            return NextResponse.json({
                success: true,

                message:
                    "Thanks. Your details have already been received.",

                leadId:
                    existingLead._id.toString(),
            });
        }

        const lead =
            await BubbyLead.create({
                name,

                mobile:
                normalizedMobile,

                propertyIds:
                    validPropertyIds.map(
                        (id) =>
                            new mongoose.Types.ObjectId(
                                id,
                            ),
                    ),

                searchFilters:
                    searchFilters ??
                    undefined,

                source:
                    "bubby",

                status:
                    "new",

                consentedAt:
                    new Date(),

                dedupeKey,

                submissionCount:
                    1,
            });

        return NextResponse.json(
            {
                success: true,

                message:
                    "Thanks. The PropYours team has received your details.",

                leadId:
                    lead._id.toString(),
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        if (
            error instanceof
            BubbyRateLimitError
        ) {
            return NextResponse.json(
                {
                    error:
                        "Too many requests. Please try again shortly.",
                },
                {
                    status: 429,

                    headers: {
                        "Retry-After":
                            String(
                                error.retryAfterSeconds,
                            ),
                    },
                },
            );
        }

        console.error(
            "Failed to create Bubby lead:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "We couldn't save your details right now. Please try again.",
            },
            {
                status: 500,
            },
        );
    }
}

function normalizeMobileNumber(
    input: string,
): string | null {
    const trimmed =
        input.trim();

    if (!trimmed) {
        return null;
    }

    /*
     * Strip spaces, brackets, hyphens, etc.
     */
    let digits =
        trimmed.replace(
            /\D/g,
            "",
        );

    /*
     * Indian mobile numbers are the primary use case.
     *
     * 9876543210
     * becomes
     * +919876543210
     */
    if (digits.length === 10) {
        digits =
            `91${digits}`;
    }

    /*
     * E.164 allows up to 15 digits.
     */
    if (
        digits.length < 8 ||
        digits.length > 15
    ) {
        return null;
    }

    /*
     * Avoid obviously invalid repeated-zero numbers.
     */
    if (
        /^0+$/.test(digits)
    ) {
        return null;
    }

    return `+${digits}`;
}