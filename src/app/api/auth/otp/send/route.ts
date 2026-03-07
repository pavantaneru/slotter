import { NextRequest, NextResponse } from "next/server";
import { SendOtpSchema } from "@/types/api";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, type, pageId } = parsed.data;

    // For attendee OTPs, check if the email is on the allowed list
    if (type === "attendee" && pageId) {
      const page = await prisma.bookingPage.findUnique({ where: { id: pageId } });
      if (page?.requireAuth) {
        const allowed: string[] = JSON.parse((page as any).allowedEmails ?? "[]");
        if (allowed.length > 0 && !allowed.map((e) => e.toLowerCase()).includes(email.toLowerCase())) {
          return NextResponse.json(
            { error: "Your email is not on the approved list for this event." },
            { status: 403 }
          );
        }
      }
    }

    const otp = await createOtp(email, type, pageId);
    await sendOtpEmail(email, otp.code, type);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
