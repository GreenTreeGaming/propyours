import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { connectDB } from "@/lib/mongoose";
import BubbyLead from "@/models/BubbyLead";
import Property from "@/models/Property";

const STATUSES = new Set(["new", "contacted", "qualified", "closed"]);
function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export async function GET(request: Request) {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    void Property;

    const url = new URL(request.url);
    const requestedPage = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "15", 10) || 15));
    const status = url.searchParams.get("status") ?? "all";
    const query = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
    const filter: Record<string, unknown> = {};
    if (STATUSES.has(status)) filter.status = status;
    if (query) {
        const expression = new RegExp(escapeRegex(query), "i");
        filter.$or = [{ name: expression }, { email: expression }, { mobile: expression }, { searchQuery: expression }];
    }

    const [total, newCount] = await Promise.all([BubbyLead.countDocuments(filter), BubbyLead.countDocuments({ status: "new" })]);
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const leads = await BubbyLead.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate({ path: "propertyIds", select: "address locality city" }).lean();
    return NextResponse.json({ leads, pagination: { page, pages, total, newCount } }, { headers: { "Cache-Control": "no-store" } });
}
