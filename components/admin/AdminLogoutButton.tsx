"use client";

import {
    useRouter,
} from "next/navigation";

type Props = {
    gateway: string;
};

export default function AdminLogoutButton({
                                              gateway,
                                          }: Props) {
    const router =
        useRouter();

    async function logout() {
        await fetch(
            "/api/admin/logout",
            {
                method: "POST",
            },
        );

        router.replace(
            `/control/${gateway}`,
        );

        router.refresh();
    }

    return (
        <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-slate-800"
        >
            Log out
        </button>
    );
}