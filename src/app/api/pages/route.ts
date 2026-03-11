import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer } from "@/lib/session";
import { CreatePageSchema } from "@/types/api";
import { generateSlug } from "@/lib/utils";
import {
  parseAllowedEmails,
  parseEventType,
  parseGuestQuestions,
  serializeJson,
} from "@/lib/booking-page";

function serializePage(page: Record<string, unknown>) {
  return {
    ...page,
    allowedEmails: parseAllowedEmails(page.allowedEmails as string | null | undefined),
    guestQuestions: parseGuestQuestions(page.guestQuestions as string | null | undefined),
    eventType: parseEventType(page.eventType as string | null | undefined),
  };
}

export async function GET() {
  const { session, error } = await requireOrganizer();
  if (error) return error;

  const pages = await prisma.bookingPage.findMany({
    where: { organizerId: session!.organizerId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { timeSlots: true } },
      timeSlots: {
        include: { _count: { select: { bookings: { where: { cancelledAt: null } } } } },
      },
    },
  });

  return NextResponse.json(pages.map((page) => serializePage(page as unknown as Record<string, unknown>)));
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireOrganizer();
  if (error) return error;

  const body = await req.json();
  const parsed = CreatePageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const {
    name,
    description,
    slug,
    requireAuth,
    allowedEmails,
    guestQuestions,
    eventType,
    meetingLink,
    mapsLink,
    isActive,
  } = parsed.data;

  // Auto-generate slug if not provided or ensure uniqueness
  let finalSlug = slug || generateSlug(name);

  const existing = await prisma.bookingPage.findUnique({ where: { slug: finalSlug } });
  if (existing) {
    return NextResponse.json({ error: "This URL is already taken. Choose a different slug." }, { status: 409 });
  }

  const page = await prisma.bookingPage.create({
    data: {
      slug: finalSlug,
      name,
      description: description ?? "",
      organizerId: session!.organizerId!,
      requireAuth,
      allowedEmails: serializeJson(allowedEmails),
      guestQuestions: serializeJson(guestQuestions),
      eventType,
      meetingLink: eventType === "gmeet" || eventType === "teams" ? meetingLink || null : null,
      mapsLink: eventType === "in_person" ? mapsLink || null : null,
      isActive,
    },
  });

  return NextResponse.json(serializePage(page as unknown as Record<string, unknown>), { status: 201 });
}
