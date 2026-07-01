import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface PricingPlan {
    name: string;
    price: string;
    period: string;

    originalPrice?: string;

    badge?: string;
    badgeType?: "popular" | "premium" | "standard";

    description: string;

    icon: LucideIcon;

    ctaText: string;
    ctaLink: string;

    features: string[];
    notIncluded?: string[];

    analyticsHighlight?: string;
}

export interface ComparisonRow {
    feature: string;

    plan1: string;
    plan2: string;
    plan3: string;

    tooltip?: string;
}

export interface FAQItem {
    q: string;
    a: string;
}