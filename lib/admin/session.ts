import jwt from "jsonwebtoken";

type AdminSessionPayload = {
    adminId: string;
    tokenVersion: number;
};

function getAdminJwtSecret():
    string {
    const secret =
        process.env
            .ADMIN_JWT_SECRET
            ?.trim();

    if (!secret) {
        throw new Error(
            "ADMIN_JWT_SECRET is not configured.",
        );
    }

    if (secret.length < 32) {
        throw new Error(
            "ADMIN_JWT_SECRET must contain at least 32 characters.",
        );
    }

    return secret;
}

export function createAdminSessionToken(
    payload: AdminSessionPayload,
): string {
    return jwt.sign(
        payload,
        getAdminJwtSecret(),
        {
            algorithm: "HS256",
            expiresIn: "30m",
            issuer: "propyours",
            audience:
                "propyours-admin",
        },
    );
}

export function verifyAdminSessionToken(
    token: string,
): AdminSessionPayload {
    const payload =
        jwt.verify(
            token,
            getAdminJwtSecret(),
            {
                algorithms: [
                    "HS256",
                ],
                issuer:
                    "propyours",
                audience:
                    "propyours-admin",
            },
        );

    if (
        typeof payload !== "object" ||
        typeof payload.adminId !==
        "string" ||
        typeof payload.tokenVersion !==
        "number"
    ) {
        throw new Error(
            "Invalid admin session.",
        );
    }

    return {
        adminId:
        payload.adminId,
        tokenVersion:
        payload.tokenVersion,
    };
}