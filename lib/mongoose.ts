import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    };
}

export async function connectDB() {
    if (cached!.conn) return cached!.conn;

    if (!cached!.promise) {
        cached!.promise = mongoose.connect(MONGODB_URI, {
            dbName: "propyours",
        }).then((m) => m);
    }

    cached!.conn = await cached!.promise;
    return cached!.conn;
}