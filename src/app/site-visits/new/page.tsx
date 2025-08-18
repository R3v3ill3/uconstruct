"use client";
export const dynamic = "force-dynamic";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobSiteEmployerManager } from "@/components/employers/JobSiteEmployerManager";
import { useToast } from "@/hooks/use-toast";

export default function SiteVisitNew() {
  const supabase = getBrowserSupabase();
  const router = useRouter();
  const { toast } = useToast();
  const [jobSiteId, setJobSiteId] = useState("");
  const [selectedEmployerIds, setSelectedEmployerIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [objective, setObjective] = useState("");
  const [estimatedWorkers, setEstimatedWorkers] = useState<number | "">("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: allJobSites = [] } = useQuery({
    queryKey: ["all-job-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_sites")
        .select("id, name, location, project:projects(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (!jobSiteId) {
      setSelectedEmployerIds([]);
      return;
    }
    const loadEmployersForJobSite = async () => {
      try {
        const { data: siteContractors, error: siteError } = await supabase
          .from("site_contractor_trades")
          .select("employer_id")
          .eq("job_site_id", jobSiteId);
        if (siteError) throw siteError;
        const { data: jobSite, error: jobSiteError } = await supabase
          .from("job_sites")
          .select(`
            project_id,
            project:projects(
              project_employer_roles(employer_id)
            )
          `)
          .eq("id", jobSiteId)
          .single();
        if (jobSiteError) throw jobSiteError;
        const employerIds = new Set<string>();
        siteContractors?.forEach((sc) => { if (sc.employer_id) employerIds.add(sc.employer_id); });
        const projectRoles = ((jobSite as any)?.project?.project_employer_roles ?? []) as any[];
        projectRoles.forEach((per: any) => { if (per.employer_id) employerIds.add(per.employer_id); });
        setSelectedEmployerIds(Array.from(employerIds));
      } catch (error) {
        console.error("Error loading employers for job site:", error);
      }
    };
    loadEmployersForJobSite();
  }, [jobSiteId]);

  const canCreate = useMemo(
    () => !!jobSiteId && selectedEmployerIds.length > 0 && !isCreating,
    [jobSiteId, selectedEmployerIds.length, isCreating]
  );

  const createVisit = async () => {
    if (!canCreate) return;
    if (!jobSiteId) {
      toast({ title: "Validation Error", description: "Please select a job site.", variant: "destructive" });
      return;
    }
    if (selectedEmployerIds.length === 0) {
      toast({ title: "Validation Error", description: "Please select at least one employer.", variant: "destructive" });
      return;
    }
    if (scheduledAt) {
      const scheduledTime = new Date(scheduledAt).getTime();
      if (scheduledTime < Date.now()) {
        toast({ title: "Invalid Date", description: "Scheduled time must be in the future.", variant: "destructive" });
        return;
      }
    }
    setIsCreating(true);
    try {
      const svCode = Math.random().toString(36).slice(2, 8).toUpperCase();
      const siteVisitPromises = selectedEmployerIds.map(async (employerId) => {
        const payload: any = {
          employer_id: employerId,
          job_site_id: jobSiteId,
          objective: objective || null,
          sv_code: `${svCode}-${employerId.slice(0, 4)}`,
          estimated_workers_count: typeof estimatedWorkers === "number" ? estimatedWorkers : null,
        };
        if (scheduledAt) payload.scheduled_at = new Date(scheduledAt).toISOString();
        return supabase.from("site_visit").insert(payload).select("id, sv_code").single();
      });
      const results = await Promise.all(siteVisitPromises);
      const failed = results.filter((r) => (r as any).error);
      if (failed.length > 0) {
        toast({ title: "Partial Success", description: `${results.length - failed.length} of ${results.length} site visits created successfully.`, variant: "destructive" });
      } else {
        toast({ title: "Site Visits Created", description: `${results.length} site visit(s) created successfully.` });
      }
      const firstSuccess = results.find((r: any) => !r.error);
      if (firstSuccess?.data) router.push(`/site-visits/${firstSuccess.data.sv_code}`);
      else router.push("/site-visits");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({ title: "Unexpected Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan a Site Visit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Job Site</Label>
              <Select value={jobSiteId} onValueChange={setJobSiteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job site" />
                </SelectTrigger>
                <SelectContent>
                  {allJobSites.map((site: any) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name || site.location || site.id}
                      {site.project?.name ? (
                        <span className="text-sm text-muted-foreground ml-2">({site.project.name})</span>
                      ) : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {jobSiteId && (
              <div className="md:col-span-2">
                <JobSiteEmployerManager
                  jobSiteId={jobSiteId}
                  selectedEmployerIds={selectedEmployerIds}
                  onEmployerSelectionChange={setSelectedEmployerIds}
                />
              </div>
            )}

            <div>
              <Label>Scheduled Date/Time</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div>
              <Label>Objective</Label>
              <Input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Optional objective" />
            </div>
            <div>
              <Label>Estimated workers</Label>
              <Input type="number" min={0} value={estimatedWorkers as any} onChange={(e) => setEstimatedWorkers(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={createVisit} disabled={!canCreate}>
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Visit"
              )}
            </Button>
            <Button asChild variant="outline">
              <Link href="/site-visits">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

