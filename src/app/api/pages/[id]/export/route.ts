import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer } from "@/lib/session";
import { buildCsv } from "@/lib/csv";
import { parseGuestQuestions, parseGuestResponses } from "@/lib/booking-page";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireOrganizer();
  if (error) return error;

  const { id } = await params;

  const page = await prisma.bookingPage.findUnique({
    where: { id },
    include: {
      timeSlots: {
        orderBy: { startTime: "asc" },
        include: {
          bookings: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (page.organizerId !== session.organizerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const questionHeaders = parseGuestQuestions(page.guestQuestions).map((question) => question.prompt);

  const rows = page.timeSlots.flatMap((slot) => {
    const activeBookings = slot.bookings.filter((b) => !b.cancelledAt);
    const bookedCount = activeBookings.length;

    if (slot.bookings.length === 0) {
      return [
        {
          slotDate: slot.startTime.toLocaleDateString("en-US"),
          slotStart: slot.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          slotEnd: slot.endTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          capacity: slot.capacity,
          bookedCount,
          attendeeName: "",
          attendeeEmail: "",
          bookedAt: "",
          status: slot.isCancelled ? "cancelled" : "no bookings",
          guestResponses: {},
        },
      ];
    }

    return slot.bookings.map((b) => {
      const responseMap = Object.fromEntries(
        parseGuestResponses(b.guestResponses).map((response) => [response.prompt, response.answer])
      );

      return {
        slotDate: slot.startTime.toLocaleDateString("en-US"),
        slotStart: slot.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        slotEnd: slot.endTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        capacity: slot.capacity,
        bookedCount,
        attendeeName: b.attendeeName,
        attendeeEmail: b.attendeeEmail,
        bookedAt: b.createdAt.toISOString(),
        status: b.cancelledAt ? "cancelled" : slot.isCancelled ? "slot cancelled" : "confirmed",
        guestResponses: responseMap,
      };
    });
  });

  const csv = buildCsv(rows, questionHeaders);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `slotter-${page.slug}-${date}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
