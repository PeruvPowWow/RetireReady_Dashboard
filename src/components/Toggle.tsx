export default function Toggle({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
      aria-pressed={checked}
    >
      <span className={["h-4 w-7 rounded-full transition", checked ? "bg-slate-900" : "bg-slate-300"].join(" ")}>
        <span
          className={[
            "block h-4 w-4 rounded-full bg-white shadow transition",
            checked ? "translate-x-3" : "translate-x-0"
          ].join(" ")}
        />
      </span>
      {label}
    </button>
  );
}
