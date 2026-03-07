"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OtpForm } from "@/components/forms/OtpForm";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
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

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "organizer" }),
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
        body: JSON.stringify({ email, type: "organizer" }),
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
        body: JSON.stringify({ email, code, type: "organizer" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black text-brand-black tracking-tight">
            SLOTTER
          </h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-brand-black/50">
            Organizer Login
          </p>
        </div>

        <div className="bg-white border-2 border-brand-black shadow-brutal-lg p-8">
          {step === "email" ? (
            <form onSubmit={handleSendOtp}>
              <label className="block text-xs font-black uppercase tracking-widest text-brand-black mb-2">
                Your Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full border-2 border-brand-black px-4 py-3 text-base font-mono shadow-brutal-sm focus:outline-none focus:bg-brand-yellow disabled:opacity-50 mb-4"
              />
              {error && (
                <p className="mb-4 text-sm font-bold text-brand-red uppercase tracking-wide">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-brand-yellow border-2 border-brand-black shadow-brutal font-black uppercase tracking-wide py-3 text-base press-effect disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "SENDING..." : "SEND CODE →"}
              </button>
            </form>
          ) : (
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-brand-black/50 mb-1">
                Code sent to
              </p>
              <p className="font-bold text-brand-black mb-6">{email}</p>

              <label className="block text-xs font-black uppercase tracking-widest text-brand-black mb-3">
                Enter 6-Digit Code
              </label>
              <OtpForm onSubmit={handleVerifyOtp} loading={loading} error={error} />

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-sm font-bold uppercase tracking-wide text-brand-black/50 hover:text-brand-black disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `RESEND IN ${resendCooldown}s` : "RESEND CODE"}
                </button>
                <button
                  onClick={() => { setStep("email"); setError(""); setResendCooldown(0); }}
                  className="text-sm font-bold uppercase tracking-wide text-brand-black/50 hover:text-brand-black underline"
                >
                  ← Use a different email
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs font-bold uppercase tracking-widest text-brand-black/40">
          Attendees don&apos;t need an account — just visit the booking link.
        </p>
      </div>
    </main>
  );
}
