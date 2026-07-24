import mongoose from "mongoose";

import {
    connectDB,
} from "@/lib/mongoose";
import {
    getHashedClientIdentifier,
} from "@/lib/request-identity";

interface RateLimitDocument {
    _id: string;
    count: number;
    expiresAt: Date;
}

type RateLimitOptions = {
    namespace: string;
    windowMs: number;
    maximumRequests: number;

    /**
     * Optional identifier in addition to the client IP,
     * such as a normalized email or phone number.
     */
    subject?: string;
};

let indexPromise:
    Promise<string> | null = null;

export class RateLimitError
    extends Error {
    constructor(
        public readonly retryAfterSeconds:
        number,
    ) {
        super("Too many requests");
        this.name = "RateLimitError";
    }
}

export async function enforceRateLimit(
    request: Request,
    {
        namespace,
        windowMs,
        maximumRequests,
        subject,
    }: RateLimitOptions,
): Promise<void> {
    await connectDB();

    const database =
        mongoose.connection.db;

    if (!database) {
        throw new Error(
            "MongoDB is unavailable for rate limiting.",
        );
    }

    const collection =
        database.collection<
            RateLimitDocument
        >("api_rate_limits");

    if (!indexPromise) {
        indexPromise =
            collection.createIndex(
                {
                    expiresAt: 1,
                },
                {
                    expireAfterSeconds: 0,
                    name:
                        "api_rate_limit_ttl",
                },
            );
    }

    await indexPromise;

    const now = Date.now();

    const windowStart =
        Math.floor(
            now / windowMs,
        ) * windowMs;

    const clientIdentifier =
        getHashedClientIdentifier(
            request,
        );

    const normalizedSubject =
        subject
            ?.trim()
            .toLowerCase() ||
        "none";

    const documentId = [
        namespace,
        clientIdentifier,
        normalizedSubject,
        windowStart,
    ].join(":");

    const updateResult =
        await collection.findOneAndUpdate(
            {
                _id: documentId,
            },
            {
                $inc: {
                    count: 1,
                },

                $setOnInsert: {
                    expiresAt: new Date(
                        windowStart +
                        windowMs * 2,
                    ),
                },
            },
            {
                upsert: true,
                returnDocument: "after",
            },
        );

    const document =
        updateResult;

    if (
        document &&
        document.count >
        maximumRequests
    ) {
        const retryAfterSeconds =
            Math.max(
                1,
                Math.ceil(
                    (
                        windowStart +
                        windowMs -
                        now
                    ) / 1_000,
                ),
            );

        throw new RateLimitError(
            retryAfterSeconds,
        );
    }
}

export function createRateLimitResponse(
    error: RateLimitError,
) {
    return Response.json(
        {
            error:
                "Too many requests. Please try again shortly.",
        },
        {
            status: 429,

            headers: {
                "Retry-After": String(
                    error.retryAfterSeconds,
                ),
            },
        },
    );
}