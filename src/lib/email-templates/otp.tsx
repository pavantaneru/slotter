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

interface OtpEmailProps {
  code: string;
  type: "organizer" | "attendee";
}

export function OtpEmail({ code, type }: OtpEmailProps) {
  const subject =
    type === "organizer"
      ? "Your Slotter login code"
      : "Your Slotter verification code";

  return (
    <Html>
      <Head />
      <Preview>{subject}: {code}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>SLOTTER</Heading>
          <Hr style={divider} />
          <Section style={codeSection}>
            <Text style={label}>YOUR {type === "organizer" ? "LOGIN" : "VERIFICATION"} CODE</Text>
            <Text style={codeText}>{code}</Text>
            <Text style={expiry}>This code expires in 10 minutes.</Text>
          </Section>
          <Hr style={divider} />
          <Text style={footer}>
            If you did not request this code, you can safely ignore this email.
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
  letterSpacing: "-1px",
  color: "#1A0A3D",
  margin: "0 0 16px 0",
  textTransform: "uppercase",
};

const divider: React.CSSProperties = {
  borderColor: "#1A0A3D",
  borderWidth: "2px",
  margin: "16px 0",
};

const codeSection: React.CSSProperties = {
  textAlign: "center",
  padding: "24px 0",
};

const label: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "2px",
  textTransform: "uppercase",
  color: "#1A0A3D",
  margin: "0 0 16px 0",
};

const codeText: React.CSSProperties = {
  fontSize: "56px",
  fontWeight: 900,
  letterSpacing: "8px",
  color: "#1A0A3D",
  backgroundColor: "#F9E400",
  border: "3px solid #1A0A3D",
  padding: "16px 32px",
  display: "inline-block",
  margin: "0 0 16px 0",
  fontFamily: "monospace",
};

const expiry: React.CSSProperties = {
  fontSize: "14px",
  color: "#555",
  margin: "8px 0 0 0",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#888",
  margin: "0",
};
