import mongoose from "mongoose";
import {
    NextResponse,
} from "next/server";

import {
    getAuthenticatedAdmin,
} from "@/lib/admin/auth";
import {
    writeAdminAudit,
} from "@/lib/admin/audit";
import {
    isAdminRole,
} from "@/lib/admin/roles";
import {
    connectDB,
} from "@/lib/mongoose";
import {
    hasTrustedOrigin,
} from "@/lib/security/trusted-origin";
import {
    deleteUploadThingFilesByUrls,
} from "@/lib/uploadthing-storage";

import AdminAuditLog from
        "@/models/AdminAuditLog";
import AnalyticsEvent from
        "@/models/AnalyticsEvent";
import BoostTransaction from
        "@/models/BoostTransaction";
import Lead from "@/models/Lead";
import PhoneOtp from
        "@/models/PhoneOtp";
import Property from
        "@/models/Property";
import User from "@/models/User";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function DELETE(
    request: Request,
    context: RouteContext,
) {
    try {
        if (
            !hasTrustedOrigin(
                request,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid request origin.",
                },
                {
                    status: 403,
                },
            );
        }

        const admin =
            await getAuthenticatedAdmin();

        if (!admin) {
            return NextResponse.json(
                {
                    error:
                        "Unauthorized.",
                },
                {
                    status: 401,
                },
            );
        }

        const {
            id,
        } = await context.params;

        if (
            !mongoose.Types.ObjectId
                .isValid(id)
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid user ID.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            admin.userId === id
        ) {
            return NextResponse.json(
                {
                    error:
                        "You cannot delete your own administrator account.",
                },
                {
                    status: 400,
                },
            );
        }

        await connectDB();

        const target =
            await User.findById(id)
                .select(
                    "name email phone role",
                )
                .lean();

        if (!target) {
            return NextResponse.json(
                {
                    error:
                        "User not found.",
                },
                {
                    status: 404,
                },
            );
        }

        /*
         * A normal Admin may delete ordinary users.
         * Only a SuperAdmin may delete another
         * Admin or SuperAdmin.
         */
        if (
            isAdminRole(
                target.role,
            ) &&
            admin.role !==
            "SuperAdmin"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Only a SuperAdmin can delete an administrator account.",
                },
                {
                    status: 403,
                },
            );
        }

        /*
         * Never allow deletion of the final
         * SuperAdmin account.
         */
        if (
            target.role ===
            "SuperAdmin"
        ) {
            const superAdminCount =
                await User.countDocuments({
                    role:
                        "SuperAdmin",
                });

            if (
                superAdminCount <= 1
            ) {
                return NextResponse.json(
                    {
                        error:
                            "The final SuperAdmin account cannot be deleted.",
                    },
                    {
                        status: 409,
                    },
                );
            }
        }

        /*
         * Read property data before deleting it
         * so we can remove analytics, leads,
         * favourites and uploaded media.
         */
        const properties =
            await Property.find({
                userId: id,
            })
                .select(
                    "_id images brochure.url",
                )
                .lean();

        const propertyIds =
            properties.map(
                (
                    property,
                ) =>
                    property._id,
            );

        const uploadUrls =
            properties.flatMap(
                (
                    property,
                ) => [
                    ...(
                        property.images ??
                        []
                    ),

                    property.brochure
                        ?.url,
                ],
            )
                .filter(
                    (
                        value,
                    ): value is string =>
                        typeof value ===
                        "string" &&
                        value.trim()
                            .length > 0,
                );

        const leadFilter = {
            $or: [
                {
                    ownerId:
                    id,
                },
                {
                    viewerId:
                    id,
                },
                {
                    propertyId: {
                        $in:
                        propertyIds,
                    },
                },
            ],
        };

        /*
         * Collect counts before deletion so the
         * permanent deletion audit entry records
         * exactly what was removed.
         */
        const [
            propertyCount,
            leadCount,
            analyticsCount,
            boostTransactionCount,
            auditLogCount,
        ] = await Promise.all([
            Property.countDocuments({
                userId: id,
            }),

            Lead.countDocuments(
                leadFilter,
            ),

            AnalyticsEvent.countDocuments({
                propertyId: {
                    $in:
                    propertyIds,
                },
            }),

            BoostTransaction.countDocuments({
                $or: [
                    {
                        userId:
                        id,
                    },
                    {
                        propertyId: {
                            $in:
                            propertyIds,
                        },
                    },
                ],
            }),

            AdminAuditLog.countDocuments({
                $or: [
                    {
                        actorUserId:
                        id,
                    },
                    {
                        targetUserId:
                        id,
                    },
                ],
            }),
        ]);

        /*
         * Use a MongoDB transaction so the
         * database deletion is all-or-nothing.
         * MongoDB Atlas supports transactions.
         */
        const session =
            await mongoose
                .startSession();

        try {
            await session.withTransaction(
                async () => {
                    /*
                     * Remove deleted properties from
                     * every account's favourites.
                     */
                    if (
                        propertyIds.length >
                        0
                    ) {
                        await User.updateMany(
                            {},
                            {
                                $pull: {
                                    favorites: {
                                        $in:
                                        propertyIds,
                                    },
                                },
                            },
                            {
                                session,
                            },
                        );

                        await AnalyticsEvent.deleteMany(
                            {
                                propertyId: {
                                    $in:
                                    propertyIds,
                                },
                            },
                            {
                                session,
                            },
                        );
                    }

                    await Lead.deleteMany(
                        leadFilter,
                        {
                            session,
                        },
                    );

                    await BoostTransaction.deleteMany(
                        {
                            $or: [
                                {
                                    userId:
                                    id,
                                },
                                {
                                    propertyId: {
                                        $in:
                                        propertyIds,
                                    },
                                },
                            ],
                        },
                        {
                            session,
                        },
                    );

                    await Property.deleteMany(
                        {
                            userId:
                            id,
                        },
                        {
                            session,
                        },
                    );

                    if (
                        target.phone
                    ) {
                        await PhoneOtp.deleteMany(
                            {
                                phone:
                                target.phone,
                            },
                            {
                                session,
                            },
                        );
                    }

                    /*
                     * Remove old audit entries that
                     * directly reference the deleted
                     * account.
                     */
                    await AdminAuditLog.deleteMany(
                        {
                            $or: [
                                {
                                    actorUserId:
                                    id,
                                },
                                {
                                    targetUserId:
                                    id,
                                },
                            ],
                        },
                        {
                            session,
                        },
                    );

                    await User.deleteOne(
                        {
                            _id:
                            id,
                        },
                        {
                            session,
                        },
                    );
                },
            );
        } finally {
            await session.endSession();
        }

        /*
         * Store a new audit entry without
         * targetUserId because that user no
         * longer exists.
         */
        await writeAdminAudit({
            request,
            actorUserId:
            admin.userId,
            actorRole:
            admin.role,
            action:
                "user.permanently_deleted",

            metadata: {
                deletedUser: {
                    id,
                    name:
                    target.name,
                    email:
                    target.email,
                    phone:
                        target.phone ??
                        null,
                    role:
                    target.role,
                },

                deletedRecords: {
                    properties:
                    propertyCount,
                    leads:
                    leadCount,
                    analyticsEvents:
                    analyticsCount,
                    boostTransactions:
                    boostTransactionCount,
                    previousAuditLogs:
                    auditLogCount,
                },
            },
        });

        /*
         * External UploadThing deletion cannot be
         * part of the MongoDB transaction.
         * The account is still deleted if media
         * cleanup fails, but the response reports
         * the cleanup warning.
         */
        let mediaDeletedCount =
            0;

        let mediaCleanupWarning:
            string | null = null;

        try {
            const mediaResult =
                await deleteUploadThingFilesByUrls(
                    uploadUrls,
                );

            mediaDeletedCount =
                mediaResult
                    .deletedCount;
        } catch (mediaError) {
            console.error(
                "Account deleted, but uploaded media cleanup failed:",
                mediaError,
            );

            mediaCleanupWarning =
                "The account and database records were deleted, but some uploaded media may require manual cleanup.";
        }

        return NextResponse.json({
            success: true,

            message:
                `${target.name}'s account and related data were permanently deleted.`,

            deleted: {
                user:
                    1,
                properties:
                propertyCount,
                leads:
                leadCount,
                analyticsEvents:
                analyticsCount,
                boostTransactions:
                boostTransactionCount,
                auditLogs:
                auditLogCount,
                uploadedFiles:
                mediaDeletedCount,
            },

            warning:
            mediaCleanupWarning,
        });
    } catch (error) {
        console.error(
            "Permanent user deletion failed:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to permanently delete this account.",
            },
            {
                status: 500,
            },
        );
    }
}