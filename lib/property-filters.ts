export function getPublicPropertyFilter(extraFilter: Record<string, unknown> = {}) {
    return {
        ...extraFilter,
        status: "active",
        $or: [
            { listingExpiresAt: { $exists: false } },
            { listingExpiresAt: { $gt: new Date() } },
        ],
    };
}

export const publicPropertySort = {
    promotedUntil: -1,
    featured: -1,
    createdAt: -1,
} as const;