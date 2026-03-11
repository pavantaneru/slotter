import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { format } from "date-fns";
import { getVenueLabel, type EventType } from "@/lib/booking-page";

interface BookingConfirmedEmailProps {
  attendeeName: string;
  pageName: string;
  slotStart: Date;
  slotEnd: Date;
  pageSlug: string;
  appUrl: string;
  eventType: EventType;
  meetingLink: string | null;
  mapsLink: string | null;
}

export function BookingConfirmedEmail({
  attendeeName,
  pageName,
  slotStart,
  slotEnd,
  pageSlug,
  appUrl,
  eventType,
  meetingLink,
  mapsLink,
}: BookingConfirmedEmailProps) {
  const dateStr = format(slotStart, "EEEE, MMMM d, yyyy");
  const startStr = format(slotStart, "h:mm a");
  const endStr = format(slotEnd, "h:mm a");
  const venueLink = eventType === "in_person" ? mapsLink : meetingLink;
  const venueLabel = getVenueLabel(eventType);

  const calendarDetails = [
    `Booked via Slotter: ${appUrl}/book/${pageSlug}`,
    venueLink ? `${venueLabel}: ${venueLink}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(pageName)}&dates=${format(slotStart, "yyyyMMdd'T'HHmmss")}/${format(slotEnd, "yyyyMMdd'T'HHmmss")}&details=${encodeURIComponent(calendarDetails)}`;

  return (
    <Html>
      <Head />
      <Preview>You&apos;re booked! {pageName} — {dateStr} {startStr}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>SLOTTER</Heading>
          <Hr style={divider} />
          <Section style={headerSection}>
            <Text style={confirmBadge}>BOOKING CONFIRMED</Text>
            <Text style={greeting}>Hey {attendeeName},</Text>
            <Text style={body}>
              You&apos;re all set! Your spot has been booked for <strong>{pageName}</strong>.
            </Text>
          </Section>
          <Section style={slotBox}>
            <Text style={slotLabel}>DATE & TIME</Text>
            <Text style={slotDate}>{dateStr}</Text>
            <Text style={slotTime}>{startStr} — {endStr}</Text>
          </Section>
          {venueLink && (
            <Section style={slotBox}>
              <Text style={slotLabel}>{venueLabel}</Text>
              <Text style={body}>
                <Link href={venueLink} style={link}>
                  {venueLink}
                </Link>
              </Text>
            </Section>
          )}
          <Section style={{ textAlign: "center", padding: "16px 0" }}>
            <Link href={gcalUrl} style={calButton}>
              + ADD TO GOOGLE CALENDAR
            </Link>
          </Section>
          <Hr style={divider} />
          <Text style={footer}>
            This booking was made via Slotter. If you need to cancel, please contact the organizer.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#FAFAFA",
  fontFamily: "Arial, sans-serif",
};

const container: React.CSSProperties = {
  margin: "40px auto",
  padding: "32px",
  maxWidth: "480px",
  border: "3px solid #1A0A3D",
  boxShadow: "6px 6px 0px #1A0A3D",
  backgroundColor: "#ffffff",
};

const logo: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: 900,
  color: "#1A0A3D",
  margin: "0 0 16px 0",
  textTransform: "uppercase",
  letterSpacing: "-1px",
};

const divider: React.CSSProperties = {
  borderColor: "#1A0A3D",
  borderWidth: "2px",
  margin: "16px 0",
};

const headerSection: React.CSSProperties = {
  padding: "8px 0",
};

const confirmBadge: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#F9E400",
  border: "2px solid #1A0A3D",
  padding: "4px 12px",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "2px",
  textTransform: "uppercase",
  margin: "0 0 16px 0",
};

const greeting: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  margin: "0 0 8px 0",
};

const body: React.CSSProperties = {
  fontSize: "15px",
  color: "#333",
  margin: "0",
};

const slotBox: React.CSSProperties = {
  backgroundColor: "#FAFAFA",
  border: "2px solid #1A0A3D",
  padding: "20px",
  margin: "16px 0",
};

const slotLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "2px",
  textTransform: "uppercase",
  color: "#888",
  margin: "0 0 8px 0",
};

const slotDate: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 900,
  textTransform: "uppercase",
  color: "#1A0A3D",
  margin: "0 0 4px 0",
};

const slotTime: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#FFAF00",
  margin: "0",
};

const calButton: React.CSSProperties = {
  backgroundColor: "#1A0A3D",
  color: "#F9E400",
  padding: "12px 24px",
  fontWeight: 700,
  fontSize: "13px",
  letterSpacing: "1px",
  textTransform: "uppercase",
  textDecoration: "none",
  display: "inline-block",
};

const link: React.CSSProperties = {
  color: "#1A0A3D",
  wordBreak: "break-word",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#888",
  margin: "0",
};
