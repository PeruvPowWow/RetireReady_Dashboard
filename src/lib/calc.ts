export function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
    
}

export function roundMoney (n: number) {
    return Math.round(n);
}

export function employeeAnnualContribution(salaryAnnual: number, rate: number) {
    return roundMoney(salaryAnnual * rate);
}

export function employerAnnualMatch(
    salaryAnnual: number,
    rate: number,
    policy: { matchPercent: number; matchUpToRate: number }
) {
    const eligibleRate = Math.min(rate, policy.matchUpToRate);
    return roundMoney(salaryAnnual * eligibleRate * policy.matchPercent);
}

export function projectBalance12Mo(
    startingBalance: number,
    employeeAnnual: number,
    employerAnnual: number,
    growthRate = 0.05
) {
    return roundMoney((startingBalance + employeeAnnual + employerAnnual) * (1+growthRate));
}

export function formatMoney(n: number) {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0});
}

export function formatPercentRate(rate: number) {
    return `${(rate * 100).toFixed(1)}%`;
}