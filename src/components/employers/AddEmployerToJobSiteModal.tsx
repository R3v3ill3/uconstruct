"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SingleEmployerPicker } from "@/components/projects/SingleEmployerPicker";
import { useToast } from "@/hooks/use-toast";

const supabase = getBrowserSupabase();

interface AddEmployerToJobSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobSiteId: string;
  onEmployerAdded: () => void;
}

export function AddEmployerToJobSiteModal({ isOpen, onClose, jobSiteId, onEmployerAdded }: AddEmployerToJobSiteModalProps) {
  const { toast } = useToast();
  const [selectedEmployerId, setSelectedEmployerId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { data: jobSite } = useQuery({
    queryKey: ["job-site-detail", jobSiteId],
    enabled: !!jobSiteId && isOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_sites")
        .select("id, name, project_id")
        .eq("id", jobSiteId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleAddEmployer = async () => {
    if (!selectedEmployerId || !jobSite) return;
    setIsAdding(true);
    try {
      if (jobSite.project_id) {
        const { error: projectError } = await supabase
          .from("project_employer_roles")
          .insert({ project_id: jobSite.project_id, employer_id: selectedEmployerId, role: "contractor" });
        if (projectError && !projectError.message.includes("duplicate")) throw projectError;
      }
      const { error: siteError } = await supabase
        .from("site_contractor_trades")
        .insert({ job_site_id: jobSiteId, employer_id: selectedEmployerId, trade_type: "electrical", eba_signatory: "not_specified" });
      if (siteError && !siteError.message.includes("duplicate")) throw siteError;
      toast({ title: "Success", description: "Employer has been linked to the job site and project." });
      setSelectedEmployerId("");
      onEmployerAdded();
    } catch (error: any) {
      console.error("Error adding employer:", error);
      toast({ title: "Error", description: error.message || "Failed to add employer to job site.", variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedEmployerId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Employer to Job Site</DialogTitle>
          <DialogDescription>
            Select an employer to link to this job site. The employer will be added to both the job site and its associated project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Job Site</Label>
            <div className="p-2 border rounded bg-muted text-sm">{jobSite?.name || "Loading..."}</div>
          </div>
          <div>
            <SingleEmployerPicker label="Employer" selectedId={selectedEmployerId} onChange={setSelectedEmployerId} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAddEmployer} disabled={!selectedEmployerId || isAdding}>{isAdding ? "Adding..." : "Add Employer"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

