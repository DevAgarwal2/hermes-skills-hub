function getTrustColor(score: number) {
  if (score >= 85) return 'text-success';
  if (score >= 65) return 'text-accent';
  return 'text-danger';
}

function getLabel(score: number) {
  if (score >= 85) return 'High';
  if (score >= 65) return 'Medium';
  return 'Low';
}

export function TrustScoreBadge({
  score,
  size = 'md',
}: {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  } as const;

  const labelClasses = {
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  } as const;

  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={`font-mono font-bold tabular-nums ${sizeClasses[size]} ${getTrustColor(score)}`}
      >
        {score}
      </span>
      <span className={`font-medium uppercase tracking-widest text-muted ${labelClasses[size]}`}>
        Trust {getLabel(score)}
      </span>
    </div>
  );
}
