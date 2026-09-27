function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizedBuilderName(value: unknown): string {
    return typeof value === "string"
        ? value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-IN")
        : "";
}

export function exactBuilderNameRegex(value: unknown): RegExp | null {
    if (typeof value !== "string") {
        return null;
    }

    const name = value.trim().replace(/\s+/g, " ");

    return name ? new RegExp(`^${escapeRegex(name)}$`, "i") : null;
}

export function getBuilderPropertyAssociation(
    userId: unknown,
    company: unknown,
) {
    const companyExpression = exactBuilderNameRegex(company);

    if (!companyExpression) {
        return { userId };
    }

    return {
        $or: [
            { userId },
            { developerName: companyExpression },
        ],
    };
}
