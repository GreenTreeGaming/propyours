import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Property from "@/models/Property";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        let body;

        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const { propertyId } = body;

        if (!propertyId) {
            return NextResponse.json(
                { error: "Property ID is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findById(auth.userId);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const property = await Property.findById(propertyId);

        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        if (!user.favorites) {
            user.favorites = [];
        }

        const index = user.favorites.findIndex(
            (fav: any) => fav.toString() === propertyId
        );

        if (index === -1) {
            user.favorites.push(propertyId);

            await Property.findByIdAndUpdate(propertyId, {
                $inc: {
                    "analytics.favoritesCount": 1,
                },
            });
        } else {
            user.favorites.splice(index, 1);

            await Property.findByIdAndUpdate(propertyId, {
                $inc: {
                    "analytics.favoritesCount": -1,
                },
            });
        }

        await user.save();

        return NextResponse.json({
            success: true,
            favorites: user.favorites.map((fav: any) => fav.toString()),
        });
    } catch (error: any) {
        console.error("Toggle Favorite Error:", error);

        return NextResponse.json(
            {
                error: error.message || "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }
}

export async function GET() {
    try {
        const auth = await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        await connectDB();

        const user = await User.findById(auth.userId).populate({
            path: "favorites",
            model: Property,
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const validFavorites = (user.favorites || []).filter(
            (favorite: any) => favorite != null
        );

        return NextResponse.json(validFavorites);
    } catch (error: any) {
        console.error("Fetch Favorites Error:", error);

        return NextResponse.json(
            {
                error: error.message || "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }
}