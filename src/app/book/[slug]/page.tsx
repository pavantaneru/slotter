"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { SlotGrid } from "@/components/booking/SlotGrid";
import { AttendeeForm } from "@/components/forms/AttendeeForm";
import { Badge } from "@/components/ui/Badge";

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isCancelled: boolean;
  _count: { bookings: number };
}

interface PageData {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  requireAuth: boolean;
  timeSlots: Slot[];
}

export default function BookingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [page, setPage] = useState<PageData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/pages/slug/${params.slug}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return; }
        const data = await r.json();
        setPage(data);
      });
  }, [params.slug]);

  function handleSelectSlot(id: string) {
    setSelectedSlotId((prev) => (prev === id ? null : id));
  }

  function handleBooked() {
    router.push(`/book/${params.slug}/success`);
  }

  if (notFound) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 py-20 text-center">
          <p className="text-5xl font-black text-brand-black/20 mb-4">404</p>
          <h1 className="text-2xl font-black text-brand-black mb-2">PAGE NOT FOUND</h1>
          <p className="text-sm font-medium normal-case text-brand-black/50">
            This booking page doesn&apos;t exist or may have been removed.
          </p>
        </main>
      </>
    );
  }

  if (!page) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-brand-black/10 w-64" />
            <div className="h-48 bg-brand-black/10" />
          </div>
        </main>
      </>
    );
  }

  const selectedSlot = page.timeSlots.find((s) => s.id === selectedSlotId) ?? null;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-brand-black">{page.name}</h1>
            {!page.isActive && <Badge variant="inactive">CLOSED</Badge>}
          </div>
          {page.description && (
            <p className="text-base font-medium normal-case text-brand-black/60 mt-2">
              {page.description}
            </p>
          )}
          {page.requireAuth && (
            <div className="mt-3 inline-flex items-center gap-2 bg-brand-black text-brand-yellow px-3 py-1 text-xs font-black uppercase tracking-wide">
              <span>✓</span> Email verification required to book
            </div>
          )}
        </div>

        {!page.isActive ? (
          <div className="border-2 border-brand-black bg-brand-black/5 p-12 text-center">
            <p className="text-xl font-black uppercase text-brand-black/40">
              THIS PAGE IS NO LONGER ACCEPTING BOOKINGS
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_360px] gap-8 items-start">
            {/* Slot grid */}
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-brand-black/50 mb-4">
                SELECT A TIME SLOT
              </h2>
              <SlotGrid
                slots={page.timeSlots}
                selectedSlotId={selectedSlotId}
                onSelect={handleSelectSlot}
              />
            </div>

            {/* Booking form */}
            <div className="md:sticky md:top-6">
              {selectedSlot ? (
                <AttendeeForm
                  pageId={page.id}
                  slotId={selectedSlot.id}
                  requireAuth={page.requireAuth}
                  onBooked={handleBooked}
                />
              ) : (
                <div className="border-2 border-brand-black/20 bg-brand-black/5 p-10 text-center flex flex-col items-center gap-3">
                  <span className="text-3xl font-black text-brand-black/15">←</span>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-black/30">
                    Select a time slot<br />to continue
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
