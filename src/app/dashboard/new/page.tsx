"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookingPageForm, BookingPageFormData } from "@/components/forms/BookingPageForm";
import { SlotBuilder, SlotData } from "@/components/forms/SlotBuilder";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type Step = 1 | 2 | 3;

export default function NewPagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [pageData, setPageData] = useState<BookingPageFormData | null>(null);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePageDetails(data: BookingPageFormData) {
    setPageData(data);
    setStep(2);
  }

  async function handleCreate() {
    if (!pageData) return;
    setLoading(true);
    setError("");
    try {
      // Create the page
      const pageRes = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });
      const page = await pageRes.json();
      if (!pageRes.ok) { setError(page.error); setStep(1); return; }

      // Create slots if any
      if (slots.length > 0) {
        const slotsRes = await fetch(`/api/pages/${page.id}/slots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slots),
        });
        if (!slotsRes.ok) {
          const err = await slotsRes.json();
          toast(err.error ?? "Slots could not be saved", "error");
        }
      }

      toast("Booking page created!", "success");
      router.push(`/dashboard/${page.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const stepLabels = ["PAGE DETAILS", "TIME SLOTS", "REVIEW"];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-black/50 hover:text-brand-black mb-6">
        ← Back to Dashboard
      </Link>

      <h1 className="text-4xl font-black text-brand-black mb-8">NEW BOOKING PAGE</h1>

      {/* Step indicator */}
      <div className="flex gap-0 mb-10">
        {stepLabels.map((label, i) => {
          const s = (i + 1) as Step;
          const active = step === s;
          const done = step > s;
          return (
            <div key={label} className={`flex-1 border-2 border-brand-black px-3 py-2 text-center text-xs font-black uppercase tracking-wide -ml-[2px] first:ml-0 ${
              active ? "bg-brand-yellow" : done ? "bg-brand-black text-brand-yellow" : "bg-white text-brand-black/40"
            }`}>
              {done ? "✓ " : ""}{label}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="bg-white border-2 border-brand-black shadow-brutal-lg p-8">
          <BookingPageForm
            initial={pageData ?? undefined}
            onSubmit={handlePageDetails}
            error={error}
          />
        </div>
      )}

      {step === 2 && (
        <div className="bg-white border-2 border-brand-black shadow-brutal-lg p-8">
          <h2 className="text-xl font-black mb-1">ADD TIME SLOTS</h2>
          <p className="text-sm text-brand-black/50 font-medium normal-case mb-6">
            Add the time slots people can book. You can add more later.
          </p>
          <SlotBuilder slots={slots} onChange={setSlots} />
          <div className="flex gap-3 mt-8">
            <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">← BACK</Button>
            <Button variant="primary" onClick={() => setStep(3)} className="flex-1">
              {slots.length === 0 ? "SKIP →" : `NEXT → (${slots.length} slot${slots.length !== 1 ? "s" : ""})`}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && pageData && (
        <div className="bg-white border-2 border-brand-black shadow-brutal-lg p-8">
          <h2 className="text-xl font-black mb-6">REVIEW & CREATE</h2>

          <div className="flex flex-col gap-4 mb-8">
            <div className="border-2 border-brand-black p-4">
              <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-1">Page Name</p>
              <p className="font-black text-lg">{pageData.name}</p>
            </div>
            <div className="border-2 border-brand-black p-4">
              <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-1">URL</p>
              <p className="font-mono font-bold">/book/{pageData.slug}</p>
            </div>
            {pageData.description && (
              <div className="border-2 border-brand-black p-4">
                <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-1">Description</p>
                <p className="font-medium normal-case text-sm">{pageData.description}</p>
              </div>
            )}
            <div className="border-2 border-brand-black p-4">
              <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-1">Email Verification</p>
              <p className="font-black">{pageData.requireAuth ? "REQUIRED" : "NOT REQUIRED"}</p>
              {pageData.requireAuth && pageData.allowedEmails.length > 0 && (
                <p className="text-xs text-brand-black/50 font-medium normal-case mt-0.5">
                  {pageData.allowedEmails.length} approved email{pageData.allowedEmails.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="border-2 border-brand-black p-4">
              <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-1">Guest Questions</p>
              <p className="font-black">
                {pageData.guestQuestions.length} question{pageData.guestQuestions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="border-2 border-brand-black p-4">
              <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-1">Event Format</p>
              <p className="font-black">
                {pageData.eventType === "none"
                  ? "NO VENUE"
                  : pageData.eventType === "gmeet"
                    ? "GOOGLE MEET"
                    : pageData.eventType === "teams"
                      ? "MICROSOFT TEAMS"
                      : "IN PERSON"}
              </p>
            </div>
            <div className="border-2 border-brand-black p-4">
              <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-1">Time Slots</p>
              <p className="font-black">{slots.length} slot{slots.length !== 1 ? "s" : ""} added</p>
            </div>
          </div>

          {error && (
            <p className="mb-4 text-sm font-bold text-brand-red uppercase tracking-wide border-2 border-brand-red p-3">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(2)} disabled={loading} className="flex-1">← BACK</Button>
            <Button variant="primary" onClick={handleCreate} loading={loading} className="flex-1 py-4">
              CREATE PAGE →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
