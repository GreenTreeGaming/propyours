import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { type } = await request.json(); // "view" or "phoneClick"

        await connectDB();

        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        let property = await Property.findById(id);

        if (!property) {
            return NextResponse.json({ error: "Property not found" }, { status: 404 });
        }

        let updateQuery: any = {};

        if (type === "view") {
            updateQuery = {
                $inc: { "analytics.views": 1 },
            };

            const statsArray = property.analytics?.dailyStats || [];
            const dayIndex = statsArray.findIndex((s: any) => s.date === today);

            if (dayIndex >= 0) {
                updateQuery.$inc[`analytics.dailyStats.${dayIndex}.views`] = 1;
            } else {
                updateQuery.$push = {
                    "analytics.dailyStats": { date: today, views: 1, phoneClicks: 0 }
                };
            }
        } else if (type === "phoneClick") {
            updateQuery = {
                $inc: { "analytics.phoneClicks": 1 },
            };

            const statsArray = property.analytics?.dailyStats || [];
            const dayIndex = statsArray.findIndex((s: any) => s.date === today);

            if (dayIndex >= 0) {
                updateQuery.$inc[`analytics.dailyStats.${dayIndex}.phoneClicks`] = 1;
            } else {
                updateQuery.$push = {
                    "analytics.dailyStats": { date: today, views: 0, phoneClicks: 1 }
                };
            }
        } else {
            return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
        }

        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true }
        );

        return NextResponse.json({ success: true, analytics: updatedProperty.analytics });
    } catch (error: any) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
