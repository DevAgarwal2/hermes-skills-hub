interface StatItem {
  label: string;
  value: string | number;
}

export function StatsRow({ stats }: { stats: StatItem[] }) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-4 border-y border-border py-5">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-0.5">
          <span className="font-mono text-base font-semibold tabular-nums text-foreground">
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
