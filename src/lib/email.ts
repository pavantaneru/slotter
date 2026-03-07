import { Resend } from "resend";
import { render } from "@react-email/components";
import { OtpEmail } from "./email-templates/otp";
import { BookingConfirmedEmail } from "./email-templates/booking-confirmed";
import { BookingCancelledEmail } from "./email-templates/booking-cancelled";
import { SlotCancelledEmail } from "./email-templates/slot-cancelled";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
const FROM = process.env.EMAIL_FROM ?? "Slotter <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendOtpEmail(
  email: string,
  code: string,
  type: "organizer" | "attendee"
) {
  const subject =
    type === "organizer"
      ? `Your Slotter login code: ${code}`
      : `Your Slotter verification code: ${code}`;

  const html = await render(OtpEmail({ code, type }));

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject,
    html,
  });
}

export async function sendBookingConfirmedEmail(params: {
  attendeeName: string;
  attendeeEmail: string;
  pageName: string;
  pageSlug: string;
  slotStart: Date;
  slotEnd: Date;
}) {
  const html = await render(
    BookingConfirmedEmail({
      attendeeName: params.attendeeName,
      pageName: params.pageName,
      slotStart: params.slotStart,
      slotEnd: params.slotEnd,
      pageSlug: params.pageSlug,
      appUrl: APP_URL,
    })
  );

  return getResend().emails.send({
    from: FROM,
    to: params.attendeeEmail,
    subject: `You're booked! — ${params.pageName}`,
    html,
  });
}

export async function sendBookingCancelledEmail(params: {
  attendeeName: string;
  attendeeEmail: string;
  pageName: string;
  slotStart: Date;
  slotEnd: Date;
}) {
  const html = await render(
    BookingCancelledEmail({
      attendeeName: params.attendeeName,
      pageName: params.pageName,
      slotStart: params.slotStart,
      slotEnd: params.slotEnd,
    })
  );

  return getResend().emails.send({
    from: FROM,
    to: params.attendeeEmail,
    subject: `Your booking was cancelled — ${params.pageName}`,
    html,
  });
}

export async function sendSlotCancelledBatch(params: {
  pageName: string;
  pageSlug: string;
  slotStart: Date;
  slotEnd: Date;
  attendees: Array<{ name: string; email: string }>;
}) {
  if (params.attendees.length === 0) return;

  const emailPayloads = await Promise.all(
    params.attendees.map(async (attendee) => {
      const html = await render(
        SlotCancelledEmail({
          attendeeName: attendee.name,
          pageName: params.pageName,
          slotStart: params.slotStart,
          slotEnd: params.slotEnd,
          pageSlug: params.pageSlug,
          appUrl: APP_URL,
        })
      );
      return {
        from: FROM,
        to: attendee.email,
        subject: `IMPORTANT: Slot cancelled — ${params.pageName}`,
        html,
      };
    })
  );

  return getResend().batch.send(emailPayloads);
}
