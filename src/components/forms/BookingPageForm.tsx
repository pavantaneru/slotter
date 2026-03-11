"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { generateSlug } from "@/lib/utils";
import type { EventType } from "@/lib/booking-page";

export interface GuestQuestionFormData {
  id: string;
  prompt: string;
  required: boolean;
}

export interface BookingPageFormData {
  name: string;
  description: string;
  slug: string;
  requireAuth: boolean;
  allowedEmails: string[];
  guestQuestions: GuestQuestionFormData[];
  eventType: EventType;
  meetingLink: string;
  mapsLink: string;
  isActive: boolean;
}

interface BookingPageFormProps {
  initial?: Partial<BookingPageFormData>;
  onSubmit: (data: BookingPageFormData) => Promise<void>;
  loading?: boolean;
  error?: string;
  submitLabel?: string;
}

export function BookingPageForm({
  initial,
  onSubmit,
  loading,
  error,
  submitLabel = "CREATE PAGE",
}: BookingPageFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [requireAuth, setRequireAuth] = useState(initial?.requireAuth ?? false);
  const [allowedEmailsText, setAllowedEmailsText] = useState(
    (initial?.allowedEmails ?? []).join("\n")
  );
  const [guestQuestions, setGuestQuestions] = useState<GuestQuestionFormData[]>(
    initial?.guestQuestions ?? []
  );
  const [eventType, setEventType] = useState<EventType>(initial?.eventType ?? "none");
  const [meetingLink, setMeetingLink] = useState(initial?.meetingLink ?? "");
  const [mapsLink, setMapsLink] = useState(initial?.mapsLink ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initial?.slug);

  // Auto-generate slug from name unless manually edited
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      const base = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/[\s-]+/g, "-");
      setSlug(base);
    }
  }, [name, slugManuallyEdited]);

  function handleSlugChange(val: string) {
    setSlugManuallyEdited(true);
    setSlug(val.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  }

  function parseAllowedEmails(): string[] {
    return allowedEmailsText
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);
  }

  function createQuestion(): GuestQuestionFormData {
    return {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      prompt: "",
      required: false,
    };
  }

  function updateQuestion(id: string, updates: Partial<GuestQuestionFormData>) {
    setGuestQuestions((prev) =>
      prev.map((question) => (question.id === id ? { ...question, ...updates } : question))
    );
  }

  function addQuestion() {
    if (guestQuestions.length >= 10) return;
    setGuestQuestions((prev) => [...prev, createQuestion()]);
  }

  function removeQuestion(id: string) {
    setGuestQuestions((prev) => prev.filter((question) => question.id !== id));
  }

  function normalizeQuestions(): GuestQuestionFormData[] {
    return guestQuestions
      .map((question) => ({
        ...question,
        prompt: question.prompt.trim(),
      }))
      .filter((question) => question.prompt.length > 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalSlug = slug || generateSlug(name);
    await onSubmit({
      name,
      description,
      slug: finalSlug,
      requireAuth,
      allowedEmails: requireAuth ? parseAllowedEmails() : [],
      guestQuestions: normalizeQuestions(),
      eventType,
      meetingLink: eventType === "gmeet" || eventType === "teams" ? meetingLink.trim() : "",
      mapsLink: eventType === "in_person" ? mapsLink.trim() : "",
      isActive,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Page Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Team Onboarding Sessions"
        required
        disabled={loading}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-black uppercase tracking-widest text-brand-black">
          Description <span className="font-normal text-brand-black/40">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this booking page for?"
          disabled={loading}
          rows={3}
          className="border-2 border-brand-black px-4 py-2.5 text-base font-mono bg-white shadow-brutal-sm focus:outline-none focus:bg-brand-yellow focus:shadow-none disabled:opacity-50 resize-none placeholder:text-brand-black/30"
        />
      </div>

      <div>
        <Input
          label="Page URL"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="my-booking-page"
          disabled={loading}
          hint={slug ? `Your link: /book/${slug}` : undefined}
        />
      </div>

      <div className="border-2 border-brand-black p-4 flex flex-col gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-brand-black">
            Event Format
          </p>
          <p className="text-xs text-brand-black/50 font-medium normal-case mt-0.5">
            Share a meeting link for online events or a Google Maps link for in-person events.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { value: "none", label: "No Venue" },
            { value: "gmeet", label: "Google Meet" },
            { value: "teams", label: "Teams" },
            { value: "in_person", label: "In Person" },
          ].map((option) => {
            const active = eventType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setEventType(option.value as EventType)}
                disabled={loading}
                className={`border-2 border-brand-black px-3 py-3 text-xs font-black uppercase tracking-wide transition-colors ${
                  active ? "bg-brand-yellow" : "bg-white hover:bg-brand-bg"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {(eventType === "gmeet" || eventType === "teams") && (
          <Input
            label={eventType === "gmeet" ? "Google Meet Link" : "Teams Meeting Link"}
            type="url"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder={
              eventType === "gmeet"
                ? "https://meet.google.com/..."
                : "https://teams.microsoft.com/l/meetup-join/..."
            }
            required
            disabled={loading}
          />
        )}

        {eventType === "in_person" && (
          <Input
            label="Google Maps Link"
            type="url"
            value={mapsLink}
            onChange={(e) => setMapsLink(e.target.value)}
            placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/..."
            required
            disabled={loading}
          />
        )}
      </div>

      {/* requireAuth toggle */}
      <div className="border-2 border-brand-black p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-brand-black">
              Email Verification
            </p>
            <p className="text-xs text-brand-black/50 font-medium normal-case mt-0.5">
              Restrict booking to a specific list of approved email addresses, verified via OTP
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRequireAuth(!requireAuth)}
            disabled={loading}
            role="switch"
            aria-checked={requireAuth}
            className={`relative flex-shrink-0 w-14 h-7 border-2 border-brand-black overflow-hidden transition-colors duration-200 ${
              requireAuth ? "bg-brand-yellow" : "bg-brand-black/10"
            }`}
          >
            <span
              className={`absolute inset-y-0 w-6 bg-brand-black transition-all duration-200 ${
                requireAuth ? "left-[calc(100%-24px)]" : "left-0"
              }`}
            />
          </button>
        </div>

        {requireAuth && (
          <div className="flex flex-col gap-1.5 border-t-2 border-brand-black/10 pt-3">
            <label className="text-xs font-black uppercase tracking-widest text-brand-black">
              Approved Emails
              <span className="font-normal text-brand-black/40 ml-1">(one per line)</span>
            </label>
            <textarea
              value={allowedEmailsText}
              onChange={(e) => setAllowedEmailsText(e.target.value)}
              placeholder={"alice@example.com\nbob@example.com\ncarol@example.com"}
              disabled={loading}
              rows={4}
              className="border-2 border-brand-black px-4 py-2.5 text-sm font-mono bg-white shadow-brutal-sm focus:outline-none focus:bg-brand-yellow focus:shadow-none disabled:opacity-50 resize-none placeholder:text-brand-black/20"
            />
            <p className="text-xs text-brand-black/40 font-medium">
              Only these addresses will be able to receive a verification code and book a slot.
            </p>
          </div>
        )}
      </div>

      <div className="border-2 border-brand-black p-4 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-brand-black">
              Guest Questions
            </p>
            <p className="text-xs text-brand-black/50 font-medium normal-case mt-0.5">
              Ask guests for extra information before they complete booking.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={addQuestion}
            disabled={loading || guestQuestions.length >= 10}
            className="text-xs"
          >
            + ADD QUESTION
          </Button>
        </div>

        {guestQuestions.length === 0 ? (
          <div className="border-2 border-dashed border-brand-black/20 p-4 text-center text-xs font-bold uppercase tracking-wide text-brand-black/30">
            No guest questions yet
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {guestQuestions.map((question, index) => (
              <div key={question.id} className="border-2 border-brand-black p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs font-black uppercase tracking-widest text-brand-black/40">
                    Question {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    disabled={loading}
                    className="text-xs font-black uppercase tracking-wide text-brand-red hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-brand-black">
                    Prompt
                  </label>
                  <textarea
                    value={question.prompt}
                    onChange={(e) => updateQuestion(question.id, { prompt: e.target.value })}
                    placeholder="What should guests answer?"
                    disabled={loading}
                    rows={2}
                    className="border-2 border-brand-black px-4 py-2.5 text-sm font-mono bg-white shadow-brutal-sm focus:outline-none focus:bg-brand-yellow focus:shadow-none disabled:opacity-50 resize-none placeholder:text-brand-black/20"
                  />
                </div>
                <label className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-wide text-brand-black">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                    disabled={loading}
                    className="h-4 w-4 rounded-none border-2 border-brand-black text-brand-black focus:ring-0"
                  />
                  Required answer
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm font-bold text-brand-red uppercase tracking-wide border-2 border-brand-red p-3">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" loading={loading} disabled={!name} className="w-full py-4 text-base">
        {submitLabel}
      </Button>
    </form>
  );
}
