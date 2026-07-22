const configuredSiteUrl =
    process.env
        .NEXT_PUBLIC_SITE_URL
        ?.trim();

export const SITE_URL =
    configuredSiteUrl ||
    "http://localhost:3000";

export const SITE_NAME =
    "PropYours";

export const SITE_DESCRIPTION =
    "Discover residential, rental and commercial properties across Tamil Nadu.";

export function getAbsoluteUrl(
    path = "/",
): string {
    return new URL(
        path,
        SITE_URL,
    ).toString();
}