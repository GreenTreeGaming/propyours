import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
}

// 👇 Proper typing (fixes TS + global issues)
declare global {
    // eslint-disable-next-line no-var
    var mongoose: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

// 👇 Initialize cache safely
const cached = global.mongoose || {
    conn: null,
    promise: null,
};

global.mongoose = cached;

export async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName: "propyours", // ✅ IMPORTANT
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}