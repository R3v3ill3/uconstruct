"use client";
export const dynamic = "force-dynamic";
import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileCheck, MapPin, Calendar, Users } from "lucide-react";

export default function SiteVisits() {
  const supabase = getBrowserSupabase();
 
  type SiteVisit = {
  id: string;
  sv_code: string;
  employer_id: string;
  job_site_id: string;
  scheduled_at: string;
  objective: string;
  estimated_workers_count: number;
  outcomes_locked: boolean;
  created_at: string;
  updated_at: string;
  employer?: { name: string } | null;
  job_site?: { name: string; location: string } | null;
  };
  useEffect(() => {
    document.title = "Site Visits — CFMEU Organiser";
  }, []);

  const { data: siteVisits = [], isLoading } = useQuery({
    queryKey: ["site-visits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_visit")
        .select(`
          *,
          employer:employers(name),
          job_site:job_sites(name, location)
        `)
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SiteVisit[];
    },
  });

  const getStatusBadge = (isLocked: boolean) => (
    <Badge variant={isLocked ? "default" : "secondary"}>
      {isLocked ? "COMPLETED" : "PLANNED"}
    </Badge>
  );

  if (isLoading) return <div className="p-6">Loading site visits...</div>;

  return (
    <main className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Site Visits</h1>
          <p className="text-muted-foreground">Plan and manage visits to construction sites</p>
        </div>
        <Button asChild>
          <Link href="/site-visits/new">
            <Plus className="h-4 w-4 mr-2" />
            Plan Site Visit
          </Link>
        </Button>
      </div>

      {siteVisits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No site visits planned</h3>
            <p className="text-muted-foreground mb-4">Create your first site visit to get started</p>
            <Button asChild>
              <Link href="/site-visits/new">
                <Plus className="h-4 w-4 mr-2" />
                Plan Site Visit
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Planned Site Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visit Code</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Workers</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siteVisits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell className="font-medium">
                      <Link href={`/site-visits/${visit.sv_code}`} className="underline decoration-dotted">
                        {visit.sv_code}
                      </Link>
                    </TableCell>
                    <TableCell>{visit.employer?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{visit.job_site?.name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{visit.job_site?.location}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {visit.scheduled_at ? new Date(visit.scheduled_at).toLocaleString() : "-"}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(visit.outcomes_locked)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {visit.estimated_workers_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/site-visits/${visit.sv_code}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

