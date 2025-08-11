import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Loader2, MoreVertical, X } from "lucide-react";
import { toast } from "sonner";
import { WorkerDetailModal } from "@/components/workers/WorkerDetailModal";
import { UnionRoleAssignmentModal } from "@/components/workers/UnionRoleAssignmentModal";
import { AssignWorkersModal } from "./AssignWorkersModal";

interface EmployerWorkerChartProps {
  isOpen: boolean;
  onClose: () => void;
  employerId: string | null;
  employerName?: string;
  projectIds?: string[];
  siteIds?: string[];
  contextSiteId?: string | null;
  siteOptions?: Array<{ id: string; name: string }>;
}

interface WorkerLite {
  id: string;
  first_name: string | null;
  surname: string | null;
  union_membership_status: string | null;
}

export const EmployerWorkerChart = ({
  isOpen,
  onClose,
  employerId,
  employerName,
  projectIds = [],
  siteIds = [],
  contextSiteId = null,
  siteOptions = [],
}: EmployerWorkerChartProps) => {
  const qc = useQueryClient();
  const [detailWorkerId, setDetailWorkerId] = useState<string | null>(null);
  const [showRole, setShowRole] = useState(false);
  const [roleWorkerId, setRoleWorkerId] = useState<string>("");
  const [showAssign, setShowAssign] = useState(false);

  const filters = useMemo(() => ({ employerId, projectIds, siteIds, contextSiteId }), [employerId, projectIds, siteIds, contextSiteId]);

  const { data, isLoading } = useQuery({
    queryKey: ["employer-worker-chart", filters],
    enabled: isOpen && !!employerId,
    queryFn: async () => {
      if (!employerId) return { workers: [] as WorkerLite[], roles: {} as Record<string, string[]>, ratings: {} as Record<string, any[]> };

      // 1) Which workers are on these projects/sites for this employer?
      let vpw = supabase
        .from("v_project_workers")
        .select("worker_id, employer_id, job_site_id, project_id")
        .eq("employer_id", employerId);

      if (siteIds && siteIds.length > 0) {
        vpw = vpw.in("job_site_id", siteIds);
      } else if (projectIds && projectIds.length > 0) {
        vpw = vpw.in("project_id", projectIds);
      }

      const { data: vWorkers, error: vErr } = await vpw;
      if (vErr) throw vErr;
      const workerIds = Array.from(new Set((vWorkers || []).map((v: any) => v.worker_id).filter(Boolean)));

      if (workerIds.length === 0) {
        return { workers: [] as WorkerLite[], roles: {}, ratings: {} };
      }

      // 2) Basic worker details
      const { data: wRows, error: wErr } = await supabase
        .from("workers")
        .select("id, first_name, surname, union_membership_status")
        .in("id", workerIds);
      if (wErr) throw wErr;

      // 3) Current union roles
      const today = new Date().toISOString().slice(0, 10);
      const { data: roleRows, error: rErr } = await supabase
        .from("union_roles")
        .select("worker_id, name, end_date")
        .in("worker_id", workerIds)
        .or(`end_date.is.null,end_date.gte.${today}`);
      if (rErr) throw rErr;
      const roles: Record<string, string[]> = {};
      (roleRows || []).forEach((r: any) => {
        if (!roles[r.worker_id]) roles[r.worker_id] = [];
        roles[r.worker_id].push(r.name);
      });

      // 4) Recent ratings (limit overall to keep light)
      const { data: ratingRows, error: ratErr } = await supabase
        .from("worker_activity_ratings")
        .select("worker_id, rating_type, rating_value, created_at")
        .in("worker_id", workerIds)
        .order("created_at", { ascending: false })
        .limit(200);
      if (ratErr) throw ratErr;
      const ratings: Record<string, any[]> = {};
      (ratingRows || []).forEach((r: any) => {
        if (!ratings[r.worker_id]) ratings[r.worker_id] = [];
        if (ratings[r.worker_id].length < 5) ratings[r.worker_id].push(r);
      });

      return { workers: wRows || [], roles, ratings };
    },
  });

  const endPlacements = async (where: Record<string, any>) => {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("worker_placements")
      .update({ end_date: today })
      .match({ ...where })
      .is("end_date", null);
    if (error) throw error;
  };

  const removeFromEmployer = async (workerId: string) => {
    try {
      await endPlacements({ employer_id: employerId, worker_id: workerId });
      toast.success("Removed from employer");
      qc.invalidateQueries({ queryKey: ["employer-worker-chart"] });
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove from employer");
    }
  };

  const removeFromProject = async (workerId: string) => {
    try {
      if (!siteIds || siteIds.length === 0) return;
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase
        .from("worker_placements")
        .update({ end_date: today })
        .eq("worker_id", workerId)
        .eq("employer_id", employerId)
        .in("job_site_id", siteIds)
        .is("end_date", null);
      if (error) throw error;
      toast.success("Removed from project");
      qc.invalidateQueries({ queryKey: ["employer-worker-chart"] });
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove from project");
    }
  };

  const removeFromSite = async (workerId: string) => {
    try {
      if (!contextSiteId) return;
      await endPlacements({ worker_id: workerId, employer_id: employerId, job_site_id: contextSiteId });
      toast.success("Removed from site");
      qc.invalidateQueries({ queryKey: ["employer-worker-chart"] });
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove from site");
    }
  };

  const formatName = (w: WorkerLite) => `${w.first_name ?? ""} ${w.surname ?? ""}`.trim() || "Unnamed";
  const membershipBadge = (status: string | null) => (
    <Badge variant={status === "member" ? "default" : status === "potential_member" ? "secondary" : "outline"}>
      {status ? status.split("_").join(" ") : "unknown"}
    </Badge>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Workers at {employerName || "Employer"}</span>
            <div className="flex items-center gap-2">
              {siteOptions && siteOptions.length > 0 && (
                <Button onClick={() => setShowAssign(true)}>Assign Workers</Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading workers…</div>
        ) : data && data.workers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.workers.map((w) => (
              <Card key={w.id} className="p-3 flex items-start justify-between">
                <div>
                  <div className="font-medium">{formatName(w)}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {membershipBadge(w.union_membership_status)}
                    {(data.roles[w.id] || []).slice(0, 2).map((r) => (
                      <Badge key={r} variant="secondary">{r.split("_").join(" ")}</Badge>
                    ))}
                  </div>
                  {data.ratings[w.id] && data.ratings[w.id].length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Recent ratings: {data.ratings[w.id].map((r) => `${r.rating_type}:${r.rating_value}`).join(" • ")}
                    </div>
                  )}
                  <div className="mt-2">
                    <Button variant="link" className="px-0" onClick={() => setDetailWorkerId(w.id)}>Open details</Button>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Worker actions"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {contextSiteId && (
                      <DropdownMenuItem onClick={() => removeFromSite(w.id)}>Remove from this site</DropdownMenuItem>
                    )}
                    {siteIds && siteIds.length > 0 && (
                      <DropdownMenuItem onClick={() => removeFromProject(w.id)}>Remove from project</DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => removeFromEmployer(w.id)}>Remove from employer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No workers found for this employer in the selected context. Workers are only counted when they have active placements on project sites.</div>
        )}

        <WorkerDetailModal
          workerId={detailWorkerId}
          isOpen={!!detailWorkerId}
          onClose={() => setDetailWorkerId(null)}
        />

        {employerId && (
          <AssignWorkersModal
            open={showAssign}
            onOpenChange={setShowAssign}
            employerId={employerId}
            employerName={employerName}
            projectId={projectIds && projectIds.length > 0 ? projectIds[0] : null}
            siteOptions={siteOptions || []}
            defaultSiteId={contextSiteId || null}
            onAssigned={() => qc.invalidateQueries({ queryKey: ["employer-worker-chart"] })}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
