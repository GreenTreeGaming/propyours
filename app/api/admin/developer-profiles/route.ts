import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { connectDB } from "@/lib/mongoose";
import { syncDeveloperProfilesFromListings } from "@/lib/sync-developer-profiles";
import DeveloperProfile from "@/models/DeveloperProfile";
import Property from "@/models/Property";
import { exactBuilderNameRegex } from "@/lib/builder-properties";

export async function GET() {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    await connectDB();
    const profiles = await syncDeveloperProfilesFromListings();
    const enriched = await Promise.all((profiles as any[]).map(async (profile) => {
        const expression = exactBuilderNameRegex(profile.name);
        const listingCount = expression ? await Property.countDocuments({ developerName: expression }) : 0;
        return { ...profile, _id: String(profile._id), listingCount };
    }));
    return NextResponse.json(enriched.sort((a, b) => a.name.localeCompare(b.name)));
}

export async function PATCH(request: Request) {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    if (!mongoose.Types.ObjectId.isValid(body.id)) {
        return NextResponse.json({ error: "Invalid developer profile." }, { status: 400 });
    }

    const clean = (value: unknown, max: number) =>
        typeof value === "string" ? value.trim().slice(0, max) : "";
    const companyWebsite = clean(body.companyWebsite, 300);
    if (companyWebsite && !/^https?:\/\//i.test(companyWebsite)) {
        return NextResponse.json({ error: "Website must start with http:// or https://" }, { status: 400 });
    }

    await connectDB();
    const profile = await DeveloperProfile.findByIdAndUpdate(
        body.id,
        { $set: {
            bio: clean(body.bio, 3000), companyWebsite,
            reraNumber: clean(body.reraNumber, 100), address: clean(body.address, 500),
            city: clean(body.city, 120), source: "admin",
        } },
        { new: true, runValidators: true },
    ).lean();
    if (!profile) return NextResponse.json({ error: "Developer profile not found." }, { status: 404 });
    return NextResponse.json({ ...profile, _id: String((profile as any)._id) });
}
