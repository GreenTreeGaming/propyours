import {
    describe,
    expect,
    it,
} from "vitest";

import {
    propertySearchQuerySchema,
} from "@/lib/validation/property-search";

describe(
    "property search validation",
    () => {
        it(
            "applies pagination defaults",
            () => {
                const result =
                    propertySearchQuerySchema.parse(
                        {},
                    );

                expect(
                    result.page,
                ).toBe(1);

                expect(
                    result.limit,
                ).toBe(8);

                expect(
                    result.purpose,
                ).toBe("buy");
            },
        );

        it(
            "converts numeric query strings",
            () => {
                const result =
                    propertySearchQuerySchema.parse(
                        {
                            page: "2",
                            limit: "16",
                            minPrice:
                                "1000000",
                            maxPrice:
                                "6000000",
                        },
                    );

                expect(
                    result.page,
                ).toBe(2);

                expect(
                    result.limit,
                ).toBe(16);

                expect(
                    result.minPrice,
                ).toBe(1_000_000);

                expect(
                    result.maxPrice,
                ).toBe(6_000_000);
            },
        );

        it(
            "rejects a reversed price range",
            () => {
                const result =
                    propertySearchQuerySchema.safeParse(
                        {
                            minPrice:
                                "8000000",
                            maxPrice:
                                "6000000",
                        },
                    );

                expect(
                    result.success,
                ).toBe(false);
            },
        );

        it(
            "rejects unsupported sorting values",
            () => {
                const result =
                    propertySearchQuerySchema.safeParse(
                        {
                            sort: "random",
                        },
                    );

                expect(
                    result.success,
                ).toBe(false);
            },
        );

        it(
            "rejects excessive page sizes",
            () => {
                const result =
                    propertySearchQuerySchema.safeParse(
                        {
                            limit: "1000",
                        },
                    );

                expect(
                    result.success,
                ).toBe(false);
            },
        );

        it(
            "rejects bedroom filters for commercial searches",
            () => {
                const result =
                    propertySearchQuerySchema.safeParse(
                        {
                            purpose:
                                "commercial",
                            bhk: "3",
                        },
                    );

                expect(
                    result.success,
                ).toBe(false);
            },
        );
    },
);