import User from "@/models/User";
import {
    refreshBoostAllowanceIfNeeded,
} from "@/lib/refresh-boost-allowance";
import { applyPlanChange } from "@/lib/apply-plan-change";
import { isPlanTier } from "@/lib/plan-catalog";

export async function processPlanLifecycle(
    now = new Date()
) {
    let expiredPlans = 0;
    let resetAllowances = 0;

    const expiredUsers =
        await User.find({
            "plan.status": "active",
            "plan.expiresAt": {
                $lte: now,
            },
        });

    for (const user of expiredUsers) {
        const tier = isPlanTier(user.plan?.tier)
            ? user.plan.tier
            : "silver";

        await applyPlanChange({
            userId: user._id.toString(),
            tier,
            status: "expired",
            audience: user.plan?.audience,
            source: "manual",
            expiresAt: user.plan?.expiresAt ?? null,
        });

        expiredPlans += 1;
    }

    const usersDueForReset =
        await User.find({
            "plan.status": "active",
            "plan.boostsResetAt": {
                $lte: now,
            },
        });

    for (const user of usersDueForReset) {
        const result =
            await refreshBoostAllowanceIfNeeded(
                user,
                {
                    now,
                }
            );

        if (result.reset) {
            resetAllowances += 1;
        }
    }

    return {
        expiredPlans,
        resetAllowances,
    };
}