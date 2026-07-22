import jwt from "jsonwebtoken";

type SessionPayload = {
    userId: string;
    tokenVersion: number;
};

function getJwtSecret(): string {
    const secret =
        process.env.JWT_SECRET?.trim();

    if (!secret) {
        throw new Error(
            "JWT_SECRET is not configured.",
        );
    }

    if (secret.length < 32) {
        throw new Error(
            "JWT_SECRET must contain at least 32 characters.",
        );
    }

    return secret;
}

export function createSessionToken(
    payload: SessionPayload,
): string {
    return jwt.sign(
        payload,
        getJwtSecret(),
        {
            expiresIn: "7d",
            algorithm: "HS256",
            issuer: "propyours",
            audience:
                "propyours-web",
        },
    );
}

export function verifySessionToken(
    token: string,
): SessionPayload {
    const payload = jwt.verify(
        token,
        getJwtSecret(),
        {
            algorithms: [
                "HS256",
            ],
            issuer: "propyours",
            audience:
                "propyours-web",
        },
    );

    if (
        typeof payload !== "object" ||
        typeof payload.userId !==
        "string" ||
        typeof payload.tokenVersion !==
        "number"
    ) {
        throw new Error(
            "Invalid session payload.",
        );
    }

    return {
        userId: payload.userId,
        tokenVersion:
        payload.tokenVersion,
    };
}