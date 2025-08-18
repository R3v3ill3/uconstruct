"use client";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnallocatedWorkspacePage() {
  const supabase = supabaseBrowser();
  const { data: workers = [], isLoading } = useQuery({
    queryKey: ["unallocated-workers"],
    queryFn: async () => {
      const { data } = await supabase.from("unallocated_workers_analysis").select("id, first_name, surname, email, employer_name, job_site_name, union_membership_status, allocation_status");
      return (data || []) as any[];
    },
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Unallocated Workers</h1>
      <Card>
        <CardHeader>
          <CardTitle>All workers needing assignment</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              {workers.map((w: any) => (
                <div key={w.id} className="grid grid-cols-4 gap-2 border-b py-2 text-sm">
                  <div className="font-medium">{w.first_name} {w.surname}</div>
                  <div className="text-muted-foreground">{w.email || ""}</div>
                  <div>{w.employer_name || "No Employer"}</div>
                  <div>{w.job_site_name || "No Job Site"}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

