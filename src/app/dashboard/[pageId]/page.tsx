"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SlotManager } from "@/components/dashboard/SlotManager";
import { SlotBuilder, SlotData } from "@/components/forms/SlotBuilder";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { EventType, StoredGuestResponse } from "@/lib/booking-page";

interface PageData {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  requireAuth: boolean;
  eventType: EventType;
  guestQuestions: Array<{ id: string; prompt: string; required: boolean }>;
  meetingLink: string | null;
  mapsLink: string | null;
  timeSlots: Array<{
    id: string;
    startTime: string;
    endTime: string;
    capacity: number;
    isCancelled: boolean;
    bookings: Array<{
      id: string;
      attendeeName: string;
      attendeeEmail: string;
      guestResponses: StoredGuestResponse[];
      createdAt: string;
      cancelledAt: string | null;
    }>;
  }>;
}

type Tab = "slots" | "bookings";

export default function ManagePagePage() {
  const params = useParams<{ pageId: string }>();
  const { toast } = useToast();
  const [page, setPage] = useState<PageData | null>(null);
  const [tab, setTab] = useState<Tab>("slots");
  const [newSlots, setNewSlots] = useState<SlotData[]>([]);
  const [addingSlots, setAddingSlots] = useState(false);
  const [showSlotBuilder, setShowSlotBuilder] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState(false);

  useEffect(() => {
    fetch(`/api/pages/${params.pageId}`)
      .then((r) => r.json())
      .then(setPage);
  }, [params.pageId]);

  function handleSlotCancelled(slotId: string) {
    setPage((prev) =>
      prev
        ? {
            ...prev,
            timeSlots: prev.timeSlots.map((s) =>
              s.id === slotId ? { ...s, isCancelled: true } : s
            ),
          }
        : prev
    );
  }

  async function handleCancelBooking() {
    if (!cancelBookingId) return;
    setCancellingBooking(true);
    try {
      const res = await fetch(`/api/bookings/${cancelBookingId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to cancel booking", "error"); return; }
      toast("Booking cancelled. Attendee notified.", "success");
      setPage((prev) =>
        prev
          ? {
              ...prev,
              timeSlots: prev.timeSlots.map((slot) => ({
                ...slot,
                bookings: slot.bookings.map((b) =>
                  b.id === cancelBookingId ? { ...b, cancelledAt: new Date().toISOString() } : b
                ),
              })),
            }
          : prev
      );
    } finally {
      setCancellingBooking(false);
      setCancelBookingId(null);
    }
  }

  async function handleAddSlots() {
    if (newSlots.length === 0) return;
    setAddingSlots(true);
    try {
      const res = await fetch(`/api/pages/${params.pageId}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlots),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to add slots", "error"); return; }
      toast(`${data.created} slot(s) added!`, "success");
      // Refresh page data
      const updated = await fetch(`/api/pages/${params.pageId}`).then((r) => r.json());
      setPage(updated);
      setNewSlots([]);
      setShowSlotBuilder(false);
    } finally {
      setAddingSlots(false);
    }
  }

  if (!page) {
    return (
      <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
        <div className="h-12 bg-brand-black/10 w-64" />
        <div className="h-48 bg-brand-black/10" />
      </div>
    );
  }

  const allBookings = page.timeSlots.flatMap((slot) =>
    slot.bookings.map((b) => ({ ...b, slot }))
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <Link href="/dashboard" className="text-xs font-bold uppercase tracking-wide text-brand-black/40 hover:text-brand-black">
            ← Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-3xl font-black text-brand-black">{page.name}</h1>
            <Badge variant={page.isActive ? "active" : "inactive"} />
            {page.requireAuth && (
              <span className="text-xs bg-brand-black text-brand-yellow px-2 py-0.5 font-black uppercase">OTP</span>
            )}
            {page.guestQuestions.length > 0 && (
              <span className="text-xs bg-brand-yellow px-2 py-0.5 font-black uppercase text-brand-black">
                {page.guestQuestions.length} Q
              </span>
            )}
          </div>
          <a
            href={`/book/${page.slug}`}
            target="_blank"
            className="text-xs font-mono text-brand-orange hover:underline mt-1 block"
          >
              /book/{page.slug} ↗
            </a>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-black/40 mt-2">
            {page.eventType === "none"
              ? "No venue info"
              : page.eventType === "gmeet"
                ? "Google Meet"
                : page.eventType === "teams"
                  ? "Microsoft Teams"
                  : "In person"}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <ExportButton pageId={page.id} />
          <Link href={`/dashboard/${page.id}/edit`}>
            <Button variant="ghost" className="text-xs">EDIT</Button>
          </Link>
          <Button variant="primary" onClick={() => setShowSlotBuilder(!showSlotBuilder)} className="text-xs">
            {showSlotBuilder ? "CANCEL" : "+ ADD SLOTS"}
          </Button>
        </div>
      </div>

      {/* Slot builder panel */}
      {showSlotBuilder && (
        <div className="bg-white border-2 border-brand-black shadow-brutal-lg p-6 mb-8">
          <h2 className="text-lg font-black mb-4">ADD MORE SLOTS</h2>
          <SlotBuilder slots={newSlots} onChange={setNewSlots} />
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" onClick={() => { setShowSlotBuilder(false); setNewSlots([]); }} className="flex-1">CANCEL</Button>
            <Button variant="primary" onClick={handleAddSlots} loading={addingSlots} disabled={newSlots.length === 0} className="flex-1">
              ADD {newSlots.length} SLOT{newSlots.length !== 1 ? "S" : ""}
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Slots", value: page.timeSlots.length },
          { label: "Active Slots", value: page.timeSlots.filter((s) => !s.isCancelled).length },
          { label: "Total Bookings", value: allBookings.filter((b) => !b.cancelledAt).length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border-2 border-brand-black p-4 shadow-brutal text-center">
            <p className="text-3xl font-black text-brand-black">{stat.value}</p>
            <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex mb-6">
        {(["slots", "bookings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 border-2 border-brand-black px-4 py-3 font-black uppercase text-sm tracking-wide -ml-[2px] first:ml-0 transition-colors ${
              tab === t ? "bg-brand-yellow" : "bg-white hover:bg-brand-bg"
            }`}
          >
            {t === "slots" ? `SLOTS (${page.timeSlots.length})` : `BOOKINGS (${allBookings.filter((b) => !b.cancelledAt).length})`}
          </button>
        ))}
      </div>

      {tab === "slots" && (
        <SlotManager
          slots={page.timeSlots}
          onSlotCancelled={handleSlotCancelled}
        />
      )}

      <Modal
        open={!!cancelBookingId}
        onClose={() => setCancelBookingId(null)}
        title="CANCEL BOOKING?"
        description="This will cancel the booking and notify the attendee by email. The spot will become available again."
        confirmLabel="YES, CANCEL BOOKING"
        confirmVariant="danger"
        onConfirm={handleCancelBooking}
        loading={cancellingBooking}
      />

      {tab === "bookings" && (
        <div>
          {allBookings.length === 0 ? (
            <div className="border-2 border-dashed border-brand-black/30 p-12 text-center">
              <p className="text-lg font-black text-brand-black/30">NO BOOKINGS YET</p>
            </div>
          ) : (
            <div className="border-2 border-brand-black overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-black text-brand-yellow">
                    {["Slot", "Name", "Email", "Guest Answers", "Booked At", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-black uppercase text-xs tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map((b, i) => {
                    const slotStart = new Date(b.slot.startTime);
                    const slotEnd = new Date(b.slot.endTime);
                    return (
                      <tr key={b.id} className={`border-t-2 border-brand-black/10 ${i % 2 === 0 ? "bg-white" : "bg-brand-bg"}`}>
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                          {slotStart.toLocaleDateString()} {slotStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–{slotEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-3 font-bold">{b.attendeeName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-brand-black/60">{b.attendeeEmail}</td>
                        <td className="px-4 py-3">
                          {b.guestResponses.length === 0 ? (
                            <span className="text-xs font-bold uppercase tracking-wide text-brand-black/30">
                              No answers
                            </span>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {b.guestResponses.map((response) => (
                                <div key={response.questionId}>
                                  <p className="text-[10px] font-black uppercase tracking-wide text-brand-black/40">
                                    {response.prompt}
                                  </p>
                                  <p className="text-xs font-medium normal-case text-brand-black/70">
                                    {response.answer}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-brand-black/40 whitespace-nowrap">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={b.cancelledAt || b.slot.isCancelled ? "cancelled" : "open"} />
                        </td>
                        <td className="px-4 py-3">
                          {!b.cancelledAt && !b.slot.isCancelled && (
                            <button
                              onClick={() => setCancelBookingId(b.id)}
                              className="text-xs font-black uppercase tracking-wide text-brand-red hover:underline"
                            >
                              CANCEL
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
