import type { Metadata } from "next";
import { Space_Grotesk, Inter, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";

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

import { LanguageProvider } from "@/context/LanguageContext";
import { CompareProvider } from "@/components/CompareContext";
import CompareFloatingBar from "@/components/CompareFloatingBar";

export const metadata: Metadata = {
  title: "PROPYOURS | Premium Real Estate & Legal Services",
  description: "Bespoke real estate solutions founded on 20 years of legal expertise. RERA Registered firm TN/Agent/0227/2024.",
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} ${notoTamil.variable} antialiased font-body flex flex-col min-h-screen`}>
        <LanguageProvider>
          <CompareProvider>
            <Navbar />
            {children}
            <CompareFloatingBar />
            <Footer />
          </CompareProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
