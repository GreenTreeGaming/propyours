"use client";

type Props = {
    value: boolean;
    onChange: (value: boolean) => void;
};

export default function NegotiabilityToggle({ value, onChange }: Props) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={value}
            onClick={() => onChange(!value)}
            className={`flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-4 focus:ring-primary/10 ${
                value
                    ? "border-primary bg-teal-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
            }`}
        >
            <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-slate-950">
                        Allow price negotiation
                    </span>
                    <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                            value
                                ? "bg-primary text-white"
                                : "bg-slate-100 text-slate-600"
                        }`}
                    >
                        {value ? "Negotiable" : "Fixed price"}
                    </span>
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {value
                        ? "Buyers can discuss the listed amount."
                        : "The listed amount is final."}
                </span>
            </span>

            <span
                aria-hidden="true"
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    value ? "bg-primary" : "bg-slate-300"
                }`}
            >
                <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        value ? "translate-x-6" : "translate-x-1"
                    }`}
                />
            </span>
        </button>
    );
}
