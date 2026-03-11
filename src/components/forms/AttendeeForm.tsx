"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OtpForm } from "./OtpForm";
import type { GuestQuestion } from "@/lib/booking-page";

interface AttendeeFormProps {
  pageId: string;
  slotId: string;
  requireAuth: boolean;
  guestQuestions: GuestQuestion[];
  onBooked: (bookingId: string) => void;
}

type AuthStep = "details" | "otp" | "questions" | "confirm";

export function AttendeeForm({
  pageId,
  slotId,
  requireAuth,
  guestQuestions,
  onBooked,
}: AttendeeFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<AuthStep>("details");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasQuestions = guestQuestions.length > 0;

  function startCooldown() {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  async function handleSendOtp() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "attendee", pageId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep("otp");
      startCooldown();
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0 || loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "attendee", pageId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      startCooldown();
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(code: string) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, type: "attendee", pageId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep(hasQuestions ? "questions" : "confirm");
    } finally {
      setLoading(false);
    }
  }

  function updateResponse(questionId: string, answer: string) {
    setResponses((prev) => ({ ...prev, [questionId]: answer }));
  }

  function hasMissingRequiredAnswers() {
    return guestQuestions.some((question) => question.required && !responses[question.id]?.trim());
  }

  function goToQuestionStep() {
    setError("");
    setStep("questions");
  }

  function handleQuestionsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasMissingRequiredAnswers()) {
      setError("Please answer all required questions.");
      return;
    }
    setError("");
    setStep("confirm");
  }

  async function handleBook() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          pageId,
          attendeeName: name,
          attendeeEmail: email,
          guestResponses: guestQuestions.map((question) => ({
            questionId: question.id,
            answer: responses[question.id] ?? "",
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onBooked(data.id);
    } finally {
      setLoading(false);
    }
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    if (requireAuth) {
      await handleSendOtp();
    } else if (hasQuestions) {
      goToQuestionStep();
    } else {
      await handleBook();
    }
  }

  return (
    <div className="bg-white border-2 border-brand-black shadow-brutal-lg p-6">
      <h2 className="text-lg font-black uppercase mb-4">YOUR DETAILS</h2>

      {step === "details" && (
        <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required disabled={loading} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required disabled={loading} />
          {error && <p className="text-sm font-bold text-brand-red uppercase tracking-wide">{error}</p>}
          <Button type="submit" variant="primary" loading={loading} disabled={!name || !email} className="w-full py-4 text-base">
            {requireAuth ? "SEND VERIFICATION CODE →" : "BOOK MY SPOT →"}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-brand-black/50 mb-1">Code sent to</p>
          <p className="font-bold mb-4">{email}</p>
          <p className="text-xs font-black uppercase tracking-widest mb-3">Enter 6-Digit Code</p>
          <OtpForm onSubmit={handleVerifyOtp} loading={loading} error={error} />
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading}
              className="text-xs font-bold uppercase tracking-wide text-brand-black/40 hover:text-brand-black disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `RESEND IN ${resendCooldown}s` : "RESEND CODE"}
            </button>
            <button
              onClick={() => { setStep("details"); setError(""); setResendCooldown(0); }}
              className="text-xs font-bold uppercase tracking-wide text-brand-black/40 hover:text-brand-black underline"
            >
              ← Use a different email
            </button>
          </div>
        </div>
      )}

      {step === "questions" && (
        <form onSubmit={handleQuestionsSubmit} className="flex flex-col gap-4">
          <div className="bg-brand-yellow border-2 border-brand-black p-3">
            <p className="text-xs font-black uppercase tracking-widest">
              {requireAuth ? "✓ EMAIL VERIFIED" : "ALMOST DONE"}
            </p>
            <p className="text-sm font-medium normal-case mt-1">
              Answer these questions for <strong>{name}</strong>.
            </p>
          </div>
          {guestQuestions.map((question) => (
            <div key={question.id} className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-brand-black">
                {question.prompt}
                {question.required && <span className="ml-1 text-brand-red">*</span>}
              </label>
              <textarea
                value={responses[question.id] ?? ""}
                onChange={(e) => updateResponse(question.id, e.target.value)}
                placeholder="Type your answer"
                disabled={loading}
                rows={3}
                className="border-2 border-brand-black px-4 py-2.5 text-sm font-mono bg-white shadow-brutal-sm focus:outline-none focus:bg-brand-yellow focus:shadow-none disabled:opacity-50 resize-none placeholder:text-brand-black/20"
              />
            </div>
          ))}
          {error && <p className="text-sm font-bold text-brand-red uppercase tracking-wide">{error}</p>}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(requireAuth ? "otp" : "details")}
              className="flex-1"
            >
              ← BACK
            </Button>
            <Button type="submit" variant="primary" className="flex-1 py-4 text-base">
              REVIEW BOOKING →
            </Button>
          </div>
        </form>
      )}

      {step === "confirm" && (
        <div>
          <div className="bg-brand-yellow border-2 border-brand-black p-3 mb-4">
            <p className="text-xs font-black uppercase tracking-widest">
              {requireAuth ? "✓ EMAIL VERIFIED" : "READY TO BOOK"}
            </p>
            <p className="font-mono text-sm mt-0.5">{email}</p>
          </div>
          <p className="text-sm font-medium normal-case text-brand-black/60 mb-4">
            Booking for <strong>{name}</strong> — click below to confirm.
          </p>
          {hasQuestions && (
            <div className="border-2 border-brand-black p-4 mb-4 bg-brand-bg">
              <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-3">
                Guest Answers
              </p>
              <div className="flex flex-col gap-3">
                {guestQuestions.map((question) => (
                  <div key={question.id}>
                    <p className="text-xs font-black uppercase tracking-wide text-brand-black">
                      {question.prompt}
                    </p>
                    <p className="text-sm font-medium normal-case text-brand-black/60 mt-1">
                      {responses[question.id]?.trim() || "No answer provided"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-sm font-bold text-brand-red uppercase tracking-wide mb-3">{error}</p>}
          <div className="flex gap-3">
            {(hasQuestions || requireAuth) && (
              <Button
                variant="ghost"
                onClick={() => setStep(hasQuestions ? "questions" : "details")}
                disabled={loading}
                className="flex-1"
              >
                ← BACK
              </Button>
            )}
            <Button variant="primary" onClick={handleBook} loading={loading} className="flex-1 py-4 text-base">
              CONFIRM BOOKING →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
