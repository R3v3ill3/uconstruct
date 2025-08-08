import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TradeContractorsManager, TradeAssignment } from "@/components/projects/TradeContractorsManager";
import { toast } from "sonner";
import EditProjectDialog from "@/components/projects/EditProjectDialog";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";
import JobSitesManager from "@/components/projects/JobSitesManager";
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
          id, name, value, proposed_start_date, proposed_finish_date, roe_email, builder_id,
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
  
  // Project-level trade contractors (not site-specific)
  const { data: projectTradeContractors = [] } = useQuery({
    queryKey: ["project-trade-contractors", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("project_contractor_trades")
        .select("id, employer_id, trade_type, eba_signatory, employers(id, name)")
        .eq("project_id", id as string);
      if (error) throw error;
      return data || [];
    },
  });

  const [addOpen, setAddOpen] = useState(false);
  const [manageSitesOpen, setManageSitesOpen] = useState(false);
  const [newAssignments, setNewAssignments] = useState<TradeAssignment[]>([]);
  const queryClient = useQueryClient();

  const addContractorsMutation = useMutation({
    mutationFn: async () => {
      if (!id || newAssignments.length === 0) return;
      const rows = newAssignments.map(a => ({
        project_id: id,
        employer_id: a.employer_id,
        trade_type: a.trade_type,
      }));
      const { error } = await (supabase as any)
        .from("project_contractor_trades")
        .insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contractors added");
      setAddOpen(false);
      setNewAssignments([]);
      queryClient.invalidateQueries({ queryKey: ["project-trade-contractors", id] });
    },
    onError: (err) => {
      toast.error("Failed to add contractors: " + (err as Error).message);
    },
  });

  const builder = project?.builder ? project.builder : null;
  return (
    <main>
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Project: {project?.name || "..."}</h1>
          <p className="text-sm text-muted-foreground">Overview of builder, sites and contractors</p>
        </div>
        {project && (
          <div className="flex gap-2">
            <EditProjectDialog
              project={{
                id: project.id,
                name: project.name,
                value: project.value,
                proposed_start_date: project.proposed_start_date,
                proposed_finish_date: project.proposed_finish_date,
                roe_email: project.roe_email,
              }}
              triggerText="Edit"
            />
            <Button variant="outline" onClick={() => setManageSitesOpen(true)}>Manage Job Sites</Button>
            <DeleteProjectDialog
              projectId={project.id}
              projectName={project.name}
              triggerText="Delete"
            />
          </div>
        )}
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

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Project Trade Contractors</h2>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employer</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>EBA Signatory</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(projectTradeContractors || []).map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.employers?.name}</TableCell>
                    <TableCell>{row.trade_type}</TableCell>
                    <TableCell>
                      {row.eba_signatory ? (
                        <Badge variant="default">{row.eba_signatory}</Badge>
                      ) : (
                        <Badge variant="secondary">not_specified</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!projectTradeContractors || projectTradeContractors.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      No project-level trade contractors yet.
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
            <Button onClick={() => setAddOpen(true)}>Add Contractors</Button>
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
      {/* Add Contractors Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Project Trade Contractors</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <TradeContractorsManager
              assignments={newAssignments}
              onChange={setNewAssignments}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={() => addContractorsMutation.mutate()} disabled={addContractorsMutation.isPending || newAssignments.length === 0}>
                {addContractorsMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Job Sites Dialog */}
      <Dialog open={manageSitesOpen} onOpenChange={setManageSitesOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Job Sites</DialogTitle>
          </DialogHeader>
          {project && (
            <JobSitesManager projectId={project.id} projectName={project.name} />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default ProjectDetail;
