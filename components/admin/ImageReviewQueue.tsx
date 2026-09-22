"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ReviewProperty = { _id: string; address: string; locality?: string; city: string; images: string[] };

export default function ImageReviewQueue() {
    const [properties, setProperties] = useState<ReviewProperty[]>([]);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState("");
    useEffect(() => {
        fetch("/api/admin/property-images", { cache: "no-store" })
            .then((response) => response.ok ? response.json() : Promise.reject())
            .then((data) => setProperties(data.properties))
            .catch(() => setError("Unable to load image reviews."));
    }, []);
    async function decide(id: string, status: "approved" | "rejected") {
        const note = status === "rejected" ? window.prompt("Reason for rejection (optional):") : "";
        if (note === null) return;
        setBusy(id); setError("");
        try {
            const response = await fetch(`/api/admin/property-images/${id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, note }),
            });
            if (!response.ok) throw new Error();
            setProperties((current) => current.filter((property) => property._id !== id));
        } catch { setError("Unable to save the review. Please retry."); }
        finally { setBusy(null); }
    }
    return <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-slate-950">Images awaiting screening ({properties.length})</h2>
        <p className="mt-1 text-sm text-slate-500">Review customer photos before they appear publicly.</p>
        {error && <p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800">{error}</p>}
        <div className="mt-4 space-y-5">{properties.map((property) => <article key={property._id} className="rounded-xl border border-slate-200 p-4">
            <p className="font-bold">{property.address}, {property.locality}, {property.city}</p>
            <div className="mt-3 flex gap-2 overflow-x-auto">{property.images.map((url) => <div key={url} className="relative h-32 w-40 shrink-0"><Image src={url} alt="Photo pending review" fill sizes="160px" className="rounded-lg object-cover" /></div>)}</div>
            <div className="mt-3 flex gap-2"><button disabled={busy === property._id} onClick={() => void decide(property._id, "approved")} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-50">Approve</button><button disabled={busy === property._id} onClick={() => void decide(property._id, "rejected")} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Reject</button></div>
        </article>)}</div>
    </section>;
}
