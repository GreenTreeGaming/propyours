"use client";

import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
} from "lucide-react";
import {
    type FormEvent,
    useState,
} from "react";
import {
    useRouter,
} from "next/navigation";

export default function OwnerAccessLoginForm() {
    const router =
        useRouter();

    const [
        email,
        setEmail,
    ] = useState("");

    const [
        password,
        setPassword,
    ] = useState("");

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    async function handleSubmit(
        event:
        FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response =
                await fetch(
                    "/api/admin/login",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                email,
                                password,
                            }),
                    },
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ??
                    "Unable to sign in.",
                );
            }

            router.refresh();
        } catch (loginError) {
            setError(
                loginError instanceof
                Error
                    ? loginError.message
                    : "Unable to sign in.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_34%),linear-gradient(135deg,#020617_0%,#111827_100%)] px-5 py-10">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/20">
                        <ShieldCheck
                            size={30}
                            aria-hidden="true"
                        />
                    </span>

                    <h1 className="mt-5 text-3xl font-black tracking-tight text-white">
                        Owner access
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Sign in to retrieve today&apos;s PropYours administration link.
                    </p>
                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8"
                >
                    <label className="block">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-600">
                            Administrator email
                        </span>

                        <span className="relative mt-2 block">
                            <Mail
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                aria-hidden="true"
                            />

                            <input
                                type="email"
                                required
                                autoComplete="username"
                                value={email}
                                onChange={(
                                    event,
                                ) =>
                                    setEmail(
                                        event.target.value,
                                    )
                                }
                                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                placeholder="admin@propyours.com"
                            />
                        </span>
                    </label>

                    <label className="mt-5 block">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-600">
                            Password
                        </span>

                        <span className="relative mt-2 block">
                            <LockKeyhole
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                aria-hidden="true"
                            />

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(
                                    event,
                                ) =>
                                    setPassword(
                                        event.target.value,
                                    )
                                }
                                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (
                                            current,
                                        ) =>
                                            !current,
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff
                                        size={18}
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Eye
                                        size={18}
                                        aria-hidden="true"
                                    />
                                )}
                            </button>
                        </span>
                    </label>

                    {error && (
                        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={
                            loading
                        }
                        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
                    >
                        <ShieldCheck
                            size={18}
                            aria-hidden="true"
                        />

                        {loading
                            ? "Signing in…"
                            : "Continue securely"}
                    </button>
                </form>
            </div>
        </main>
    );
}