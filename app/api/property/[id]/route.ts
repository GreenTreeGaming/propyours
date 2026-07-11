import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import User from "@/models/User";
import { getPublicPropertyFilter } from "@/lib/property-filters";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";
import { getPlanLimits } from "@/lib/plans";

function cleanStringArray(
    value: unknown
): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            (item): item is string =>
                typeof item === "string"
        )
        .map((item) => item.trim())
        .filter(
            (item): item is string =>
                item.length > 0
        );
}

function isValidImageUrl(url: string) {
    return (
        url.startsWith("https://") &&
        (
            url.includes("utfs.io") ||
            url.includes("uploadthing") ||
            url.includes("ufs.sh")
        )
    );
}

function isValidVideoUrl(url: string) {
    try {
        const parsed = new URL(url);

        return [
            "youtube.com",
            "www.youtube.com",
            "youtu.be",
            "vimeo.com",
            "www.vimeo.com",
        ].includes(parsed.hostname);
    } catch {
        return false;
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;

        const property = await Property.findOne(
            getPublicPropertyFilter({ _id: id })
        ).populate("userId", "name email role bio company city phone");

        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(property);
    } catch (error) {
        console.error("Failed to fetch property:", error);

        return NextResponse.json(
            { error: "Failed to fetch property" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        await connectDB();

        const { id } = await params;
        const body = await req.json();

        if (
            "negotiable" in body &&
            typeof body.negotiable !== "boolean"
        ) {
            return NextResponse.json(
                {
                    error: "Negotiable must be either true or false.",
                },
                {
                    status: 400,
                }
            );
        }

        const property = await Property.findById(id);

        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        if (property.userId.toString() !== auth.userId) {
            return NextResponse.json(
                { error: "You are not allowed to update this property." },
                { status: 403 }
            );
        }

        const user = await User.findById(auth.userId);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const limits = getPlanLimits(user);

        const images: string[] =
            "images" in body
                ? cleanStringArray(body.images)
                : cleanStringArray(
                    property.images
                );

        if (images.length > limits.maxImages) {
            return NextResponse.json(
                {
                    error: `Your ${limits.tier} plan allows up to ${limits.maxImages} image(s).`,
                },
                { status: 403 }
            );
        }

        const invalidImage = images.find((url) => !isValidImageUrl(url));

        if (invalidImage) {
            return NextResponse.json(
                { error: "One or more image URLs are invalid." },
                { status: 400 }
            );
        }

        const videoLinks: string[] =
            "videoLinks" in body
                ? cleanStringArray(
                    body.videoLinks
                )
                : cleanStringArray(
                    property.videoLinks
                );

        if (videoLinks.length > limits.maxVideoLinks) {
            return NextResponse.json(
                {
                    error: `Your ${limits.tier} plan allows up to ${limits.maxVideoLinks} video link(s).`,
                },
                { status: 403 }
            );
        }

        const invalidVideo = videoLinks.find((url) => !isValidVideoUrl(url));

        if (invalidVideo) {
            return NextResponse.json(
                {
                    error: "Only YouTube and Vimeo video links are allowed.",
                },
                { status: 400 }
            );
        }

        const allowedUpdates: Record<string, unknown> = {
            purpose: body.purpose,
            propertyType: body.propertyType,
            description: body.description,
            address: body.address,
            locality: body.locality,
            city: body.city,
            state: body.state,
            landmark: body.landmark,
            uds: body.uds,
            size: body.size,
            sizeUnit: body.sizeUnit,
            dimensions: body.dimensions,
            ownershipType: body.ownershipType,
            price: body.price,
            priceType: body.priceType,
            negotiable: body.negotiable,
            bedrooms: body.bedrooms,
            bathrooms: body.bathrooms,
            floors: body.floors,
            amenities: Array.isArray(body.amenities) ? body.amenities : undefined,
            images,
            videoLinks,
        };

        Object.keys(allowedUpdates).forEach((key) => {
            if (allowedUpdates[key] === undefined) {
                delete allowedUpdates[key];
            }
        });

        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        );

        return NextResponse.json({
            success: true,
            property: updatedProperty,
        });
    } catch (error) {
        console.error("Failed to update property:", error);

        return NextResponse.json(
            { error: "Failed to update property" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        await connectDB();

        const { id } = await params;

        const property = await Property.findById(id);

        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        if (property.userId.toString() !== auth.userId) {
            return NextResponse.json(
                { error: "You are not allowed to delete this property." },
                { status: 403 }
            );
        }

        await Property.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: "Property deleted successfully.",
        });
    } catch (error) {
        console.error("Failed to delete property:", error);

        return NextResponse.json(
            { error: "Failed to delete property" },
            { status: 500 }
        );
    }
}