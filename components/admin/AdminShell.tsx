"use client";

import {
    Building2,
    ExternalLink,
    LayoutDashboard,
    Menu,
    ShieldCheck,
    Users,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

type Props = {
    children: React.ReactNode;
    gateway: string;
    admin: {
        name: string;
        email: string;
        role: "Admin" | "SuperAdmin";
    };
};

export default function AdminShell({
                                       children,
                                       gateway,
                                       admin,
                                   }: Props) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const dashboardUrl = `/control/${gateway}/dashboard`;

    const navigation = [
        {
            label: "Overview",
            href: dashboardUrl,
            icon: LayoutDashboard,
            active: pathname === dashboardUrl,
        },
        {
            label: "Accounts",
            href: `${dashboardUrl}#accounts`,
            icon: Users,
            active: pathname.includes("/dashboard/users/"),
        },
    ];

    const initials =
        admin.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "A";

    const sidebar = (
        <div className="flex h-full flex-col bg-slate-950 text-white">
            <div className="flex h-20 items-center border-b border-white/10 px-5">
                <Link
                    href={dashboardUrl}
                    className="flex items-center gap-3"
                    onClick={() => setMobileOpen(false)}
                >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20">
                        <ShieldCheck size={23} aria-hidden="true" />
                    </span>

                    <span>
                        <span className="block text-base font-black tracking-tight">
                            PropYours
                        </span>
                        <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                            Control centre
                        </span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 space-y-2 px-3 py-5">
                <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                    Administration
                </p>

                {navigation.map(({ label, href, icon: Icon, active }) => (
                    <Link
                        key={label}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                            active
                                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15"
                                : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        <Icon size={18} aria-hidden="true" />
                        {label}
                    </Link>
                ))}

                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                    <ExternalLink size={18} aria-hidden="true" />
                    Open public site
                </Link>
            </nav>

            <div className="border-t border-white/10 p-4">
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400 font-black text-slate-950">
                        {initials}
                    </span>

                    <span className="min-w-0">
                        <span className="block truncate text-sm font-black">
                            {admin.name}
                        </span>
                        <span className="block truncate text-xs text-slate-400">
                            {admin.email}
                        </span>
                        <span className="mt-1 inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-300">
                            {admin.role}
                        </span>
                    </span>
                </div>

                <AdminLogoutButton gateway={gateway} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 text-slate-950">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
                {sidebar}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close navigation"
                        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />

                    <aside className="relative h-full w-[min(86vw,320px)] shadow-2xl">
                        <button
                            type="button"
                            className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close menu"
                        >
                            <X size={20} aria-hidden="true" />
                        </button>
                        {sidebar}
                    </aside>
                </div>
            )}

            <div className="lg:pl-72">
                <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
                    <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(true)}
                                className="rounded-xl border border-slate-200 p-2.5 text-slate-700 lg:hidden"
                                aria-label="Open admin navigation"
                            >
                                <Menu size={20} aria-hidden="true" />
                            </button>

                            <div className="min-w-0">
                                <p className="truncate text-lg font-black tracking-tight text-slate-950">
                                    Administration
                                </p>
                                <p className="truncate text-xs font-semibold text-slate-500">
                                    Manage accounts, plans, listings and enquiries
                                </p>
                            </div>
                        </div>

                        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
                            <Building2
                                size={16}
                                className="text-emerald-700"
                                aria-hidden="true"
                            />
                            <span className="text-xs font-bold text-slate-600">
                                Live database
                            </span>
                        </div>
                    </div>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <div className="mx-auto max-w-[1500px]">{children}</div>
                </main>
            </div>
        </div>
    );
}
