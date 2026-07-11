import {
    PLAN_CATALOG,
    type PlanDefinition,
} from "@/lib/plan-catalog";

import type {
    ComparisonRow,
} from "@/types/pricing";

const plans = [
    PLAN_CATALOG["builder-starter"],
    PLAN_CATALOG["builder-growth"],
    PLAN_CATALOG["builder-elite"],
];

function row(
    feature: string,
    formatter: (plan: PlanDefinition) => string,
    tooltip?: string
): ComparisonRow {
    const [plan1, plan2, plan3] =
        plans.map(formatter);

    return {
        feature,
        plan1,
        plan2,
        plan3,
        tooltip,
    };
}

function yesNo(value: boolean) {
    return value ? "✓" : "—";
}

function toTitle(value: string) {
    return value
        .split("-")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");
}

export const developerComparison:
    ComparisonRow[] = [
    row(
        "Active Projects",
        (plan) =>
            `Up to ${plan.entitlements.activeProperties}`
    ),

    row(
        "Listing Duration",
        (plan) =>
            `${plan.entitlements.listingDays} Days`
    ),

    row(
        "Photos per Project",
        (plan) =>
            String(
                plan.entitlements.maxImages
            )
    ),

    row(
        "Video Links per Project",
        (plan) =>
            plan.entitlements.maxVideoLinks > 0
                ? String(
                    plan.entitlements
                        .maxVideoLinks
                )
                : "—"
    ),

    row(
        "Search Ranking",
        (plan) =>
            toTitle(
                plan.entitlements.rankingLevel
            )
    ),

    row(
        "Builder Card Style",
        (plan) =>
            toTitle(
                plan.entitlements
                    .compareVisibility
            )
    ),

    row(
        "Verified Builder Badge",
        (plan) => {
            const level =
                plan.entitlements.badgeLevel;

            if (level === "none") {
                return "—";
            }

            return toTitle(level);
        }
    ),

    row(
        "Featured Property Placement",
        (plan) =>
            yesNo(plan.entitlements.featured)
    ),

    row(
        "Homepage Featured Placement",
        (plan) =>
            yesNo(
                plan.entitlements
                    .homepageFeatured
            )
    ),

    row(
        "Promote Boosts",
        (plan) =>
            plan.entitlements
                .promoteBoostsPerMonth > 0
                ? `${plan.entitlements.promoteBoostsPerMonth} / month`
                : "—"
    ),

    row(
        "Analytics Level",
        (plan) =>
            toTitle(
                plan.entitlements
                    .analyticsLevel
            ),
        "Analytics access is controlled by the same plan catalogue used by the backend."
    ),
];