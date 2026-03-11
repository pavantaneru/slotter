import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseEventType, parseGuestQuestions } from "@/lib/booking-page";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const page = await prisma.bookingPage.findUnique({
    where: { slug },
    include: {
      timeSlots: {
        where: { isCancelled: false },
        orderBy: { startTime: "asc" },
        include: {
          _count: { select: { bookings: { where: { cancelledAt: null } } } },
        },
      },
    },
  });

  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...page,
    guestQuestions: parseGuestQuestions(page.guestQuestions),
    eventType: parseEventType(page.eventType),
  });
}
