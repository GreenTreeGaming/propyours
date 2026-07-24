import {
    createHmac,
    timingSafeEqual,
} from "node:crypto";

const TOKEN_LENGTH = 24;

function getGatewaySecret(): string {
    const secret =
        process.env
            .ADMIN_GATEWAY_SECRET
            ?.trim();

    if (!secret) {
        throw new Error(
            "ADMIN_GATEWAY_SECRET is not configured.",
        );
    }

    if (secret.length < 32) {
        throw new Error(
            "ADMIN_GATEWAY_SECRET must contain at least 32 characters.",
        );
    }

    return secret;
}

function getIndiaDateKey(
    date: Date,
): string {
    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    "Asia/Kolkata",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            },
        ).formatToParts(date);

    const values =
        Object.fromEntries(
            parts.map((part) => [
                part.type,
                part.value,
            ]),
        );

    return [
        values.year,
        values.month,
        values.day,
    ].join("-");
}

function deriveGatewayToken(
    date: Date,
): string {
    const dateKey =
        getIndiaDateKey(date);

    return createHmac(
        "sha256",
        getGatewaySecret(),
    )
        .update(
            `propyours-admin:${dateKey}`,
        )
        .digest("base64url")
        .slice(0, TOKEN_LENGTH);
}

function securelyEqual(
    first: string,
    second: string,
): boolean {
    const firstBuffer =
        Buffer.from(first);

    const secondBuffer =
        Buffer.from(second);

    if (
        firstBuffer.length !==
        secondBuffer.length
    ) {
        return false;
    }

    return timingSafeEqual(
        firstBuffer,
        secondBuffer,
    );
}

export function getCurrentAdminGateway():
    string {
    return deriveGatewayToken(
        new Date(),
    );
}

export function isValidAdminGateway(
    candidate: string,
): boolean {
    if (
        candidate.length !==
        TOKEN_LENGTH
    ) {
        return false;
    }

    const now = new Date();

    // Accept yesterday's URL as a short
    // rollover grace period.
    const yesterday =
        new Date(
            now.getTime() -
            24 * 60 * 60 * 1_000,
        );

    return [
        deriveGatewayToken(now),
        deriveGatewayToken(yesterday),
    ].some((validToken) =>
        securelyEqual(
            candidate,
            validToken,
        ),
    );
}