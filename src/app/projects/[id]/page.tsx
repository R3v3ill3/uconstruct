"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/integrations/supabase/client";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = supabaseBrowser();
  const { data: project } = useQuery({
    queryKey: ["project", id],
    enabled: !!id && id !== "[id]",
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, name, value").eq("id", id).single();
      return data as any;
    },
  });
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">{project?.name || "Project"}</h1>
    </main>
  );
}

