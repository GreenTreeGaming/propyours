import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";
import { createUploadDeleteToken } from "@/lib/uploadthing-storage";

const f = createUploadthing();

async function requireAuthenticatedUser() {
    const auth = await getAuthenticatedUser();
    if (isAuthError(auth)) throw new UploadThingError("You must be signed in to upload files.");
    return auth;
}

export const ourFileRouter = {
    propertyImageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 40 } })
        .middleware(async () => {
            const auth = await requireAuthenticatedUser();
            return { userId: auth.userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const url = file.ufsUrl || file.url;
            if (!url) throw new UploadThingError("Uploaded image URL was not returned.");
            return {
                uploadedBy: metadata.userId,
                url,
                fileKey: file.key,
                deleteToken: createUploadDeleteToken(metadata.userId, file.key),
            };
        }),

    developerBrochureUploader: f({ pdf: { maxFileSize: "8MB", maxFileCount: 1 } })
        .middleware(async () => {
            const auth = await requireAuthenticatedUser();
            return { userId: auth.userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const url = file.ufsUrl || file.url;
            if (!url) throw new UploadThingError("Uploaded brochure URL was not returned.");
            return {
                uploadedBy: metadata.userId,
                url,
                fileName: file.name,
                fileKey: file.key,
                deleteToken: createUploadDeleteToken(metadata.userId, file.key),
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
