import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { ChatWidget } from "@/components/chat-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forum Agusp",
  description: "A modern forum application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          {children}
          <ChatWidget />
          <footer className="py-3 shadow-sm border-t" role="footer">
            <div className="max-w-5xl mx-auto justify-center flex items-center  gap-1 text-center text-sm">
              &copy; {new Date().getFullYear()} Forum by
              <a
                className="text-blue-600"
                href="https://agusp.com"
                target="_blank"
                rel="noreferrer"
              >
                Agusp
              </a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
