interface CapacityBarProps {
  booked: number;
  capacity: number;
  showLabel?: boolean;
}

export function CapacityBar({ booked, capacity, showLabel = true }: CapacityBarProps) {
  const pct = capacity === 0 ? 100 : Math.min(100, (booked / capacity) * 100);

  const fillColor =
    pct >= 100 ? "bg-brand-red" : pct >= 80 ? "bg-brand-orange" : "bg-brand-yellow";

  return (
    <div>
      {showLabel && (
        <p className="text-xs font-black uppercase tracking-widest text-brand-black/50 mb-1">
          {booked} / {capacity} SPOTS TAKEN
        </p>
      )}
      <div className="h-3 w-full border-2 border-brand-black bg-white overflow-hidden">
        <div
          className={`h-full transition-all ${fillColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
