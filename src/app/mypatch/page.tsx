"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfileRole } from "@/hooks/useProfileRole";
import { useQuery } from "@tanstack/react-query";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Project = { id: string; name: string };
type JobSite = { id: string; name: string; location: string };
type Employer = { id: string; name: string };

export default function MyPatchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { role, isLoading } = useProfileRole();
  const supabase = getBrowserSupabase();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (!(role === "admin" || role === "organiser" || role === "lead_organiser")) {
      router.replace("/dashboard");
    }
  }, [isLoading, role, router, user]);

  const { data: projectIds = [] } = useQuery({
    queryKey: ["accessible-projects", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_accessible_projects", { user_id: user!.id });
      if (error) throw error;
      return ((data ?? []) as { project_id: string }[]).map((r) => r.project_id);
    },
  });

  const { data: jobSiteIds = [] } = useQuery({
    queryKey: ["accessible-job-sites", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_accessible_job_sites", { user_id: user!.id });
      if (error) throw error;
      return ((data ?? []) as { job_site_id: string }[]).map((r) => r.job_site_id);
    },
  });

  const { data: employerIds = [] } = useQuery({
    queryKey: ["accessible-employers", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_accessible_employers", { user_id: user!.id });
      if (error) throw error;
      return ((data ?? []) as { employer_id: string }[]).map((r) => r.employer_id);
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects", projectIds],
    enabled: projectIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id,name").in("id", projectIds);
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const { data: jobSites = [] } = useQuery({
    queryKey: ["job-sites", jobSiteIds],
    enabled: jobSiteIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("job_sites").select("id,name,location").in("id", jobSiteIds);
      if (error) throw error;
      return (data ?? []) as JobSite[];
    },
  });

  const { data: employers = [] } = useQuery({
    queryKey: ["employers", employerIds],
    enabled: employerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("employers").select("id,name").in("id", employerIds);
      if (error) throw error;
      return (data ?? []) as Employer[];
    },
  });

  return (
    <main className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Patch</h1>
        <p className="text-sm text-muted-foreground">Projects, sites, and employers you can access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects ({projects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell className="text-muted-foreground">None</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Sites ({jobSites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobSites.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.location}</TableCell>
                </TableRow>
              ))}
              {jobSites.length === 0 && (
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={2}>None</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employers ({employers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employers.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.name}</TableCell>
                </TableRow>
              ))}
              {employers.length === 0 && (
                <TableRow>
                  <TableCell className="text-muted-foreground">None</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}

