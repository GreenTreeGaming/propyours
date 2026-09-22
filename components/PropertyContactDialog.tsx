"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import VerifiedEnquiryForm from "@/components/VerifiedEnquiryForm";

export default function PropertyContactDialog({ propertyId, address, onClose, onSuccess }: { propertyId: string; address: string; onClose: () => void; onSuccess?: () => void }) {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const node = dialog.current;
        if (node && !node.open) node.showModal();
        return () => { if (node?.open) node.close(); };
    }, []);
    return <dialog ref={dialog} onClose={onClose} className="m-auto w-[calc(100%-2rem)] max-w-[470px] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-white p-0 text-slate-950 shadow-[0_30px_90px_rgba(15,23,42,0.22)] backdrop:bg-slate-950/55 backdrop:backdrop-blur-[3px]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">PropYours enquiry</p><h2 className="mt-1 font-heading text-xl font-black tracking-tight">Contact this property’s owner</h2><p className="mt-1 line-clamp-1 text-xs text-slate-500">{address}</p></div><button type="button" onClick={() => dialog.current?.close()} aria-label="Close contact form" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-primary"><X size={18} /></button></div>
        <div className="p-5 sm:p-6"><VerifiedEnquiryForm variant="property" propertyId={propertyId} onSuccess={onSuccess} /></div>
    </dialog>;
}
