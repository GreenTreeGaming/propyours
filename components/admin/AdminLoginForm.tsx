"use client";

import {
    FormEvent,
    useState,
} from "react";
import {
    useRouter,
} from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

type Props = {
    gateway: string;
};

export default function AdminLoginForm({
                                           gateway,
                                       }: Props) {
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
        error,
        setError,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(false);

    async function handleSubmit(
        event:
        FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        setError("");
        setLoading(true);

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
                setError(
                    data.error ??
                    "Unable to log in.",
                );
                return;
            }

            router.replace(
                `/control/${gateway}/dashboard`,
            );

            router.refresh();
        } catch {
            setError(
                "Unable to log in.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5">
            <form
                onSubmit={
                    handleSubmit
                }
                className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
            >
                <div className="mb-6 flex justify-center">
                    <BrandLogo
                        href={undefined}
                        priority
                        className="h-24 w-full max-w-[330px]"
                        imageClassName="object-center"
                    />
                </div>

                <h1 className="text-center text-2xl font-black text-white">
                    Administration sign in
                </h1>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Authorised personnel only.
                </p>

                <label className="mt-8 block text-sm font-bold text-slate-200">
                    Email
                </label>

                <input
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(
                        event,
                    ) =>
                        setEmail(
                            event.target
                                .value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                />

                <label className="mt-5 block text-sm font-bold text-slate-200">
                    Password
                </label>

                <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={
                        password
                    }
                    onChange={(
                        event,
                    ) =>
                        setPassword(
                            event.target
                                .value,
                        )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                />

                {error && (
                    <p className="mt-4 rounded-lg bg-red-950/60 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={
                        loading
                    }
                    className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 font-black text-slate-950 disabled:opacity-50"
                >
                    {loading
                        ? "Signing in…"
                        : "Sign in"}
                </button>
            </form>
        </main>
    );
}