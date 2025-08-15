import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmployerWorkerChart } from "@/components/patchwall/EmployerWorkerChart";
import { getDensityBadgeClass } from "@/utils/densityColors";
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

const densityBadge = (pct?: number | null) => {
  const v = typeof pct === 'number' ? pct : 0;
  return <Badge className={getDensityBadgeClass(v)}>{v}%</Badge>;
};

const PatchWall = () => {
  const { user } = useAuth();
  const location = useLocation();
  const projectId = useMemo(() => new URLSearchParams(location.search).get("projectId"), [location.search]);

  useEffect(() => {
    setMeta(
      "Patch Wall Charts",
      "Colour-coded organisers' patch overview by site and employer.",
      window.location.origin + "/patch/walls" + (projectId ? `?projectId=${projectId}` : "")
    );
  }, [projectId]);

  const organiserId = user?.id;

  const { data: organiserProjects = [] } = useQuery({
    queryKey: ["wall-projects", organiserId],
    enabled: !projectId && !!organiserId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .rpc("get_accessible_projects", { user_id: organiserId as string });
      if (error) throw error;
      return (data || []).map((d: any) => d.project_id);
    },
  });

  const projectIds = projectId ? [projectId] : (organiserProjects as string[]);

  const { data: sites = [] } = useQuery({
    queryKey: ["wall-sites", projectIds],
    enabled: projectIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_sites")
        .select("id, name, location, full_address, main_builder_id")
        .in("project_id", projectIds as string[]);
      if (error) throw error;
      return data || [];
    },
  });

  const siteIds = useMemo(() => (sites || []).map((s: any) => s.id), [sites]);

  const { data: siteContractors = [] } = useQuery({
    queryKey: ["wall-site-contractors", siteIds],
    enabled: siteIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_contractor_trades")
        .select(`
          job_site_id,
          trade_type,
          employers(id, name, employer_type)
        `)
        .in("job_site_id", siteIds);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: projectRoles = [] } = useQuery({
    queryKey: ["wall-project-roles", projectIds],
    enabled: projectIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_employer_roles")
        .select(`
          project_id,
          employer_id,
          role,
          employers(id, name)
        `)
        .in("project_id", projectIds as string[]);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ["employer-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employer_analytics")
        .select("employer_id, member_density_percent");
      if (error) throw error;
      return data || [];
    },
  });

  const getDensity = (employerId: string) =>
    (analytics as any[]).find((a) => a.employer_id === employerId)?.member_density_percent as number | undefined;

  const builderEmployer = useMemo(() => (projectRoles as any[]).find((r) => r.role === 'builder')?.employers, [projectRoles]);
  const headContractorEmployer = useMemo(() => (projectRoles as any[]).find((r) => r.role === 'head_contractor')?.employers, [projectRoles]);

  const [selectedEmployer, setSelectedEmployer] = useState<{ id: string; name: string } | null>(null);
  const [contextSiteId, setContextSiteId] = useState<string | null>(null);
  const openChart = (employer: any, siteId?: string) => {
    if (!employer) return;
    setSelectedEmployer({ id: employer.id, name: employer.name });
    setContextSiteId(siteId || null);
  };

  return (
    <main>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Patch Wall Charts</h1>
        <p className="text-sm text-muted-foreground">Colour-coded by member density</p>
      </header>

      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>By Worksite</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Member Density</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sites as any[]).flatMap((s) => {
                  const rows: Array<{ employer: any; type: string; key: string }> = [];
                  if (builderEmployer) {
                    rows.push({ employer: builderEmployer, type: 'builder', key: `${s.id}-builder-${builderEmployer.id}` });
                  }
                  if (headContractorEmployer) {
                    rows.push({ employer: headContractorEmployer, type: 'head_contractor', key: `${s.id}-head-${headContractorEmployer.id}` });
                  }
                  (siteContractors as any[])
                    .filter((ct) => ct.job_site_id === s.id)
                    .forEach((ct: any, i: number) => {
                      if (ct.employers) {
                        rows.push({
                          employer: ct.employers,
                          type: 'trade_subbie',
                          key: `${s.id}-${ct.employers.id}-${i}`,
                        });
                      }
                    });
                  return rows.map((r) => (
                    <TableRow key={r.key} className="cursor-pointer hover:bg-accent/40" onClick={() => openChart(r.employer, s.id)}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{r.employer?.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.type}</Badge>
                      </TableCell>
                      <TableCell>{densityBadge(getDensity(r.employer?.id))}</TableCell>
                    </TableRow>
                  ));
                })}
                {sites.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No sites in your patch yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>By Employer Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {['builder', 'head_contractor', 'contractor', 'trade_subbie'].map((cat) => {
                let employersInCat: any[] = [];
                if (cat === 'builder') {
                  if (builderEmployer) employersInCat = [builderEmployer];
                } else if (cat === 'head_contractor') {
                  if (headContractorEmployer) employersInCat = [headContractorEmployer];
                } else if (cat === 'contractor') {
                  employersInCat = (projectRoles as any[])
                    .filter((r: any) => r.role === 'contractor')
                    .map((r: any) => r.employers)
                    .filter(Boolean);
                } else if (cat === 'trade_subbie') {
                  employersInCat = (siteContractors as any[])
                    .map((ct: any) => ct.employers)
                    .filter(Boolean);
                }
                const unique = Array.from(new Map(employersInCat.map((e: any) => [e.id, e])).values());
                return (
                  <Card key={cat} className="p-4">
                    <div className="mb-2 font-medium capitalize">{cat.replace('_', ' ')}</div>
                    <div className="flex flex-wrap gap-2">
                      {unique.map((e: any) => (
                        <div
                          key={e.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-accent/40 rounded px-2 py-1"
                          onClick={() => openChart(e)}
                        >
                          <Badge variant="outline">{e.name}</Badge>
                          {densityBadge(getDensity(e.id))}
                        </div>
                      ))}
                      {unique.length === 0 && (
                        <div className="text-sm text-muted-foreground">None</div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <EmployerWorkerChart
        isOpen={!!selectedEmployer}
        onClose={() => { setSelectedEmployer(null); setContextSiteId(null); }}
        employerId={selectedEmployer?.id || null}
        employerName={selectedEmployer?.name}
        projectIds={projectIds}
        siteIds={siteIds}
        contextSiteId={contextSiteId}
        siteOptions={(sites as any[]).map((s: any) => ({ id: s.id, name: s.name }))}
      />
    </main>
  );
};

export default PatchWall;
