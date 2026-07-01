"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type ProtectedRouteProps = {
    children: React.ReactNode;
    requiredRole?: string | string[];
};

export default function ProtectedRoute({
                                           children,
                                           requiredRole,
                                       }: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me", {
                    credentials: "include",
                });

                if (!res.ok) {
                    localStorage.removeItem("user");

                    router.replace(
                        `/login?redirect=${encodeURIComponent(pathname)}`
                    );

                    return;
                }

                const user = await res.json();

                // Keep localStorage only for UI convenience
                localStorage.setItem("user", JSON.stringify(user));

                if (requiredRole) {
                    const roles = Array.isArray(requiredRole)
                        ? requiredRole
                        : [requiredRole];

                    if (!roles.includes(user.role)) {
                        router.replace("/unauthorized");
                        return;
                    }
                }

                setIsAuthorized(true);
            } catch (error) {
                console.error("Authentication check failed:", error);

                localStorage.removeItem("user");

                router.replace(
                    `/login?redirect=${encodeURIComponent(pathname)}`
                );
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [pathname, requiredRole, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFA]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-bold animate-pulse">
                        Checking Access...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}