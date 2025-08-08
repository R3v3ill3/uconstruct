
import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type EditableProject = {
  id: string;
  name: string;
  value: number | null;
  proposed_start_date: string | null;
  proposed_finish_date: string | null;
  roe_email: string | null;
};

export function EditProjectDialog({
  project,
  triggerText = "Edit",
}: {
  project: EditableProject;
  triggerText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name || "");
  const [value, setValue] = useState(project.value ? String(project.value) : "");
  const [start, setStart] = useState(project.proposed_start_date || "");
  const [finish, setFinish] = useState(project.proposed_finish_date || "");
  const [roeEmail, setRoeEmail] = useState(project.roe_email || "");

  const queryClient = useQueryClient();

  const resetForm = () => {
    setName(project.name || "");
    setValue(project.value ? String(project.value) : "");
    setStart(project.proposed_start_date || "");
    setFinish(project.proposed_finish_date || "");
    setRoeEmail(project.roe_email || "");
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        value: value ? parseFloat(value) : null,
        proposed_start_date: start || null,
        proposed_finish_date: finish || null,
        roe_email: roeEmail ? roeEmail.trim() : null,
      };
      const { error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", project.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Project updated");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
    },
    onError: (err) => {
      toast.error("Failed to update project: " + (err as Error).message);
    },
  });

  const isDisabled = useMemo(() => !name.trim() || updateMutation.isPending, [name, updateMutation.isPending]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">{triggerText}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="proj_name">Project Name</Label>
            <Input id="proj_name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          </div>
          <div>
            <Label htmlFor="proj_value">Project Value (AUD)</Label>
            <Input
              id="proj_value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., 5000000"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="proj_start">Proposed Start</Label>
              <Input id="proj_start" type="date" value={start || ""} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="proj_finish">Proposed Finish</Label>
              <Input id="proj_finish" type="date" value={finish || ""} onChange={(e) => setFinish(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="proj_roe">ROE Email</Label>
            <Input
              id="proj_roe"
              type="email"
              value={roeEmail}
              onChange={(e) => setRoeEmail(e.target.value)}
              placeholder="rightofentry@example.com"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={() => updateMutation.mutate()} disabled={isDisabled}>
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EditProjectDialog;
