import type { Metadata } from "next";
import {
    Manrope,
    Noto_Sans_Tamil,
} from "next/font/google";

import "./globals.css";

import AppChrome from "@/components/AppChrome";
import {
    SITE_DESCRIPTION,
    SITE_NAME,
    SITE_URL,
} from "@/lib/site";

const headingFont = Manrope({
    subsets: ["latin"],
    variable: "--font-heading",
    display: "swap",
    weight: ["600", "700", "800"],
});

const bodyFont = Manrope({
    subsets: ["latin"],
    variable: "--font-body",
    display: "swap",
    weight: ["400", "500", "600", "700"],
});

const notoTamil = Noto_Sans_Tamil({
    subsets: ["tamil"],
    variable: "--font-noto-tamil",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),

    title: {
        default: `${SITE_NAME} | Property in Tamil Nadu`,
        template: `%s | ${SITE_NAME}`,
    },

    description: SITE_DESCRIPTION,

    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,

    icons: {
        icon: [
            {
                url: "/icon.png",
                type: "image/png",
            },
        ],
        shortcut: "/icon.png",
        apple: "/icon.png",
    },

    alternates: {
        canonical: "/",
    },

    openGraph: {
        type: "website",
        locale: "en_IN",
        url: "/",
        siteName: SITE_NAME,
        title: `${SITE_NAME} | Property in Tamil Nadu`,
        description: SITE_DESCRIPTION,
        images: [
            {
                url: "/opengraph-image.jpg",
                width: 1200,
                height: 630,
                alt: `${SITE_NAME} property marketplace`,
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: `${SITE_NAME} | Property in Tamil Nadu`,
        description: SITE_DESCRIPTION,
        images: ["/opengraph-image.jpg"],
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },

    category: "real estate",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${headingFont.variable} ${bodyFont.variable} ${notoTamil.variable} min-h-screen bg-white font-body antialiased`}
        >
        <AppChrome>{children}</AppChrome>
        </body>
        </html>
    );
}
