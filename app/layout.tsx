import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-noto-tamil",
  display: "swap",
});

import { LanguageProvider } from "@/context/LanguageContext";

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
      <body className={`${outfit.variable} ${plusJakartaSans.variable} ${notoTamil.variable} antialiased font-sans flex flex-col min-h-screen`}>
        <LanguageProvider>
          <Navbar />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
