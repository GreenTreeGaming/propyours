import {
    connectDB,
} from "@/lib/mongoose";
import {
    getHashedClientIdentifier,
} from "@/lib/request-identity";
import {
    type AdminRole,
} from "@/lib/admin/roles";

import AdminAuditLog from
        "@/models/AdminAuditLog";

type AuditInput = {
    request: Request;
    actorUserId: string;
    actorRole: AdminRole;
    action: string;
    targetUserId?: string;
    metadata?: Record<
        string,
        unknown
    >;
};

export async function writeAdminAudit(
    input: AuditInput,
): Promise<void> {
    try {
        await connectDB();

        await AdminAuditLog.create({
            actorUserId:
            input.actorUserId,
            actorRole:
            input.actorRole,
            action:
            input.action,
            targetUserId:
            input.targetUserId,
            clientIdentifier:
                getHashedClientIdentifier(
                    input.request,
                ),
            metadata:
                input.metadata ?? {},
        });
    } catch (error) {
        console.error(
            "Unable to write admin audit log:",
            error,
        );
    }
}