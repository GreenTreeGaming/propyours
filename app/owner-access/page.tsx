import type {
    Metadata,
} from "next";

import OwnerAccessLoginForm from
        "@/components/admin/OwnerAccessLoginForm";
import OwnerAccessPanel from
        "@/components/admin/OwnerAccessPanel";
import {
    getAuthenticatedAdmin,
} from "@/lib/admin/auth";
import {
    getCurrentAdminGateway,
} from "@/lib/admin/gateway";

export const dynamic =
    "force-dynamic";

export const metadata:
    Metadata = {
    title:
        "Owner Access",

    robots: {
        index: false,
        follow: false,
        noarchive: true,
        nosnippet: true,
    },
};

function getSiteUrl():
    string {
    const siteUrl =
        process.env
            .NEXT_PUBLIC_SITE_URL
            ?.trim();

    if (!siteUrl) {
        if (
            process.env.NODE_ENV ===
            "development"
        ) {
            return "http://localhost:3000";
        }

        throw new Error(
            "NEXT_PUBLIC_SITE_URL is not configured.",
        );
    }

    return siteUrl.replace(
        /\/$/,
        "",
    );
}

export default async function OwnerAccessPage() {
    const admin =
        await getAuthenticatedAdmin();

    if (!admin) {
        return (
            <OwnerAccessLoginForm />
        );
    }

    if (
        admin.role !==
        "SuperAdmin"
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5">
                <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
                    <h1 className="text-2xl font-black text-slate-950">
                        SuperAdmin required
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        This page is restricted to the primary PropYours owner.
                    </p>
                </section>
            </main>
        );
    }

    const gateway =
        getCurrentAdminGateway();

    const adminUrl =
        `${getSiteUrl()}/control/${gateway}/dashboard`;

    return (
        <OwnerAccessPanel
            adminUrl={
                adminUrl
            }
            admin={{
                name:
                admin.name,
                email:
                admin.email,
                role:
                admin.role,
            }}
        />
    );
}