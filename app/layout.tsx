import type { Metadata } from "next";
import {
    Manrope,
    Noto_Sans_Tamil,
} from "next/font/google";
import "./globals.css";

import {
  CompareProvider,
} from "@/components/CompareContext";
import CompareFloatingBar from "@/components/CompareFloatingBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BubbyChat from "@/components/BubbyChat";

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
    metadataBase:
        new URL(SITE_URL),

    title: {
        default:
            `${SITE_NAME} | Property in Tamil Nadu`,

        template:
            `%s | ${SITE_NAME}`,
    },

    description:
    SITE_DESCRIPTION,

    applicationName:
    SITE_NAME,

    authors: [
        {
            name:
            SITE_NAME,
        },
    ],

    creator:
    SITE_NAME,

    publisher:
    SITE_NAME,

    alternates: {
        canonical: "/",
    },

    openGraph: {
        type: "website",
        locale: "en_IN",
        url: "/",
        siteName:
        SITE_NAME,

        title:
            `${SITE_NAME} | Property in Tamil Nadu`,

        description:
        SITE_DESCRIPTION,

        images: [
            {
                url:
                    "/opengraph-image.jpg",
                width: 1200,
                height: 630,
                alt:
                    `${SITE_NAME} property marketplace`,
            },
        ],
    },

    twitter: {
        card:
            "summary_large_image",

        title:
            `${SITE_NAME} | Property in Tamil Nadu`,

        description:
        SITE_DESCRIPTION,

        images: [
            "/opengraph-image.jpg",
        ],
    },

    robots: {
        index: true,
        follow: true,

        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview":
                "large",
            "max-snippet": -1,
        },
    },

    category:
        "real estate",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <body
          className={`${headingFont.variable} ${bodyFont.variable} ${notoTamil.variable} antialiased font-body flex min-h-screen flex-col`}
      >
      <CompareProvider>
        <Navbar />
        {children}
        <CompareFloatingBar />
        <BubbyChat />
        <Footer />
      </CompareProvider>
      </body>
      </html>
  );
}