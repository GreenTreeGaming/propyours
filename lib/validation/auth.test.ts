import {
    describe,
    expect,
    it,
} from "vitest";

import {
    loginSchema,
    sendPhoneOtpSchema,
    signupSchema,
    verifyPhoneOtpSchema,
} from "@/lib/validation/auth";

describe(
    "authentication validation",
    () => {
        it(
            "normalizes login email addresses",
            () => {
                const result =
                    loginSchema.parse({
                        email:
                            "  PERSON@EXAMPLE.COM ",
                        password:
                            "password-value",
                    });

                expect(
                    result.email,
                ).toBe(
                    "person@example.com",
                );
            },
        );

        it(
            "rejects invalid email addresses",
            () => {
                const result =
                    loginSchema.safeParse({
                        email:
                            "not-an-email",
                        password:
                            "password-value",
                    });

                expect(
                    result.success,
                ).toBe(false);
            },
        );

        it(
            "rejects signup passwords shorter than 12 characters",
            () => {
                const result =
                    signupSchema.safeParse({
                        name:
                            "Example User",
                        email:
                            "person@example.com",
                        phone:
                            "+919876543210",
                        password:
                            "short123",
                    });

                expect(
                    result.success,
                ).toBe(false);
            },
        );

        it(
            "accepts a valid signup request",
            () => {
                const result =
                    signupSchema.safeParse({
                        name:
                            "Example User",
                        email:
                            "PERSON@EXAMPLE.COM",
                        phone:
                            "+919876543210",
                        password:
                            "a-secure-password-123",
                    });

                expect(
                    result.success,
                ).toBe(true);

                if (result.success) {
                    expect(
                        result.data.email,
                    ).toBe(
                        "person@example.com",
                    );
                }
            },
        );

        it(
            "rejects malformed phone numbers",
            () => {
                const result =
                    sendPhoneOtpSchema.safeParse(
                        {
                            phone:
                                "123",
                        },
                    );

                expect(
                    result.success,
                ).toBe(false);
            },
        );

        it(
            "requires exactly six OTP digits",
            () => {
                expect(
                    verifyPhoneOtpSchema.safeParse(
                        {
                            phone:
                                "+919876543210",
                            otp: "12345",
                        },
                    ).success,
                ).toBe(false);

                expect(
                    verifyPhoneOtpSchema.safeParse(
                        {
                            phone:
                                "+919876543210",
                            otp: "123456",
                        },
                    ).success,
                ).toBe(true);
            },
        );
    },
);