export function hasTrustedOrigin(
    request: Request,
): boolean {
    const origin =
        request.headers.get(
            "origin",
        );

    if (!origin) {
        return false;
    }

    try {
        const allowedOrigins =
            new Set<string>();

        allowedOrigins.add(
            new URL(
                request.url,
            ).origin,
        );

        const configuredSite =
            process.env
                .NEXT_PUBLIC_SITE_URL
                ?.trim();

        if (configuredSite) {
            allowedOrigins.add(
                new URL(
                    configuredSite,
                ).origin,
            );
        }

        return allowedOrigins.has(
            new URL(origin).origin,
        );
    } catch {
        return false;
    }
}