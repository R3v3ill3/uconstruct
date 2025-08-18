"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/integrations/supabase/client";
import { useProfileRole } from "@/hooks/useProfileRole";

export default function DashboardPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const { role, isLoading } = useProfileRole();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/auth");
    });
  }, [router, supabase]);

  useEffect(() => {
    if (isLoading) return;
    if (!role) return; // keep neutral dashboard if role unknown
    if (role === "admin") router.replace("/admin");
    if (role === "organiser" || role === "lead_organiser") router.replace("/mypatch");
  }, [isLoading, role, router]);
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-2">Welcome.</p>
    </main>
  );
}

