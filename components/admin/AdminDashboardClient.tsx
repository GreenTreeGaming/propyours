"use client";

import {
    Activity,
    Building2,
    ChevronLeft,
    ChevronRight,
    Crown,
    Home,
    Mail,
    Search,
    ShieldCheck,
    UserRound,
    Users,
} from "lucide-react";
import Link from "next/link";
import {
    type FormEvent,
    useEffect,
    useState,
} from "react";

import {
    USER_ROLES,
    type UserRole,
} from "@/lib/admin/roles";

type UserPlan = {
    audience?: "owner" | "builder";
    tier?: string;
    status?: string;
};

type AdminUser = {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    company: string;
    city: string;
    plan?: UserPlan;
    propertyCount: number;
    favoritesCount: number;
    createdAt: string;
};

type Overview = {
    admin: {
        name: string;
        email: string;
        role: "Admin" | "SuperAdmin";
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

function formatDate(
    value?: string | null,
): string {
    if (!value) {
        return "Unknown";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return "Unknown";
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    ).format(date);
}

function planLabel(plan?: UserPlan): string {
    if (!plan?.tier) {
        return "No plan";
    }

    return plan.tier
        .split("-")
        .map(
            (part) =>
                part.charAt(0).toUpperCase() + part.slice(1),
        )
        .join(" ");
}

export default function AdminDashboardClient({
                                                 gateway,
                                             }: Props) {
    const [overview, setOverview] = useState<Overview | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [draftQuery, setDraftQuery] = useState("");
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [changingRole, setChangingRole] = useState<string | null>(null);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            setLoading(true);

            try {
                const search = new URLSearchParams({
                    page: String(page),
                    limit: "20",
                });

                if (query) {
                    search.set("q", query);
                }

                const [overviewResponse, usersResponse] =
                    await Promise.all([
                        fetch("/api/admin/overview", {
                            cache: "no-store",
                            signal: controller.signal,
                        }),
                        fetch(
                            `/api/admin/users?${search.toString()}`,
                            {
                                cache: "no-store",
                                signal: controller.signal,
                            },
                        ),
                    ]);

                if (!overviewResponse.ok || !usersResponse.ok) {
                    throw new Error("Unable to load admin data.");
                }

                const overviewData =
                    (await overviewResponse.json()) as Overview;
                const usersData =
                    (await usersResponse.json()) as UsersResponse;

                setOverview(overviewData);
                setUsers(usersData.users);
                setPages(usersData.pagination.pages);
                setError("");
            } catch (loadError) {
                if (
                    loadError instanceof DOMException &&
                    loadError.name === "AbortError"
                ) {
                    return;
                }

                setError("Unable to load admin data.");
            } finally {
                setLoading(false);
            }
        }

        void load();

        return () => controller.abort();
    }, [page, query]);

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPage(1);
        setQuery(draftQuery.trim());
    }

    async function updateRole(
        user: AdminUser,
        nextRole: UserRole,
    ) {
        if (user.role === nextRole) {
            return;
        }

        const confirmed = window.confirm(
            `Change ${user.name}'s role from ${user.role} to ${nextRole}? Their active sessions will be revoked.`,
        );

        if (!confirmed) {
            return;
        }

        setChangingRole(user.id);
        setNotice("");

        try {
            const response = await fetch(
                `/api/admin/users/${user.id}/role`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        role: nextRole,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ?? "Unable to update role.",
                );
            }

            setUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser.id === user.id
                        ? {
                            ...currentUser,
                            role: nextRole,
                        }
                        : currentUser,
                ),
            );

            setNotice(`${user.name}'s role was updated.`);
        } catch (roleError) {
            setNotice(
                roleError instanceof Error
                    ? roleError.message
                    : "Unable to update role.",
            );
        } finally {
            setChangingRole(null);
        }
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
                <p className="font-black">Dashboard unavailable</p>
                <p className="mt-1 text-sm">{error}</p>
            </div>
        );
    }

    if (!overview || (loading && users.length === 0)) {
        return (
            <div className="space-y-6">
                <div className="h-28 animate-pulse rounded-3xl bg-white" />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-32 animate-pulse rounded-2xl bg-white"
                        />
                    ))}
                </div>
                <div className="h-96 animate-pulse rounded-3xl bg-white" />
            </div>
        );
    }

    const cards = [
        {
            label: "Registered users",
            value: overview.counts.users,
            description: "All accounts",
            icon: Users,
            iconClass: "bg-sky-50 text-sky-700",
        },
        {
            label: "Administrators",
            value: overview.counts.admins,
            description: "Admin access",
            icon: ShieldCheck,
            iconClass: "bg-violet-50 text-violet-700",
        },
        {
            label: "Properties",
            value: overview.counts.properties,
            description: "All listings",
            icon: Building2,
            iconClass: "bg-amber-50 text-amber-700",
        },
        {
            label: "Active properties",
            value: overview.counts.activeProperties,
            description: "Currently public",
            icon: Home,
            iconClass: "bg-emerald-50 text-emerald-700",
        },
        {
            label: "Leads",
            value: overview.counts.leads,
            description: "Recorded enquiries",
            icon: Activity,
            iconClass: "bg-rose-50 text-rose-700",
        },
    ] as const;

    return (
        <div className="space-y-7">
            <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10 sm:p-8">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                            <Crown size={14} aria-hidden="true" />
                            {overview.admin.role}
                        </span>

                        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                            Welcome back, {overview.admin.name}
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                            Review account activity, manage permissions,
                            inspect listings and control plan access from one
                            place.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                            Signed in as
                        </p>
                        <p className="mt-2 flex items-center gap-2 font-bold">
                            <Mail
                                size={16}
                                className="text-emerald-300"
                                aria-hidden="true"
                            />
                            {overview.admin.email}
                        </p>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {cards.map(
                    ({
                         label,
                         value,
                         description,
                         icon: Icon,
                         iconClass,
                     }) => (
                        <article
                            key={label}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-500">
                                        {label}
                                    </p>
                                    <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                                        {value}
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-slate-400">
                                        {description}
                                    </p>
                                </div>

                                <span
                                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}
                                >
                                    <Icon size={20} aria-hidden="true" />
                                </span>
                            </div>
                        </article>
                    ),
                )}
            </section>

            <section
                id="accounts"
                className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
                <div className="border-b border-slate-200 p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                                Account directory
                            </p>
                            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                                People using PropYours
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Search accounts, inspect profiles and safely
                                manage roles.
                            </p>
                        </div>

                        <form
                            onSubmit={submitSearch}
                            className="flex w-full max-w-xl gap-2"
                        >
                            <label className="relative min-w-0 flex-1">
                                <Search
                                    size={18}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    aria-hidden="true"
                                />
                                <span className="sr-only">
                                    Search accounts
                                </span>
                                <input
                                    value={draftQuery}
                                    onChange={(event) =>
                                        setDraftQuery(event.target.value)
                                    }
                                    placeholder="Name, email, phone or company"
                                    className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                />
                            </label>

                            <button
                                className="min-h-12 rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800"
                                type="submit"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {notice && (
                        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                            {notice}
                        </p>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1120px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Account</th>
                            <th className="px-5 py-4">Contact</th>
                            <th className="px-5 py-4">Plan</th>
                            <th className="px-5 py-4">Activity</th>
                            <th className="px-5 py-4">Joined</th>
                            <th className="px-5 py-4">Role</th>
                            <th className="px-6 py-4 text-right">
                                Actions
                            </th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                        {users.map((user) => {
                            const initials =
                                user.name
                                    .split(/\s+/)
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((part) =>
                                        part[0]?.toUpperCase(),
                                    )
                                    .join("") || "U";

                            return (
                                <tr
                                    key={user.id}
                                    className="transition hover:bg-slate-50/80"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white">
                                                    {initials}
                                                </span>
                                            <div className="min-w-0">
                                                <p className="truncate font-black text-slate-950">
                                                    {user.name}
                                                </p>
                                                <p className="truncate text-xs font-semibold text-slate-500">
                                                    {user.company ||
                                                        user.city ||
                                                        "Individual account"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-5">
                                        <p className="font-semibold text-slate-700">
                                            {user.email}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {user.phone || "No phone"}
                                        </p>
                                    </td>

                                    <td className="px-5 py-5">
                                            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                                                {planLabel(user.plan)}
                                            </span>
                                        <p className="mt-1 text-xs font-semibold capitalize text-slate-500">
                                            {user.plan?.status || "unknown"}
                                        </p>
                                    </td>

                                    <td className="px-5 py-5">
                                        <p className="font-black text-slate-800">
                                            {user.propertyCount} listing
                                            {user.propertyCount === 1
                                                ? ""
                                                : "s"}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {user.favoritesCount} favourite
                                            {user.favoritesCount === 1
                                                ? ""
                                                : "s"}
                                        </p>
                                    </td>

                                    <td className="px-5 py-5 text-slate-600">
                                        {formatDate(user.createdAt)}
                                    </td>

                                    <td className="px-5 py-5">
                                        <select
                                            value={user.role}
                                            disabled={
                                                changingRole === user.id
                                            }
                                            onChange={(event) =>
                                                void updateRole(
                                                    user,
                                                    event.target
                                                        .value as UserRole,
                                                )
                                            }
                                            className="min-h-10 min-w-40 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-emerald-500 disabled:cursor-wait disabled:opacity-60"
                                        >
                                            {USER_ROLES.map((role) => (
                                                <option
                                                    key={role}
                                                    value={role}
                                                >
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                        <Link
                                            href={`/control/${gateway}/dashboard/users/${user.id}`}
                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700"
                                        >
                                            <UserRound
                                                size={16}
                                                aria-hidden="true"
                                            />
                                            Manage
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}

                        {users.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-6 py-16 text-center"
                                >
                                    <p className="font-black text-slate-700">
                                        No accounts found
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Try a different search.
                                    </p>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:px-6">
                    <p className="text-sm font-semibold text-slate-500">
                        Page <span className="font-black text-slate-800">{page}</span>{" "}
                        of <span className="font-black text-slate-800">{pages}</span>
                    </p>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() =>
                                setPage((current) => current - 1)
                            }
                            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={16} aria-hidden="true" />
                            Previous
                        </button>

                        <button
                            type="button"
                            disabled={page >= pages}
                            onClick={() =>
                                setPage((current) => current + 1)
                            }
                            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ChevronRight size={16} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
