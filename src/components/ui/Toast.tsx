"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const typeClasses: Record<ToastType, string> = {
    success: "bg-brand-yellow border-brand-black text-brand-black",
    error: "bg-brand-red border-brand-black text-white",
    info: "bg-brand-black border-brand-black text-brand-yellow",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "border-2 shadow-brutal px-4 py-3 font-bold text-sm uppercase tracking-wide",
              "animate-in slide-in-from-right-4 fade-in duration-200",
              typeClasses[t.type]
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
