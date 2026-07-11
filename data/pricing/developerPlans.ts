import {
    Briefcase,
    Building2,
    Crown,
} from "lucide-react";

import {
    PLAN_CATALOG,
} from "@/lib/plan-catalog";

import {
    createPricingPlan,
} from "@/data/pricing/createPricingPlan";

export const developerPlans = [
    createPricingPlan(
        PLAN_CATALOG["builder-starter"],
        Building2
    ),

    createPricingPlan(
        PLAN_CATALOG["builder-growth"],
        Briefcase
    ),

    createPricingPlan(
        PLAN_CATALOG["builder-elite"],
        Crown
    ),
];