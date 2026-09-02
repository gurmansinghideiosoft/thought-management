/** A metric card: eyebrow label, a big value, an optional delta, a body slot. */
export function ReviewStat({
  icon,
  label,
  value,
  sub,
  delta,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  delta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-hairline bg-surface flex flex-col rounded-xl border p-4">
      <div className="text-ink-faint mb-2 flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
        {icon}
        {label}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-ink font-serif text-2xl font-semibold tabular-nums">
          {value}
        </span>
        {delta}
      </div>
      {sub ? <p className="text-ink-faint mt-1 text-[12px]">{sub}</p> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
