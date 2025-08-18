import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { AuthProvider } from "@/hooks/useAuth";
import Link from "next/link";
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
            <nav className="container mx-auto flex items-center gap-4 p-4 text-sm">
              <Link href="/">Home</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/site-visits">Site Visits</Link>
              <Link href="/projects">Projects</Link>
              <Link href="/employers">Employers</Link>
              <Link href="/workers">Workers</Link>
              <Link href="/upload">Upload</Link>
              <Link href="/mypatch">MyPatch</Link>
              <Link href="/patch-wall">Patch Wall</Link>
              <Link href="/admin">Admin</Link>
              <Link href="/unallocated-workspace">Unallocated</Link>
            </nav>
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