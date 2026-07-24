import AdminUserDetailClient from
        "@/components/admin/AdminUserDetailClient";

type Props = {
    params: Promise<{
        gateway: string;
        id: string;
    }>;
};

export default async function AdminUserPage({
                                                params,
                                            }: Props) {
    const {
        gateway,
        id,
    } = await params;

    return (
        <AdminUserDetailClient
            userId={id}
            gateway={gateway}
        />
    );
}