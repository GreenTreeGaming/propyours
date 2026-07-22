import mongoose from "mongoose";
import {
    NextResponse,
} from "next/server";

import {
    connectDB,
} from "@/lib/mongoose";

export const dynamic =
    "force-dynamic";

export async function GET() {
    const startedAt =
        Date.now();

    try {
        await connectDB();

        const database =
            mongoose.connection.db;

        if (!database) {
            throw new Error(
                "Database connection is unavailable.",
            );
        }

        await database.command({
            ping: 1,
        });

        return NextResponse.json(
            {
                status: "ok",
                database:
                    "connected",
                responseTimeMs:
                    Date.now() -
                    startedAt,
                timestamp:
                    new Date()
                        .toISOString(),
            },
            {
                status: 200,

                headers: {
                    "Cache-Control":
                        "no-store",
                },
            },
        );
    } catch (error) {
        console.error(
            "Health check failed:",
            error,
        );

        return NextResponse.json(
            {
                status:
                    "unavailable",
                database:
                    "disconnected",
                timestamp:
                    new Date()
                        .toISOString(),
            },
            {
                status: 503,

                headers: {
                    "Cache-Control":
                        "no-store",
                },
            },
        );
    }
}