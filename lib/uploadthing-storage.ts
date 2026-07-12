import crypto from "node:crypto";

import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

function getDeleteTokenSecret(): string {
    const secret =
        process.env.UPLOADTHING_DELETE_SECRET ??
        process.env.UPLOADTHING_TOKEN;

    if (!secret) {
        throw new Error(
            "UPLOADTHING_TOKEN or UPLOADTHING_DELETE_SECRET is required.",
        );
    }

    return secret;
}

export function extractUploadThingFileKey(
    value: string,
): string | null {
    try {
        const url = new URL(value);

        const isUploadThingHost =
            url.hostname === "utfs.io" ||
            url.hostname.endsWith(".ufs.sh") ||
            url.hostname.includes("uploadthing");

        if (!isUploadThingHost) {
            return null;
        }

        const segments = url.pathname
            .split("/")
            .filter(Boolean);

        const fileMarkerIndex =
            segments.lastIndexOf("f");

        const encodedKey =
            fileMarkerIndex >= 0
                ? segments[fileMarkerIndex + 1]
                : segments.at(-1);

        if (!encodedKey) {
            return null;
        }

        return decodeURIComponent(encodedKey);
    } catch {
        return null;
    }
}

export function createUploadDeleteToken(
    userId: string,
    fileKey: string,
): string {
    return crypto
        .createHmac(
            "sha256",
            getDeleteTokenSecret(),
        )
        .update(`${userId}:${fileKey}`)
        .digest("base64url");
}

export function verifyUploadDeleteToken(
    userId: string,
    fileKey: string,
    token: string,
): boolean {
    const expected =
        createUploadDeleteToken(
            userId,
            fileKey,
        );

    const receivedBuffer = Buffer.from(
        token,
    );
    const expectedBuffer = Buffer.from(
        expected,
    );

    return (
        receivedBuffer.length ===
        expectedBuffer.length &&
        crypto.timingSafeEqual(
            receivedBuffer,
            expectedBuffer,
        )
    );
}

export interface UploadThingDeleteResult {
    requestedUrls: string[];
    fileKeys: string[];
    ignoredUrls: string[];
    deletedCount: number;
}

export async function deleteUploadThingFilesByUrls(
    values: Array<
        string | null | undefined
    >,
): Promise<UploadThingDeleteResult> {
    const requestedUrls = Array.from(
        new Set(
            values.filter(
                (value): value is string =>
                    typeof value === "string" &&
                    value.trim().length > 0,
            ),
        ),
    );

    const keyedUrls = requestedUrls.map(
        (url) => ({
            url,
            key: extractUploadThingFileKey(
                url,
            ),
        }),
    );

    const fileKeys = Array.from(
        new Set(
            keyedUrls
                .map((item) => item.key)
                .filter(
                    (key): key is string =>
                        Boolean(key),
                ),
        ),
    );

    const ignoredUrls = keyedUrls
        .filter((item) => !item.key)
        .map((item) => item.url);

    if (fileKeys.length > 0) {
        await utapi.deleteFiles(fileKeys);
    }

    return {
        requestedUrls,
        fileKeys,
        ignoredUrls,
        deletedCount: fileKeys.length,
    };
}

export async function deleteUploadThingFileKeys(
    fileKeys: string[],
): Promise<number> {
    const uniqueKeys = Array.from(
        new Set(
            fileKeys
                .map((key) => key.trim())
                .filter(Boolean),
        ),
    );

    if (uniqueKeys.length === 0) {
        return 0;
    }

    await utapi.deleteFiles(uniqueKeys);

    return uniqueKeys.length;
}
