"use client";

import {
    AlertTriangle,
    Trash2,
} from "lucide-react";
import {
    useRouter,
} from "next/navigation";
import {
    type FormEvent,
    useState,
} from "react";

type Props = {
    userId: string;
    userName: string;
    userEmail: string;
    returnUrl: string;
};

export default function DeleteUserAccount({
                                              userId,
                                              userName,
                                              userEmail,
                                              returnUrl,
                                          }: Props) {
    const router =
        useRouter();

    const [
        open,
        setOpen,
    ] = useState(false);

    const [
        confirmation,
        setConfirmation,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const requiredText =
        "DELETE";

    async function handleDelete(
        event:
        FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (
            confirmation !==
            requiredText
        ) {
            setError(
                `Type ${requiredText} exactly to continue.`,
            );

            return;
        }

        const finalConfirmation =
            window.confirm(
                `Permanently delete ${userName}?\n\nThis will delete the account, properties, leads, analytics, uploaded media and related records. This action cannot be undone.`,
            );

        if (!finalConfirmation) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response =
                await fetch(
                    `/api/admin/users/${userId}/delete`,
                    {
                        method:
                            "DELETE",
                    },
                );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ??
                    "Unable to delete this account.",
                );
            }

            if (
                result.warning
            ) {
                window.alert(
                    `${result.message}\n\nWarning: ${result.warning}`,
                );
            }

            router.replace(
                returnUrl,
            );

            router.refresh();
        } catch (deleteError) {
            setError(
                deleteError instanceof
                Error
                    ? deleteError.message
                    : "Unable to delete this account.",
            );
        } finally {
            setLoading(false);
        }
    }

    if (!open) {
        return (
            <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">
                            Danger zone
                        </p>

                        <h2 className="mt-1 text-xl font-black text-red-950">
                            Permanently delete account
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-red-900/75">
                            This removes the user, their properties, leads, analytics, plan history, uploaded property media and related records.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setOpen(
                                true,
                            )
                        }
                        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700"
                    >
                        <Trash2
                            size={17}
                            aria-hidden="true"
                        />

                        Delete account
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-3xl border-2 border-red-300 bg-red-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                    <AlertTriangle
                        size={22}
                        aria-hidden="true"
                    />
                </span>

                <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">
                        Irreversible action
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-red-950">
                        Delete {userName}
                    </h2>

                    <p className="mt-1 text-sm font-semibold text-red-900/75">
                        {userEmail}
                    </p>
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-red-200 bg-white p-4">
                <p className="text-sm font-black text-red-950">
                    This permanently removes:
                </p>

                <ul className="mt-3 space-y-2 text-sm font-semibold text-red-900/80">
                    <li>
                        The account and profile
                    </li>
                    <li>
                        Every property listing
                    </li>
                    <li>
                        Property images and brochures
                    </li>
                    <li>
                        Leads and enquiries
                    </li>
                    <li>
                        Property analytics and boost history
                    </li>
                    <li>
                        Favourite references and related audit records
                    </li>
                </ul>
            </div>

            <form
                onSubmit={
                    handleDelete
                }
                className="mt-5"
            >
                <label className="block">
                    <span className="text-sm font-black text-red-950">
                        Type{" "}
                        <span className="font-mono">
                            DELETE
                        </span>{" "}
                        to confirm
                    </span>

                    <input
                        value={
                            confirmation
                        }
                        onChange={(
                            event,
                        ) => {
                            setConfirmation(
                                event.target.value,
                            );

                            setError("");
                        }}
                        autoComplete="off"
                        className="mt-2 min-h-12 w-full rounded-xl border border-red-300 bg-white px-4 font-mono text-sm font-black text-red-950 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        placeholder="DELETE"
                    />
                </label>

                {error && (
                    <p className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700">
                        {error}
                    </p>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            confirmation !==
                            requiredText
                        }
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Trash2
                            size={17}
                            aria-hidden="true"
                        />

                        {loading
                            ? "Deleting all data…"
                            : "Permanently delete everything"}
                    </button>

                    <button
                        type="button"
                        disabled={
                            loading
                        }
                        onClick={() => {
                            setOpen(
                                false,
                            );

                            setConfirmation(
                                "",
                            );

                            setError(
                                "",
                            );
                        }}
                        className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
}