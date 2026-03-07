import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer } from "@/lib/session";
import { CreateSlotsSchema } from "@/types/api";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireOrganizer();
  if (error) return error;
  const { id } = await params;

  const page = await prisma.bookingPage.findFirst({
    where: { id, organizerId: session!.organizerId },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = CreateSlotsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const created = await prisma.timeSlot.createMany({
    data: parsed.data.map((slot) => ({
      pageId: id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
    })),
  });

  return NextResponse.json({ created: created.count }, { status: 201 });
}
