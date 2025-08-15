import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useLocation } from "react-router-dom";
import { FileCheck } from "lucide-react";

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
      "Patch — Overview",
      "Role-based overview of assigned projects, sites, employers, workers, members and delegates.",
      window.location.origin + "/patch"
    );
  }, []);

  const organiserId = user?.id;

  // Fetch current user's role
  const { data: userProfile } = useQuery({
    queryKey: ["patch-user-role", organiserId],
    enabled: !!organiserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, full_name, email")
        .eq("id", organiserId as string)
        .single();
      if (error) throw error;
      return data as { id: string; role: string; full_name?: string | null; email?: string | null };
    },
  });

  const role = userProfile?.role ?? "viewer";
  const isLead = role === "lead_organiser";
  const isAdmin = role === "admin";
  const isDelegate = role === "delegate";

  // Allow lead/admin to view a specific organiser via query param
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const viewOrganiserIdParam = searchParams.get("organiserId");
  const targetUserId = (isLead || isAdmin) && viewOrganiserIdParam ? viewOrganiserIdParam : organiserId;

  const { data: projectsData } = useQuery({
    queryKey: ["my-patch-projects", targetUserId],
    enabled: !!targetUserId,
    queryFn: async () => {
      // Get accessible project IDs via RPC, then fetch details
      const { data: projectIdsRows, error: rpcErr } = await (supabase as any)
        .rpc("get_accessible_projects", { user_id: targetUserId as string });
      if (rpcErr) throw rpcErr;
      const ids = (projectIdsRows || []).map((r: { project_id: string }) => r.project_id);
      if (!ids.length) return [] as Array<{ id: string; name: string; builder_id: string | null; proposed_start_date: string | null; proposed_finish_date: string | null }>;
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, builder_id, proposed_start_date, proposed_finish_date")
        .in("id", ids);
      if (error) throw error;
      return (data || []) as Array<{ id: string; name: string; builder_id: string | null; proposed_start_date: string | null; proposed_finish_date: string | null }>;
    },
  });

  const projectIds = useMemo(() => (projectsData || []).map((p: any) => p.id), [projectsData]);

  const { data: sitesData } = useQuery({
    queryKey: ["my-patch-sites", targetUserId],
    enabled: !!targetUserId,
    queryFn: async () => {
      // Use RPC to get accessible job sites, then fetch details
      const { data: siteIdRows, error: rpcErr } = await (supabase as any)
        .rpc("get_accessible_job_sites", { user_id: targetUserId as string });
      if (rpcErr) throw rpcErr;
      const ids = (siteIdRows || []).map((r: { job_site_id: string }) => r.job_site_id);
      if (!ids.length) return [] as any[];
      const { data, error } = await supabase
        .from("job_sites")
        .select("id, name, project_id, location")
        .in("id", ids);
      if (error) throw error;
      return data || [];
    },
  });

  const siteIds = useMemo(() => (sitesData || []).map((s: any) => s.id), [sitesData]);

  const { data: employersData } = useQuery({
    queryKey: ["my-patch-employers", targetUserId],
    enabled: !!targetUserId,
    queryFn: async () => {
      const { data: employerIdRows, error: rpcErr } = await (supabase as any)
        .rpc("get_accessible_employers", { user_id: targetUserId as string });
      if (rpcErr) throw rpcErr;
      const ids = (employerIdRows || []).map((r: { employer_id: string }) => r.employer_id);
      if (!ids.length) return [] as any[];
      const { data, error } = await supabase
        .from("employers")
        .select("id, name, employer_type, enterprise_agreement_status")
        .in("id", ids);
      if (error) throw error;
      return data || [];
    },
  });

  // Get accessible workers, then fetch their details
  const { data: accessibleWorkerIds } = useQuery({
    queryKey: ["my-patch-accessible-worker-ids", targetUserId],
    enabled: !!targetUserId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .rpc("get_accessible_workers", { user_id: targetUserId as string });
      if (error) throw error;
      return (data || []).map((r: { worker_id: string }) => r.worker_id) as string[];
    },
  });

  const workerIds = useMemo(() => Array.from(new Set(accessibleWorkerIds || [])), [accessibleWorkerIds]);

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

  // Helper to compute stats for a given userId (used by lead/admin aggregations)
  async function fetchStatsForUser(userId: string) {
    const [projResult, siteResult, empResult, workerResult] = await Promise.all([
      (supabase as any).rpc("get_accessible_projects", { user_id: userId }),
      (supabase as any).rpc("get_accessible_job_sites", { user_id: userId }),
      (supabase as any).rpc("get_accessible_employers", { user_id: userId }),
      (supabase as any).rpc("get_accessible_workers", { user_id: userId }),
    ]);
    const workerIds: string[] = (workerResult.data || []).map((r: { worker_id: string }) => r.worker_id);
    let members = 0;
    if (workerIds.length > 0) {
      const { count } = await supabase
        .from("workers")
        .select("id", { count: "exact", head: true })
        .in("id", workerIds)
        .eq("union_membership_status", "member");
      members = count || 0;
    }
    return {
      projects: (projResult.data || []).length,
      sites: (siteResult.data || []).length,
      employers: (empResult.data || []).length,
      workers: (workerResult.data || []).length,
      members,
    };
  }

  // Lead aggregated stats (across subordinates)
  const { data: leadAggregate } = useQuery({
    queryKey: ["lead-aggregate", isLead, organiserId],
    enabled: isLead && !!organiserId && !viewOrganiserIdParam,
    queryFn: async () => fetchStatsForUser(organiserId as string),
  });

  // Admin: list leads and their organisers; also list unassigned organisers (declare before aggregates)
  const { data: allLeads = [] } = useQuery({
    queryKey: ["admin-leads", isAdmin],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "lead_organiser")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: hierarchyLinks = [] } = useQuery({
    queryKey: ["admin-role-hierarchy", isAdmin],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_hierarchy")
        .select("parent_user_id, child_user_id")
        .eq("is_active", true)
        .is("end_date", null);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: allOrganisers = [] } = useQuery({
    queryKey: ["admin-organisers", isAdmin],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "organiser")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Admin aggregated stats per lead and per organiser
  const { data: adminAggregates } = useQuery({
    queryKey: ["admin-aggregates", isAdmin, allLeads, hierarchyLinks, allOrganisers],
    enabled: isAdmin && (allLeads as any[]).length >= 0 && (hierarchyLinks as any[]).length >= 0,
    queryFn: async () => {
      const result: Array<{ lead: any; leadStats: any; organisers: Array<{ organiser: any; stats: any }> }> = [];
      for (const lead of (allLeads as any[])) {
        const childrenLinks = (hierarchyLinks as any[]).filter((l) => l.parent_user_id === lead.id);
        const organisers = childrenLinks
          .map((l) => (allOrganisers as any[]).find((o) => o.id === l.child_user_id))
          .filter(Boolean);
        const leadStats = await fetchStatsForUser(lead.id);
        const organisersStats: Array<{ organiser: any; stats: any }> = [];
        for (const org of organisers) {
          const stats = await fetchStatsForUser(org.id);
          organisersStats.push({ organiser: org, stats });
        }
        result.push({ lead, leadStats, organisers: organisersStats });
      }
      return result;
    },
  });

  // Lead organiser: list subordinate organisers
  const { data: subOrganisers = [] } = useQuery({
    queryKey: ["lead-subordinates", isLead, organiserId],
    enabled: !!organiserId && isLead,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_hierarchy")
        .select("child_user_id, profiles:child_user_id(id, full_name, email)")
        .eq("parent_user_id", organiserId as string)
        .eq("is_active", true)
        .is("end_date", null);
      if (error) throw error;
      return data || [];
    },
  });

  const organiserIdToLeadId = useMemo(() => {
    const map = new Map<string, string>();
    (hierarchyLinks as any[]).forEach((l) => map.set(l.child_user_id, l.parent_user_id));
    return map;
  }, [hierarchyLinks]);

  const unassignedOrganisers = useMemo(() => {
    if (!isAdmin) return [] as any[];
    return (allOrganisers as any[]).filter((o) => !organiserIdToLeadId.has(o.id));
  }, [isAdmin, allOrganisers, organiserIdToLeadId]);

  return (
    <main>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Patch</h1>
        <p className="text-sm text-muted-foreground">Role-based summary of projects, sites, employers, workers and membership.</p>
      </header>


      <section className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projectsData?.length || 0}</div>
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
            <CardTitle className="flex items-center justify-between">
              Summary
              <Button asChild variant="outline" size="sm">
                <Link to="/site-visits/new">
                  <FileCheck className="h-4 w-4 mr-2" />Plan Site Visit
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Projects</div>
                <div className="text-2xl font-bold">{projectsData?.length || 0}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Job Sites</div>
                <div className="text-2xl font-bold">{sitesData?.length || 0}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Employers</div>
                <div className="text-2xl font-bold">{employersData?.length || 0}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Workers</div>
                <div className="text-2xl font-bold">{totalWorkers}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Members</div>
                <div className="text-2xl font-bold">{memberCount}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Delegates</div>
                <div className="text-2xl font-bold">{delegates?.length || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Lead rollup numbers */}
      {isLead && !viewOrganiserIdParam && leadAggregate && (
        <section className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Rollup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div><div className="text-xs text-muted-foreground">Projects</div><div className="text-2xl font-bold">{leadAggregate.projects}</div></div>
                <div><div className="text-xs text-muted-foreground">Job Sites</div><div className="text-2xl font-bold">{leadAggregate.sites}</div></div>
                <div><div className="text-xs text-muted-foreground">Employers</div><div className="text-2xl font-bold">{leadAggregate.employers}</div></div>
                <div><div className="text-xs text-muted-foreground">Workers</div><div className="text-2xl font-bold">{leadAggregate.workers}</div></div>
                <div><div className="text-xs text-muted-foreground">Members</div><div className="text-2xl font-bold">{leadAggregate.members}</div></div>
                <div></div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Admin grouped numbers by lead and organiser */}
      {isAdmin && !viewOrganiserIdParam && adminAggregates && (
        <section className="mb-8 space-y-6">
          {(adminAggregates as any[]).map((row) => (
            <Card key={row.lead.id}>
              <CardHeader>
                <CardTitle>{row.lead.full_name || row.lead.email}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div><div className="text-xs text-muted-foreground">Projects</div><div className="text-2xl font-bold">{row.leadStats.projects}</div></div>
                  <div><div className="text-xs text-muted-foreground">Job Sites</div><div className="text-2xl font-bold">{row.leadStats.sites}</div></div>
                  <div><div className="text-xs text-muted-foreground">Employers</div><div className="text-2xl font-bold">{row.leadStats.employers}</div></div>
                  <div><div className="text-xs text-muted-foreground">Workers</div><div className="text-2xl font-bold">{row.leadStats.workers}</div></div>
                  <div><div className="text-xs text-muted-foreground">Members</div><div className="text-2xl font-bold">{row.leadStats.members}</div></div>
                  <div></div>
                </div>
                <div className="space-y-2">
                  {(row.organisers as any[]).map((o: any) => (
                    <div key={o.organiser.id} className="flex items-center justify-between border rounded p-2">
                      <Link to={`/patch?organiserId=${o.organiser.id}`} className="font-medium underline decoration-dotted">
                        {o.organiser.full_name || o.organiser.email}
                      </Link>
                      <div className="grid grid-cols-5 gap-3 text-right text-sm">
                        <div><div className="text-xs text-muted-foreground">Projects</div><div>{o.stats.projects}</div></div>
                        <div><div className="text-xs text-muted-foreground">Sites</div><div>{o.stats.sites}</div></div>
                        <div><div className="text-xs text-muted-foreground">Employers</div><div>{o.stats.employers}</div></div>
                        <div><div className="text-xs text-muted-foreground">Workers</div><div>{o.stats.workers}</div></div>
                        <div><div className="text-xs text-muted-foreground">Members</div><div>{o.stats.members}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* Lead view: list subordinate organisers */}
      {isLead && !viewOrganiserIdParam && (
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Organisers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(subOrganisers as any[]).map((row) => (
                  <Link key={row.child_user_id} to={`/patch?organiserId=${row.child_user_id}`} className="px-3 py-1 rounded bg-accent text-accent-foreground text-sm">
                    {row.profiles?.full_name || row.profiles?.email || row.child_user_id}
                  </Link>
                ))}
                {subOrganisers.length === 0 && (
                  <span className="text-sm text-muted-foreground">No linked organisers.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Admin view: list leads and their organisers */}
      {isAdmin && !viewOrganiserIdParam && (
        <section className="mb-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Organisers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(allLeads as any[]).map((lead) => {
                const children = (hierarchyLinks as any[])
                  .filter((l) => l.parent_user_id === lead.id)
                  .map((l) => (allOrganisers as any[]).find((o) => o.id === l.child_user_id))
                  .filter(Boolean);
                return (
                  <div key={lead.id} className="border rounded p-3">
                    <div className="font-medium mb-2">{lead.full_name || lead.email}</div>
                    <div className="flex flex-wrap gap-2">
                      {children.length > 0 ? (
                        children.map((o: any) => (
                          <Link key={o.id} to={`/patch?organiserId=${o.id}`} className="px-3 py-1 rounded bg-accent text-accent-foreground text-sm">
                            {o.full_name || o.email}
                          </Link>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No organisers</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {unassignedOrganisers.length > 0 && (
                <div className="border rounded p-3">
                  <div className="font-medium mb-2">Unassigned lead</div>
                  <div className="flex flex-wrap gap-2">
                    {unassignedOrganisers.map((o: any) => (
                      <Link key={o.id} to={`/patch?organiserId=${o.id}`} className="px-3 py-1 rounded bg-accent text-accent-foreground text-sm">
                        {o.full_name || o.email}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

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
                {(projectsData || []).slice(0, 8).map((p: any) => {
                  const siteCount = (sitesData || []).filter((s: any) => s.project_id === p.id).length;
                  return (

                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <Link to={`/patch/walls?projectId=${p.id}`} className="underline decoration-dotted">{p.name}</Link>
                      </TableCell>
                      <TableCell>{siteCount}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{p.proposed_start_date || "TBC"}</span>
                          <span>→</span>
                          <span>{p.proposed_finish_date || "TBC"}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!projectsData || projectsData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      {isDelegate ? "No delegate projects found." : "No projects assigned yet."}
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
