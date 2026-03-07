"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CapacityBar } from "@/components/booking/CapacityBar";
import { useToast } from "@/components/ui/Toast";
import { formatSlotDate, formatSlotTime } from "@/lib/utils";

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isCancelled: boolean;
  bookings: Array<{ id: string; attendeeName: string; attendeeEmail: string }>;
}

interface SlotManagerProps {
  slots: Slot[];
  onSlotCancelled: (id: string) => void;
}

export function SlotManager({ slots, onSlotCancelled }: SlotManagerProps) {
  const { toast } = useToast();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  async function handleCancelSlot() {
    if (!confirmId) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/slots/${confirmId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to cancel slot", "error"); return; }
      toast("Slot cancelled. Attendees notified.", "success");
      onSlotCancelled(confirmId);
    } finally {
      setCancelling(false);
      setConfirmId(null);
    }
  }

  if (slots.length === 0) {
    return (
      <div className="border-2 border-dashed border-brand-black/30 p-12 text-center">
        <p className="text-lg font-black text-brand-black/30">NO SLOTS YET</p>
        <p className="text-sm font-medium text-brand-black/30 normal-case mt-1">Add slots to this page.</p>
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

  const confirmingSlot = slots.find((s) => s.id === confirmId);

  return (
    <>
      <div className="flex flex-col gap-8">
        {Object.entries(grouped).map(([dateKey, daySlots]) => (
          <div key={dateKey}>
            <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-3">
              {formatSlotDate(new Date(daySlots[0].startTime))}
            </p>
            <div className="flex flex-col gap-3">
              {daySlots.map((slot) => {
                const booked = slot.bookings.length;
                const isFull = booked >= slot.capacity;
                const status = slot.isCancelled ? "cancelled" : isFull ? "full" : "open";

                return (
                  <div key={slot.id} className={`border-2 border-brand-black p-4 flex items-center gap-4 ${slot.isCancelled ? "opacity-60" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-black text-base">{formatSlotTime(new Date(slot.startTime), new Date(slot.endTime))}</p>
                        <Badge variant={status} />
                      </div>
                      <CapacityBar booked={booked} capacity={slot.capacity} />
                    </div>
                    {!slot.isCancelled && (
                      <Button
                        variant="danger"
                        onClick={() => setConfirmId(slot.id)}
                        className="text-xs py-2 shrink-0"
                      >
                        CANCEL
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="CANCEL SLOT?"
        description={
          confirmingSlot
            ? `This will cancel the ${formatSlotTime(new Date(confirmingSlot.startTime), new Date(confirmingSlot.endTime))} slot and notify all ${confirmingSlot.bookings.length} booked attendee(s) by email. This cannot be undone.`
            : undefined
        }
        confirmLabel="YES, CANCEL SLOT"
        confirmVariant="danger"
        onConfirm={handleCancelSlot}
        loading={cancelling}
      />
    </>
  );
}
