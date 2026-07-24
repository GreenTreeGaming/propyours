import { redirect } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";

type Props = {
    children: React.ReactNode;
    params: Promise<{
        gateway: string;
    }>;
};

export default async function AdminDashboardLayout({
                                                       children,
                                                       params,
                                                   }: Props) {
    const { gateway } = await params;
    const admin = await getAuthenticatedAdmin();

    if (!admin) {
        redirect(`/control/${gateway}`);
    }

    return (
        <AdminShell gateway={gateway} admin={admin}>
            {children}
        </AdminShell>
    );
}
