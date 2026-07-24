import {
    redirect,
} from "next/navigation";

import AdminLoginForm from
        "@/components/admin/AdminLoginForm";
import {
    getAuthenticatedAdmin,
} from "@/lib/admin/auth";

type Props = {
    params: Promise<{
        gateway: string;
    }>;
};

export default async function AdminLoginPage({
                                                 params,
                                             }: Props) {
    const {
        gateway,
    } = await params;

    const admin =
        await getAuthenticatedAdmin();

    if (admin) {
        redirect(
            `/control/${gateway}/dashboard`,
        );
    }

    return (
        <AdminLoginForm
            gateway={gateway}
        />
    );
}