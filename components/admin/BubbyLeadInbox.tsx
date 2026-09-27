"use client";

import Link from "next/link";
import { Bot, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

type LeadStatus = "new" | "contacted" | "qualified" | "closed";
type LeadProperty = { _id: string; address: string; locality?: string; city?: string };
type BubbyLead = {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    searchQuery?: string;
    searchFilters?: Record<string, unknown>;
    propertyIds?: LeadProperty[];
    status: LeadStatus;
    submissionCount?: number;
    consentedAt: string;
    createdAt: string;
};

const STATUS_LABELS: Record<LeadStatus, string> = { new: "New", contacted: "Contacted", qualified: "Qualified", closed: "Closed" };

function formatFilters(filters?: Record<string, unknown>) {
    if (!filters) return "No structured filters captured";
    const labels: Record<string, string> = { listingPurpose: "Purpose", propertyType: "Type", commercialType: "Commercial type", city: "City", locality: "Locality", minPrice: "Min price", maxPrice: "Max price", minBedrooms: "Min BHK", maxBedrooms: "Max BHK", minSize: "Min size", maxSize: "Max size", negotiable: "Negotiable", searchText: "Search" };
    const values = Object.entries(filters)
        .filter(([key, value]) => key !== "sort" && key !== "amenities" && value !== null && value !== undefined && value !== "")
        .map(([key, value]) => `${labels[key] ?? key}: ${String(value)}`);
    if (Array.isArray(filters.amenities) && filters.amenities.length) values.push(`Amenities: ${filters.amenities.join(", ")}`);
    return values.length ? values.join(" · ") : "No structured filters captured";
}

export default function BubbyLeadInbox() {
    const [leads, setLeads] = useState<BubbyLead[]>([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/bubby-leads", { cache: "no-store" })
            .then((response) => response.ok ? response.json() : Promise.reject())
            .then((data) => setLeads(data.leads ?? []))
            .catch(() => setError("Unable to load Bubby leads."));
    }, []);

    async function updateStatus(id: string, status: LeadStatus) {
        setBusy(id); setError("");
        try {
            const response = await fetch(`/api/admin/bubby-leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
            if (!response.ok) throw new Error();
            setLeads((current) => current.map((lead) => lead._id === id ? { ...lead, status } : lead));
        } catch { setError("Unable to update the Bubby lead."); }
        finally { setBusy(null); }
    }

    return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="flex items-center gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-primary"><Bot size={19} /></span><div><h2 className="text-xl font-black text-slate-950">Bubby guest leads ({leads.length})</h2><p className="mt-1 text-sm text-slate-500">Verified contact details collected from signed out visitors in Bubby chat.</p></div></div></div>
            <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-primary">{leads.filter((lead) => lead.status === "new").length} new</span>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800">{error}</p>}
        {leads.length === 0 && !error ? <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm font-semibold text-slate-500">No Bubby guest leads yet.</div> : null}
        <div className="mt-5 max-h-[680px] space-y-4 overflow-y-auto pr-1">{leads.map((lead) => <article key={lead._id} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-black text-slate-950">{lead.name}</h3><span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary">Phone verified</span>{(lead.submissionCount ?? 1) > 1 && <span className="text-xs font-bold text-slate-400">Submitted {lead.submissionCount} times</span>}</div><p className="mt-1 text-xs text-slate-500">Received {new Date(lead.createdAt).toLocaleString("en-IN")}</p></div>
                <select disabled={busy === lead._id} value={lead.status} onChange={(event) => void updateStatus(lead._id, event.target.value as LeadStatus)} aria-label={`Status for ${lead.name}`} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-primary"><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option></select>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2"><a href={`tel:${lead.mobile}`} className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2.5 text-sm font-bold text-primary"><Phone size={15} /> {lead.mobile}</a><a href={`mailto:${lead.email}`} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700"><Mail size={15} /> {lead.email}</a></div>
            <a href={`https://wa.me/${lead.mobile.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-xs font-black text-primary underline underline-offset-2">Open WhatsApp</a>
            {lead.searchQuery && <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/60 p-3"><p className="text-[10px] font-black uppercase tracking-wider text-primary">What they asked Bubby</p><p className="mt-1 text-sm leading-6 text-slate-700">{lead.searchQuery}</p></div>}
            <div className="mt-3"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Search details</p><p className="mt-1 text-xs leading-5 text-slate-600">{formatFilters(lead.searchFilters)}</p></div>
            {lead.propertyIds?.length ? <div className="mt-3"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Matching properties</p><div className="mt-2 flex flex-wrap gap-2">{lead.propertyIds.map((property) => <Link key={property._id} href={`/property/${property._id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-bold text-primary hover:bg-teal-50"><MapPin size={13} /> {property.address}{property.locality ? `, ${property.locality}` : ""}</Link>)}</div></div> : null}
            <p className="mt-3 text-[10px] font-semibold text-slate-400">Consent recorded {new Date(lead.consentedAt).toLocaleString("en-IN")} · {STATUS_LABELS[lead.status]}</p>
        </article>)}</div>
    </section>;
}
