"use client";

import { useEffect, useState } from "react";

import {
    TAMIL_NADU_CITIES,
    TAMIL_NADU_LOCATIONS,
} from "@/lib/locations";

type LocationOptions = {
    districtCityTowns: string[];
    villageAreas: string[];
};

const fallbackVillageAreas = Array.from(
    new Set(
        Object.values(TAMIL_NADU_LOCATIONS)
            .flat()
            .filter((value) => value !== "All"),
    ),
).sort((first, second) => first.localeCompare(second));

const fallback: LocationOptions = {
    districtCityTowns: [...TAMIL_NADU_CITIES].sort((first, second) =>
        first.localeCompare(second),
    ),
    villageAreas: fallbackVillageAreas,
};

let cachedOptions: LocationOptions | null = null;
let pendingRequest: Promise<LocationOptions> | null = null;

function loadOptions(): Promise<LocationOptions> {
    if (cachedOptions) {
        return Promise.resolve(cachedOptions);
    }

    if (!pendingRequest) {
        pendingRequest = fetch("/api/locations?v=2")
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error("Unable to load location options.");
                }
                return response.json() as Promise<LocationOptions>;
            })
            .then((options) => {
                cachedOptions = options;
                return options;
            })
            .finally(() => {
                pendingRequest = null;
            });
    }

    return pendingRequest;
}

export function useLocationOptions(): LocationOptions {
    const [options, setOptions] = useState<LocationOptions>(
        cachedOptions ?? fallback,
    );

    useEffect(() => {
        let active = true;
        void loadOptions()
            .then((loaded) => {
                if (active) setOptions(loaded);
            })
            .catch(() => undefined);

        return () => {
            active = false;
        };
    }, []);

    return options;
}
