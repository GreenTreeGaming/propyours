import {
    config,
} from "dotenv";
import bcrypt from "bcryptjs";
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

const email =
    process.env
        .ADMIN_BOOTSTRAP_EMAIL
        ?.trim()
        .toLowerCase();

const password =
    process.env
        .ADMIN_BOOTSTRAP_PASSWORD;

const name =
    process.env
        .ADMIN_BOOTSTRAP_NAME
        ?.trim() ||
    "PropYours Administrator";

if (!mongodbUri) {
    throw new Error(
        "MONGODB_URI is not configured.",
    );
}

if (!email) {
    throw new Error(
        "ADMIN_BOOTSTRAP_EMAIL is not configured.",
    );
}

if (
    !password ||
    password.length < 16
) {
    throw new Error(
        "ADMIN_BOOTSTRAP_PASSWORD must contain at least 16 characters.",
    );
}

const client =
    new MongoClient(
        mongodbUri,
    );

try {
    await client.connect();

    const database =
        client.db();

    const users =
        database.collection(
            "users",
        );

    const existing =
        await users.findOne({
            email,
        });

    const passwordHash =
        await bcrypt.hash(
            password,
            12,
        );

    const now =
        new Date();

    if (existing) {
        await users.updateOne(
            {
                _id:
                existing._id,
            },
            {
                $set: {
                    name,
                    email,
                    password:
                    passwordHash,
                    role:
                        "SuperAdmin",
                    updatedAt:
                    now,
                },

                $inc: {
                    tokenVersion:
                        1,
                },
            },
        );

        console.log(
            `Updated ${email} as SuperAdmin.`,
        );
    } else {
        await users.insertOne({
            name,
            email,
            password:
            passwordHash,
            role:
                "SuperAdmin",
            tokenVersion: 0,
            favorites: [],

            plan: {
                audience:
                    "owner",
                tier:
                    "silver",
                status:
                    "free",
                startedAt:
                now,
                source:
                    "manual",
                boostsRemaining:
                    0,
            },

            createdAt:
            now,
            updatedAt:
            now,
        });

        console.log(
            `Created ${email} as SuperAdmin.`,
        );
    }
} finally {
    await client.close();
}