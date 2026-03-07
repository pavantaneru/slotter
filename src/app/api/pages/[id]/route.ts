import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer } from "@/lib/session";
import { UpdatePageSchema } from "@/types/api";

async function getPageForOrganizer(id: string, organizerId: string) {
  return prisma.bookingPage.findFirst({ where: { id, organizerId } });
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
            select: { id: true, attendeeName: true, attendeeEmail: true, createdAt: true },
          },
        },
      },
    },
  });

  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...page, allowedEmails: JSON.parse((page as any).allowedEmails ?? "[]") });
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

  const { allowedEmails, ...rest } = parsed.data;
  const updated = await prisma.bookingPage.update({
    where: { id },
    data: {
      ...rest,
      ...(allowedEmails !== undefined && { allowedEmails: JSON.stringify(allowedEmails) }),
    },
  });

  return NextResponse.json({ ...updated, allowedEmails: JSON.parse((updated as any).allowedEmails ?? "[]") });
}
