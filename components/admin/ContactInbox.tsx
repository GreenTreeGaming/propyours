"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Inquiry = { _id: string; name: string; email: string; phone: string; message: string; source?: string; propertyId?: string | null; createdAt: string };
export default function ContactInbox() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [error, setError] = useState("");
    useEffect(() => { fetch("/api/admin/contact-inquiries", { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => setInquiries(data.inquiries)).catch(() => setError("Unable to load contact enquiries.")); }, []);
    return <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-slate-950">Contact enquiries ({inquiries.length})</h2>
        <p className="mt-1 text-sm text-slate-500">Contact page and property enquiries, stored in MongoDB.</p>
        {error && <p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800">{error}</p>}
        <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">{inquiries.map((item) => <article key={item._id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-950">{item.name} · {new Date(item.createdAt).toLocaleDateString("en-IN")}</p>{item.source === "property-contact" && <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary">Verified property enquiry</span>}</div>
            <p className="mt-1 text-sm"><a href={`mailto:${item.email}`} className="text-primary underline">{item.email}</a> · <a href={`tel:${item.phone}`} className="text-primary underline">{item.phone}</a></p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{item.message}</p>
            {item.propertyId && <Link href={`/property/${item.propertyId}`} className="mt-2 inline-block text-sm font-bold text-primary underline underline-offset-2">View property</Link>}
        </article>)}</div>
    </section>;
}
