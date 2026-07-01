"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStoredUser } from "@/lib/browser-user";

type ProtectedRouteProps = {
    children: React.ReactNode;
    requiredRole?: string | string[];
};

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const user = getStoredUser();

            if (!user) {
                // Not signed in
                setIsAuthorized(false);
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                return;
            }

            // Check if role is required and if user has it
            if (requiredRole) {
                const userRole = (user as any).role || "User";
                const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

                if (!roles.includes(userRole)) {
                    // Signed in but doesn't have required role
                    setIsAuthorized(false);
                    router.push("/unauthorized"); // Or back to home
                    return;
                }
            }

            setIsAuthorized(true);
        };

        checkAuth();

        // Listen for storage changes (logout in other tabs/components)
        window.addEventListener("storage", checkAuth);
        return () => window.removeEventListener("storage", checkAuth);
    }, [router, pathname, requiredRole]);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFA]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-bold animate-pulse">Checking Access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
