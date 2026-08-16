import { describe, expect, it } from "vitest";
import { toPublicUserProfile } from "@/lib/public-user";

describe("public user DTO", () => {
    it("does not serialize private account or plan fields", () => {
        const value = toPublicUserProfile({
            _id: "user-1",
            name: "Builder",
            role: "Builder",
            bio: "Bio",
            company: "Company",
            city: "Chennai",
            email: "private@example.com",
            phone: "+919999999999",
            address: "Private address",
            plan: {
                audience: "builder",
                tier: "builder-elite",
                status: "active",
                expiresAt: new Date("2027-01-01"),
                paymentId: "payments-private",
            },
        } as any);

        expect(value).toEqual({
            _id: "user-1",
            id: "user-1",
            name: "Builder",
            role: "Builder",
            bio: "Bio",
            company: "Company",
            city: "Chennai",
            builderPlan: {
                tier: "builder-elite",
                isActive: true,
            },
        });
    });
});
