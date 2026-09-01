import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ALLOWED_EXTENSIONS = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".svg",
    ".avif",
    ".gif",
]);

export async function GET() {
    try {
        const directoryPath = path.join(
            process.cwd(),
            "public",
            "authresellers",
        );

        const files = await fs.readdir(directoryPath, {
            withFileTypes: true,
        });

        const logos = files
            .filter((file) => {
                if (!file.isFile()) {
                    return false;
                }

                const extension = path
                    .extname(file.name)
                    .toLowerCase();

                return ALLOWED_EXTENSIONS.has(extension);
            })
            .map(
                (file) =>
                    `/authresellers/${encodeURIComponent(
                        file.name,
                    )}`,
            )
            .sort((a, b) =>
                a.localeCompare(b, undefined, {
                    numeric: true,
                    sensitivity: "base",
                }),
            );

        return NextResponse.json({
            logos,
        });
    } catch (error) {
        console.error(
            "Failed to load authorised partner logos:",
            error,
        );

        return NextResponse.json(
            {
                logos: [],
            },
            {
                status: 500,
            },
        );
    }
}