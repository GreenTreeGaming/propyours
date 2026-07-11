import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getAuthenticatedUser, isAuthError } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

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

            await connectDB();

            const user = await User.findById(auth.userId)
                .select("role plan.audience")
                .lean();

            const isDeveloper =
                user?.role === "Builder" ||
                user?.plan?.audience === "builder";

            if (!isDeveloper) {
                throw new Error("Only developers can upload brochures");
            }

            return {
                userId: auth.userId,
            };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const fileUrl = file.ufsUrl || file.url;

            console.log(
                "Property image uploaded by:",
                metadata.userId
            );
            console.log("File URL:", fileUrl);

            return {
                uploadedBy: metadata.userId,
                url: fileUrl,
            };
        }),

    developerBrochureUploader: f({
        pdf: {
            maxFileSize: "8MB",
            maxFileCount: 1,
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

            console.log(
                "Developer brochure uploaded by:",
                metadata.userId
            );
            console.log("File URL:", fileUrl);

            return {
                uploadedBy: metadata.userId,
                url: fileUrl,
                fileName: file.name,
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;