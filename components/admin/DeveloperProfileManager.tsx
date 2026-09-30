"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ExternalLink, Loader2, Save } from "lucide-react";

type DeveloperProfile = {
    _id: string; name: string; bio: string; companyWebsite: string;
    reraNumber: string; address: string; city: string; listingCount: number;
};

export default function DeveloperProfileManager() {
    const [profiles, setProfiles] = useState<DeveloperProfile[]>([]);
    const [saving, setSaving] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/admin/developer-profiles", { cache: "no-store" })
            .then((response) => response.ok ? response.json() : Promise.reject())
            .then((data) => setProfiles(Array.isArray(data) ? data : []))
            .catch(() => setMessage("Developer profiles could not be loaded."));
    }, []);

    function update(id: string, patch: Partial<DeveloperProfile>) {
        setProfiles((current) => current.map((item) => item._id === id ? { ...item, ...patch } : item));
    }

    async function save(profile: DeveloperProfile) {
        setSaving(profile._id);
        setMessage("");
        try {
            const response = await fetch("/api/admin/developer-profiles", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to save developer profile.");
            update(profile._id, data);
            setMessage(`${profile.name} was updated.`);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to save developer profile.");
        } finally {
            setSaving(null);
        }
    }

    return (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Building2 size={20} /></span>
                    <div><h2 className="text-xl font-black text-slate-950">Developer profiles</h2><p className="text-sm text-slate-500">Created automatically from Developer / Builder names on listings.</p></div>
                </div>
                {message ? <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
            </div>
            <div className="grid gap-5 p-6 xl:grid-cols-2">
                {profiles.map((profile) => (
                    <article key={profile._id} className="rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div><h3 className="font-black text-slate-950">{profile.name}</h3><p className="text-xs font-semibold text-slate-500">{profile.listingCount} linked listing{profile.listingCount === 1 ? "" : "s"}</p></div>
                            <Link href={`/profile/${profile._id}`} className="text-emerald-700" aria-label={`View ${profile.name} profile`}><ExternalLink size={18} /></Link>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <input value={profile.city || ""} onChange={(e) => update(profile._id, { city: e.target.value })} placeholder="City" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
                            <input value={profile.reraNumber || ""} onChange={(e) => update(profile._id, { reraNumber: e.target.value })} placeholder="RERA number (optional)" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
                            <input value={profile.companyWebsite || ""} onChange={(e) => update(profile._id, { companyWebsite: e.target.value })} placeholder="https://company.com" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm sm:col-span-2" />
                            <input value={profile.address || ""} onChange={(e) => update(profile._id, { address: e.target.value })} placeholder="Company address" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm sm:col-span-2" />
                            <textarea value={profile.bio || ""} onChange={(e) => update(profile._id, { bio: e.target.value })} placeholder="Company profile and brand description" rows={4} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm sm:col-span-2" />
                        </div>
                        <button type="button" onClick={() => void save(profile)} disabled={saving === profile._id} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white disabled:opacity-60">
                            {saving === profile._id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save profile
                        </button>
                    </article>
                ))}
                {!profiles.length && !message ? <p className="text-sm text-slate-500">No listing developer names have been added yet.</p> : null}
            </div>
        </section>
    );
}
