import { z } from "zod";

const optionalTrimmedString = (
    maximumLength: number,
) =>
    z.preprocess(
        (value) => {
            if (typeof value !== "string") {
                return value;
            }

            const trimmed = value.trim();

            return trimmed.length > 0
                ? trimmed
                : undefined;
        },
        z
            .string()
            .max(maximumLength)
            .optional(),
    );

const optionalPositiveInteger = z.preprocess(
    (value) => {
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return undefined;
        }

        return Number(value);
    },
    z
        .number()
        .int()
        .nonnegative()
        .optional(),
);

export const propertySearchQuerySchema = z
    .object({
        purpose: z
            .enum([
                "buy",
                "rent",
                "commercial",
            ])
            .default("buy"),

        city: optionalTrimmedString(120),
        location: optionalTrimmedString(160),

        type: optionalTrimmedString(100),

        bhk: z
            .enum([
                "All",
                "Studio",
                "1",
                "2",
                "3",
                "4+",
            ])
            .default("All"),

        minPrice: optionalPositiveInteger,
        maxPrice: optionalPositiveInteger,

        filter: z
            .enum([
                "all",
                "featured",
            ])
            .default("all"),

        sort: z
            .enum([
                "default",
                "newest",
                "popular",
                "price-low",
                "price-high",
            ])
            .default("default"),

        page: z.coerce
            .number()
            .int()
            .min(1)
            .max(10_000)
            .default(1),

        limit: z.coerce
            .number()
            .int()
            .min(1)
            .max(24)
            .default(8),
    })
    .superRefine((value, context) => {
        if (
            value.minPrice !== undefined &&
            value.maxPrice !== undefined &&
            value.minPrice > value.maxPrice
        ) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["maxPrice"],
                message:
                    "Maximum price must be greater than or equal to minimum price.",
            });
        }

        if (
            value.purpose === "commercial" &&
            value.bhk !== "All"
        ) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["bhk"],
                message:
                    "Bedroom filters cannot be used for commercial searches.",
            });
        }
    });

export type PropertySearchQuery =
    z.infer<
        typeof propertySearchQuerySchema
    >;