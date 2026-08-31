import {
    z,
} from "zod";

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email(
        "Enter a valid email address.",
    )
    .max(254);

const passwordSchema = z
    .string()
    .min(
        12,
        "Password must contain at least 12 characters.",
    )
    .max(
        128,
        "Password cannot exceed 128 characters.",
    );

const phoneSchema = z
    .string()
    .trim()
    .regex(
        /^\+?[1-9]\d{7,14}$/,
        "Enter a valid phone number including country code.",
    );

const otpSchema = z
    .string()
    .trim()
    .regex(
        /^\d{6}$/,
        "OTP must be a 6-digit code.",
    );

export const loginSchema = z.object({
    email: emailSchema,

    password: z
        .string()
        .min(
            1,
            "Password is required.",
        )
        .max(128),
});

export const signupSchema = z.object({
    name: z
        .string()
        .trim()
        .min(
            2,
            "Name must contain at least 2 characters.",
        )
        .max(100),

    email: emailSchema,

    phone: phoneSchema,

    password: passwordSchema,
});

export const sendPhoneOtpSchema =
    z.object({
        phone: phoneSchema,

        email:
            emailSchema.optional(),
    });

export const verifyPhoneOtpSchema =
    z.object({
        phone: phoneSchema,

        otp: otpSchema,
    });

export const sendEmailOtpSchema =
    z.object({
        email: emailSchema,
    });

export const verifyEmailOtpSchema =
    z.object({
        email: emailSchema,

        otp: otpSchema,
    });

export type LoginInput =
    z.infer<
        typeof loginSchema
    >;

export type SignupInput =
    z.infer<
        typeof signupSchema
    >;