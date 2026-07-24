import {
    type Metadata,
} from "next";
import {
    notFound,
} from "next/navigation";

import {
    isValidAdminGateway,
} from "@/lib/admin/gateway";

export const metadata:
    Metadata = {
    title:
        "PropYours Control",
    robots: {
        index: false,
        follow: false,
        noarchive: true,
        nosnippet: true,
    },
};

type Props = {
    children:
        React.ReactNode;

    params: Promise<{
        gateway: string;
    }>;
};

export default async function AdminGatewayLayout({
                                                     children,
                                                     params,
                                                 }: Props) {
    const {
        gateway,
    } = await params;

    if (
        !isValidAdminGateway(
            gateway,
        )
    ) {
        notFound();
    }

    return children;
}