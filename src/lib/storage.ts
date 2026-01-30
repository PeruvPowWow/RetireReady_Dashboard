import type { ActivityItem, MatchPolicy, Profile } from "./types";

const KEY_PROFILE = "rr_profile_v1";
const KEY_POLICY = "rr_policy_v1";
const KEY_ACTIVITY = "rr_activity_v1";

export const defaults = {
  profile: {
    salaryAnnual: 70000,
    contributionRate: 0.06,
    startingBalance: 2500
  } satisfies Profile,
  policy: {
    matchPercent: 1.0,
    matchUpToRate: 0.04
  } satisfies MatchPolicy
};

export function loadProfile(): Profile {
  const raw = localStorage.getItem(KEY_PROFILE);
  if (!raw) return defaults.profile;
  try {
    return { ...defaults.profile, ...JSON.parse(raw) };
  } catch {
    return defaults.profile;
  }
}

export function saveProfile(p: Profile) {
  localStorage.setItem(KEY_PROFILE, JSON.stringify(p));
}

export function loadPolicy(): MatchPolicy {
  const raw = localStorage.getItem(KEY_POLICY);
  if (!raw) return defaults.policy;
  try {
    return { ...defaults.policy, ...JSON.parse(raw) };
  } catch {
    return defaults.policy;
  }
}

export function savePolicy(p: MatchPolicy) {
  localStorage.setItem(KEY_POLICY, JSON.stringify(p));
}

export function loadActivity(): ActivityItem[] {
  const raw = localStorage.getItem(KEY_ACTIVITY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function pushActivity(message: string) {
  const next: ActivityItem = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    message
  };
  const existing = loadActivity();
  const merged = [next, ...existing].slice(0, 50);
  localStorage.setItem(KEY_ACTIVITY, JSON.stringify(merged));
  return merged;
}

export function clearActivity() {
  localStorage.removeItem(KEY_ACTIVITY);
}
