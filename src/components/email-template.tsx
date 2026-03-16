import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Button,
  Section,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
  userName: string;
  verificationUrl: string;
}

export const EmailTemplate: React.FC<Readonly<VerificationEmailProps>> = ({
  userName,
  verificationUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email to join Forum Agusp</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Welcome to Forum Agusp, {userName}!</Text>
          <Text style={paragraph}>
            We&apos;re excited to have you on board. Please verify your email
            address by clicking the button below so you can start participating
            in discussions.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Verify Email Address
            </Button>
          </Section>
          <Text style={paragraph}>
            If you didn&apos;t create an account with us, you can safely ignore
            this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Forum Agusp securely built with BetterAuth & Next.js 16
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default EmailTemplate;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  marginBottom: "64px",
  marginTop: "64px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  maxWidth: "480px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "600",
  color: "#111827",
  padding: "17px 0 0",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#3c3f44",
};

const buttonContainer = {
  padding: "24px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 24px",
  display: "inline-block",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};
