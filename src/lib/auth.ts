import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db"; // your drizzle instance
import * as schema from "../db/schema";
import { Resend } from "resend";
import EmailTemplate from "@/components/email-template";
import * as React from "react";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "pg", "mysql"
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log("Verification URL:", url); // Log the verification URL for debugging
      if (process.env.RESEND_API_KEY) {
        console.log("Sending verification email to:", user.email);
        console.log("process.env.RESEND_API_KEY:", process.env.RESEND_API_KEY);
        try {
          const htmlContent = await render(
            React.createElement(EmailTemplate, {
              userName: user.name,
              verificationUrl: url,
            }),
          );

          console.log(
            "Using raw fetch for Resend to bypass DNS constraints...",
          );
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Support Forum Agusp <support@agusp.com>",
              to: user.email,
              subject: "Verify your email for Forum Agusp",
              html: htmlContent,
            }),
          });

          const data = await response.json();
          if (response.ok) {
            console.log("Resend Email Sent ID via Fetch:", data.id);
          } else {
            console.error("Resend API Error via Fetch:", data);
          }
        } catch (error) {
          console.error("Error sending email:", error);
        }
      } else {
        console.warn(
          "Skipped sending email because RESEND_API_KEY is not set in .env",
        );
      }
    },
  },
});
