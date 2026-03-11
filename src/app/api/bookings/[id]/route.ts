import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer } from "@/lib/session";
import { sendBookingCancelledEmail } from "@/lib/email";
import {
  getVenueLabel,
  normalizeMapsPreviewUrl,
  parseEventType,
  parseGuestResponses,
} from "@/lib/booking-page";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      slot: {
        include: {
          page: true,
        },
      },
    },
  });

  if (!booking || booking.cancelledAt) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const eventType = parseEventType(booking.slot.page.eventType);

  return NextResponse.json({
    id: booking.id,
    attendeeName: booking.attendeeName,
    pageName: booking.slot.page.name,
    pageSlug: booking.slot.page.slug,
    slotStart: booking.slot.startTime,
    slotEnd: booking.slot.endTime,
    eventType,
    venueLabel: getVenueLabel(eventType),
    meetingLink: booking.slot.page.meetingLink,
    mapsLink: booking.slot.page.mapsLink,
    mapsPreviewUrl: booking.slot.page.mapsLink
      ? normalizeMapsPreviewUrl(booking.slot.page.mapsLink)
      : null,
    guestResponses: parseGuestResponses(booking.guestResponses),
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireOrganizer();
  if (error) return error;

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      slot: { include: { page: true } },
    },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.slot.page.organizerId !== session.organizerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (booking.cancelledAt) {
    return NextResponse.json({ error: "Booking already cancelled" }, { status: 400 });
  }

  await prisma.booking.update({
    where: { id },
    data: { cancelledAt: new Date() },
  });

  sendBookingCancelledEmail({
    attendeeName: booking.attendeeName,
    attendeeEmail: booking.attendeeEmail,
    pageName: booking.slot.page.name,
    slotStart: booking.slot.startTime,
    slotEnd: booking.slot.endTime,
  }).catch(console.error);

  return NextResponse.json({ ok: true });
}
