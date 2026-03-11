import { GuestQuestionSchema, GuestResponseInputSchema, EventTypeSchema } from "@/types/api";

export type EventType = "none" | "gmeet" | "teams" | "in_person";

export interface GuestQuestion {
  id: string;
  prompt: string;
  required: boolean;
}

export interface StoredGuestResponse {
  questionId: string;
  prompt: string;
  answer: string;
}

function parseJsonArray(value: string | null | undefined): unknown[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseAllowedEmails(value: string | null | undefined): string[] {
  return parseJsonArray(value)
    .map((entry) => (typeof entry === "string" ? entry.toLowerCase() : ""))
    .filter(Boolean);
}

export function parseGuestQuestions(value: string | null | undefined): GuestQuestion[] {
  return parseJsonArray(value)
    .map((entry) => GuestQuestionSchema.safeParse(entry))
    .filter((result) => result.success)
    .map((result) => result.data);
}

export function parseGuestResponses(value: string | null | undefined): StoredGuestResponse[] {
  return parseJsonArray(value)
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const parsed = GuestResponseInputSchema.safeParse({
        questionId: record.questionId,
        answer: record.answer,
      });
      if (!parsed.success || typeof record.prompt !== "string" || !record.prompt.trim()) {
        return null;
      }
      return {
        questionId: parsed.data.questionId,
        prompt: record.prompt.trim(),
        answer: parsed.data.answer,
      };
    })
    .filter((entry): entry is StoredGuestResponse => entry !== null);
}

export function parseEventType(value: string | null | undefined): EventType {
  const parsed = EventTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : "none";
}

export function serializeJson(value: unknown): string {
  return JSON.stringify(value);
}

export function normalizeMapsPreviewUrl(mapsLink: string): string | null {
  try {
    const url = new URL(mapsLink);
    if (!url.hostname.includes("google.")) return null;

    if (url.pathname.startsWith("/maps/embed")) {
      return url.toString();
    }

    if (url.pathname === "/maps" && url.searchParams.get("q")) {
      return `https://www.google.com/maps?q=${encodeURIComponent(url.searchParams.get("q") ?? "")}&output=embed`;
    }

    if (url.pathname.startsWith("/maps/place/") || url.pathname.startsWith("/maps/search/")) {
      return `${url.origin}${url.pathname}${url.search}${url.search ? "&" : "?"}output=embed`;
    }

    if (url.searchParams.get("q")) {
      return `https://www.google.com/maps?q=${encodeURIComponent(url.searchParams.get("q") ?? "")}&output=embed`;
    }

    return null;
  } catch {
    return null;
  }
}

export function getVenueLabel(eventType: EventType): string {
  if (eventType === "gmeet") return "Google Meet";
  if (eventType === "teams") return "Microsoft Teams";
  if (eventType === "in_person") return "Location";
  return "Event";
}
