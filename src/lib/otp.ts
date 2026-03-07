import { prisma } from "./prisma";
import { randomInt } from "crypto";

export function generateOtpCode(): string {
  return String(randomInt(100000, 999999));
}

export async function createOtp(
  email: string,
  type: "organizer" | "attendee",
  pageId?: string
) {
  // Invalidate all previous unused OTPs for this email + type
  await prisma.otpCode.updateMany({
    where: { email, type, used: false },
    data: { used: true },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return prisma.otpCode.create({
    data: {
      email,
      code,
      expiresAt,
      type,
      pageId: pageId ?? null,
    },
  });
}

export async function verifyOtp(
  email: string,
  code: string,
  type: "organizer" | "attendee"
): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      email,
      code,
      type,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) return false;

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { used: true },
  });

  return true;
}
