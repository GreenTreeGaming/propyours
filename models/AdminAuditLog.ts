import mongoose from "mongoose";

const AdminAuditLogSchema =
    new mongoose.Schema(
        {
            actorUserId: {
                type:
                mongoose.Schema.Types
                    .ObjectId,
                ref: "User",
                required: true,
                index: true,
            },

            actorRole: {
                type: String,
                required: true,
            },

            action: {
                type: String,
                required: true,
                index: true,
            },

            targetUserId: {
                type:
                mongoose.Schema.Types
                    .ObjectId,
                ref: "User",
                required: false,
                index: true,
            },

            clientIdentifier: {
                type: String,
                required: true,
            },

            metadata: {
                type:
                mongoose.Schema.Types
                    .Mixed,
                default: {},
            },
        },
        {
            timestamps: {
                createdAt: true,
                updatedAt: false,
            },
        },
    );

AdminAuditLogSchema.index({
    actorUserId: 1,
    createdAt: -1,
});

AdminAuditLogSchema.index({
    targetUserId: 1,
    createdAt: -1,
});

const AdminAuditLog =
    mongoose.models
        .AdminAuditLog ||
    mongoose.model(
        "AdminAuditLog",
        AdminAuditLogSchema,
    );

export default AdminAuditLog;