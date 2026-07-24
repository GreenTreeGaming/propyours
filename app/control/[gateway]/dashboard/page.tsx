import AdminDashboardClient from
        "@/components/admin/AdminDashboardClient";

type Props = {
    params: Promise<{
        gateway: string;
    }>;
};

export default async function AdminDashboardPage({
                                                     params,
                                                 }: Props) {
    const {
        gateway,
    } = await params;

    return (
        <AdminDashboardClient
            gateway={gateway}
        />
    );
}