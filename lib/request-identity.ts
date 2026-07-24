import {
    createHash,
} from "node:crypto";

function getRawClientIdentifier(
    request: Request,
): string {
    const forwardedFor =
        request.headers.get(
            "x-forwarded-for",
        );

    if (forwardedFor) {
        const firstAddress =
            forwardedFor
                .split(",")[0]
                ?.trim();

        if (firstAddress) {
            return firstAddress;
        }
    }

    return (
        request.headers
            .get("cf-connecting-ip")
            ?.trim() ||
        request.headers
            .get("x-real-ip")
            ?.trim() ||
        "unknown-client"
    );
}

export function getHashedClientIdentifier(
    request: Request,
): string {
    const salt =
        process.env
            .REQUEST_IDENTITY_SALT
            ?.trim() ||
        process.env.JWT_SECRET?.trim();

    if (!salt) {
        throw new Error(
            "REQUEST_IDENTITY_SALT is not configured.",
        );
    }

    return createHash("sha256")
        .update(
            `${salt}:${getRawClientIdentifier(
                request,
            )}`,
        )
        .digest("hex");
}