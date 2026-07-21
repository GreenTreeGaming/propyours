import type { ClientSession } from "mongoose";

import BoostTransaction from "@/models/BoostTransaction";
import { getPlanLimits } from "@/lib/plans";
import {
    addCalendarMonth,
    advanceMonthlyResetIntoFuture,
} from "@/lib/boost-dates";

type RefreshBoostOptions = {
    now?: Date;
    session?: ClientSession;
    save?: boolean;
};

export async function refreshBoostAllowanceIfNeeded(
    user: any,
    options: RefreshBoostOptions = {}
) {
    const {
        now = new Date(),
        session,
        save = true,
    } = options;

    const limits = getPlanLimits(user);
    const monthlyAllowance =
        limits.promoteBoostsPerMonth;

    const planIsActive =
        user.plan?.status === "active";

    const planExpiresAt = user.plan?.expiresAt
        ? new Date(user.plan.expiresAt)
        : null;

    const planHasExpired =
        planExpiresAt !== null &&
        planExpiresAt.getTime() <= now.getTime();

    const balanceBefore =
        user.plan?.boostsRemaining ?? 0;

    if (
        !planIsActive ||
        planHasExpired ||
        monthlyAllowance <= 0
    ) {
        const changed =
            balanceBefore !== 0 ||
            Boolean(user.plan?.boostsResetAt);

        user.plan.boostsRemaining = 0;
        user.plan.boostsResetAt = undefined;

        if (changed && save) {
            await user.save({ session });
        }

        return {
            changed,
            reset: false,
            boostsRemaining: 0,
            boostsResetAt: null,
        };
    }

    const existingResetAt =
        user.plan?.boostsResetAt
            ? new Date(user.plan.boostsResetAt)
            : null;

    /*
     * Existing paid account with no reset date:
     * establish its first reset without granting
     * another duplicate balance.
     */
    if (!existingResetAt) {
        const anchor =
            user.plan?.startedAt
                ? new Date(user.plan.startedAt)
                : now;

        const nextResetAt =
            advanceMonthlyResetIntoFuture(
                addCalendarMonth(anchor),
                now
            );

        user.plan.boostsResetAt = nextResetAt;

        if (save) {
            await user.save({ session });
        }

        return {
            changed: true,
            reset: false,
            boostsRemaining: balanceBefore,
            boostsResetAt: nextResetAt,
        };
    }

    if (
        existingResetAt.getTime() >
        now.getTime()
    ) {
        return {
            changed: false,
            reset: false,
            boostsRemaining: balanceBefore,
            boostsResetAt: existingResetAt,
        };
    }

    const nextResetAt =
        advanceMonthlyResetIntoFuture(
            existingResetAt,
            now
        );

    user.plan.boostsRemaining =
        monthlyAllowance;

    user.plan.lastBoostResetAt = now;
    user.plan.boostsResetAt = nextResetAt;

    if (save) {
        await user.save({ session });
    }

    await BoostTransaction.create(
        [
            {
                userId: user._id,
                type: "monthly_reset",
                amount:
                    monthlyAllowance -
                    balanceBefore,
                balanceBefore,
                balanceAfter:
                monthlyAllowance,
                planTier: limits.tier,
                metadata: {
                    previousResetAt:
                    existingResetAt,
                    nextResetAt,
                },
            },
        ],
        {
            session,
        }
    );

    return {
        changed: true,
        reset: true,
        boostsRemaining:
        monthlyAllowance,
        boostsResetAt: nextResetAt,
    };
}