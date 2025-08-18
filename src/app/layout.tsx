import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { AuthProvider } from "@/hooks/useAuth";
import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

export const metadata: Metadata = {
  title: "uconstruct (Next)",
  description: "Next.js migration sandbox",
  icons: {
    icon: [{ url: "/icon.svg" }, { url: "/favicon.ico", rel: "icon", type: "image/x-icon" }],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AuthProvider>
          <header className="border-b">
            <HeaderNav />
          </header>
          <div className="container mx-auto">{children}</div>
          </AuthProvider>
        </Providers>
        <SonnerToaster richColors />
        <Toaster />
      </body>
    </html>
  );
}