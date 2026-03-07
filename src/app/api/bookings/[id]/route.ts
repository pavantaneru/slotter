import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer } from "@/lib/session";
import { sendBookingCancelledEmail } from "@/lib/email";

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
