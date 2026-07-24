"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
    gateway: string;
    compact?: boolean;
};

export default function AdminLogoutButton({
                                              gateway,
                                              compact = false,
                                          }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function logout() {
        setLoading(true);

        try {
            await fetch("/api/admin/logout", {
                method: "POST",
            });
        } finally {
            router.replace(`/control/${gateway}`);
            router.refresh();
        }
    }

    return (
        <button
            type="button"
            onClick={() => void logout()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-bold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
            aria-label="Log out of the admin console"
        >
            <LogOut size={17} aria-hidden="true" />
            {!compact && (
                <span>{loading ? "Signing out…" : "Sign out"}</span>
            )}
        </button>
    );
}
