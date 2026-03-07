import { SlotCard } from "./SlotCard";
import { formatSlotDate } from "@/lib/utils";

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isCancelled: boolean;
  _count: { bookings: number };
}

interface SlotGridProps {
  slots: Slot[];
  selectedSlotId: string | null;
  onSelect: (id: string) => void;
}

export function SlotGrid({ slots, selectedSlotId, onSelect }: SlotGridProps) {
  if (slots.length === 0) {
    return (
      <div className="border-2 border-dashed border-brand-black/30 p-12 text-center">
        <p className="text-xl font-black text-brand-black/30 uppercase">No Slots Available</p>
        <p className="text-sm font-medium text-brand-black/30 normal-case mt-2">
          Check back later for available time slots.
        </p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, Slot[]> = {};
  for (const slot of slots) {
    const dateKey = new Date(slot.startTime).toDateString();
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(slot);
  }

  return (
    <div className="flex flex-col gap-10">
      {Object.entries(grouped).map(([dateKey, daySlots]) => (
        <div key={dateKey}>
          <div className="border-b-2 border-brand-black mb-4 pb-2">
            <h3 className="text-base font-black uppercase tracking-tight text-brand-black">
              {formatSlotDate(new Date(daySlots[0].startTime))}
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {daySlots.map((slot) => (
              <SlotCard
                key={slot.id}
                id={slot.id}
                startTime={slot.startTime}
                endTime={slot.endTime}
                capacity={slot.capacity}
                bookedCount={slot._count.bookings}
                isCancelled={slot.isCancelled}
                selected={selectedSlotId === slot.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
