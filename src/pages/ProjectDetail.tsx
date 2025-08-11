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
import ContractorSiteAssignmentModal from "@/components/projects/ContractorSiteAssignmentModal";
import { TRADE_OPTIONS } from "@/constants/trades";
import { EmployerDetailModal } from "@/components/employers/EmployerDetailModal";
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
        .select("id, name, location, full_address")
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
          employers(id, name, employer_type, enterprise_agreement_status, company_eba_records ( id ))
        `)
        .in("job_site_id", siteIds);
      if (error) throw error;
      return data || [];
    },
  });
  // Project roles (builder, head contractor)
  const { data: projectRoles = [] } = useQuery({
    queryKey: ["project-roles", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_employer_roles")
        .select("role, employers(id, name)")
        .eq("project_id", id as string);
      if (error) throw error;
      return data || [];
    },
  });
  
  // Employer IDs involved in this project (roles + site contractors)
  const employerIds = useMemo(() => {
    const ids = new Set<string>();
    (projectRoles as any[]).forEach((r) => r.employers?.id && ids.add(r.employers.id));
    (contractors || []).forEach((c: any) => c.employers?.id && ids.add(c.employers.id));
    return Array.from(ids);
  }, [projectRoles, contractors]);

  // Company EBA records for involved employers
  const { data: ebaRecords = [] } = useQuery({
    queryKey: ["company-eba-records", employerIds],
    enabled: employerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_eba_records")
        .select("id, employer_id")
        .in("employer_id", employerIds as string[]);
      if (error) throw error;
      return data || [];
    },
  });

  // Derived set of employers with any EBA indicator
  const ebaEmployers = useMemo(() => {
    const set = new Set<string>();
    const fromCompany = new Set<string>((ebaRecords as any[]).map((r) => r.employer_id));
    (contractors || []).forEach((c: any) => {
      const id = c.employers?.id as string | undefined;
      const signatory = String(c.eba_signatory || "not_specified");
      const has = !!c.eba_status || signatory !== "not_specified" || !!c.employers?.enterprise_agreement_status;
      if (id && (has || fromCompany.has(id))) set.add(id);
    });
    // Also include role employers found in company records
    (projectRoles as any[]).forEach((r) => {
      const id = r.employers?.id as string | undefined;
      if (id && (fromCompany.has(id))) set.add(id);
    });
    return set;
  }, [contractors, ebaRecords, projectRoles]);

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

  // Workforce analytics
  const { data: projectWorkers = [] } = useQuery({
    queryKey: ["v-project-workers", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_project_workers")
        .select("worker_id")
        .eq("project_id", id as string);
      if (error) throw error;
      return data || [];
    },
  });

  const workerIds = useMemo(
    () => Array.from(new Set((projectWorkers as any[]).map((w: any) => w.worker_id).filter(Boolean))),
    [projectWorkers]
  );

  const { data: memberWorkers = [] } = useQuery({
    queryKey: ["project-member-workers", workerIds],
    enabled: workerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workers")
        .select("id, union_membership_status")
        .in("id", workerIds as string[]);
      if (error) throw error;
      return data || [];
    },
  });

  const memberCount = useMemo(
    () => (memberWorkers as any[]).filter((w: any) => w.union_membership_status && w.union_membership_status !== 'non_member').length,
    [memberWorkers]
  );

  const { data: delegateRoles = [] } = useQuery({
    queryKey: ["project-delegate-roles", siteIds],
    enabled: siteIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("union_roles")
        .select("worker_id")
        .in("job_site_id", siteIds as string[])
        .in("name", ["site_delegate", "shift_delegate", "company_delegate"]) 
        .is("end_date", null);
      if (error) throw error;
      return data || [];
    },
  });

  const delegateCount = useMemo(
    () => Array.from(new Set((delegateRoles as any[]).map((r: any) => r.worker_id))).length,
    [delegateRoles]
  );

  const [addOpen, setAddOpen] = useState(false);
  const [manageSitesOpen, setManageSitesOpen] = useState(false);
  const [focusSiteId, setFocusSiteId] = useState<string | null>(null);
  const [newAssignments, setNewAssignments] = useState<TradeAssignment[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
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

      <section className="mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Builder</div>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{builder ? builder.name : <span className="text-sm text-muted-foreground">Not set</span>}</div>
                  {project && (
                    <EditProjectDialog
                      project={{
                        id: project.id,
                        name: project.name,
                        value: project.value,
                        proposed_start_date: project.proposed_start_date,
                        proposed_finish_date: project.proposed_finish_date,
                        roe_email: project.roe_email,
                      }}
                      triggerText="Manage"
                    />
                  )}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline decoration-dotted hover:text-primary"
                  onClick={() => setManageSitesOpen(true)}
                >
                  Job Sites
                </button>
                <div className="text-2xl font-bold">{jobSites?.length || 0}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Project Value</div>
                <div className="font-medium">{project?.value ? new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(Number(project.value)) : '-'}</div>
              </div>
            </div>
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
                    <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setFocusSiteId(s.id); setManageSitesOpen(true); }}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.full_address || s.location}</TableCell>
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
          <Button size="sm" onClick={() => setAddOpen(true)}>Add</Button>
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
                      {ebaEmployers.has(row.employers?.id as string) ? (
                        <Badge variant="default">EBA</Badge>
                      ) : (
                        <Badge variant="destructive">No EBA</Badge>
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
            <Button variant="secondary" onClick={() => setAssignOpen(true)}>Assign to Sites</Button>
            <Button variant="outline" asChild>
              <Link to="/delegations">Manage Delegations</Link>
            </Button>
            <Button asChild>
              <Link to={`/patch/walls?projectId=${project?.id}`}>Open Wall Charts</Link>
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
        <DialogContent
          className="max-w-3xl"
          onPointerDownOutside={(e) => {
            const target = (e as any).detail?.originalEvent?.target as HTMLElement | null;
            if (target && target.closest('.pac-container')) {
              console.debug('[Dialog] prevent pointerDownOutside for pac-container');
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            const target = (e as any).detail?.originalEvent?.target as HTMLElement | null;
            if (target && target.closest('.pac-container')) {
              console.debug('[Dialog] prevent interactOutside for pac-container');
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Manage Job Sites</DialogTitle>
          </DialogHeader>
          {project && (
            <JobSitesManager projectId={project.id} projectName={project.name} focusSiteId={focusSiteId || undefined} />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Contractors to Sites */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Assign contractors to sites</DialogTitle>
          </DialogHeader>
          {project && <ContractorSiteAssignmentModal projectId={project.id} />}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default ProjectDetail;
