import sharp from "sharp";

import {
    createUploadthing,
    type FileRouter,
} from "uploadthing/next";

import {
    UTApi,
    UploadThingError,
} from "uploadthing/server";

import {
    getAuthenticatedUser,
    isAuthError,
} from "@/lib/auth";

import {
    createUploadDeleteToken,
} from "@/lib/uploadthing-storage";

const f = createUploadthing();

const utapi = new UTApi();

async function requireAuthenticatedUser() {
    const auth =
        await getAuthenticatedUser();

    if (isAuthError(auth)) {
        throw new UploadThingError(
            "You must be signed in to upload files.",
        );
    }

    return auth;
}

function escapeXml(
    value: string,
): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

async function createWatermarkedImage(
    imageBuffer: Buffer,
): Promise<Buffer> {
    const image = sharp(
        imageBuffer,
        {
            failOn: "none",
        },
    ).rotate();

    const metadata =
        await image.metadata();

    const width =
        metadata.width ?? 1200;

    const fontSize = Math.max(
        24,
        Math.min(
            56,
            Math.round(width * 0.035),
        ),
    );

    const horizontalPadding =
        Math.round(
            fontSize * 0.7,
        );

    const verticalPadding =
        Math.round(
            fontSize * 0.45,
        );

    const watermarkWidth =
        Math.round(
            fontSize * 7.5,
        );

    const watermarkHeight =
        Math.round(
            fontSize * 1.9,
        );

    const text = escapeXml(
        "PROPYOURS",
    );

    const watermarkSvg =
        Buffer.from(`
            <svg
                width="${watermarkWidth}"
                height="${watermarkHeight}"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect
                    x="0"
                    y="0"
                    width="${watermarkWidth}"
                    height="${watermarkHeight}"
                    rx="${Math.round(
            fontSize * 0.35,
        )}"
                    fill="rgba(0,0,0,0.35)"
                />

                <text
                    x="${horizontalPadding}"
                    y="${
            watermarkHeight -
            verticalPadding
        }"
                    fill="white"
                    fill-opacity="0.82"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="${fontSize}"
                    font-weight="700"
                    letter-spacing="${
            fontSize * 0.08
        }"
                >
                    ${text}
                </text>
            </svg>
        `);

    return image
        .composite([
            {
                input:
                watermarkSvg,
                gravity:
                    "southeast",
            },
        ])
        .webp({
            quality: 90,
        })
        .toBuffer();
}

async function watermarkUploadThingImage(
    file: {
        key: string;
        name: string;
        url?: string;
        ufsUrl?: string;
    },
) {
    const originalUrl =
        file.ufsUrl ||
        file.url;

    if (!originalUrl) {
        throw new UploadThingError(
            "Uploaded image URL was not returned.",
        );
    }

    const response =
        await fetch(originalUrl);

    if (!response.ok) {
        throw new UploadThingError(
            "Unable to process uploaded image.",
        );
    }

    const originalBuffer =
        Buffer.from(
            await response.arrayBuffer(),
        );

    const watermarkedBuffer =
        await createWatermarkedImage(
            originalBuffer,
        );

    const baseName =
        file.name
            .replace(
                /\.[^.]+$/,
                "",
            )
            .replace(
                /[^a-zA-Z0-9-_]/g,
                "-",
            );

    const watermarkedFile =
        new File(
            [
                new Uint8Array(
                    watermarkedBuffer,
                ),
            ],
            `${baseName}-propyours.webp`,
            {
                type: "image/webp",
            },
        );

    const uploadResult =
        await utapi.uploadFiles(
            watermarkedFile,
        );

    if (
        uploadResult.error ||
        !uploadResult.data
    ) {
        throw new UploadThingError(
            "Unable to save watermarked image.",
        );
    }

    await utapi.deleteFiles(
        file.key,
    );

    return {
        url:
            uploadResult.data.ufsUrl ||
            uploadResult.data.url,
        fileKey:
        uploadResult.data.key,
    };
}

export const ourFileRouter = {
    propertyImageUploader: f({
        image: {
            maxFileSize: "8MB",
            maxFileCount: 40,
        },
    })
        .middleware(async () => {
            const auth =
                await requireAuthenticatedUser();

            return {
                userId: auth.userId,
            };
        })
        .onUploadComplete(
            async ({
                       metadata,
                       file,
                   }) => {
                const watermarked =
                    await watermarkUploadThingImage(
                        file,
                    );

                return {
                    uploadedBy:
                    metadata.userId,

                    url:
                    watermarked.url,

                    fileKey:
                    watermarked.fileKey,

                    deleteToken:
                        createUploadDeleteToken(
                            metadata.userId,
                            watermarked.fileKey,
                        ),
                };
            },
        ),

    developerBrochureUploader: f({
        pdf: {
            maxFileSize: "8MB",
            maxFileCount: 1,
        },
    })
        .middleware(async () => {
            const auth =
                await requireAuthenticatedUser();

            return {
                userId: auth.userId,
            };
        })
        .onUploadComplete(
            async ({
                       metadata,
                       file,
                   }) => {
                const fileUrl =
                    file.ufsUrl ||
                    file.url;

                return {
                    uploadedBy:
                    metadata.userId,

                    url:
                    fileUrl,

                    fileName:
                    file.name,

                    fileKey:
                    file.key,

                    deleteToken:
                        createUploadDeleteToken(
                            metadata.userId,
                            file.key,
                        ),
                };
            },
        ),
} satisfies FileRouter;

export type OurFileRouter =
    typeof ourFileRouter;