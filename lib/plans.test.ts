import { describe, expect, it } from "vitest";
import { getPlanLimits } from "@/lib/plans";

describe("effective plan limits", () => {
    it("immediately falls back to Silver when a paid plan is expired", () => {
        const limits = getPlanLimits({
            plan: {
                tier: "platinum",
                status: "active",
                expiresAt: new Date("2026-08-07T00:00:00.000Z"),
            },
        }, new Date("2026-08-07T00:00:00.000Z"));

        expect(limits.tier).toBe("silver");
        expect(limits.activeProperties).toBe(1);
    });

    it("keeps an unexpired paid plan effective", () => {
        expect(getPlanLimits({
            plan: {
                tier: "platinum",
                status: "active",
                expiresAt: new Date("2026-08-08T00:00:00.000Z"),
            },
        }, new Date("2026-08-07T00:00:00.000Z")).tier).toBe("platinum");
    });
});
