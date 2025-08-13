import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";

const setMeta = (title: string, description: string, canonical?: string) => {
  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", description);
  else {
    const m = document.createElement("meta");
    m.name = "description";
    m.content = description;
    document.head.appendChild(m);
  }
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = canonical || window.location.href;
};

const MyPatch = () => {
  const { user } = useAuth();

  useEffect(() => {
    setMeta(
      "Organiser Patch — My Patch",
      "Overview of your assigned projects, sites, employers, members and delegates.",
      window.location.origin + "/patch"
    );
  }, []);

  const organiserId = user?.id;

  const { data: organiserProjects = [] } = useQuery({
    queryKey: ["my-patch-projects", organiserId],
    enabled: !!organiserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organiser_projects")
        .select("project_id, projects(id, name, builder_id, proposed_start_date, proposed_finish_date)")
        .eq("organiser_id", organiserId as string);
      if (error) throw error;
      return data || [];
    },
  });

  const projectIds = useMemo(() => (organiserProjects || []).map((p) => p.project_id), [organiserProjects]);

  const { data: sitesData } = useQuery({
    queryKey: ["my-patch-sites", projectIds],
    enabled: projectIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_sites")
        .select("id, name, project_id, location")
        .in("project_id", projectIds);
      if (error) throw error;
      return data || [];
    },
  });

  const siteIds = useMemo(() => (sitesData || []).map((s: any) => s.id), [sitesData]);

  const { data: employersData } = useQuery({
    queryKey: ["my-patch-employers", organiserId],
    enabled: !!organiserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employer_organisers")
        .select("employer_id, employers(id, name, employer_type, enterprise_agreement_status)")
        .eq("organiser_id", organiserId as string);
      if (error) throw error;
      return (data || []).map((d: any) => d.employers).filter(Boolean);
    },
  });

  const { data: placements } = useQuery({
    queryKey: ["my-patch-placements", siteIds],
    enabled: siteIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("worker_placements")
        .select("worker_id, job_site_id")
        .in("job_site_id", siteIds);
      if (error) throw error;
      return data || [];
    },
  });

  const workerIds = useMemo(() => Array.from(new Set((placements || []).map((p: any) => p.worker_id).filter(Boolean))), [placements]);

  const { data: workers } = useQuery({
    queryKey: ["my-patch-workers", workerIds],
    enabled: workerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workers")
        .select("id, first_name, surname, union_membership_status")
        .in("id", workerIds);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: delegateAssignments } = useQuery({
    queryKey: ["my-patch-delegates", workerIds],
    enabled: workerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("worker_delegate_assignments")
        .select("delegate_id, worker_id, is_active")
        .eq("is_active", true)
        .in("worker_id", workerIds);
      if (error) throw error;
      return data || [];
    },
  });

  const delegateIds = useMemo(() => Array.from(new Set((delegateAssignments || []).map((d: any) => d.delegate_id).filter(Boolean))), [delegateAssignments]);

  const { data: delegates } = useQuery({
    queryKey: ["my-patch-delegate-profiles", delegateIds],
    enabled: delegateIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workers")
        .select("id, first_name, surname")
        .in("id", delegateIds);
      if (error) throw error;
      return data || [];
    },
  });

  const totalWorkers = workers?.length || 0;
  const memberCount = (workers || []).filter((w: any) => w.union_membership_status && w.union_membership_status !== "non_member").length;

  return (
    <main>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">My Patch</h1>
        <p className="text-sm text-muted-foreground">Your projects, sites, employers and members.</p>
      </header>

      <section className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{organiserProjects?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Job Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sitesData?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Employers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employersData?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalWorkers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{memberCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Delegates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{delegates?.length || 0}</div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Projects</h2>
          <Button variant="outline" asChild>
            <Link to="/projects">View all</Link>
          </Button>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sites</TableHead>
                  <TableHead>Timeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(organiserProjects || []).slice(0, 8).map((p: any) => {
                  const siteCount = (sitesData || []).filter((s: any) => s.project_id === p.project_id).length;
                  return (
                    <TableRow key={p.project_id}>
                      <TableCell className="font-medium">{p.projects.name}</TableCell>
                      <TableCell>{siteCount}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{p.projects.proposed_start_date || "TBC"}</span>
                          <span>→</span>
                          <span>{p.projects.proposed_finish_date || "TBC"}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!organiserProjects || organiserProjects.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      No projects assigned yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Employers</h2>
          <Button variant="outline" asChild>
            <Link to="/employers">View all</Link>
          </Button>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>EBA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(employersData || []).slice(0, 8).map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{e.employer_type || "unknown"}</Badge>
                    </TableCell>
                    <TableCell>
                      {e.enterprise_agreement_status ? (
                        <Badge variant="default">EBA</Badge>
                      ) : (
                        <Badge variant="destructive">No EBA</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!employersData || employersData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      No employers assigned yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Delegates</h2>
          <Button asChild>
            <Link to="/activities">Create activity</Link>
          </Button>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Assigned Workers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(delegates || []).slice(0, 8).map((d: any) => {
                  const count = (delegateAssignments || []).filter((a: any) => a.delegate_id === d.id).length;
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.first_name} {d.surname}</TableCell>
                      <TableCell>{count}</TableCell>
                    </TableRow>
                  );
                })}
                {(!delegates || delegates.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">
                      No delegates found in your patch yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default MyPatch;
