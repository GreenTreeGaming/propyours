export interface PropertyDisplayData {
    price?: number | null;
    startingPrice?: number | null;
    hasUnitConfigurations?: boolean;

    bedrooms?: number | null;
    availableBHKs?: number[];
    unitConfigurations?: Array<{ bedrooms: number; toilets?: number | null }>;

    projectName?: string | null;
    locality?: string | null;
    propertyType?: string | null;
}

export function getPropertyDisplayPrice(
    property: PropertyDisplayData,
): number | null {
    if (
        property.hasUnitConfigurations &&
        typeof property.startingPrice ===
        "number" &&
        Number.isFinite(
            property.startingPrice,
        )
    ) {
        return property.startingPrice;
    }

    if (
        typeof property.price ===
        "number" &&
        Number.isFinite(
            property.price,
        )
    ) {
        return property.price;
    }

    return null;
}

export function getPropertyBHKLabel(
    property: PropertyDisplayData,
): string | null {
    const pairedUnits = property.unitConfigurations
        ?.filter((unit) => Number.isFinite(unit.bedrooms) && typeof unit.toilets === "number" && Number.isFinite(unit.toilets))
        .map((unit) => `${unit.bedrooms === 0 ? "Studio" : `${unit.bedrooms}BHK`} ${unit.toilets}T`);
    if (pairedUnits?.length) return [...new Set(pairedUnits)].join(" · ");
    const values = [
        ...new Set(
            property.availableBHKs ??
            [],
        ),
    ]
        .filter(
            (value) =>
                typeof value === "number" &&
                Number.isFinite(value) &&
                value >= 0,
        )
        .sort(
            (first, second) =>
                first - second,
        );

    if (values.length > 0) {
        const labels = values.map(
            (value) =>
                value === 0
                    ? "Studio"
                    : String(value),
        );

        if (labels.length === 1) {
            return labels[0] ===
            "Studio"
                ? "Studio"
                : `${labels[0]} BHK`;
        }

        if (labels.length === 2) {
            return `${labels[0]} & ${labels[1]} BHK`;
        }

        return `${labels
            .slice(0, -1)
            .join(", ")} & ${
            labels[
            labels.length - 1
                ]
        } BHK`;
    }

    if (
        property.bedrooms === 0
    ) {
        return "Studio";
    }

    if (
        typeof property.bedrooms ===
        "number" &&
        property.bedrooms > 0
    ) {
        return `${property.bedrooms} BHK`;
    }

    return null;
}

export function getPropertyDisplayTitle(
    property: PropertyDisplayData,
): string {
    const projectName =
        property.projectName?.trim();

    if (projectName) {
        return projectName;
    }

    const bhkLabel =
        getPropertyBHKLabel(
            property,
        );

    const locality =
        property.locality?.trim();

    if (bhkLabel && locality) {
        return `${bhkLabel} in ${locality}`;
    }

    if (bhkLabel) {
        return bhkLabel;
    }

    if (locality) {
        return property.propertyType
            ? `${property.propertyType} in ${locality}`
            : locality;
    }

    return (
        property.propertyType ??
        "Property"
    );
}
