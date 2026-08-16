import mongoose, { type ClientSession } from "mongoose";

import { connectDB } from "@/lib/mongoose";
import { getPlanLimits } from "@/lib/plans";
import Property from "@/models/Property";
import User from "@/models/User";

export class ListingCapacityError extends Error {
    constructor(
        message: string,
        public readonly status = 403,
    ) {
        super(message);
        this.name = "ListingCapacityError";
    }
}

function activeListingIds(user: any): mongoose.Types.ObjectId[] {
    return Array.isArray(user.listingUsage?.activeListingIds)
        ? user.listingUsage.activeListingIds
        : [];
}

export async function createActiveListing(
    userId: string,
    values: Record<string, unknown>,
) {
    await connectDB();

    const session = await mongoose.startSession();

    try {
        let property: any;

        await session.withTransaction(async () => {
            const user = await User.findById(userId).session(session);

            if (!user) {
                throw new ListingCapacityError("User not found.", 404);
            }

            const limits = getPlanLimits(user);
            const propertyId = new mongoose.Types.ObjectId();

            const reserved = await User.findOneAndUpdate(
                {
                    _id: user._id,
                    $expr: {
                        $lt: [
                            {
                                $size: {
                                    $ifNull: [
                                        "$listingUsage.activeListingIds",
                                        [],
                                    ],
                                },
                            },
                            limits.activeProperties,
                        ],
                    },
                },
                {
                    $push: {
                        "listingUsage.activeListingIds": propertyId,
                    },
                },
                {
                    new: true,
                    session,
                },
            );

            if (!reserved) {
                throw new ListingCapacityError(
                    `Your ${limits.tier} plan allows up to ${limits.activeProperties} active listing(s).`,
                );
            }

            const created = await Property.create(
                [
                    {
                        _id: propertyId,
                        userId: user._id,
                        ...values,
                        status: "active",
                    },
                ],
                { session },
            );

            property = created[0];
        });

        return property;
    } finally {
        await session.endSession();
    }
}

export async function deleteListing(
    userId: string,
    propertyId: string,
) {
    await connectDB();

    const session = await mongoose.startSession();

    try {
        let property: any;

        await session.withTransaction(async () => {
            property = await Property.findOne({
                _id: propertyId,
                userId,
            }).session(session);

            if (!property) {
                throw new ListingCapacityError(
                    "Property not found.",
                    404,
                );
            }

            await Property.deleteOne({
                _id: property._id,
            }).session(session);

            if (property.status === "active") {
                await User.updateOne(
                    { _id: userId },
                    {
                        $pull: {
                            "listingUsage.activeListingIds":
                                property._id,
                        },
                    },
                    { session },
                );
            }
        });

        return property;
    } finally {
        await session.endSession();
    }
}

export async function setListingCapacity(
    user: any,
    activeLimit: number,
    session: ClientSession,
) {
    const activeProperties = await Property.find({
        userId: user._id,
        status: "active",
    })
        .sort({ createdAt: -1, _id: -1 })
        .session(session);

    const kept = activeProperties.slice(0, activeLimit);
    const deactivated = activeProperties.slice(activeLimit);

    if (deactivated.length > 0) {
        await Property.updateMany(
            { _id: { $in: deactivated.map((property) => property._id) } },
            {
                $set: { status: "inactive" },
                $unset: { promotedUntil: "" },
            },
            { session },
        );
    }

    user.listingUsage = {
        ...(user.listingUsage?.toObject?.() ?? user.listingUsage ?? {}),
        activeListingIds: kept.map((property) => property._id),
    };

    await user.save({ session });

    return {
        kept,
        deactivated,
    };
}


export async function setListingStatus(
    userId: string,
    propertyId: string,
    status: "active" | "sold" | "inactive",
) {
    await connectDB();

    const session = await mongoose.startSession();

    try {
        let property: any;

        await session.withTransaction(async () => {
            property = await Property.findOne({
                _id: propertyId,
                userId,
            }).session(session);

            if (!property) {
                throw new ListingCapacityError(
                    "Property not found.",
                    404,
                );
            }

            if (
                property.status !== "active" &&
                status === "active"
            ) {
                const user = await User.findById(userId)
                    .session(session);

                if (!user) {
                    throw new ListingCapacityError(
                        "User not found.",
                        404,
                    );
                }

                const limits = getPlanLimits(user);
                const reserved = await User.findOneAndUpdate(
                    {
                        _id: user._id,
                        $expr: {
                            $lt: [
                                {
                                    $size: {
                                        $ifNull: [
                                            "$listingUsage.activeListingIds",
                                            [],
                                        ],
                                    },
                                },
                                limits.activeProperties,
                            ],
                        },
                    },
                    {
                        $addToSet: {
                            "listingUsage.activeListingIds":
                                property._id,
                        },
                    },
                    { new: true, session },
                );

                if (!reserved) {
                    throw new ListingCapacityError(
                        `Your ${limits.tier} plan allows up to ${limits.activeProperties} active listing(s).`,
                    );
                }
            }

            if (
                property.status === "active" &&
                status !== "active"
            ) {
                await User.updateOne(
                    { _id: userId },
                    {
                        $pull: {
                            "listingUsage.activeListingIds":
                                property._id,
                        },
                    },
                    { session },
                );
            }

            property.status = status;

            if (status !== "active") {
                property.promotedUntil = undefined;
            }

            await property.save({ session });
        });

        return property;
    } finally {
        await session.endSession();
    }
}
