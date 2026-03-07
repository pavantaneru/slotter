import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { CreateBookingSchema } from "@/types/api";
import { sendBookingConfirmedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { slotId, pageId, attendeeName, attendeeEmail } = parsed.data;

    // Fetch slot with page
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
      include: { page: true },
    });

    if (!slot || slot.pageId !== pageId) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }
    if (slot.isCancelled) {
      return NextResponse.json({ error: "This slot has been cancelled" }, { status: 409 });
    }
    if (!slot.page.isActive) {
      return NextResponse.json({ error: "This booking page is no longer active" }, { status: 409 });
    }

    // Check auth requirement
    if (slot.page.requireAuth) {
      const session = await getSession();
      if (
        session.verifiedAttendeeEmail !== attendeeEmail ||
        session.verifiedForPageId !== pageId
      ) {
        return NextResponse.json(
          { error: "Email verification required. Please verify your email first." },
          { status: 403 }
        );
      }
      // Verify the email is still on the allowed list
      const allowed: string[] = JSON.parse((slot.page as any).allowedEmails ?? "[]");
      if (allowed.length > 0 && !allowed.map((e) => e.toLowerCase()).includes(attendeeEmail.toLowerCase())) {
        return NextResponse.json(
          { error: "Your email is not on the approved list for this event." },
          { status: 403 }
        );
      }
    }

    // One booking per page per email (across all slots)
    const existingOnPage = await prisma.booking.findFirst({
      where: {
        attendeeEmail,
        cancelledAt: null,
        slot: { pageId, isCancelled: false },
      },
    });
    if (existingOnPage) {
      return NextResponse.json(
        { error: "You already have an active booking on this page" },
        { status: 409 }
      );
    }

    // Transactional booking with race-condition-safe capacity check
    const booking = await prisma.$transaction(async (tx) => {
      const currentCount = await tx.booking.count({
        where: { slotId, cancelledAt: null },
      });
      if (currentCount >= slot.capacity) {
        throw new Error("SLOT_FULL");
      }
      return tx.booking.create({
        data: { slotId, attendeeName, attendeeEmail },
      });
    });

    // Send confirmation email (non-blocking — don't fail if email fails)
    sendBookingConfirmedEmail({
      attendeeName,
      attendeeEmail,
      pageName: slot.page.name,
      pageSlug: slot.page.slug,
      slotStart: slot.startTime,
      slotEnd: slot.endTime,
    }).catch((err) => console.error("Booking confirm email failed:", err));

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_FULL") {
      return NextResponse.json({ error: "Sorry, this slot just filled up" }, { status: 409 });
    }
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
