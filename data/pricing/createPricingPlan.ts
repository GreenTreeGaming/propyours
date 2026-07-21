import type { LucideIcon } from "lucide-react";

import type {
    PlanDefinition,
    PlanEntitlements,
} from "@/lib/plan-catalog";

import type { PricingPlan } from "@/types/pricing";

export function formatPlanPrice(
    priceInPaise: number
): string {
    if (priceInPaise === 0) {
        return "₹0";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(priceInPaise / 100);
}

export function createPricingPlan(
    plan: PlanDefinition,
    icon: LucideIcon
): PricingPlan {
    return {
        name: plan.presentation.displayName,
        price: formatPlanPrice(
            plan.presentation.priceInPaise
        ),

        originalPrice:
            plan.presentation.originalPriceInPaise !== undefined
                ? formatPlanPrice(
                    plan.presentation.originalPriceInPaise
                )
                : undefined,

        period: plan.presentation.billingLabel,
        badge: plan.presentation.badge,
        badgeType: plan.presentation.badgeType,

        description: plan.presentation.description,
        icon,

        ctaText: plan.presentation.ctaText,
        ctaLink: plan.presentation.ctaLink,

        features: buildIncludedFeatures(
            plan.entitlements
        ),

        notIncluded: buildExcludedFeatures(
            plan.entitlements
        ),

        analyticsHighlight:
        plan.presentation.analyticsHighlight,
    };
}

function buildIncludedFeatures(
    limits: PlanEntitlements
): string[] {
    const features = [
        `${limits.activeProperties} Active ${
            limits.activeProperties === 1
                ? "Property"
                : "Properties"
        }`,

        `${limits.listingDays} Days Listing Duration`,
        `Up to ${limits.maxImages} Photos`,
    ];

    if (limits.maxVideoLinks > 0) {
        features.push(
            `${limits.maxVideoLinks} Video ${
                limits.maxVideoLinks === 1
                    ? "Link"
                    : "Links"
            }`
        );
    }

    features.push(
        limits.verifiedLeadLimit === null
            ? "Unlimited Verified Leads"
            : `${limits.verifiedLeadLimit} Verified ${
                limits.verifiedLeadLimit === 1
                    ? "Lead"
                    : "Leads"
            }`
    );

    features.push(
        `${toTitle(limits.rankingLevel)} Search Ranking`
    );

    if (limits.featured) {
        features.push("Featured Listing");
    }

    if (limits.homepageFeatured) {
        features.push("Homepage Featured");
    }

    if (limits.badgeLevel === "verified") {
        features.push("Verified Badge");
    }

    if (limits.badgeLevel === "premium") {
        features.push("Premium Verified Badge");
    }

    if (limits.analyticsLevel !== "none") {
        features.push(
            `${toTitle(limits.analyticsLevel)} Analytics`
        );
    }

    if (limits.promoteBoostsPerMonth > 0) {
        features.push(
            `${limits.promoteBoostsPerMonth} Promote Boosts per Month`
        );
    }

    if (limits.leadNotifications) {
        features.push("Lead Notifications");
    }

    return features;
}

function buildExcludedFeatures(
    limits: PlanEntitlements
): string[] {
    const features: string[] = [];

    if (limits.maxVideoLinks === 0) {
        features.push("Video Links");
    }

    if (!limits.featured) {
        features.push("Featured Listing");
    }

    if (!limits.homepageFeatured) {
        features.push("Homepage Promotion");
    }

    if (limits.analyticsLevel === "none") {
        features.push("Performance Analytics");
    }

    return features;
}

function toTitle(value: string): string {
    return value
        .split("-")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");
}