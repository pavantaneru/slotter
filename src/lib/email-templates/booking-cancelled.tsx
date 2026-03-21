import {Body, Container, Head, Heading, Hr, Html, Preview, Section, Text} from "@react-email/components";
import {formatInTimeZone} from "date-fns-tz";

interface BookingCancelledEmailProps {
	attendeeName: string;
	pageName: string;
	slotStart: Date;
	slotEnd: Date;
}

export function BookingCancelledEmail({attendeeName, pageName, slotStart, slotEnd}: BookingCancelledEmailProps) {
	const dateStr = formatInTimeZone(slotStart, "Asia/Kolkata", "EEEE, MMMM d, yyyy");
	const startStr = formatInTimeZone(slotStart, "Asia/Kolkata", "h:mm a");
	const endStr = formatInTimeZone(slotEnd, "Asia/Kolkata", "h:mm a");

	return (
		<Html>
			<Head />
			<Preview>Your booking for {pageName} has been cancelled</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={logo}>SLOTTER</Heading>
					<Hr style={divider} />
					<Section>
						<Text style={cancelBadge}>BOOKING CANCELLED</Text>
						<Text style={greeting}>Hi {attendeeName},</Text>
						<Text style={body}>
							Your booking for <strong>{pageName}</strong> has been cancelled.
						</Text>
					</Section>
					<Section style={slotBox}>
						<Text style={slotLabel}>CANCELLED SLOT</Text>
						<Text style={slotDate}>{dateStr}</Text>
						<Text style={slotTime}>
							{startStr} — {endStr}
						</Text>
					</Section>
					<Hr style={divider} />
					<Text style={footer}>If you have questions, please contact the event organizer.</Text>
				</Container>
			</Body>
		</Html>
	);
}

const main: React.CSSProperties = {backgroundColor: "#FAFAFA", fontFamily: "Arial, sans-serif"};
const container: React.CSSProperties = {margin: "40px auto", padding: "32px", maxWidth: "480px", border: "3px solid #1A0A3D", boxShadow: "6px 6px 0px #1A0A3D", backgroundColor: "#ffffff"};
const logo: React.CSSProperties = {fontSize: "32px", fontWeight: 900, color: "#1A0A3D", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "-1px"};
const divider: React.CSSProperties = {borderColor: "#1A0A3D", borderWidth: "2px", margin: "16px 0"};
const cancelBadge: React.CSSProperties = {
	display: "inline-block",
	backgroundColor: "#F5004F",
	color: "#fff",
	border: "2px solid #1A0A3D",
	padding: "4px 12px",
	fontSize: "11px",
	fontWeight: 700,
	letterSpacing: "2px",
	textTransform: "uppercase",
	margin: "0 0 16px 0",
};
const greeting: React.CSSProperties = {fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0"};
const body: React.CSSProperties = {fontSize: "15px", color: "#333", margin: "0"};
const slotBox: React.CSSProperties = {backgroundColor: "#FAFAFA", border: "2px solid #1A0A3D", padding: "20px", margin: "16px 0"};
const slotLabel: React.CSSProperties = {fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#888", margin: "0 0 8px 0"};
const slotDate: React.CSSProperties = {fontSize: "18px", fontWeight: 900, textTransform: "uppercase", color: "#1A0A3D", margin: "0 0 4px 0"};
const slotTime: React.CSSProperties = {fontSize: "16px", fontWeight: 700, color: "#F5004F", margin: "0"};
const footer: React.CSSProperties = {fontSize: "12px", color: "#888", margin: "0"};
