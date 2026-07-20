import type { Metadata } from "next";
import {
  Space_Grotesk,
  Inter,
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

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-noto-tamil",
  display: "swap",
});

export const metadata: Metadata = {
  title:
      "PROPYOURS | Premium Real Estate & Legal Services",
  description:
      "Bespoke real estate solutions founded on 20 years of legal expertise. RERA Registered firm TN/Agent/0227/2024.",
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