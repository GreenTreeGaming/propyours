import User from "@/models/User";
import Property from "@/models/Property";
import BoostTransaction from "@/models/BoostTransaction";
import {
    refreshBoostAllowanceIfNeeded,
} from "@/lib/refresh-boost-allowance";

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
        const balanceBefore =
            user.plan?.boostsRemaining ?? 0;

        user.plan.status = "expired";
        user.plan.boostsRemaining = 0;
        user.plan.boostsResetAt =
            undefined;

        await user.save();

        await Property.updateMany(
            {
                userId: user._id,
                status: "active",
            },
            {
                $set: {
                    status: "inactive",
                },
            }
        );

        await BoostTransaction.create({
            userId: user._id,
            type: "plan_expired",
            amount: -balanceBefore,
            balanceBefore,
            balanceAfter: 0,
            planTier:
            user.plan.tier,
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