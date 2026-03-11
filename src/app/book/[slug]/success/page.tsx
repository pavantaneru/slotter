"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { formatSlotDate, formatSlotTime } from "@/lib/utils";
import type { EventType, StoredGuestResponse } from "@/lib/booking-page";

interface BookingSummary {
  id: string;
  attendeeName: string;
  pageName: string;
  slotStart: string;
  slotEnd: string;
  eventType: EventType;
  venueLabel: string;
  meetingLink: string | null;
  mapsLink: string | null;
  mapsPreviewUrl: string | null;
  guestResponses: StoredGuestResponse[];
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "Could not load booking details.");
          return;
        }
        setBooking(data);
      })
      .catch(() => setError("Could not load booking details."));
  }, [bookingId]);

  async function handleCopyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const venueLink = booking?.eventType === "in_person" ? booking.mapsLink : booking?.meetingLink;
  const slotDate = booking ? formatSlotDate(new Date(booking.slotStart)) : "";
  const slotTime = booking ? formatSlotTime(new Date(booking.slotStart), new Date(booking.slotEnd)) : "";

  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white border-2 border-brand-black shadow-brutal-xl p-12">
            <div className="inline-block bg-brand-yellow border-2 border-brand-black px-4 py-2 text-2xl font-black mb-6">
              ✓
            </div>
            <h1 className="text-4xl font-black text-brand-black mb-4">
              YOU&apos;RE BOOKED!
            </h1>
            <p className="text-base font-medium normal-case text-brand-black/60 mb-8">
              Your spot is confirmed. Check your email for the full confirmation as well.
            </p>

            {booking && (
              <div className="grid gap-6 text-left mb-8">
                <div className="border-2 border-brand-black p-5 bg-brand-bg">
                  <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-2">
                    Booking Details
                  </p>
                  <p className="text-2xl font-black text-brand-black">{booking.pageName}</p>
                  <p className="text-sm font-medium normal-case text-brand-black/60 mt-2">
                    {slotDate}
                  </p>
                  <p className="text-sm font-bold text-brand-orange mt-1">{slotTime}</p>
                </div>

                {booking.eventType === "in_person" && booking.mapsPreviewUrl && (
                  <div className="border-2 border-brand-black overflow-hidden">
                    <iframe
                      title="Venue map preview"
                      src={booking.mapsPreviewUrl}
                      className="h-72 w-full"
                      loading="lazy"
                    />
                  </div>
                )}

                {venueLink && (
                  <div className="border-2 border-brand-black p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-2">
                      {booking.venueLabel}
                    </p>
                    <p className="text-sm font-mono break-all text-brand-black/70 mb-4">
                      {venueLink}
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <a
                        href={venueLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 border-2 border-brand-black bg-brand-yellow py-3 text-center text-xs font-black uppercase tracking-wide"
                      >
                        OPEN LINK ↗
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(venueLink)}
                        className="flex-1 border-2 border-brand-black bg-white py-3 text-xs font-black uppercase tracking-wide"
                      >
                        {copied ? "COPIED" : "COPY LINK"}
                      </button>
                    </div>
                  </div>
                )}

                {booking.guestResponses.length > 0 && (
                  <div className="border-2 border-brand-black p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-3">
                      Your Answers
                    </p>
                    <div className="flex flex-col gap-3">
                      {booking.guestResponses.map((response) => (
                        <div key={response.questionId}>
                          <p className="text-xs font-black uppercase tracking-wide text-brand-black">
                            {response.prompt}
                          </p>
                          <p className="text-sm font-medium normal-case text-brand-black/60 mt-1">
                            {response.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="border-2 border-brand-red p-4 text-sm font-bold uppercase tracking-wide text-brand-red mb-8">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <Link href="/">
                <div className="w-full border-2 border-brand-black bg-brand-black text-brand-yellow py-3 font-black uppercase tracking-wide text-sm press-effect text-center">
                  BACK TO HOME
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
