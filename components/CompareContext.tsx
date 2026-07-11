"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CompareProperty = {
    _id: string;
    address: string;
    images?: string[];
    price: number;
    size: number;
    sizeUnit: string;
    propertyType: string;
    bedrooms?: number;
    bathrooms?: number;
    locality?: string;
    city?: string;
    amenities?: string[];
    ownershipType?: string;
    planSnapshot?: {
        homepageFeatured?: boolean;
        rankingLevel?: "standard" | "featured" | "priority" | "top";
        compareVisibility?: "standard" | "highlighted" | "priority";
        badgeLevel?: "none" | "verified" | "premium";
        analyticsLevel?: "none" | "basic" | "advanced" | "project" | "portfolio";
    };
};

type CompareContextType = {
    compareList: CompareProperty[];
    addToCompare: (property: CompareProperty) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
};

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [compareList, setCompareList] =
        useState<CompareProperty[]>(() => {
            if (
                typeof window ===
                "undefined"
            ) {
                return [];
            }

            const saved =
                localStorage.getItem(
                    "propyours_compare"
                );

            if (!saved) {
                return [];
            }

            try {
                const parsed =
                    JSON.parse(saved);

                return Array.isArray(parsed)
                    ? parsed
                    : [];
            } catch {
                return [];
            }
        });

    useEffect(() => {
        localStorage.setItem("propyours_compare", JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (property: CompareProperty) => {
        if (compareList.length >= 3) {
            alert("You can only compare up to 3 properties at a time.");
            return;
        }
        if (compareList.find((p) => p._id === property._id)) {
            alert("This property is already in your comparison list.");
            return;
        }
        setCompareList((current) => [
            ...current,
            property,
        ]);
    };

    const removeFromCompare = (id: string) => {
        setCompareList((current) =>
            current.filter(
                (property) =>
                    property._id !== id
            )
        );
    };

    const clearCompare = () => setCompareList([]);

    return (
        <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error("useCompare must be used within a CompareProvider");
    }
    return context;
}
