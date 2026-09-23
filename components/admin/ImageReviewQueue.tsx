"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type ReviewProperty = { _id: string; address: string; locality?: string; city: string; images: string[] };

export default function ImageReviewQueue() {
    const [properties, setProperties] = useState<ReviewProperty[]>([]);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [preview, setPreview] = useState<{ images: string[]; index: number } | null>(null);
    useEffect(() => {
        fetch("/api/admin/property-images", { cache: "no-store" })
            .then((response) => response.ok ? response.json() : Promise.reject())
            .then((data) => setProperties(data.properties))
            .catch(() => setError("Unable to load image reviews."));
    }, []);
    useEffect(() => {
        if (!preview) return;
        const close = (event: KeyboardEvent) => { if (event.key === "Escape") setPreview(null); };
        window.addEventListener("keydown", close);
        return () => window.removeEventListener("keydown", close);
    }, [preview]);
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
            <div className="mt-3 flex gap-2 overflow-x-auto">{property.images.map((url, index) => <button type="button" key={url} onClick={() => setPreview({ images: property.images, index })} aria-label={`Open photo ${index + 1} full screen`} className="group relative h-32 w-40 shrink-0 overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-primary"><Image src={url} alt={`Photo ${index + 1} pending review`} fill sizes="160px" className="object-cover transition group-hover:scale-105" /><span className="absolute inset-x-2 bottom-2 rounded-md bg-slate-950/70 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">View full image</span></button>)}</div>
            <div className="mt-3 flex gap-2"><button disabled={busy === property._id} onClick={() => void decide(property._id, "approved")} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-50">Approve</button><button disabled={busy === property._id} onClick={() => void decide(property._id, "rejected")} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Reject</button></div>
        </article>)}</div>
        {preview && <div role="dialog" aria-modal="true" aria-label="Full size property photo" className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/90 p-4" onClick={() => setPreview(null)}>
            <button type="button" onClick={() => setPreview(null)} aria-label="Close image preview" className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"><X size={22} /></button>
            {preview.images.length > 1 && <button type="button" aria-label="Previous image" onClick={(event) => { event.stopPropagation(); setPreview((current) => current ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length } : null); }} className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"><ChevronLeft size={26} /></button>}
            <div className="relative h-[85vh] w-[min(92vw,1200px)]" onClick={(event) => event.stopPropagation()}><Image src={preview.images[preview.index]} alt={`Full size review photo ${preview.index + 1}`} fill sizes="92vw" className="object-contain" /></div>
            {preview.images.length > 1 && <button type="button" aria-label="Next image" onClick={(event) => { event.stopPropagation(); setPreview((current) => current ? { ...current, index: (current.index + 1) % current.images.length } : null); }} className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"><ChevronRight size={26} /></button>}
            <span className="absolute bottom-5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white">{preview.index + 1} / {preview.images.length}</span>
        </div>}
    </section>;
}
