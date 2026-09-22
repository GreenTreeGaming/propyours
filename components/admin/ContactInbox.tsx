"use client";

import { useEffect, useState } from "react";

type Inquiry = { _id: string; name: string; email: string; phone: string; message: string; createdAt: string };
export default function ContactInbox() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [error, setError] = useState("");
    useEffect(() => { fetch("/api/admin/contact-inquiries", { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => setInquiries(data.inquiries)).catch(() => setError("Unable to load contact enquiries.")); }, []);
    return <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-black text-slate-950">Contact enquiries ({inquiries.length})</h2><p className="mt-1 text-sm text-slate-500">Details submitted through the contact page, stored in MongoDB.</p>{error && <p role="alert" className="mt-3 text-red-600">{error}</p>}<div className="mt-4 max-h-96 space-y-3 overflow-y-auto">{inquiries.map((item) => <article key={item._id} className="rounded-xl border border-slate-200 p-4"><p className="font-bold">{item.name} · {new Date(item.createdAt).toLocaleDateString("en-IN")}</p><p className="mt-1 text-sm"><a href={`mailto:${item.email}`} className="text-teal-700 underline">{item.email}</a> · <a href={`tel:${item.phone}`} className="text-teal-700 underline">{item.phone}</a></p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{item.message}</p></article>)}</div></section>;
}
