import { Building2, Briefcase, Crown } from "lucide-react";
import { PricingPlan } from "@/types/pricing";

export const developerPlans: PricingPlan[] = [
    {
        name: "Builder Starter",

        price: "₹9,999",
        period: "/ year",

        description:
            "For small builders who want a professional profile and basic project visibility on Propyours.",

        icon: Building2,

        ctaText: "Choose Builder Starter",
        ctaLink: "/builders/register?plan=starter",

        features: [
            "Up to 3 Active Projects",
            "Company Profile Page",
            "Standard Builder Directory Listing",
            "Standard Builder Card",
            "Company Name, Bio, City & Phone Display",
            "10 Photos per Project",
            "Direct Call Enquiries",
            "Property Views Tracking",
            "Phone Click Tracking",
            "Favorites Count Tracking",
            "Standard Search Ranking"
        ],

        notIncluded: [
            "Verified Builder Badge",
            "Highlighted Builder Card",
            "Priority Placement on Builders Page",
            "Top Placement on Builders Page",
            "Featured Property Placement",
            "Promote Boosts",
            "Homepage Featured Placement",
            "25 Photos per Project",
            "40 Photos per Project",
            "Views Over Time Chart",
            "Advanced Project Analytics"
        ],

        analyticsHighlight:
            "Views, phone clicks & favorites count"
    },

    {
        name: "Builder Growth",

        price: "₹24,999",
        originalPrice: "₹29,999",
        period: "/ year",

        badge: "Most Popular",
        badgeType: "popular",

        description:
            "For growing builders who want better visibility, stronger trust signals, and more project exposure.",

        icon: Briefcase,

        ctaText: "Choose Builder Growth",
        ctaLink: "/builders/register?plan=growth",

        features: [
            "Up to 10 Active Projects",
            "Verified Builder Badge",
            "Highlighted Builder Card",
            "Priority Placement on Builders Page",
            "Priority Search Ranking",
            "Featured Property Placement",
            "5 Promote Boosts per Month",
            "25 Photos per Project",
            "Company Name, Bio, City & Phone Display",
            "Direct Call Enquiries",
            "Property Views Tracking",
            "Phone Click Tracking",
            "Favorites Count Tracking",
            "Views Over Time Chart",
            "Project Performance Analytics"
        ],

        notIncluded: [
            "Top Placement on Builders Page",
            "Premium Builder Card",
            "Premium Verified Builder Badge",
            "Homepage Featured Placement",
            "Scheduled Promote Boosts",
            "25 Active Projects",
            "40 Photos per Project",
            "Portfolio-Level Analytics",
            "Regional Performance Insights"
        ],

        analyticsHighlight:
            "Views, phone clicks, favorites & daily performance trends"
    },

    {
        name: "Builder Elite",

        price: "₹49,999",
        originalPrice: "₹59,999",
        period: "/ year",

        badge: "Enterprise",
        badgeType: "premium",

        description:
            "For established builders who want the strongest visibility across builder listings and property discovery.",

        icon: Crown,

        ctaText: "Choose Builder Elite",
        ctaLink: "/builders/register?plan=elite",

        features: [
            "Up to 25 Active Projects",
            "Premium Verified Builder Badge",
            "Premium Builder Card",
            "Top Placement on Builders Page",
            "Top Search Ranking",
            "Homepage Featured Placement",
            "Featured Property Placement",
            "15 Promote Boosts per Month",
            "Scheduled Promote Boosts",
            "40 Photos per Project",
            "Company Name, Bio, City & Phone Display",
            "Direct Call Enquiries",
            "Property Views Tracking",
            "Phone Click Tracking",
            "Favorites Count Tracking",
            "Views Over Time Chart",
            "Portfolio-Level Analytics",
            "Regional Performance Insights"
        ],

        notIncluded: [
            "Unlimited Active Projects",
            "Unlimited Media Storage",
            "Video Uploads",
            "Team Member Accounts",
            "CRM Export",
            "API Integration",
            "Dedicated Account Manager"
        ],

        analyticsHighlight:
            "Portfolio views, contact clicks, favorites & regional performance"
    }
];