"use client";

import { BadgeIndianRupee, ShieldCheck } from "lucide-react";

type Props = {
    zeroBrokerage: boolean;
    onChange: (zeroBrokerage: boolean) => void;
};

export default function BrokerageChoice({
    zeroBrokerage,
    onChange,
}: Props) {
    const options = [
        {
            value: true,
            title: "Zero Brokerage",
            description: "No agent brokerage applies to this property.",
            icon: ShieldCheck,
        },
        {
            value: false,
            title: "Brokerage Applies",
            description: "Agent or broker charges may apply.",
            icon: BadgeIndianRupee,
        },
    ];

    return (
        <div
            role="radiogroup"
            aria-label="Brokerage preference"
            className="grid gap-3 sm:grid-cols-2"
        >
            {options.map((option) => {
                const selected = zeroBrokerage === option.value;
                const Icon = option.icon;

                return (
                    <button
                        key={option.title}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(option.value)}
                        className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-primary/10 ${
                            selected
                                ? option.value
                                    ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500/10"
                                    : "border-amber-300 bg-amber-50 ring-2 ring-amber-400/10"
                                : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                    >
                        <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                selected
                                    ? option.value
                                        ? "bg-emerald-600 text-white"
                                        : "bg-amber-500 text-white"
                                    : "bg-slate-100 text-slate-500"
                            }`}
                        >
                            <Icon size={18} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-sm font-black text-slate-950">
                                {option.title}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                                {option.description}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
