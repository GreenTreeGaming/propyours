import { User, Crown, Gem } from "lucide-react";
import { PricingPlan } from "@/types/pricing";

export const ownerPlans: PricingPlan[] = [
    {
        name: "Silver",
        price: "₹0",
        period: "Forever Free",

        description:
            "Perfect for owners selling or renting a single property for the first time.",

        icon: User,

        ctaText: "List for Free",
        ctaLink: "/post-property",

        features: [
            "1 Active Property",
            "30 Days Listing Duration",
            "Up to 5 Photos",
            "1 Verified Lead",
            "WhatsApp & Call Buttons",
            "Standard Search Ranking",
            "Standard Compare Tool"
        ],

        notIncluded: [
            "Performance Analytics",
            "Featured Listing",
            "Video Upload",
            "Lead Insights",
            "Homepage Promotion"
        ],

        analyticsHighlight: "No analytics"
    },

    {
        name: "Gold",

        price: "₹2,499",
        originalPrice: "₹2,999",
        period: "per listing",

        badge: "Most Popular",
        badgeType: "popular",

        description:
            "Boost your property's visibility and receive more qualified enquiries.",

        icon: Crown,

        ctaText: "Choose Gold",
        ctaLink: "/post-property?plan=gold",

        features: [
            "1 Active Property",
            "90 Days Listing",
            "25 Verified Leads",
            "20 Photos",
            "1 Video Upload",
            "Featured Search Ranking",
            "Basic Analytics",
            "Verified Owner Badge",
            "Lead Notifications"
        ],

        notIncluded: [
            "2 Active Properties",
            "Unlimited Leads",
            "360° Virtual Tour",
            "Homepage Featured",
            "Advanced Analytics"
        ],

        analyticsHighlight:
            "Views, clicks & enquiry tracking"
    },

    {
        name: "Platinum",

        price: "₹5,999",
        originalPrice: "₹6,999",
        period: "per listing",

        badge: "Best Value",
        badgeType: "premium",

        description:
            "Maximum exposure with premium placement, unlimited leads and advanced insights.",

        icon: Gem,

        ctaText: "Choose Platinum",
        ctaLink: "/post-property?plan=platinum",

        features: [
            "2 Active Properties",
            "180 Days Listing",
            "Unlimited Verified Leads",
            "30 Photos",
            "2 Video Uploads",
            "360° Virtual Tour",
            "Homepage Featured",
            "Priority Search Ranking",
            "Advanced Analytics",
            "Buyer Demographics",
            "Lead Export",
            "WhatsApp & SMS Alerts",
            "Priority Support"
        ],

        analyticsHighlight:
            "CTR, demographics, geo analytics & lead tracking"
    }
];