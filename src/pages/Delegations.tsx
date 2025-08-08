import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { EnhancedActivityCreationDialog } from "@/components/activities/EnhancedActivityCreationDialog";
import { toast } from "sonner";

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

const Delegations = () => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setMeta(
      "Delegate Allocation Wizard",
      "Select workers and assign delegates, then save as an activity.",
      window.location.origin + "/delegations"
    );
  }, []);

  const { data: templates } = useQuery({
    queryKey: ["activity-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_templates")
        .select("*")
        .order("is_predefined", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: jobSites } = useQuery({
    queryKey: ["job-sites-for-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_sites")
        .select("id, name, location")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async ({ formData, selectedWorkers, delegations }: any) => {
    try {
      const { data: activity, error: activityError } = await supabase
        .from("union_activities")
        .insert({
          activity_type: formData.activity_type,
          custom_activity_type: formData.custom_activity_type,
          template_id: formData.template_id,
          date: formData.date,
          job_site_id: formData.job_site_id || null,
          topic: formData.topic,
          notes: formData.notes,
          total_participants: selectedWorkers?.length || 0,
          total_delegates: delegations?.length || 0,
          assignment_metadata: { participants: selectedWorkers, delegations },
        })
        .select()
        .single();

      if (activityError) throw activityError;

      if (selectedWorkers && selectedWorkers.length > 0) {
        const participantInserts = selectedWorkers.map((p: any) => ({
          activity_id: activity.id,
          worker_id: p.workerId,
          assignment_method: p.method,
          assignment_source_id: p.sourceId,
        }));
        const { error: participantsError } = await supabase
          .from("activity_participants")
          .insert(participantInserts);
        if (participantsError) throw participantsError;
      }

      if (delegations && delegations.length > 0) {
        const delegationInserts = delegations.flatMap((d: any) =>
          d.assignedWorkerIds.map((assignedWorkerId: string) => ({
            activity_id: activity.id,
            delegate_worker_id: d.delegateWorkerId,
            assigned_worker_id: assignedWorkerId,
            assignment_type: d.assignmentType,
            source_activity_id: d.sourceActivityId,
          }))
        );
        if (delegationInserts.length > 0) {
          const { error: delegationsError } = await supabase
            .from("activity_delegations")
            .insert(delegationInserts);
          if (delegationsError) throw delegationsError;
        }
      }

      toast.success("Activity saved with delegations");
      setOpen(false);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to save activity");
    }
  };

  return (
    <main>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Delegate Allocation Wizard</h1>
        <p className="text-sm text-muted-foreground">Plan allocations and save as an activity.</p>
      </header>

      <div className="mb-4">
        <Button onClick={() => setOpen(true)}>Start/Resume Wizard</Button>
      </div>

      <EnhancedActivityCreationDialog
        open={open}
        onOpenChange={setOpen}
        templates={templates || []}
        jobSites={jobSites || []}
        onSubmit={handleSubmit}
        onCustomActivityCreate={() => {}}
      />
    </main>
  );
};

export default Delegations;
