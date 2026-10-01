"use client";

import Link from "next/link";
import { Bot, ChevronDown, ChevronLeft, ChevronRight, Loader2, Mail, MapPin, Phone, Search } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

type LeadStatus = "new" | "contacted" | "qualified" | "closed";
type LeadProperty = { _id: string; address: string; locality?: string; city?: string };
type BubbyLead = {
    _id: string; name: string; email: string; mobile: string; searchQuery?: string;
    searchFilters?: Record<string, unknown>; propertyIds?: LeadProperty[]; status: LeadStatus;
    submissionCount?: number; consentedAt: string; createdAt: string;
};
type Pagination = { page: number; pages: number; total: number; newCount: number };

const STATUS_LABELS: Record<LeadStatus, string> = { new: "New", contacted: "Contacted", qualified: "Qualified", closed: "Closed" };

function formatFilters(filters?: Record<string, unknown>) {
    if (!filters) return "No structured filters captured";
    const labels: Record<string, string> = { listingPurpose: "Purpose", propertyType: "Type", commercialType: "Commercial type", city: "City", locality: "Locality", minPrice: "Min price", maxPrice: "Max price", minBedrooms: "Min BHK", maxBedrooms: "Max BHK", minSize: "Min size", maxSize: "Max size", negotiable: "Negotiable", searchText: "Search" };
    const values = Object.entries(filters).filter(([key, value]) => key !== "sort" && key !== "amenities" && value !== null && value !== undefined && value !== "").map(([key, value]) => `${labels[key] ?? key}: ${String(value)}`);
    if (Array.isArray(filters.amenities) && filters.amenities.length) values.push(`Amenities: ${filters.amenities.join(", ")}`);
    return values.length ? values.join(" · ") : "No structured filters captured";
}

export default function BubbyLeadInbox() {
    const [leads, setLeads] = useState<BubbyLead[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0, newCount: 0 });
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<LeadStatus | "all">("all");
    const [searchDraft, setSearchDraft] = useState("");
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);

    const loadLeads = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const params = new URLSearchParams({ page: String(page), limit: "15", status });
            if (search) params.set("q", search);
            const response = await fetch(`/api/admin/bubby-leads?${params}`, { cache: "no-store" });
            if (!response.ok) throw new Error();
            const data = await response.json();
            setLeads(data.leads ?? []);
            setPagination(data.pagination ?? { page: 1, pages: 1, total: 0, newCount: 0 });
        } catch { setError("Unable to load Bubby leads."); }
        finally { setLoading(false); }
    }, [page, search, status]);

    useEffect(() => { void loadLeads(); }, [loadLeads]);

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); setPage(1); setExpandedId(null); setSearch(searchDraft.trim());
    }

    async function updateStatus(id: string, nextStatus: LeadStatus) {
        setBusy(id); setError("");
        try {
            const response = await fetch(`/api/admin/bubby-leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
            if (!response.ok) throw new Error();
            await loadLeads();
        } catch { setError("Unable to update the Bubby lead."); }
        finally { setBusy(null); }
    }

    return <section id="leads" className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-primary"><Bot size={19} /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black text-slate-950">Bubby guest leads ({pagination.total})</h2><span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-black text-primary">{pagination.newCount} new</span></div><p className="text-sm text-slate-500">Verified contact details from signed out visitors using Bubby chat.</p></div></div>
                <form onSubmit={submitSearch} className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
                    <label className="relative flex-1"><span className="sr-only">Search Bubby leads</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search name, phone, email or query" className="h-11 w-full rounded-xl border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-primary" /></label>
                    <select value={status} onChange={(event) => { setStatus(event.target.value as LeadStatus | "all"); setPage(1); setExpandedId(null); }} aria-label="Filter leads by status" className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700"><option value="all">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option></select>
                    <button type="submit" className="h-11 rounded-xl bg-slate-950 px-4 text-sm font-black text-white">Search</button>
                </form>
            </div>
            {error ? <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800">{error}</p> : null}
        </div>

        {!loading ? <div className="divide-y divide-slate-200">{leads.map((lead) => {
            const expanded = expandedId === lead._id;
            return <article key={lead._id}>
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <button type="button" onClick={() => setExpandedId(expanded ? null : lead._id)} aria-expanded={expanded} className="min-w-0 text-left">
                        <div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-slate-950">{lead.name}</h3><span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-primary">Phone verified</span>{(lead.submissionCount ?? 1) > 1 ? <span className="text-xs font-bold text-slate-400">{lead.submissionCount} submissions</span> : null}</div>
                        <p className="mt-1 truncate text-xs text-slate-500">{lead.mobile} · {lead.email} · {new Date(lead.createdAt).toLocaleDateString("en-IN")}</p>
                    </button>
                    <div className="flex items-center gap-2">
                        <select disabled={busy === lead._id} value={lead.status} onChange={(event) => void updateStatus(lead._id, event.target.value as LeadStatus)} aria-label={`Status for ${lead.name}`} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-primary"><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option></select>
                        <button type="button" onClick={() => setExpandedId(expanded ? null : lead._id)} aria-label={`${expanded ? "Hide" : "Show"} details for ${lead.name}`} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600"><ChevronDown size={17} className={expanded ? "rotate-180" : ""} /></button>
                    </div>
                </div>
                {expanded ? <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
                    <div className="grid gap-2 sm:grid-cols-2"><a href={`tel:${lead.mobile}`} className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2.5 text-sm font-bold text-primary"><Phone size={15} /> {lead.mobile}</a><a href={`mailto:${lead.email}`} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-slate-700"><Mail size={15} /> {lead.email}</a></div>
                    <a href={`https://wa.me/${lead.mobile.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-xs font-black text-primary underline underline-offset-2">Open WhatsApp</a>
                    {lead.searchQuery ? <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/60 p-3"><p className="text-[10px] font-black uppercase tracking-wider text-primary">What they asked Bubby</p><p className="mt-1 text-sm leading-6 text-slate-700">{lead.searchQuery}</p></div> : null}
                    <div className="mt-3"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Search details</p><p className="mt-1 text-xs leading-5 text-slate-600">{formatFilters(lead.searchFilters)}</p></div>
                    {lead.propertyIds?.length ? <div className="mt-3"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Matching properties</p><div className="mt-2 flex flex-wrap gap-2">{lead.propertyIds.map((property) => <Link key={property._id} href={`/property/${property._id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-primary hover:bg-teal-50"><MapPin size={13} /> {property.address}{property.locality ? `, ${property.locality}` : ""}</Link>)}</div></div> : null}
                    <p className="mt-3 text-[10px] font-semibold text-slate-400">Consent recorded {new Date(lead.consentedAt).toLocaleString("en-IN")} · {STATUS_LABELS[lead.status]}</p>
                </div> : null}
            </article>;
        })}</div> : null}

        {loading ? <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm font-semibold text-slate-500"><Loader2 size={17} className="animate-spin" /> Loading leads</div> : null}
        {!loading && leads.length === 0 && !error ? <div className="px-5 py-10 text-center text-sm font-semibold text-slate-500">{search || status !== "all" ? "No Bubby leads match these filters." : "No Bubby guest leads yet."}</div> : null}
        {pagination.total > 0 ? <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs font-semibold text-slate-500">Page {pagination.page} of {pagination.pages} · {pagination.total} leads</p><div className="flex gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => { setExpandedId(null); setPage((value) => Math.max(1, value - 1)); }} className="inline-flex h-11 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700 disabled:opacity-40"><ChevronLeft size={15} /> Previous</button><button type="button" disabled={page >= pagination.pages || loading} onClick={() => { setExpandedId(null); setPage((value) => value + 1); }} className="inline-flex h-11 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700 disabled:opacity-40">Next <ChevronRight size={15} /></button></div></div> : null}
    </section>;
}
