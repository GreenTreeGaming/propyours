import DeveloperProfile from "@/models/DeveloperProfile";
import Property from "@/models/Property";
import { normalizedBuilderName } from "@/lib/builder-properties";

export async function syncDeveloperProfilesFromListings() {
    const names = await Property.distinct("developerName", {
        developerName: { $type: "string", $ne: "" },
    });

    const unique = new Map<string, string>();
    for (const rawName of names) {
        const name = typeof rawName === "string" ? rawName.trim().replace(/\s+/g, " ") : "";
        const normalizedName = normalizedBuilderName(name);
        if (name && normalizedName && !unique.has(normalizedName)) {
            unique.set(normalizedName, name);
        }
    }

    if (unique.size) {
        await DeveloperProfile.bulkWrite(
            [...unique.entries()].map(([normalizedName, name]) => ({
                updateOne: {
                    filter: { normalizedName },
                    update: { $setOnInsert: { normalizedName, name, source: "listing" } },
                    upsert: true,
                },
            })),
            { ordered: false },
        );
    }

    return DeveloperProfile.find({ normalizedName: { $in: [...unique.keys()] } }).lean();
}
