import { Badge } from "@/components/ui/Badge";
import { CapacityBar } from "./CapacityBar";
import { formatSlotTime } from "@/lib/utils";

interface SlotCardProps {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isCancelled: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function SlotCard({
  id,
  startTime,
  endTime,
  capacity,
  bookedCount,
  isCancelled,
  selected,
  onSelect,
}: SlotCardProps) {
  const isFull = bookedCount >= capacity;
  const disabled = isFull || isCancelled;

  const status = isCancelled ? "cancelled" : isFull ? "full" : "open";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(id)}
      className={`w-full text-left border-2 p-4 transition-all
        ${selected
          ? "border-brand-black bg-brand-yellow shadow-brutal"
          : disabled
          ? "border-brand-black/30 bg-white opacity-60 cursor-not-allowed"
          : "border-brand-black bg-white shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-black text-base text-brand-black">
          {formatSlotTime(new Date(startTime), new Date(endTime))}
        </p>
        <Badge variant={status} />
      </div>
      <CapacityBar booked={bookedCount} capacity={capacity} />
      {!disabled && !selected && (
        <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mt-3">
          CLICK TO SELECT →
        </p>
      )}
      {selected && (
        <p className="text-xs font-black uppercase tracking-widest text-brand-black mt-3">
          ✓ SELECTED
        </p>
      )}
    </button>
  );
}
