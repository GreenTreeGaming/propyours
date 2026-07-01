"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CompareProperty = {
    _id: string;
    address: string;
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
};

type CompareContextType = {
    compareList: CompareProperty[];
    addToCompare: (property: CompareProperty) => void;
    removeFromCompare: (id: string) => void;
    clearCompare: () => void;
};

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [compareList, setCompareList] = useState<CompareProperty[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("propyours_compare");
        if (saved) setCompareList(JSON.parse(saved));
    }, []);

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
        setCompareList([...compareList, property]);
    };

    const removeFromCompare = (id: string) => {
        setCompareList(compareList.filter((p) => p._id !== id));
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
