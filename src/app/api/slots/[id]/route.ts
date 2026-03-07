import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer } from "@/lib/session";
import { sendSlotCancelledBatch } from "@/lib/email";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireOrganizer();
  if (error) return error;

  const { id } = await params;

  const slot = await prisma.timeSlot.findUnique({
    where: { id },
    include: {
      page: true,
      bookings: {
        where: { cancelledAt: null },
        select: { id: true, attendeeName: true, attendeeEmail: true },
      },
    },
  });

  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  if (slot.page.organizerId !== session.organizerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (slot.isCancelled) {
    return NextResponse.json({ error: "Slot is already cancelled" }, { status: 400 });
  }

  await prisma.timeSlot.update({ where: { id }, data: { isCancelled: true } });

  sendSlotCancelledBatch({
    pageName: slot.page.name,
    pageSlug: slot.page.slug,
    slotStart: slot.startTime,
    slotEnd: slot.endTime,
    attendees: slot.bookings.map((b) => ({ name: b.attendeeName, email: b.attendeeEmail })),
  }).catch(console.error);

  return NextResponse.json({ ok: true, notified: slot.bookings.length });
}
