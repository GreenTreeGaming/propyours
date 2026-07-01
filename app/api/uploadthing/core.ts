import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
    propertyImageUploader: f({
        image: {
            maxFileSize: "8MB",
            maxFileCount: 40,
        },
    })
        .middleware(async () => {
            const auth = await getAuthenticatedUser();

            if (isAuthError(auth)) {
                throw new Error("Unauthorized");
            }

            return {
                userId: auth.userId,
            };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Property image uploaded by:", metadata.userId);
            console.log("File URL:", file.url);

            return {
                uploadedBy: metadata.userId,
                url: file.url,
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;