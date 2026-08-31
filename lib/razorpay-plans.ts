import {
    PLAN_CATALOG,
    type PlanTier,
} from "@/lib/plan-catalog";

type PaidPlanTier = Exclude<PlanTier, "silver">;

type RazorpayPlanConfig = {
    razorpayPlanId: string;
    totalCount: number;
};

function getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export const RAZORPAY_PLANS: Record<
    PaidPlanTier,
    RazorpayPlanConfig
> = {
    gold: {
        razorpayPlanId: getRequiredEnv(
            "RAZORPAY_GOLD_PLAN_ID",
        ),
        totalCount: 1200,
    },

    platinum: {
        razorpayPlanId: getRequiredEnv(
            "RAZORPAY_PLATINUM_PLAN_ID",
        ),
        totalCount: 1200,
    },

    "builder-starter": {
        razorpayPlanId: getRequiredEnv(
            "RAZORPAY_BUILDER_STARTER_PLAN_ID",
        ),
        totalCount: 100,
    },

    "builder-growth": {
        razorpayPlanId: getRequiredEnv(
            "RAZORPAY_BUILDER_GROWTH_PLAN_ID",
        ),
        totalCount: 100,
    },

    "builder-elite": {
        razorpayPlanId: getRequiredEnv(
            "RAZORPAY_BUILDER_ELITE_PLAN_ID",
        ),
        totalCount: 100,
    },

    "agent-ruby": {
        razorpayPlanId: getRequiredEnv(
            "RAZORPAY_AGENT_RUBY_PLAN_ID",
        ),
        totalCount: 1,
    },

    "agent-emerald": {
        razorpayPlanId: getRequiredEnv(
            "RAZORPAY_AGENT_EMERALD_PLAN_ID",
        ),
        totalCount: 1,
    },

    "agent-diamond": {
        razorpayPlanId: getRequiredEnv(
            "RAZORPAY_AGENT_DIAMOND_PLAN_ID",
        ),
        totalCount: 1,
    },
};

export function isPaidPlanTier(
    value: unknown,
): value is PaidPlanTier {
    return (
        typeof value === "string" &&
        value !== "silver" &&
        Object.prototype.hasOwnProperty.call(
            RAZORPAY_PLANS,
            value,
        )
    );
}

export function getRazorpayPlan(
    tier: PaidPlanTier,
) {
    return {
        ...RAZORPAY_PLANS[tier],
        internalPlan: PLAN_CATALOG[tier],
    };
}