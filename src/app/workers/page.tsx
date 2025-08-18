"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WorkersPage() {
  const supabase = supabaseBrowser();
  const [filters, setFilters] = useState<{ unionStatus: string[] }>({ unionStatus: [] });
  const { data: workers = [], isLoading, refetch } = useQuery({
    queryKey: ["workers", filters],
    queryFn: async () => {
      let query = supabase.from("workers").select("id, first_name, surname, email, mobile_phone, union_membership_status, worker_placements(job_sites(name))");
      if (filters.unionStatus.length > 0) query = (query as any).in("union_membership_status", filters.unionStatus as any);
      const { data } = await query;
      return (data ?? []) as any[];
    },
  });
  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Workers</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Workers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              {workers.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <div className="font-medium">{w.first_name} {w.surname}</div>
                    <div className="text-sm text-muted-foreground">{w.email || ""} {w.mobile_phone ? `· ${w.mobile_phone}` : ""}</div>
                  </div>
                  <div className="text-sm">{w.union_membership_status || ""}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

