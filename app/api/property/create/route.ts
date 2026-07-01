import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        await connectDB();

        const body = await req.json();

        const property = await Property.create({
            ...body,

            // Never trust the client.
            userId: auth.userId,
        });

        return NextResponse.json({
            success: true,
            property,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Failed to create property",
            },
            {
                status: 500,
            }
        );
    }
}