import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Property from "@/models/Property"; // Ensure Property is registered for population

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Handle potentially malformed or empty body
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const { propertyId } = body;

        if (!propertyId) {
            return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if the property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return NextResponse.json({ error: "Property not found" }, { status: 404 });
        }

        // Initialize favorites if it doesn't exist
        if (!user.favorites) {
            user.favorites = [];
        }

        // Toggle favorite
        // Use string comparison for ObjectIds
        const index = user.favorites.findIndex(
            (fav: any) => fav.toString() === propertyId
        );

        if (index === -1) {
            user.favorites.push(propertyId); // Add to favorites
            // Increment favoritesCount on the property
            await Property.findByIdAndUpdate(propertyId, {
                $inc: { "analytics.favoritesCount": 1 }
            });
        } else {
            user.favorites.splice(index, 1); // Remove from favorites
            // Decrement favoritesCount on the property
            await Property.findByIdAndUpdate(propertyId, {
                $inc: { "analytics.favoritesCount": -1 }
            }, { min: { "analytics.favoritesCount": 0 } }); // Ensure it doesn't go below 0
        }

        await user.save();

        return NextResponse.json({
            success: true,
            favorites: user.favorites.map((fav: any) => fav.toString()),
        });
    } catch (error: any) {
        console.error("Toggle Favorite Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        // Populate favorites to get full property details
        const user = await User.findById(id).populate({
            path: "favorites",
            model: Property // Explicitly mention the model to avoid population issues
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Filter out any favorites that might have been deleted (null after populate)
        const validFavorites = (user.favorites || []).filter((f: any) => f != null);

        return NextResponse.json(validFavorites);
    } catch (error: any) {
        console.error("Fetch Favorites Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

