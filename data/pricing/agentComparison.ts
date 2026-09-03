import {
    PLAN_CATALOG,
    type PlanDefinition,
} from "@/lib/plan-catalog";

import type {
    ComparisonRow,
} from "@/types/pricing";

const plans = [
    PLAN_CATALOG["agent-ruby"],
    PLAN_CATALOG["agent-emerald"],
    PLAN_CATALOG["agent-diamond"],
];

function row(
    feature: string,
    formatter: (
        plan: PlanDefinition,
    ) => string,
    tooltip?: string,
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

function yesNo(
    value: boolean,
): string {
    return value ? "✓" : "—";
}

function toTitle(
    value: string,
): string {
    return value
        .split("-")
        .map(
            (word) =>
                word
                    .charAt(0)
                    .toUpperCase() +
                word.slice(1),
        )
        .join(" ");
}

export const agentComparison:
    ComparisonRow[] = [
    row(
        "Active Listings",
        (plan) =>
            `Up to ${plan.entitlements.activeProperties}`,
    ),

    row(
        "Listing Duration",
        (plan) =>
            `${plan.entitlements.listingDays} Days`,
    ),

    row(
        "Photos per Listing",
        (plan) =>
            String(
                plan.entitlements
                    .maxImages,
            ),
    ),

    row(
        "Video Links",
        (plan) =>
            plan.entitlements
                .maxVideoLinks > 0
                ? String(
                    plan.entitlements
                        .maxVideoLinks,
                )
                : "—",
    ),

    row(
        "Verified Leads",
        (plan) =>
            plan.entitlements
                .verifiedLeadLimit ===
            null
                ? "Unlimited"
                : String(
                    plan.entitlements
                        .verifiedLeadLimit,
                ),
    ),

    row(
        "Search Ranking",
        (plan) =>
            toTitle(
                plan.entitlements
                    .rankingLevel,
            ),
    ),

    row(
        "Featured Listing",
        (plan) =>
            yesNo(
                plan.entitlements
                    .featured,
            ),
    ),

    row(
        "Homepage Featured",
        (plan) =>
            yesNo(
                plan.entitlements
                    .homepageFeatured,
            ),
    ),

    row(
        "Compare Visibility",
        (plan) =>
            toTitle(
                plan.entitlements
                    .compareVisibility,
            ),
    ),

    row(
        "Analytics",
        (plan) =>
            toTitle(
                plan.entitlements
                    .analyticsLevel,
            ),
    ),

    row(
        "Lead Notifications",
        (plan) =>
            yesNo(
                plan.entitlements
                    .leadNotifications,
            ),
    ),
];