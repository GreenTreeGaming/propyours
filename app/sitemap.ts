import type {
    MetadataRoute,
} from "next";

import {
    getAbsoluteUrl,
} from "@/lib/site";

export default function sitemap():
    MetadataRoute.Sitemap {
    const now =
        new Date();

    return [
        {
            url:
                getAbsoluteUrl("/"),
            lastModified: now,
            changeFrequency:
                "daily",
            priority: 1,
        },

        {
            url:
                getAbsoluteUrl(
                    "/buy",
                ),
            lastModified: now,
            changeFrequency:
                "daily",
            priority: 0.9,
        },

        {
            url:
                getAbsoluteUrl(
                    "/sell",
                ),
            lastModified: now,
            changeFrequency:
                "monthly",
            priority: 0.8,
        },

        {
            url:
                getAbsoluteUrl(
                    "/builders",
                ),
            lastModified: now,
            changeFrequency:
                "weekly",
            priority: 0.8,
        },

        {
            url:
                getAbsoluteUrl(
                    "/pricing",
                ),
            lastModified: now,
            changeFrequency:
                "monthly",
            priority: 0.7,
        },
    ];
}