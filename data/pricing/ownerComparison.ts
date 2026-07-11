import {
    PLAN_CATALOG,
    type PlanDefinition,
} from "@/lib/plan-catalog";

import type {
    ComparisonRow,
} from "@/types/pricing";

const plans = [
    PLAN_CATALOG.silver,
    PLAN_CATALOG.gold,
    PLAN_CATALOG.platinum,
];

function values(
    formatter: (plan: PlanDefinition) => string
) {
    return plans.map(formatter);
}

function row(
    feature: string,
    formatter: (plan: PlanDefinition) => string,
    tooltip?: string
): ComparisonRow {
    const [plan1, plan2, plan3] = values(formatter);

    return {
        feature,
        plan1,
        plan2,
        plan3,
        tooltip,
    };
}

const yesNo = (value: boolean) =>
    value ? "✓" : "—";

export const ownerComparison: ComparisonRow[] = [
    row(
        "Active Properties",
        (plan) =>
            String(
                plan.entitlements.activeProperties
            )
    ),

    row(
        "Listing Duration",
        (plan) =>
            `${plan.entitlements.listingDays} Days`
    ),

    row(
        "Photos",
        (plan) =>
            `Up to ${plan.entitlements.maxImages}`
    ),

    row(
        "Video Links",
        (plan) =>
            plan.entitlements.maxVideoLinks > 0
                ? String(
                    plan.entitlements.maxVideoLinks
                )
                : "—"
    ),

    row(
        "Verified Leads",
        (plan) =>
            plan.entitlements.verifiedLeadLimit === null
                ? "Unlimited"
                : String(
                    plan.entitlements
                        .verifiedLeadLimit
                )
    ),

    row(
        "Search Ranking",
        (plan) =>
            toTitle(
                plan.entitlements.rankingLevel
            )
    ),

    row(
        "Featured Listing",
        (plan) =>
            yesNo(plan.entitlements.featured)
    ),

    row(
        "Homepage Featured",
        (plan) =>
            yesNo(
                plan.entitlements.homepageFeatured
            )
    ),

    row(
        "Compare Tool Visibility",
        (plan) =>
            toTitle(
                plan.entitlements
                    .compareVisibility
            )
    ),

    row(
        "Analytics",
        (plan) =>
            plan.entitlements.analyticsLevel ===
            "none"
                ? "—"
                : toTitle(
                    plan.entitlements
                        .analyticsLevel
                ),
        "Analytics access is controlled by the same plan catalogue used by the backend."
    ),
];

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