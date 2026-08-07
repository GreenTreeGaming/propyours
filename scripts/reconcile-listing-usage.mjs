import {
    config,
} from "dotenv";
import {
    MongoClient,
} from "mongodb";

config({
    path: ".env.local",
});

config();

const mongodbUri =
    process.env
        .MONGODB_URI
        ?.trim();

if (!mongodbUri) {
    throw new Error(
        "MONGODB_URI is not configured.",
    );
}

const client = new MongoClient(mongodbUri);

function sameIds(
    left,
    right,
) {
    if (left.length !== right.length) {
        return false;
    }

    return left.every(
        (value, index) =>
            value.toString() ===
            right[index].toString(),
    );
}

try {
    await client.connect();

    const database = client.db();
    const users = database.collection("users");
    const properties = database.collection("properties");

    let scanned = 0;
    let repaired = 0;

    for await (const user of users.find(
        {},
        {
            projection: {
                _id: 1,
                "listingUsage.activeListingIds": 1,
            },
        },
    )) {
        scanned += 1;

        const activeListingIds = await properties
            .find(
                {
                    userId: user._id,
                    status: "active",
                },
                {
                    projection: {
                        _id: 1,
                    },
                },
            )
            .sort({
                createdAt: -1,
                _id: -1,
            })
            .map((property) => property._id)
            .toArray();

        const currentIds =
            user.listingUsage?.activeListingIds ??
            [];

        if (sameIds(currentIds, activeListingIds)) {
            continue;
        }

        await users.updateOne(
            {
                _id: user._id,
            },
            {
                $set: {
                    "listingUsage.activeListingIds":
                        activeListingIds,
                    updatedAt: new Date(),
                },
            },
        );

        repaired += 1;
    }

    console.log(
        `Listing usage reconciliation complete: scanned ${scanned}, repaired ${repaired}.`,
    );
} finally {
    await client.close();
}
