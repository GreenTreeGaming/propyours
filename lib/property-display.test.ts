import { describe, expect, it } from "vitest";
import { getPropertyBHKLabel } from "./property-display";
import { screenPropertyImages } from "./public-property-images";

describe("property listing presentation", () => {
    it("pairs each unit's bedrooms with its own toilet count", () => {
        expect(getPropertyBHKLabel({ unitConfigurations: [
            { bedrooms: 2, toilets: 2 }, { bedrooms: 3, toilets: 3 },
        ] })).toBe("2BHK 2T · 3BHK 3T");
    });

    it("hides photos awaiting review while preserving approved and legacy photos", () => {
        const images = ["https://example.com/image.jpg"];
        expect(screenPropertyImages({ images, imageReviewStatus: "pending" }).images).toEqual([]);
        expect(screenPropertyImages({ images, imageReviewStatus: "rejected" }).images).toEqual([]);
        expect(screenPropertyImages({ images, imageReviewStatus: "approved" }).images).toEqual(images);
        expect(screenPropertyImages({ images }).images).toEqual(images);
    });
});
