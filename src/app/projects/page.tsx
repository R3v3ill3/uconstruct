"use client";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ProjectsPage() {
  const supabase = supabaseBrowser();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      // Use the correct FK name for the embedded relation to main_job_site
      const { data } = await supabase
        .from("projects")
        .select("id, name, value, main_job_site_id, job_sites!fk_projects_main_job_site(name)");
      return (data || []) as any[];
    },
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              {projects.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between border-b py-2">
                  <Link href={`/projects/${p.id}`} className="underline decoration-dotted">{p.name}</Link>
                  <span className="text-sm text-muted-foreground">{p.job_sites?.name || "No site"}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}