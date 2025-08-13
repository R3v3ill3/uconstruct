import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "uconstruct (Next)",
  description: "Next.js migration sandbox",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}