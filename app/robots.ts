import type {
    MetadataRoute,
} from "next";

import {
    getAbsoluteUrl,
    SITE_URL,
} from "@/lib/site";

export default function robots():
    MetadataRoute.Robots {
    const production =
        process.env.NODE_ENV ===
        "production";

    if (!production) {
        return {
            rules: {
                userAgent: "*",
                disallow: "/",
            },
        };
    }

    return {
        rules: {
            userAgent: "*",

            allow: [
                "/",
                "/buy",
                "/sell",
                "/builders",
                "/pricing",
                "/property/",
            ],

            disallow: [
                "/api/",
                "/admin/",
                "/dashboard/",
                "/manage-properties/",
                "/checkout/",
                "/payment/",
                "/login",
                "/signup",
                "/post-property",
                "/create-property",
            ],
        },

        sitemap:
            getAbsoluteUrl(
                "/sitemap.xml",
            ),

        host:
        SITE_URL,
    };
}