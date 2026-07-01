import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import Property from "@/models/Property";
import User from "@/models/User";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";
import { getPlanLimits } from "@/lib/plans";

function cleanStringArray(value: unknown) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
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

export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        await connectDB();

        const user = await User.findById(auth.userId);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const limits = getPlanLimits(user);

        const activeCount = await Property.countDocuments({
            userId: auth.userId,
            status: "active",
        });

        if (activeCount >= limits.activeProperties) {
            return NextResponse.json(
                {
                    error: `Your ${limits.tier} plan allows up to ${limits.activeProperties} active listing(s).`,
                },
                { status: 403 }
            );
        }

        const body = await req.json();

        const images = cleanStringArray(body.images);

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

        const videoLinks = cleanStringArray(body.videoLinks);

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

        const listingExpiresAt = new Date();
        listingExpiresAt.setDate(listingExpiresAt.getDate() + limits.listingDays);

        const property = await Property.create({
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
            bedrooms: body.bedrooms,
            bathrooms: body.bathrooms,
            floors: body.floors,
            amenities: Array.isArray(body.amenities) ? body.amenities : [],

            images,
            videoLinks,

            featured: limits.featured,
            listingExpiresAt,
            promoteBoostsRemaining: limits.promoteBoosts,

            planSnapshot: {
                tier: limits.tier,
                listingDays: limits.listingDays,
                maxPhotos: limits.maxImages,
                maxVideoLinks: limits.maxVideoLinks,
                featured: limits.featured,
                analyticsLevel: limits.analyticsLevel,
            },

            userId: auth.userId,
        });

        return NextResponse.json({
            success: true,
            property,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Failed to create property",
            },
            {
                status: 500,
            }
        );
    }
}