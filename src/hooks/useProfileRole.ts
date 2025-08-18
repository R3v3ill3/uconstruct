"use client";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "organiser" | "lead_organiser" | null;

export function useProfileRole() {
  const supabase = supabaseBrowser();
  const { user } = useAuth();

  const enabled = !!user?.id;
  const query = useQuery({
    queryKey: ["profile-role", user?.id],
    enabled,
    queryFn: async () => {
      if (!user?.id) return null as AppRole;
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      const role = (data as any)?.role ?? null;
      return (role === "admin" || role === "organiser" || role === "lead_organiser") ? (role as AppRole) : null;
    },
    staleTime: 60_000,
  });

  return {
    role: (query.data ?? null) as AppRole,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

