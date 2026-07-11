import {
    Crown,
    Gem,
    User,
} from "lucide-react";

import {
    PLAN_CATALOG,
} from "@/lib/plan-catalog";

import {
    createPricingPlan,
} from "@/data/pricing/createPricingPlan";

export const ownerPlans = [
    createPricingPlan(
        PLAN_CATALOG.silver,
        User
    ),

    createPricingPlan(
        PLAN_CATALOG.gold,
        Crown
    ),

    createPricingPlan(
        PLAN_CATALOG.platinum,
        Gem
    ),
];