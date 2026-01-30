import { useEffect, useMemo, useState } from "react";
import Card from "./components/Card";
import Field from "./components/Field";
import Toggle from "./components/Toggle";
import {
  clamp,
  employeeAnnualContribution,
  employerAnnualMatch,
  formatMoney,
  formatPercentRate,
  projectBalance12Mo
} from "./lib/calc";
import type { MatchPolicy, Profile } from "./lib/types";
import {
  clearActivity,
  loadActivity,
  loadPolicy,
  loadProfile,
  pushActivity,
  savePolicy,
  saveProfile
} from "./lib/storage";

function numOr(v: string, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function App() {
  const [adminMode, setAdminMode] = useState(false);

  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [policy, setPolicy] = useState<MatchPolicy>(() => loadPolicy());
  const [activity, setActivity] = useState(() => loadActivity());

  // input mirrors (nice UX)
  const [salaryStr, setSalaryStr] = useState(String(profile.salaryAnnual));
  const [rateStr, setRateStr] = useState(String(profile.contributionRate));
  const [balanceStr, setBalanceStr] = useState(String(profile.startingBalance));

  const [matchPercentStr, setMatchPercentStr] = useState(String(policy.matchPercent));
  const [matchUpToStr, setMatchUpToStr] = useState(String(policy.matchUpToRate));

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    savePolicy(policy);
  }, [policy]);

  const metrics = useMemo(() => {
    const employeeAnnual = employeeAnnualContribution(profile.salaryAnnual, profile.contributionRate);
    const employerAnnual = employerAnnualMatch(profile.salaryAnnual, profile.contributionRate, policy);
    const projected = projectBalance12Mo(profile.startingBalance, employeeAnnual, employerAnnual, 0.05);
    return { employeeAnnual, employerAnnual, projected };
  }, [profile, policy]);

  function log(msg: string) {
    setActivity(pushActivity(msg));
  }

  function saveParticipant() {
    const nextSalary = clamp(Math.round(numOr(salaryStr, profile.salaryAnnual)), 0, 10_000_000);
    const nextRate = clamp(numOr(rateStr, profile.contributionRate), 0, 0.15);
    const nextBalance = clamp(Math.round(numOr(balanceStr, profile.startingBalance)), 0, 10_000_000);

    const changes: string[] = [];
    if (nextSalary !== profile.salaryAnnual)
      changes.push(`Salary ${formatMoney(profile.salaryAnnual)} → ${formatMoney(nextSalary)}`);
    if (nextRate !== profile.contributionRate)
      changes.push(`Contribution ${formatPercentRate(profile.contributionRate)} → ${formatPercentRate(nextRate)}`);
    if (nextBalance !== profile.startingBalance)
      changes.push(`Starting balance ${formatMoney(profile.startingBalance)} → ${formatMoney(nextBalance)}`);

    setProfile({ salaryAnnual: nextSalary, contributionRate: nextRate, startingBalance: nextBalance });

    if (changes.length) log(`Updated participant settings: ${changes.join(", ")}`);
  }

  function saveMatchPolicy() {
    const nextMatchPercent = clamp(numOr(matchPercentStr, policy.matchPercent), 0, 2);
    const nextUpTo = clamp(numOr(matchUpToStr, policy.matchUpToRate), 0, 0.2);

    const changes: string[] = [];
    if (nextMatchPercent !== policy.matchPercent)
      changes.push(`Match ${Math.round(policy.matchPercent * 100)}% → ${Math.round(nextMatchPercent * 100)}%`);
    if (nextUpTo !== policy.matchUpToRate)
      changes.push(`Cap ${formatPercentRate(policy.matchUpToRate)} → ${formatPercentRate(nextUpTo)}`);

    setPolicy({
      matchPercent: Number(nextMatchPercent.toFixed(4)),
      matchUpToRate: Number(nextUpTo.toFixed(4))
    });

    if (changes.length) log(`Updated employer match policy: ${changes.join(", ")}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">RetireReady</h1>
            <p className="text-slate-600">
              Fintech-style retirement dashboard (React + TypeScript + Tailwind) — persisted locally.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Toggle checked={adminMode} onChange={setAdminMode} label={adminMode ? "Admin mode" : "Participant mode"} />
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-5">
            <Card title="Participant Dashboard" subtitle="Estimate annual contributions, employer match, and projection.">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Annual salary" hint="USD">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    value={salaryStr}
                    onChange={(e) => setSalaryStr(e.target.value)}
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Contribution rate" hint="0.06 = 6%">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    value={rateStr}
                    onChange={(e) => setRateStr(e.target.value)}
                    inputMode="decimal"
                  />
                </Field>

                <Field label="Starting balance" hint="USD">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    value={balanceStr}
                    onChange={(e) => setBalanceStr(e.target.value)}
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={saveParticipant}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setSalaryStr(String(profile.salaryAnnual));
                    setRateStr(String(profile.contributionRate));
                    setBalanceStr(String(profile.startingBalance));
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium text-slate-500">Employee annual</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{formatMoney(metrics.employeeAnnual)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium text-slate-500">Employer match</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{formatMoney(metrics.employerAnnual)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium text-slate-500">Projected (12 mo)</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{formatMoney(metrics.projected)}</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">Current employer policy</div>
                <p className="mt-1 text-sm text-slate-600">
                  Match: <span className="font-medium text-slate-900">{Math.round(policy.matchPercent * 100)}%</span>{" "}
                  up to <span className="font-medium text-slate-900">{formatPercentRate(policy.matchUpToRate)}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">Simplified model for portfolio purposes.</p>
              </div>
            </Card>

            {adminMode && (
              <Card title="Admin: Match Policy" subtitle="Edit match policy and see calculations update live.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Match percent" hint="1.0 = 100%">
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                      value={matchPercentStr}
                      onChange={(e) => setMatchPercentStr(e.target.value)}
                      inputMode="decimal"
                    />
                  </Field>

                  <Field label="Match cap (rate)" hint="0.04 = 4%">
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                      value={matchUpToStr}
                      onChange={(e) => setMatchUpToStr(e.target.value)}
                      inputMode="decimal"
                    />
                  </Field>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={saveMatchPolicy}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    Save policy
                  </button>
                  <button
                    onClick={() => {
                      setMatchPercentStr(String(policy.matchPercent));
                      setMatchUpToStr(String(policy.matchUpToRate));
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>
              </Card>
            )}
          </div>

          <div className="grid gap-5">
            <Card title="Activity Log" subtitle="Audit-style history (stored in localStorage).">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    clearActivity();
                    setActivity([]);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
                <span className="text-xs text-slate-500">{activity.length}/50</span>
              </div>

              <div className="mt-4 grid gap-3">
                {activity.length === 0 ? (
                  <p className="text-sm text-slate-500">No activity yet. Save a change to generate entries.</p>
                ) : (
                  activity.map((a) => (
                    <div key={a.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">{new Date(a.ts).toLocaleString()}</div>
                      <div className="mt-1 text-sm text-slate-800">{a.message}</div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card title="Portfolio Notes" subtitle="How to talk about this project.">
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
                <li>
                  Built a fintech-style dashboard with <span className="font-medium">React + TypeScript</span> and a clean
                  component system.
                </li>
                <li>Implemented domain logic for contributions, match caps, and projections with reusable utilities.</li>
                <li>
                  Added an audit-style activity log and persistent state via <span className="font-medium">localStorage</span>.
                </li>
                <li>Designed for clarity and UX: safe clamping, reset controls, and an “admin mode” toggle.</li>
              </ul>
            </Card>
          </div>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-500">Built by Pedro • RetireReady Dashboard</footer>
      </div>
    </div>
  );
}
