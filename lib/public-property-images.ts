export function screenPropertyImages<T extends { images?: unknown; imageReviewStatus?: unknown }>(property: T): T {
    return property.imageReviewStatus === "pending" || property.imageReviewStatus === "rejected"
        ? { ...property, images: [] }
        : property;
}
