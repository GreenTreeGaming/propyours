"use client";

import {
    usePathname,
} from "next/navigation";

import BubbyChat from "@/components/BubbyChat";
import CompareFloatingBar from "@/components/CompareFloatingBar";
import {
    CompareProvider,
} from "@/components/CompareContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

type Props = {
    children: React.ReactNode;
};

export default function AppChrome({
                                      children,
                                  }: Props) {
    const pathname =
        usePathname();

    const isAdminArea =
        pathname.startsWith(
            "/control/",
        ) ||
        pathname.startsWith(
            "/owner-access",
        );

    if (isAdminArea) {
        return (
            <>
                {children}
            </>
        );
    }

    return (
        <CompareProvider>
            <Navbar />

            {children}

            <CompareFloatingBar />
            <BubbyChat />
            <Footer />
        </CompareProvider>
    );
}