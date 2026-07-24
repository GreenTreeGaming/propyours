"use client";

import {
    Check,
    Copy,
    ExternalLink,
    LogOut,
    ShieldCheck,
} from "lucide-react";
import {
    useRouter,
} from "next/navigation";
import {
    useState,
} from "react";

type Props = {
    adminUrl: string;

    admin: {
        name: string;
        email: string;
        role: string;
    };
};

export default function OwnerAccessPanel({
                                             adminUrl,
                                             admin,
                                         }: Props) {
    const router =
        useRouter();

    const [
        copied,
        setCopied,
    ] = useState(false);

    const [
        loggingOut,
        setLoggingOut,
    ] = useState(false);

    async function copyLink() {
        try {
            await navigator
                .clipboard
                .writeText(
                    adminUrl,
                );

            setCopied(true);

            window.setTimeout(
                () =>
                    setCopied(
                        false,
                    ),
                2_000,
            );
        } catch {
            window.prompt(
                "Copy this admin link:",
                adminUrl,
            );
        }
    }

    async function logout() {
        setLoggingOut(true);

        try {
            await fetch(
                "/api/admin/logout",
                {
                    method:
                        "POST",
                },
            );
        } finally {
            router.refresh();
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_34%),linear-gradient(135deg,#020617_0%,#111827_100%)] px-5 py-10">
            <section className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
                <div className="bg-slate-950 p-6 text-white sm:p-8">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                        <div>
                            <h1 className="mt-4 text-3xl font-black tracking-tight">
                                Administration access
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Signed in as{" "}
                                <span className="font-bold text-white">
                                    {admin.name}
                                </span>
                                .
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                void logout()
                            }
                            disabled={
                                loggingOut
                            }
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-black text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
                        >
                            <LogOut
                                size={16}
                                aria-hidden="true"
                            />

                            {loggingOut
                                ? "Signing out…"
                                : "Sign out"}
                        </button>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                        Today&apos;s secure link
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-slate-950">
                        Open the admin dashboard
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        This link changes automatically every day. Bookmark this owner-access page instead of bookmarking the rotating link.
                    </p>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="break-all font-mono text-sm font-bold text-slate-800">
                            {adminUrl}
                        </p>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <a
                            href={
                                adminUrl
                            }
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white transition hover:bg-emerald-700"
                        >
                            <ExternalLink
                                size={18}
                                aria-hidden="true"
                            />

                            Open dashboard
                        </a>

                        <button
                            type="button"
                            onClick={() =>
                                void copyLink()
                            }
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
                        >
                            {copied ? (
                                <Check
                                    size={18}
                                    className="text-emerald-600"
                                    aria-hidden="true"
                                />
                            ) : (
                                <Copy
                                    size={18}
                                    aria-hidden="true"
                                />
                            )}

                            {copied
                                ? "Copied"
                                : "Copy link"}
                        </button>
                    </div>

                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-bold text-amber-900">
                            Bookmark:
                        </p>

                        <p className="mt-1 text-sm text-amber-800">
                            Bookmark{" "}
                            <strong>
                                /owner-access
                            </strong>
                            , not the rotating control URL.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}