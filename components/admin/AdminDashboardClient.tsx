"use client";

import Link from "next/link";
import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import {
    USER_ROLES,
    type UserRole,
} from "@/lib/admin/roles";

type AdminUser = {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    company: string;
    city: string;
    propertyCount: number;
    favoritesCount: number;
    createdAt: string;
};

type Overview = {
    admin: {
        name: string;
        email: string;
        role:
            "Admin" |
            "SuperAdmin";
    };

    counts: {
        users: number;
        admins: number;
        properties: number;
        activeProperties: number;
        leads: number;
    };
};

type UsersResponse = {
    users: AdminUser[];

    pagination: {
        page: number;
        pages: number;
        total: number;
    };
};

type Props = {
    gateway: string;
};

export default function AdminDashboardClient({
                                                 gateway,
                                             }: Props) {
    const [
        overview,
        setOverview,
    ] = useState<
        Overview | null
    >(null);

    const [
        users,
        setUsers,
    ] = useState<
        AdminUser[]
    >([]);

    const [
        page,
        setPage,
    ] = useState(1);

    const [
        pages,
        setPages,
    ] = useState(1);

    const [
        draftQuery,
        setDraftQuery,
    ] = useState("");

    const [
        query,
        setQuery,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState("");

    useEffect(() => {
        const controller =
            new AbortController();

        async function load() {
            try {
                const search =
                    new URLSearchParams({
                        page:
                            String(
                                page,
                            ),
                        limit: "20",
                    });

                if (query) {
                    search.set(
                        "q",
                        query,
                    );
                }

                const [
                    overviewResponse,
                    usersResponse,
                ] =
                    await Promise.all([
                        fetch(
                            "/api/admin/overview",
                            {
                                cache:
                                    "no-store",
                                signal:
                                controller
                                    .signal,
                            },
                        ),

                        fetch(
                            `/api/admin/users?${search.toString()}`,
                            {
                                cache:
                                    "no-store",
                                signal:
                                controller
                                    .signal,
                            },
                        ),
                    ]);

                if (
                    !overviewResponse.ok ||
                    !usersResponse.ok
                ) {
                    throw new Error(
                        "Unable to load admin data.",
                    );
                }

                const overviewData =
                    await overviewResponse
                        .json() as Overview;

                const usersData =
                    await usersResponse
                        .json() as UsersResponse;

                setOverview(
                    overviewData,
                );

                setUsers(
                    usersData.users,
                );

                setPages(
                    usersData
                        .pagination
                        .pages,
                );

                setError("");
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
                    "Unable to load admin data.",
                );
            }
        }

        void load();

        return () => {
            controller.abort();
        };
    }, [
        page,
        query,
    ]);

    function submitSearch(
        event:
        FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        setPage(1);
        setQuery(
            draftQuery.trim(),
        );
    }

    async function updateRole(
        userId: string,
        role: UserRole,
    ) {
        const response =
            await fetch(
                `/api/admin/users/${userId}/role`,
                {
                    method:
                        "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body:
                        JSON.stringify({
                            role,
                        }),
                },
            );

        const data =
            await response.json();

        if (!response.ok) {
            window.alert(
                data.error ??
                "Unable to update role.",
            );
            return;
        }

        setUsers(
            (currentUsers) =>
                currentUsers.map(
                    (user) =>
                        user.id ===
                        userId
                            ? {
                                ...user,
                                role,
                            }
                            : user,
                ),
        );
    }

    if (error) {
        return (
            <p className="rounded-xl bg-red-50 p-5 text-red-700">
                {error}
            </p>
        );
    }

    if (!overview) {
        return (
            <p className="text-slate-500">
                Loading dashboard…
            </p>
        );
    }

    const cards = [
        [
            "Users",
            overview.counts
                .users,
        ],
        [
            "Administrators",
            overview.counts
                .admins,
        ],
        [
            "Properties",
            overview.counts
                .properties,
        ],
        [
            "Active properties",
            overview.counts
                .activeProperties,
        ],
        [
            "Leads",
            overview.counts
                .leads,
        ],
    ] as const;

    return (
        <div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {cards.map(
                    ([
                         label,
                         value,
                     ]) => (
                        <article
                            key={
                                label
                            }
                            className="rounded-2xl border border-slate-200 bg-white p-5"
                        >
                            <p className="text-sm font-bold text-slate-500">
                                {label}
                            </p>

                            <p className="mt-2 text-3xl font-black text-slate-950">
                                {value}
                            </p>
                        </article>
                    ),
                )}
            </div>

            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 p-5">
                    <h2 className="text-xl font-black">
                        Accounts
                    </h2>

                    <form
                        onSubmit={
                            submitSearch
                        }
                        className="mt-4 flex gap-3"
                    >
                        <input
                            value={
                                draftQuery
                            }
                            onChange={(
                                event,
                            ) =>
                                setDraftQuery(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Search name, email, phone or company"
                            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3"
                        />

                        <button
                            className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white"
                            type="submit"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-left text-sm">
                        <thead className="bg-slate-50">
                        <tr>
                            <th className="p-4">
                                Account
                            </th>
                            <th className="p-4">
                                Contact
                            </th>
                            <th className="p-4">
                                Location
                            </th>
                            <th className="p-4">
                                Listings
                            </th>
                            <th className="p-4">
                                Role
                            </th>
                            <th className="p-4">
                                Details
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {users.map(
                            (
                                user,
                            ) => (
                                <tr
                                    key={
                                        user.id
                                    }
                                    className="border-t border-slate-100"
                                >
                                    <td className="p-4">
                                        <p className="font-bold">
                                            {
                                                user.name
                                            }
                                        </p>

                                        <p className="text-slate-500">
                                            {
                                                user.company
                                            }
                                        </p>
                                    </td>

                                    <td className="p-4">
                                        <p>
                                            {
                                                user.email
                                            }
                                        </p>

                                        <p className="text-slate-500">
                                            {
                                                user.phone
                                            }
                                        </p>
                                    </td>

                                    <td className="p-4">
                                        {
                                            user.city ||
                                            "—"
                                        }
                                    </td>

                                    <td className="p-4">
                                        {
                                            user.propertyCount
                                        }
                                    </td>

                                    <td className="p-4">
                                        <select
                                            value={
                                                user.role
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                void updateRole(
                                                    user.id,
                                                    event
                                                        .target
                                                        .value as UserRole,
                                                )
                                            }
                                            className="rounded-lg border border-slate-300 px-3 py-2"
                                        >
                                            {USER_ROLES.map(
                                                (
                                                    role,
                                                ) => (
                                                    <option
                                                        key={
                                                            role
                                                        }
                                                        value={
                                                            role
                                                        }
                                                    >
                                                        {
                                                            role
                                                        }
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </td>

                                    <td className="p-4">
                                        <Link
                                            href={`/control/${gateway}/dashboard/users/${user.id}`}
                                            className="font-bold text-emerald-700"
                                        >
                                            Open
                                        </Link>
                                    </td>
                                </tr>
                            ),
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 p-5">
                    <button
                        type="button"
                        disabled={
                            page <= 1
                        }
                        onClick={() =>
                            setPage(
                                (
                                    current,
                                ) =>
                                    current -
                                    1,
                            )
                        }
                        className="rounded-lg border px-4 py-2 disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <p>
                        Page {page} of{" "}
                        {pages}
                    </p>

                    <button
                        type="button"
                        disabled={
                            page >= pages
                        }
                        onClick={() =>
                            setPage(
                                (
                                    current,
                                ) =>
                                    current +
                                    1,
                            )
                        }
                        className="rounded-lg border px-4 py-2 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </section>
        </div>
    );
}