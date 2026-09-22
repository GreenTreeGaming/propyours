"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
    const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); setState("sending");
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());
        try {
            const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
            if (!response.ok) throw new Error();
            form.reset(); setState("sent");
        } catch { setState("error"); }
    }
    return <form onSubmit={(event) => void submit(event)} className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-gray-900">Leave your contact details</h2>
        <p className="mt-1 text-sm text-gray-600">Our team can follow up about your enquiry.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Name<input required name="name" maxLength={120} className="mt-2 w-full rounded-xl border border-gray-300 p-3" /></label><label className="text-sm font-bold">Phone<input required name="phone" type="tel" maxLength={30} className="mt-2 w-full rounded-xl border border-gray-300 p-3" /></label></div>
        <label className="mt-4 block text-sm font-bold">Email<input required name="email" type="email" maxLength={160} className="mt-2 w-full rounded-xl border border-gray-300 p-3" /></label>
        <label className="mt-4 block text-sm font-bold">How can we help?<textarea required name="message" minLength={10} maxLength={2000} rows={4} className="mt-2 w-full rounded-xl border border-gray-300 p-3" /></label>
        <button disabled={state === "sending"} className="mt-5 rounded-xl bg-teal-700 px-6 py-3 font-bold text-white disabled:opacity-50">{state === "sending" ? "Sending…" : "Send enquiry"}</button>
        {state === "sent" && <p role="status" className="mt-3 text-emerald-700">Your details were saved. We’ll be in touch.</p>}
        {state === "error" && <p role="alert" className="mt-3 text-red-700">Unable to save your enquiry. Please try again.</p>}
    </form>;
}
