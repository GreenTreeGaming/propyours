export type PlotPricingInput = {
    size: number;
    sizeUnit: string;
    totalPrice?: number | null;
    pricePerSqFt?: number | null;
};

const SQFT_PER_UNIT: Record<string, number> = {
    sqft: 1,
    sqyd: 9,
    sqm: 10.7639104167,
    acre: 43_560,
    kanal: 5_445,
    marla: 272.25,
    ground: 2_400,
    cent: 435.6,
};

export function areaInSquareFeet(size: number, sizeUnit: string): number {
    const multiplier = SQFT_PER_UNIT[sizeUnit];
    return Number.isFinite(size) && size > 0 && multiplier ? size * multiplier : Number.NaN;
}

export function resolvePlotPricing(plot: PlotPricingInput) {
    const squareFeet = areaInSquareFeet(plot.size, plot.sizeUnit);
    const enteredTotal = Number(plot.totalPrice);
    const enteredRate = Number(plot.pricePerSqFt);
    const validTotal = Number.isFinite(enteredTotal) && enteredTotal > 0 ? enteredTotal : null;
    const validRate = Number.isFinite(enteredRate) && enteredRate > 0 ? enteredRate : null;
    const totalPrice = validTotal ?? (validRate && Number.isFinite(squareFeet) ? validRate * squareFeet : null);
    const pricePerSqFt = validRate ?? (validTotal && Number.isFinite(squareFeet) ? validTotal / squareFeet : null);

    return {
        squareFeet,
        totalPrice: totalPrice === null ? null : Math.round(totalPrice),
        pricePerSqFt: pricePerSqFt === null ? null : Math.round(pricePerSqFt * 100) / 100,
    };
}

export function plotStartingPrice(plots?: PlotPricingInput[] | null): number | null {
    const totals = (plots ?? [])
        .map((plot) => resolvePlotPricing(plot).totalPrice)
        .filter((value): value is number => typeof value === "number" && value > 0);
    return totals.length ? Math.min(...totals) : null;
}
