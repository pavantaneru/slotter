"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";

interface OtpFormProps {
  onSubmit: (code: string) => void;
  loading?: boolean;
  error?: string;
}

export function OtpForm({ onSubmit, loading, error }: OtpFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== "") && next.join("").length === 6) {
      onSubmit(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setDigits(next);
    const lastIdx = Math.min(pasted.length - 1, 5);
    inputs.current[lastIdx]?.focus();
    if (pasted.length === 6) {
      onSubmit(pasted);
    }
  }

  return (
    <div>
      <div className="flex gap-2 justify-center">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={loading}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="w-12 h-14 text-center text-2xl font-black border-2 border-brand-black bg-white shadow-brutal focus:outline-none focus:bg-brand-yellow disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-center text-sm font-bold text-brand-red uppercase tracking-wide">
          {error}
        </p>
      )}
    </div>
  );
}
