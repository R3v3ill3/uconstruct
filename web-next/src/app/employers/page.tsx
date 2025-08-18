"use client";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployersPage() {
  const supabase = supabaseBrowser();
  const { data: employers = [], isLoading } = useQuery({
    queryKey: ["employers-list"],
    queryFn: async () => {
      const { data } = await supabase.from("employers").select("id, name, employer_type").order("name");
      return (data || []) as any[];
    },
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Employers</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Employers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              {employers.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between border-b py-2">
                  <div>{e.name}</div>
                  <div className="text-sm text-muted-foreground">{e.employer_type}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

