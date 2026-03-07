"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OtpForm } from "./OtpForm";

interface AttendeeFormProps {
  pageId: string;
  slotId: string;
  requireAuth: boolean;
  onBooked: () => void;
}

type AuthStep = "details" | "otp" | "confirm";

export function AttendeeForm({ pageId, slotId, requireAuth, onBooked }: AttendeeFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<AuthStep>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setStep("confirm");
    } finally {
      setLoading(false);
    }
  }

  async function handleBook() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, pageId, attendeeName: name, attendeeEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onBooked();
    } finally {
      setLoading(false);
    }
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    if (requireAuth) {
      await handleSendOtp();
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

      {step === "confirm" && (
        <div>
          <div className="bg-brand-yellow border-2 border-brand-black p-3 mb-4">
            <p className="text-xs font-black uppercase tracking-widest">✓ EMAIL VERIFIED</p>
            <p className="font-mono text-sm mt-0.5">{email}</p>
          </div>
          <p className="text-sm font-medium normal-case text-brand-black/60 mb-4">
            Booking for <strong>{name}</strong> — click below to confirm.
          </p>
          {error && <p className="text-sm font-bold text-brand-red uppercase tracking-wide mb-3">{error}</p>}
          <Button variant="primary" onClick={handleBook} loading={loading} className="w-full py-4 text-base">
            CONFIRM BOOKING →
          </Button>
        </div>
      )}
    </div>
  );
}
