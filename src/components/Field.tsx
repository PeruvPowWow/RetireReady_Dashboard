import type { ReactNode } from "react";

export default function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
