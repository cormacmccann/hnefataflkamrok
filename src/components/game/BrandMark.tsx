interface BrandMarkProps { className?: string; compact?: boolean }
export function BrandMark({ className = '', compact = false }: BrandMarkProps) {
  return <div className={`brand-mark ${compact ? 'brand-mark--compact' : ''} ${className}`}>
    <img src="/brand/tafl-emblem.png" alt="TAFL carved wooden emblem" width="80" height="80" />
    {!compact && <div><span className="brand-name">TAFL</span><span className="brand-caption">The ancient games collection</span></div>}
  </div>;
}
