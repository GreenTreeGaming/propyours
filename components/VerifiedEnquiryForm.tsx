"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail, Phone, ShieldCheck } from "lucide-react";

type OwnerContact = { name?: string | null; phone?: string | null; email?: string | null };
type Props = {
    variant: "property" | "bubby";
    propertyId?: string;
    propertyIds?: string[];
    searchFilters?: unknown;
    onSuccess?: () => void;
};

async function postJson(url: string, body: unknown) {
    const response = await fetch(url, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload && typeof payload.error === "string" ? payload.error : "Please try again.");
    return payload;
}

export default function VerifiedEnquiryForm({ variant, propertyId, propertyIds = [], searchFilters = null, onSuccess }: Props) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [consent, setConsent] = useState(false);
    const [stage, setStage] = useState<"details" | "code" | "verified" | "done">("details");
    const [token, setToken] = useState("");
    const [owner, setOwner] = useState<OwnerContact | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const isBubby = variant === "bubby";

    async function requestCode(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!consent) { setError("Please agree to be contacted about your enquiry."); return; }
        setBusy(true); setError("");
        try { await postJson("/api/lead-otp/send", { phone }); setStage("code"); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to send the code."); }
        finally { setBusy(false); }
    }

    async function saveLead(verificationToken: string) {
        const payload = isBubby
            ? await postJson("/api/bubby/lead", { name: name.trim(), email: email.trim(), mobile: phone.trim(), verificationToken, propertyIds, searchFilters, consent: true })
            : await postJson(`/api/property/${propertyId}/contact-request`, { name: name.trim(), email: email.trim(), phone: phone.trim(), verificationToken, consent: true });
        if (!isBubby) setOwner(payload.owner ?? null);
        setStage("done"); onSuccess?.();
    }

    async function verifyAndSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); setBusy(true); setError("");
        try {
            const payload = await postJson("/api/lead-otp/verify", { phone, otp });
            setToken(payload.token);
            setStage("verified");
            await saveLead(payload.token);
        } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to verify your phone."); }
        finally { setBusy(false); }
    }

    async function retrySave() {
        setBusy(true); setError("");
        try { await saveLead(token); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save your enquiry."); }
        finally { setBusy(false); }
    }

    const field = "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10";
    const action = "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-md shadow-primary/15 transition hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-55";
    return <div className="font-body">
        {stage === "done" ? <div className="space-y-4 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-primary"><CheckCircle2 size={26} aria-hidden="true" /></span>
            <h3 className="font-heading text-xl font-black text-slate-950">Your number is verified</h3>
            <p className="text-sm leading-6 text-slate-600">{isBubby ? "Your details have been saved. Bubby can help you explore matching properties." : "Your enquiry has been shared with the listing owner."}</p>
            {!isBubby && owner?.phone && <a className={action} href={`tel:${owner.phone}`}><Phone size={16} /> Call {owner.name || "owner"}</a>}
            {!isBubby && owner?.phone && <a className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 text-sm font-bold text-primary transition hover:bg-teal-100" href={`https://wa.me/${owner.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"><Phone size={16} /> WhatsApp owner</a>}
            {!isBubby && owner?.email && <a className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-primary transition hover:border-primary/40 hover:bg-teal-50" href={`mailto:${owner.email}`}><Mail size={16} /> Email owner</a>}
            <p className="border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">Want to save, compare, and shortlist homes? <Link className="font-bold text-primary underline underline-offset-2" href="/signup">Create an account</Link> whenever you’re ready.</p>
        </div> : <>
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary"><ShieldCheck size={18} /></span><div><p className="text-sm font-black text-slate-950">{isBubby ? "Get help with your property search" : "Get the owner’s contact details"}</p><p className="mt-1 text-xs leading-5 text-slate-600">{isBubby ? "Verify your mobile number so our team can follow up on your query." : "Share your details and verify your mobile number. No account is needed to enquire."}</p></div></div>
            {stage === "details" ? <form onSubmit={(event) => void requestCode(event)} className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Your name<input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" className={`mt-1.5 ${field}`} /></label>
                <label className="block text-xs font-bold text-slate-700">Email<input required type="email" maxLength={160} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className={`mt-1.5 ${field}`} /></label>
                <label className="block text-xs font-bold text-slate-700">WhatsApp / mobile number<div className="mt-1.5 flex gap-2"><span className="flex h-12 shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700">+91</span><input required type="tel" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="10-digit mobile number" className={field} /></div></label>
                <label className="flex items-start gap-2 pt-1 text-xs leading-5 text-slate-600"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-primary" /><span>I agree that PropYours may contact me about this enquiry. See our <Link href="/privacy" className="font-bold text-primary underline">Privacy Policy</Link>.</span></label>
                <button type="submit" disabled={busy} className={action}>{busy ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />} Send verification code</button>
            </form> : stage === "code" ? <form onSubmit={(event) => void verifyAndSave(event)} className="space-y-3">
                <p className="text-sm text-slate-600">Enter the six-digit code sent to <strong className="text-slate-950">{phone}</strong>.</p>
                <label className="block text-xs font-bold text-slate-700">Verification code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className={`mt-1.5 text-center tracking-[0.35em] ${field}`} /></label>
                <button type="submit" disabled={busy || otp.length !== 6} className={action}>{busy ? <Loader2 size={17} className="animate-spin" /> : <ShieldCheck size={17} />} Verify and continue</button>
                <button type="button" onClick={() => { setStage("details"); setOtp(""); setError(""); }} className="h-9 w-full text-xs font-bold text-primary hover:underline">Change number or resend code</button>
            </form> : <button type="button" onClick={() => void retrySave()} disabled={busy} className={action}>{busy ? "Saving…" : "Save enquiry"}</button>}
            {error && <p role="alert" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-800">{error}</p>}
        </>}
    </div>;
}
