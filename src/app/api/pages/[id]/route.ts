import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer } from "@/lib/session";
import { UpdatePageSchema } from "@/types/api";
import {
  parseAllowedEmails,
  parseEventType,
  parseGuestQuestions,
  parseGuestResponses,
  serializeJson,
} from "@/lib/booking-page";

async function getPageForOrganizer(id: string, organizerId: string) {
  return prisma.bookingPage.findFirst({ where: { id, organizerId } });
}

function serializePage(page: Record<string, unknown>) {
  const timeSlots = Array.isArray(page.timeSlots)
    ? page.timeSlots.map((slot) => {
        const slotRecord = slot as Record<string, unknown>;
        return {
          ...slotRecord,
          bookings: Array.isArray(slotRecord.bookings)
            ? slotRecord.bookings.map((booking) => ({
                ...(booking as Record<string, unknown>),
                guestResponses: parseGuestResponses(
                  (booking as Record<string, unknown>).guestResponses as string | null | undefined
                ),
              }))
            : slotRecord.bookings,
        };
      })
    : page.timeSlots;

  return {
    ...page,
    timeSlots,
    allowedEmails: parseAllowedEmails(page.allowedEmails as string | null | undefined),
    guestQuestions: parseGuestQuestions(page.guestQuestions as string | null | undefined),
    eventType: parseEventType(page.eventType as string | null | undefined),
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireOrganizer();
  if (error) return error;
  const { id } = await params;

  const page = await prisma.bookingPage.findFirst({
    where: { id, organizerId: session!.organizerId },
    include: {
      timeSlots: {
        orderBy: { startTime: "asc" },
        include: {
          bookings: {
            where: { cancelledAt: null },
            select: {
              id: true,
              attendeeName: true,
              attendeeEmail: true,
              guestResponses: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializePage(page as unknown as Record<string, unknown>));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireOrganizer();
  if (error) return error;
  const { id } = await params;

  const page = await getPageForOrganizer(id, session!.organizerId!);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdatePageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // Check slug uniqueness if changing
  if (parsed.data.slug && parsed.data.slug !== page.slug) {
    const existing = await prisma.bookingPage.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json({ error: "This URL is already taken." }, { status: 409 });
    }
  }

  const { allowedEmails, guestQuestions, eventType, meetingLink, mapsLink, ...rest } = parsed.data;
  const updated = await prisma.bookingPage.update({
    where: { id },
    data: {
      ...rest,
      ...(allowedEmails !== undefined && { allowedEmails: serializeJson(allowedEmails) }),
      ...(guestQuestions !== undefined && { guestQuestions: serializeJson(guestQuestions) }),
      ...(eventType !== undefined && { eventType }),
      ...(eventType !== undefined && {
        meetingLink:
          eventType === "gmeet" || eventType === "teams" ? meetingLink || null : null,
        mapsLink: eventType === "in_person" ? mapsLink || null : null,
      }),
    },
  });

  return NextResponse.json(serializePage(updated as unknown as Record<string, unknown>));
}
