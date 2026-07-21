import { createHash } from "node:crypto";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";

interface RateLimitDocument {
    _id: string;
    count: number;
    expiresAt: Date;
}

const WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 10;

let ttlIndexPromise: Promise<string> | null = null;

export class BubbyRateLimitError extends Error {
    constructor(
        public readonly retryAfterSeconds: number,
    ) {
        super("Too many Bubby requests");
        this.name = "BubbyRateLimitError";
    }
}

export async function enforceBubbyRateLimit(
    request: Request,
): Promise<void> {
    await connectDB();

    const database = mongoose.connection.db;

    if (!database) {
        throw new Error(
            "MongoDB is unavailable for Bubby rate limiting",
        );
    }

    const salt =
        process.env.BUBBY_RATE_LIMIT_SALT?.trim() ||
        process.env.JWT_SECRET?.trim();

    if (!salt) {
        throw new Error(
            "BUBBY_RATE_LIMIT_SALT is not configured",
        );
    }

    const collection =
        database.collection<RateLimitDocument>(
            "bubby_rate_limits",
        );

    if (!ttlIndexPromise) {
        ttlIndexPromise = collection.createIndex(
            {
                expiresAt: 1,
            },
            {
                expireAfterSeconds: 0,
                name: "bubby_rate_limit_ttl",
            },
        );
    }

    await ttlIndexPromise;

    const now = Date.now();
    const windowStart =
        Math.floor(now / WINDOW_MS) * WINDOW_MS;

    const clientIdentifier = getClientIdentifier(
        request,
    );

    const hashedIdentifier = createHash("sha256")
        .update(`${salt}:${clientIdentifier}`)
        .digest("hex");

    const documentId = `${hashedIdentifier}:${windowStart}`;

    await collection.updateOne(
        {
            _id: documentId,
        },
        {
            $inc: {
                count: 1,
            },
            $setOnInsert: {
                expiresAt: new Date(
                    windowStart + WINDOW_MS * 2,
                ),
            },
        },
        {
            upsert: true,
        },
    );

    const document = await collection.findOne(
        {
            _id: documentId,
        },
        {
            projection: {
                count: 1,
            },
        },
    );

    const maxRequests = getMaximumRequests();

    if (
        document &&
        document.count > maxRequests
    ) {
        const retryAfterSeconds = Math.max(
            1,
            Math.ceil(
                (windowStart + WINDOW_MS - now) / 1_000,
            ),
        );

        throw new BubbyRateLimitError(
            retryAfterSeconds,
        );
    }
}

function getClientIdentifier(
    request: Request,
): string {
    const forwardedFor =
        request.headers.get("x-forwarded-for");

    if (forwardedFor) {
        const firstAddress = forwardedFor
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
        request.headers.get("x-real-ip")?.trim() ||
        "unknown-client"
    );
}

function getMaximumRequests(): number {
    const configuredValue = Number.parseInt(
        process.env
            .BUBBY_RATE_LIMIT_PER_MINUTE ?? "",
        10,
    );

    if (
        Number.isInteger(configuredValue) &&
        configuredValue > 0 &&
        configuredValue <= 100
    ) {
        return configuredValue;
    }

    return DEFAULT_MAX_REQUESTS;
}