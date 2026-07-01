import { Building2, Briefcase, Crown } from "lucide-react";
import { PricingPlan } from "@/types/pricing";

export const developerPlans: PricingPlan[] = [
    {
        name: "Basic",

        price: "₹9,999",
        period: "/ year",

        description:
            "Ideal for small builders and developers managing a handful of residential or commercial projects.",

        icon: Building2,

        ctaText: "Choose Basic",
        ctaLink: "/builders/register?plan=basic",

        features: [
            "Up to 5 Active Projects",
            "Company Profile Page",
            "Builder Directory Listing",
            "25 Photos per Project",
            "5 Videos per Project",
            "Standard Search Ranking",
            "Basic Project Analytics",
            "Direct WhatsApp & Call Enquiries",
            "Company Logo & Branding",
            "Project Brochure Upload"
        ],

        notIncluded: [
            "Featured Builder Badge",
            "Homepage Promotion",
            "CRM Lead Export",
            "Bulk Project Upload",
            "Team Member Accounts",
            "Advanced Analytics"
        ],

        analyticsHighlight: "Views, enquiries & project performance"
    },

    {
        name: "Premium",

        price: "₹24,999",
        originalPrice: "₹29,999",
        period: "/ year",

        badge: "Most Popular",
        badgeType: "popular",

        description:
            "Designed for growing developers looking for greater exposure, better lead management and enhanced branding.",

        icon: Briefcase,

        ctaText: "Choose Premium",
        ctaLink: "/builders/register?plan=premium",

        features: [
            "Up to 15 Active Projects",
            "Featured Builder Badge",
            "Priority Search Ranking",
            "Unlimited Photos",
            "Unlimited Videos",
            "Advanced Analytics Dashboard",
            "Lead Dashboard",
            "CRM Lead Export",
            "Bulk Project Upload",
            "5 Team Member Accounts",
            "Homepage Featured Rotation",
            "Premium Builder Profile",
            "Priority Customer Support"
        ],

        notIncluded: [
            "Unlimited Projects",
            "API Integration",
            "Dedicated Account Manager",
            "Custom Branding"
        ],

        analyticsHighlight:
            "Lead sources, CTR, traffic trends & conversion insights"
    },

    {
        name: "Premium Pro",

        price: "₹49,999",
        originalPrice: "₹59,999",
        period: "/ year",

        badge: "Enterprise",
        badgeType: "premium",

        description:
            "Complete marketing and lead management solution for large developers and construction companies.",

        icon: Crown,

        ctaText: "Choose Premium Pro",
        ctaLink: "/builders/register?plan=pro",

        features: [
            "Unlimited Active Projects",
            "Premium Homepage Placement",
            "Top Search Ranking",
            "Unlimited Photos & Videos",
            "Unlimited Team Members",
            "Advanced CRM Dashboard",
            "Lead Assignment",
            "API Integration",
            "Bulk Import & Export",
            "Dedicated Builder Landing Page",
            "Verified Premium Builder Badge",
            "Regional Traffic Analytics",
            "Buyer Demographics",
            "Dedicated Account Manager",
            "Priority Phone Support"
        ],

        analyticsHighlight:
            "Enterprise analytics, buyer demographics, lead attribution & regional insights"
    }
];