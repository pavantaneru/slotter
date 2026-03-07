"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm?: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  confirmLabel = "CONFIRM",
  confirmVariant = "primary",
  onConfirm,
  loading,
  children,
}: ModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-black/60"
        onClick={onClose}
      />
      {/* Modal box */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md",
          "bg-white border-3 border-brand-black shadow-brutal-xl p-8"
        )}
      >
        <h2 className="text-xl font-black uppercase tracking-tight text-brand-black mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-brand-black/70 mb-6 font-medium normal-case">
            {description}
          </p>
        )}
        {children}
        {onConfirm && (
          <div className="flex gap-3 mt-6">
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              loading={loading}
              className="flex-1"
            >
              {confirmLabel}
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={loading} className="flex-1">
              CANCEL
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
