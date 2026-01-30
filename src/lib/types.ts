export type MatchPolicy = {
    matchPercent: number;
    matchUpToRate: number;

};

export type Profile = {
    salaryAnnual: number;
    contributionRate: number;
    startingBalance: number;
};

export type ActivityItem = {
    id: string;
    ts: number;
    message: string;

};