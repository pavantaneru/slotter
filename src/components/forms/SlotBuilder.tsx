"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface SlotData {
  startTime: string; // ISO string
  endTime: string;
  capacity: number;
}

interface SlotBuilderProps {
  slots: SlotData[];
  onChange: (slots: SlotData[]) => void;
}

function toLocalDateTimeInput(iso?: string): string {
  if (!iso) {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  }
  return new Date(iso).toISOString().slice(0, 16);
}

export function SlotBuilder({ slots, onChange }: SlotBuilderProps) {
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  const [newCapacity, setNewCapacity] = useState(10);
  const [addError, setAddError] = useState("");

  function handleAdd() {
    setAddError("");
    if (!newDate || !newStart || !newEnd) { setAddError("Fill in all fields"); return; }
    const start = new Date(`${newDate}T${newStart}`);
    const end = new Date(`${newDate}T${newEnd}`);
    if (end <= start) { setAddError("End time must be after start time"); return; }
    if (newCapacity < 1) { setAddError("Capacity must be at least 1"); return; }
    onChange([...slots, { startTime: start.toISOString(), endTime: end.toISOString(), capacity: newCapacity }]);
    // Advance start to next slot for convenience
    const nextStart = new Date(end);
    setNewStart(nextStart.toTimeString().slice(0, 5));
    const nextEnd = new Date(nextStart.getTime() + 60 * 60 * 1000);
    setNewEnd(nextEnd.toTimeString().slice(0, 5));
  }

  function handleRemove(idx: number) {
    onChange(slots.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Existing slots */}
      {slots.length > 0 && (
        <div className="flex flex-col gap-2 mb-2">
          {slots.map((slot, i) => {
            const start = new Date(slot.startTime);
            const end = new Date(slot.endTime);
            const dateStr = start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            const startStr = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
            const endStr = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
            return (
              <div key={i} className="flex items-center justify-between border-2 border-brand-black p-3 bg-brand-bg gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase tracking-wide">{dateStr}</p>
                  <p className="text-sm font-bold text-brand-orange">{startStr} — {endStr}</p>
                </div>
                <div className="text-center shrink-0">
                  <p className="text-xs font-black uppercase tracking-widest text-brand-black/40">Cap.</p>
                  <p className="text-lg font-black">{slot.capacity}</p>
                </div>
                <button
                  onClick={() => handleRemove(i)}
                  className="text-brand-red font-black text-lg hover:bg-brand-red hover:text-white border-2 border-brand-red w-8 h-8 flex items-center justify-center shrink-0"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new slot */}
      <div className="border-2 border-brand-black p-4 bg-white">
        <p className="text-xs font-black uppercase tracking-widest mb-4">ADD SLOT</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="col-span-2">
            <Input label="Date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
          </div>
          <Input label="Start Time" type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
          <Input label="End Time" type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
          <div className="col-span-2">
            <Input
              label="Capacity (max attendees per slot)"
              type="number"
              min={1}
              max={1000}
              value={newCapacity}
              onChange={(e) => setNewCapacity(Number(e.target.value))}
            />
          </div>
        </div>
        {addError && <p className="text-xs font-bold text-brand-red uppercase tracking-wide mb-3">{addError}</p>}
        <Button type="button" variant="dark" onClick={handleAdd} className="w-full">
          + ADD SLOT
        </Button>
      </div>
    </div>
  );
}
