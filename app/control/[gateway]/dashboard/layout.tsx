import Link from "next/link";
import {
    redirect,
} from "next/navigation";

import AdminLogoutButton from
        "@/components/admin/AdminLogoutButton";
import {
    getAuthenticatedAdmin,
} from "@/lib/admin/auth";

type Props = {
    children:
        React.ReactNode;

    params: Promise<{
        gateway: string;
    }>;
};

export default async function AdminDashboardLayout({
                                                       children,
                                                       params,
                                                   }: Props) {
    const {
        gateway,
    } = await params;

    const admin =
        await getAuthenticatedAdmin();

    if (!admin) {
        redirect(
            `/control/${gateway}`,
        );
    }

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-800 bg-slate-950 text-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
                    <div>
                        <Link
                            href={`/control/${gateway}/dashboard`}
                            className="font-black"
                        >
                            PropYours Control
                        </Link>

                        <p className="text-xs text-slate-400">
                            {admin.name} ·{" "}
                            {admin.role}
                        </p>
                    </div>

                    <AdminLogoutButton
                        gateway={
                            gateway
                        }
                    />
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-5 py-8">
                {children}
            </div>
        </main>
    );
}