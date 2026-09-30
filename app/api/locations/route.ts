import { NextResponse } from "next/server";

import villageData from "@/data/tamil-nadu-villages.json";
import { TAMIL_NADU_LOCATIONS } from "@/lib/locations";

function uniqueSorted(values: string[]): string[] {
    return Array.from(
        new Map(
            values
                .filter(Boolean)
                .map((value) => [value.toLocaleLowerCase("en-IN"), value]),
        ).values(),
    ).sort((first, second) => first.localeCompare(second, "en-IN"));
}

const districtCityTowns = uniqueSorted([
    ...Object.keys(TAMIL_NADU_LOCATIONS),
    ...villageData.districts.flatMap((district) => [
        district.name,
        ...district.blocks.map((block) => block.name),
    ]),
]);

const villageAreas = uniqueSorted([
    ...Object.values(TAMIL_NADU_LOCATIONS).flat().filter((value) => value !== "All"),
    ...villageData.districts.flatMap((district) =>
        district.blocks.flatMap((block) =>
            block.villages.map((village) => village.name),
        ),
    ),
]);

export async function GET() {
    return NextResponse.json(
        {
            districtCityTowns,
            villageAreas,
        },
        {
            headers: {
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
            },
        },
    );
}
