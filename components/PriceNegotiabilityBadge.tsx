type PriceNegotiabilityBadgeProps = {
    negotiable?: boolean;
    className?: string;
};

export default function PriceNegotiabilityBadge({
                                                    negotiable,
                                                    className = "",
                                                }: PriceNegotiabilityBadgeProps) {
    // Do not incorrectly label legacy records where the field is absent.
    if (typeof negotiable !== "boolean") {
        return null;
    }

    const stateClasses = negotiable
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

    return (
        <span
            className={[
                "inline-flex items-center rounded-full border px-2.5 py-1",
                "text-[10px] font-black uppercase tracking-wide",
                stateClasses,
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {negotiable ? "Negotiable" : "Fixed price"}
        </span>
    );
}