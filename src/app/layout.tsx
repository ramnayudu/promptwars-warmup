/**
 * @file Root Layout
 * @description Application shell providing global fonts, metadata, and HTML structure.
 */
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** SEO metadata for the ClaimBridge application */
export const metadata: Metadata = {
  title: 'ClaimBridge — AI-Powered Insurance Claims for India',
  description: 'A Gemini-powered agentic bridge that converts vehicle damage photos and insurance PDFs into verified, ready-to-file insurance claims.',
};

/**
 * Root layout wrapper providing global font variables and document structure.
 *
 * @param props.children - Page content rendered within the layout shell
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
