export function addCalendarMonth(date: Date): Date {
    const source = new Date(date);
    const target = new Date(source);

    const originalDay = source.getUTCDate();

    target.setUTCDate(1);
    target.setUTCMonth(target.getUTCMonth() + 1);

    const lastDayOfTargetMonth = new Date(
        Date.UTC(
            target.getUTCFullYear(),
            target.getUTCMonth() + 1,
            0
        )
    ).getUTCDate();

    target.setUTCDate(
        Math.min(originalDay, lastDayOfTargetMonth)
    );

    return target;
}

export function advanceMonthlyResetIntoFuture(
    resetAt: Date,
    now: Date
): Date {
    let next = new Date(resetAt);

    while (next.getTime() <= now.getTime()) {
        next = addCalendarMonth(next);
    }

    return next;
}