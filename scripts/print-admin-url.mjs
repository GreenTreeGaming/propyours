import {
    config,
} from "dotenv";
import {
    createHmac,
} from "node:crypto";

config({
    path: ".env.local",
});

config();

const secret =
    process.env
        .ADMIN_GATEWAY_SECRET
        ?.trim();

const siteUrl =
    process.env
        .NEXT_PUBLIC_SITE_URL
        ?.trim() ||
    "http://localhost:3000";

if (
    !secret ||
    secret.length < 32
) {
    throw new Error(
        "ADMIN_GATEWAY_SECRET must contain at least 32 characters.",
    );
}

function getIndiaDateKey(
    date,
) {
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

const token =
    createHmac(
        "sha256",
        secret,
    )
        .update(
            `propyours-admin:${getIndiaDateKey(
                new Date(),
            )}`,
        )
        .digest("base64url")
        .slice(0, 24);

console.log(
    `${siteUrl.replace(
        /\/$/,
        "",
    )}/control/${token}`,
);