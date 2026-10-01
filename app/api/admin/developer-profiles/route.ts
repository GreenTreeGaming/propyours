import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { connectDB } from "@/lib/mongoose";
import { syncDeveloperProfilesFromListings } from "@/lib/sync-developer-profiles";
import DeveloperProfile from "@/models/DeveloperProfile";
import Property from "@/models/Property";
import { exactBuilderNameRegex } from "@/lib/builder-properties";

function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export async function GET(request: Request) {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    await connectDB();
    const url = new URL(request.url);
    const requestedPage = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "12", 10) || 12));
    const query = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
    const linkedProfiles = await syncDeveloperProfilesFromListings();
    const filter: Record<string, unknown> = { _id: { $in: (linkedProfiles as any[]).map((profile) => profile._id) } };
    if (query) {
        const expression = new RegExp(escapeRegex(query), "i");
        filter.$or = [{ name: expression }, { city: expression }, { reraNumber: expression }];
    }
    const total = await DeveloperProfile.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const profiles = await DeveloperProfile.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean();
    const enriched = await Promise.all((profiles as any[]).map(async (profile) => {
        const expression = exactBuilderNameRegex(profile.name);
        const listingCount = expression ? await Property.countDocuments({ developerName: expression }) : 0;
        return { ...profile, _id: String(profile._id), listingCount };
    }));
    return NextResponse.json({ profiles: enriched, pagination: { page, pages, total } }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    if (!mongoose.Types.ObjectId.isValid(body.id)) return NextResponse.json({ error: "Invalid developer profile." }, { status: 400 });
    const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
    const companyWebsite = clean(body.companyWebsite, 300);
    if (companyWebsite && !/^https?:\/\//i.test(companyWebsite)) return NextResponse.json({ error: "Website must start with http:// or https://" }, { status: 400 });
    await connectDB();
    const profile = await DeveloperProfile.findByIdAndUpdate(body.id, { $set: {
        bio: clean(body.bio, 3000), companyWebsite, reraNumber: clean(body.reraNumber, 100),
        address: clean(body.address, 500), city: clean(body.city, 120), source: "admin",
    } }, { new: true, runValidators: true }).lean();
    if (!profile) return NextResponse.json({ error: "Developer profile not found." }, { status: 404 });
    return NextResponse.json({ ...profile, _id: String((profile as any)._id) });
}
