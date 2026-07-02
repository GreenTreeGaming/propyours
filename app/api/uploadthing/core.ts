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
            const fileUrl = file.ufsUrl || file.url;

            console.log("Property image uploaded by:", metadata.userId);
            console.log("File URL:", fileUrl);

            return {
                uploadedBy: metadata.userId,
                url: fileUrl,
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;