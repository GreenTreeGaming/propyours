import {
    describe,
    expect,
    it,
} from "vitest";

import {
    findInappropriateField,
    hasInappropriateContent,
} from "@/lib/content-moderation";

describe(
    "content moderation",
    () => {
        describe(
            "hasInappropriateContent",
            () => {
                it(
                    "detects clearly inappropriate English language",
                    () => {
                        expect(
                            hasInappropriateContent(
                                "This is fucking ridiculous",
                            ),
                        ).toBe(true);
                    },
                );

                it(
                    "detects inappropriate language regardless of capitalization",
                    () => {
                        expect(
                            hasInappropriateContent(
                                "FUCK THIS",
                            ),
                        ).toBe(true);
                    },
                );

                it(
                    "detects inappropriate language surrounded by punctuation",
                    () => {
                        expect(
                            hasInappropriateContent(
                                "What the fuck!",
                            ),
                        ).toBe(true);
                    },
                );

                it(
                    "allows normal property descriptions",
                    () => {
                        expect(
                            hasInappropriateContent(
                                "Spacious three-bedroom apartment near schools and public transport.",
                            ),
                        ).toBe(false);
                    },
                );

                it(
                    "allows normal names",
                    () => {
                        expect(
                            hasInappropriateContent(
                                "Arun Kumar",
                            ),
                        ).toBe(false);
                    },
                );

                it(
                    "allows normal company names",
                    () => {
                        expect(
                            hasInappropriateContent(
                                "Green Tree Properties",
                            ),
                        ).toBe(false);
                    },
                );

                it(
                    "allows empty strings",
                    () => {
                        expect(
                            hasInappropriateContent(
                                "",
                            ),
                        ).toBe(false);
                    },
                );

                it(
                    "allows whitespace-only strings",
                    () => {
                        expect(
                            hasInappropriateContent(
                                "   ",
                            ),
                        ).toBe(false);
                    },
                );

                it(
                    "returns false for non-string values",
                    () => {
                        expect(
                            hasInappropriateContent(
                                undefined,
                            ),
                        ).toBe(false);

                        expect(
                            hasInappropriateContent(
                                null,
                            ),
                        ).toBe(false);

                        expect(
                            hasInappropriateContent(
                                123,
                            ),
                        ).toBe(false);
                    },
                );
            },
        );

        describe(
            "findInappropriateField",
            () => {
                it(
                    "returns the name of the first inappropriate field",
                    () => {
                        const result =
                            findInappropriateField({
                                name:
                                    "Normal User",
                                bio:
                                    "This is fucking offensive",
                                company:
                                    "Normal Properties",
                            });

                        expect(
                            result,
                        ).toBe("bio");
                    },
                );

                it(
                    "returns null when every field is appropriate",
                    () => {
                        const result =
                            findInappropriateField({
                                name:
                                    "Arun Kumar",
                                bio:
                                    "Experienced property owner in Chennai.",
                                company:
                                    "Green Tree Properties",
                                city:
                                    "Chennai",
                            });

                        expect(
                            result,
                        ).toBeNull();
                    },
                );

                it(
                    "ignores missing optional fields",
                    () => {
                        const result =
                            findInappropriateField({
                                name:
                                    "Arun Kumar",
                                bio:
                                undefined,
                                company:
                                undefined,
                                city:
                                    "Chennai",
                            });

                        expect(
                            result,
                        ).toBeNull();
                    },
                );

                it(
                    "checks property-related fields",
                    () => {
                        const result =
                            findInappropriateField({
                                description:
                                    "A well-maintained family apartment.",
                                address:
                                    "This fucking place",
                                locality:
                                    "Anna Nagar",
                                city:
                                    "Chennai",
                            });

                        expect(
                            result,
                        ).toBe("address");
                    },
                );
            },
        );
    },
);