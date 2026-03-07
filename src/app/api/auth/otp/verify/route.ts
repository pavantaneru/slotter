import { NextRequest, NextResponse } from "next/server";
import { VerifyOtpSchema } from "@/types/api";
import { verifyOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, code, type, pageId } = parsed.data;

    const valid = await verifyOtp(email, code, type);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    const session = await getSession();

    if (type === "organizer") {
      // Upsert organizer user
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, name: "" },
      });
      session.organizerId = user.id;
      session.organizerEmail = user.email;
      session.organizerName = user.name;
      await session.save();

      return NextResponse.json({
        success: true,
        redirect: "/dashboard",
        user: { id: user.id, email: user.email, name: user.name },
      });
    } else {
      // Attendee verification — scope to page
      session.verifiedAttendeeEmail = email;
      session.verifiedForPageId = pageId;
      await session.save();

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
