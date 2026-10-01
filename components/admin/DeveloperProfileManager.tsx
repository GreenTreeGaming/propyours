"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Loader2, Save, Search } from "lucide-react";

type DeveloperProfile = {
    _id: string; name: string; bio: string; companyWebsite: string;
    reraNumber: string; address: string; city: string; listingCount: number;
};
type Pagination = { page: number; pages: number; total: number };

export default function DeveloperProfileManager() {
    const [profiles, setProfiles] = useState<DeveloperProfile[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
    const [page, setPage] = useState(1);
    const [searchDraft, setSearchDraft] = useState("");
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    const loadProfiles = useCallback(async () => {
        setLoading(true);
        setMessage("");
        try {
            const params = new URLSearchParams({ page: String(page), limit: "12" });
            if (search) params.set("q", search);
            const response = await fetch(`/api/admin/developer-profiles?${params}`, { cache: "no-store" });
            if (!response.ok) throw new Error();
            const data = await response.json();
            setProfiles(Array.isArray(data.profiles) ? data.profiles : []);
            setPagination(data.pagination ?? { page: 1, pages: 1, total: 0 });
        } catch {
            setMessage("Developer profiles could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { void loadProfiles(); }, [loadProfiles]);

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setExpandedId(null);
        setPage(1);
        setSearch(searchDraft.trim());
    }

    function update(id: string, patch: Partial<DeveloperProfile>) {
        setProfiles((current) => current.map((item) => item._id === id ? { ...item, ...patch } : item));
    }

    async function save(profile: DeveloperProfile) {
        setSaving(profile._id);
        setMessage("");
        try {
            const response = await fetch("/api/admin/developer-profiles", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...profile, id: profile._id }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to save developer profile.");
            update(profile._id, data);
            setMessage(`${profile.name} was updated.`);
            setExpandedId(null);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to save developer profile.");
        } finally {
            setSaving(null);
        }
    }

    return <section id="developer-profiles" className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Building2 size={20} /></span>
                    <div><h2 className="text-xl font-black text-slate-950">Developer profiles ({pagination.total})</h2><p className="text-sm text-slate-500">Manage profiles created from developer and builder names on listings.</p></div>
                </div>
                <form onSubmit={submitSearch} className="flex w-full max-w-md gap-2">
                    <label className="relative flex-1"><span className="sr-only">Search developer profiles</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search name, city or RERA" className="h-11 w-full rounded-xl border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-emerald-600" /></label>
                    <button type="submit" className="h-11 rounded-xl bg-slate-950 px-4 text-sm font-black text-white">Search</button>
                </form>
            </div>
            {message ? <p role="status" className="mt-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
        </div>

        {!loading ? <div className="divide-y divide-slate-200">{profiles.map((profile) => {
            const expanded = expandedId === profile._id;
            return <article key={profile._id}>
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 className="truncate font-black text-slate-950">{profile.name}</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{profile.listingCount} listing{profile.listingCount === 1 ? "" : "s"}</span></div><p className="mt-1 truncate text-xs text-slate-500">{[profile.city, profile.reraNumber ? `RERA ${profile.reraNumber}` : "RERA not added"].filter(Boolean).join(" · ")}</p></div>
                    <div className="flex items-center gap-2"><Link href={`/profile/${profile._id}`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-emerald-700 hover:bg-emerald-50" aria-label={`View ${profile.name} profile`}><ExternalLink size={15} /> View</Link><button type="button" onClick={() => setExpandedId(expanded ? null : profile._id)} aria-expanded={expanded} className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-50 px-3 text-xs font-black text-emerald-800 hover:bg-emerald-100">{expanded ? "Close" : "Edit"}<ChevronDown size={15} className={expanded ? "rotate-180" : ""} /></button></div>
                </div>
                {expanded ? <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <input value={profile.city || ""} onChange={(event) => update(profile._id, { city: event.target.value })} placeholder="City" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
                        <input value={profile.reraNumber || ""} onChange={(event) => update(profile._id, { reraNumber: event.target.value })} placeholder="RERA number (optional)" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" />
                        <input value={profile.companyWebsite || ""} onChange={(event) => update(profile._id, { companyWebsite: event.target.value })} placeholder="https://company.com" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm sm:col-span-2" />
                        <input value={profile.address || ""} onChange={(event) => update(profile._id, { address: event.target.value })} placeholder="Company address" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm sm:col-span-2" />
                        <textarea value={profile.bio || ""} onChange={(event) => update(profile._id, { bio: event.target.value })} placeholder="Company profile and brand description" rows={3} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm sm:col-span-2" />
                    </div>
                    <button type="button" onClick={() => void save(profile)} disabled={saving === profile._id} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white disabled:opacity-60">{saving === profile._id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save profile</button>
                </div> : null}
            </article>;
        })}</div> : null}

        {loading ? <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm font-semibold text-slate-500"><Loader2 size={17} className="animate-spin" /> Loading profiles</div> : null}
        {!loading && !profiles.length ? <p className="px-6 py-10 text-center text-sm text-slate-500">{search ? "No developer profiles match this search." : "No listing developer names have been added yet."}</p> : null}
        {pagination.total > 0 ? <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs font-semibold text-slate-500">Page {pagination.page} of {pagination.pages} · {pagination.total} profiles</p><div className="flex gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => { setExpandedId(null); setPage((value) => Math.max(1, value - 1)); }} className="inline-flex h-11 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700 disabled:opacity-40"><ChevronLeft size={15} /> Previous</button><button type="button" disabled={page >= pagination.pages || loading} onClick={() => { setExpandedId(null); setPage((value) => value + 1); }} className="inline-flex h-11 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700 disabled:opacity-40">Next <ChevronRight size={15} /></button></div></div> : null}
    </section>;
}
