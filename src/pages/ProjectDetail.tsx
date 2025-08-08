import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    setMeta(
      "Project Detail — Organiser Patch",
      "Builder, sites and contractors for this project.",
      window.location.href
    );
  }, []);

  const { data: project } = useQuery({
    queryKey: ["project-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id, name, value, proposed_start_date, proposed_finish_date, builder_id,
          builder:employers!builder_id(id, name)
        `)
        .eq("id", id as string)
        .single();
      if (error) throw error;
      return data as any;
    },
  });

  const { data: jobSites } = useQuery({
    queryKey: ["project-sites", project?.id],
    enabled: !!project?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_sites")
        .select("id, name, location")
        .eq("project_id", project?.id);
      if (error) throw error;
      return data || [];
    },
  });

  const siteIds = useMemo(() => (jobSites || []).map((s: any) => s.id), [jobSites]);

  const { data: contractors } = useQuery({
    queryKey: ["project-contractors", siteIds],
    enabled: siteIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_contractor_trades")
        .select(`
          id, job_site_id, trade_type, eba_status, eba_signatory,
          employers(id, name, employer_type)
        `)
        .in("job_site_id", siteIds);
      if (error) throw error;
      return data || [];
    },
  });

  const builder = project?.builder ? project.builder : null;

  return (
    <main>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Project: {project?.name || "..."}</h1>
        <p className="text-sm text-muted-foreground">Overview of builder, sites and contractors</p>
      </header>

      <section className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Builder</CardTitle>
          </CardHeader>
          <CardContent>
            {builder ? (
              <div className="flex items-center justify-between">
                <span className="font-medium">{builder.name}</span>
                <Badge variant="secondary">builder</Badge>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Not set</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Job Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{jobSites?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contractors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contractors?.length || 0}</div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Sites</h2>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contractors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(jobSites || []).map((s: any) => {
                  const count = (contractors || []).filter((c: any) => c.job_site_id === s.id).length;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.location}</TableCell>
                      <TableCell>{count}</TableCell>
                    </TableRow>
                  );
                })}
                {(!jobSites || jobSites.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      No sites yet.
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
          <h2 className="text-lg font-medium">Contractors by Site</h2>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/delegations">Manage Delegations</Link>
            </Button>
            <Button asChild>
              <Link to="/patch/walls">Open Wall Charts</Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>EBA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(contractors || []).map((ct: any) => (
                  <TableRow key={ct.id}>
                    <TableCell>{(jobSites || []).find((s: any) => s.id === ct.job_site_id)?.name}</TableCell>
                    <TableCell className="font-medium">{ct.employers?.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ct.employers?.employer_type || 'contractor'}</Badge>
                    </TableCell>
                    <TableCell>{ct.trade_type}</TableCell>
                    <TableCell>
                      {ct.eba_status ? (
                        <Badge variant="default">EBA</Badge>
                      ) : (
                        <Badge variant="destructive">No EBA</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!contractors || contractors.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      No contractors recorded for this project yet.
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

export default ProjectDetail;
