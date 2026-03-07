import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { format } from "date-fns";

interface SlotCancelledEmailProps {
  attendeeName: string;
  pageName: string;
  slotStart: Date;
  slotEnd: Date;
  pageSlug: string;
  appUrl: string;
}

export function SlotCancelledEmail({
  attendeeName,
  pageName,
  slotStart,
  slotEnd,
  pageSlug,
  appUrl,
}: SlotCancelledEmailProps) {
  const dateStr = format(slotStart, "EEEE, MMMM d, yyyy");
  const startStr = format(slotStart, "h:mm a");
  const endStr = format(slotEnd, "h:mm a");
  const bookingUrl = `${appUrl}/book/${pageSlug}`;

  return (
    <Html>
      <Head />
      <Preview>IMPORTANT: Your slot for {pageName} has been cancelled by the organizer</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>SLOTTER</Heading>
          <Hr style={divider} />
          <Section>
            <Text style={cancelBadge}>SLOT CANCELLED BY ORGANIZER</Text>
            <Text style={greeting}>Hi {attendeeName},</Text>
            <Text style={body}>
              We&apos;re sorry to let you know that the organizer has cancelled the following slot for <strong>{pageName}</strong>. Your booking has been automatically cancelled.
            </Text>
          </Section>
          <Section style={slotBox}>
            <Text style={slotLabel}>CANCELLED SLOT</Text>
            <Text style={slotDate}>{dateStr}</Text>
            <Text style={slotTime}>{startStr} — {endStr}</Text>
          </Section>
          <Text style={body}>
            If other slots are available, you can re-book at:{" "}
            <a href={bookingUrl} style={{ color: "#FFAF00", fontWeight: 700 }}>
              {bookingUrl}
            </a>
          </Text>
          <Hr style={divider} />
          <Text style={footer}>
            We apologize for any inconvenience.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = { backgroundColor: "#FAFAFA", fontFamily: "Arial, sans-serif" };
const container: React.CSSProperties = { margin: "40px auto", padding: "32px", maxWidth: "480px", border: "3px solid #1A0A3D", boxShadow: "6px 6px 0px #1A0A3D", backgroundColor: "#ffffff" };
const logo: React.CSSProperties = { fontSize: "32px", fontWeight: 900, color: "#1A0A3D", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "-1px" };
const divider: React.CSSProperties = { borderColor: "#1A0A3D", borderWidth: "2px", margin: "16px 0" };
const cancelBadge: React.CSSProperties = { display: "inline-block", backgroundColor: "#F5004F", color: "#fff", border: "2px solid #1A0A3D", padding: "4px 12px", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px 0" };
const greeting: React.CSSProperties = { fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0" };
const body: React.CSSProperties = { fontSize: "15px", color: "#333", margin: "0 0 12px 0" };
const slotBox: React.CSSProperties = { backgroundColor: "#FAFAFA", border: "2px solid #F5004F", padding: "20px", margin: "16px 0" };
const slotLabel: React.CSSProperties = { fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#888", margin: "0 0 8px 0" };
const slotDate: React.CSSProperties = { fontSize: "18px", fontWeight: 900, textTransform: "uppercase", color: "#1A0A3D", margin: "0 0 4px 0" };
const slotTime: React.CSSProperties = { fontSize: "16px", fontWeight: 700, color: "#F5004F", margin: "0" };
const footer: React.CSSProperties = { fontSize: "12px", color: "#888", margin: "0" };
