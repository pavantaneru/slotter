import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export function formatSlotTime(start: Date, end: Date): string {
  const startStr = new Date(start).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const endStr = new Date(end).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${startStr} — ${endStr}`;
}

export function formatSlotDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
