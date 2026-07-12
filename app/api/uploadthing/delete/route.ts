import { NextResponse } from "next/server";

import {
    getAuthenticatedUser,
    isAuthError,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import {
    deleteUploadThingFileKeys,
    extractUploadThingFileKey,
    verifyUploadDeleteToken,
} from "@/lib/uploadthing-storage";
import Property from "@/models/Property";

interface DeleteFileRequest {
    url: string;
    fileKey?: string;
    deleteToken: string;
}

function parseDeleteFiles(
    value: unknown,
): DeleteFileRequest[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            (
                item,
            ): item is Record<
                string,
                unknown
            > =>
                typeof item === "object" &&
                item !== null,
        )
        .map((item) => ({
            url:
                typeof item.url === "string"
                    ? item.url.trim()
                    : "",
            fileKey:
                typeof item.fileKey ===
                "string"
                    ? item.fileKey.trim()
                    : undefined,
            deleteToken:
                typeof item.deleteToken ===
                "string"
                    ? item.deleteToken.trim()
                    : "",
        }))
        .filter(
            (item) =>
                item.url.length > 0 &&
                item.deleteToken.length > 0,
        )
        .slice(0, 50);
}

export async function POST(
    request: Request,
) {
    try {
        const auth =
            await getAuthenticatedUser();

        if (isAuthError(auth)) {
            return auth;
        }

        const body: unknown =
            await request.json();

        const files =
            typeof body === "object" &&
            body !== null &&
            "files" in body
                ? parseDeleteFiles(body.files)
                : [];

        if (files.length === 0) {
            return NextResponse.json(
                {
                    error:
                        "Provide at least one uploaded file.",
                },
                {
                    status: 400,
                },
            );
        }

        const verified = files.map(
            (file) => {
                const fileKey =
                    file.fileKey ||
                    extractUploadThingFileKey(
                        file.url,
                    );

                const valid =
                    Boolean(fileKey) &&
                    verifyUploadDeleteToken(
                        auth.userId,
                        fileKey as string,
                        file.deleteToken,
                    );

                return {
                    ...file,
                    fileKey,
                    valid,
                };
            },
        );

        if (
            verified.some(
                (file) => !file.valid,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "One or more file deletion tokens are invalid.",
                },
                {
                    status: 403,
                },
            );
        }

        await connectDB();

        const urls = verified.map(
            (file) => file.url,
        );

        const referencedProperties =
            await Property.find({
                $or: [
                    {
                        images: {
                            $in: urls,
                        },
                    },
                    {
                        "brochure.url": {
                            $in: urls,
                        },
                    },
                ],
            })
                .select("images brochure.url")
                .lean();

        const referencedUrls =
            new Set<string>();

        for (const property of
            referencedProperties) {
            for (const image of
            property.images ?? []) {
                if (urls.includes(image)) {
                    referencedUrls.add(image);
                }
            }

            const brochureUrl =
                property.brochure?.url;

            if (
                brochureUrl &&
                urls.includes(brochureUrl)
            ) {
                referencedUrls.add(
                    brochureUrl,
                );
            }
        }

        const deletable = verified.filter(
            (file) =>
                !referencedUrls.has(
                    file.url,
                ),
        );

        const deletedCount =
            await deleteUploadThingFileKeys(
                deletable.map(
                    (file) =>
                        file.fileKey as string,
                ),
            );

        return NextResponse.json({
            success: true,
            deletedCount,
            skippedReferencedUrls:
                Array.from(referencedUrls),
        });
    } catch (error) {
        console.error(
            "Failed to delete UploadThing files:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to delete the uploaded files.",
            },
            {
                status: 500,
            },
        );
    }
}
