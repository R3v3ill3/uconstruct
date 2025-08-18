"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/integrations/supabase/client";

export default function DashboardPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/auth");
    });
  }, [router, supabase]);
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-2">Welcome.</p>
    </main>
  );
}

