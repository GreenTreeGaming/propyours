import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import {
    processPlanLifecycle,
} from "@/lib/process-plan-lifecycle";

export async function GET(request: Request) {
    const cronSecret =
        process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error(
            "CRON_SECRET is not configured"
        );

        return NextResponse.json(
            {
                error: "Cron is not configured",
            },
            {
                status: 500,
            }
        );
    }

    const authorization =
        request.headers.get(
            "authorization"
        );

    if (
        authorization !==
        `Bearer ${cronSecret}`
    ) {
        return NextResponse.json(
            {
                error: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    try {
        await connectDB();

        const result =
            await processPlanLifecycle();

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error(
            "Plan lifecycle job failed:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Plan lifecycle job failed",
            },
            {
                status: 500,
            }
        );
    }
}