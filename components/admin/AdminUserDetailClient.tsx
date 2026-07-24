"use client";

import {
    useEffect,
    useState,
} from "react";

type Props = {
    userId: string;
};

type UserDetail = {
    user: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        role: string;
        bio?: string;
        company?: string;
        address?: string;
        city?: string;
        favorites?: string[];
        plan?: unknown;
        createdAt: string;
        updatedAt: string;
    };

    properties: {
        items:
            Array<
                Record<
                    string,
                    unknown
                >
            >;
        total: number;
    };

    leads: {
        items:
            Array<
                Record<
                    string,
                    unknown
                >
            >;
        total: number;
    };
};

export default function AdminUserDetailClient({
                                                  userId,
                                              }: Props) {
    const [
        data,
        setData,
    ] = useState<
        UserDetail | null
    >(null);

    const [
        error,
        setError,
    ] = useState("");

    useEffect(() => {
        const controller =
            new AbortController();

        async function load() {
            try {
                const response =
                    await fetch(
                        `/api/admin/users/${userId}`,
                        {
                            cache:
                                "no-store",
                            signal:
                            controller
                                .signal,
                        },
                    );

                const result =
                    await response
                        .json();

                if (!response.ok) {
                    throw new Error(
                        result.error,
                    );
                }

                setData(result);
            } catch (loadError) {
                if (
                    loadError instanceof
                    DOMException &&
                    loadError.name ===
                    "AbortError"
                ) {
                    return;
                }

                setError(
                    "Unable to load this account.",
                );
            }
        }

        void load();

        return () =>
            controller.abort();
    }, [
        userId,
    ]);

    if (error) {
        return (
            <p className="text-red-700">
                {error}
            </p>
        );
    }

    if (!data) {
        return (
            <p>
                Loading account…
            </p>
        );
    }

    const {
        user,
    } = data;

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border bg-white p-6">
                <h1 className="text-2xl font-black">
                    {user.name}
                </h1>

                <dl className="mt-6 grid gap-4 md:grid-cols-2">
                    {[
                        [
                            "Email",
                            user.email,
                        ],
                        [
                            "Phone",
                            user.phone,
                        ],
                        [
                            "Role",
                            user.role,
                        ],
                        [
                            "Company",
                            user.company,
                        ],
                        [
                            "City",
                            user.city,
                        ],
                        [
                            "Address",
                            user.address,
                        ],
                        [
                            "Created",
                            user.createdAt,
                        ],
                        [
                            "Updated",
                            user.updatedAt,
                        ],
                    ].map(
                        ([
                             label,
                             value,
                         ]) => (
                            <div
                                key={
                                    label
                                }
                            >
                                <dt className="text-xs font-bold uppercase text-slate-500">
                                    {
                                        label
                                    }
                                </dt>

                                <dd className="mt-1 break-words">
                                    {value ||
                                        "—"}
                                </dd>
                            </div>
                        ),
                    )}
                </dl>

                <h2 className="mt-8 font-black">
                    Biography
                </h2>

                <p className="mt-2 whitespace-pre-wrap text-slate-700">
                    {user.bio ||
                        "No biography."}
                </p>

                <h2 className="mt-8 font-black">
                    Plan
                </h2>

                <pre className="mt-2 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                    {JSON.stringify(
                        user.plan,
                        null,
                        2,
                    )}
                </pre>
            </section>

            <section className="rounded-2xl border bg-white p-6">
                <h2 className="text-xl font-black">
                    Properties (
                    {
                        data
                            .properties
                            .total
                    }
                    )
                </h2>

                <pre className="mt-4 max-h-[600px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                    {JSON.stringify(
                        data
                            .properties
                            .items,
                        null,
                        2,
                    )}
                </pre>
            </section>

            <section className="rounded-2xl border bg-white p-6">
                <h2 className="text-xl font-black">
                    Leads (
                    {
                        data.leads
                            .total
                    }
                    )
                </h2>

                <pre className="mt-4 max-h-[600px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                    {JSON.stringify(
                        data.leads
                            .items,
                        null,
                        2,
                    )}
                </pre>
            </section>
        </div>
    );
}