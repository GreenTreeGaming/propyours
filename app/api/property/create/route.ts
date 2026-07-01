import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        console.log("DEBUG: Posting Property with body:", body);
        const property = await Property.create(body);

        return NextResponse.json({
            success: true,
            property,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}