
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TRADE_OPTIONS } from "@/constants/trades";

const employerTypeOptions = [
  { value: "builder", label: "Builder" },
  { value: "principal_contractor", label: "Principal Contractor" },
  { value: "large_contractor", label: "Contractor (Large)" },
  { value: "small_contractor", label: "Contractor (Small)" },
  { value: "individual", label: "Individual" },
] as const;

type EmployerType = typeof employerTypeOptions[number]["value"];

const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  employer_type: z.enum([
    "builder",
    "principal_contractor",
    "large_contractor",
    "small_contractor",
    "individual",
  ] as [EmployerType, ...EmployerType[]]),
});

export type EmployerEditFormProps = {
  employer: {
    id: string;
    name: string;
    employer_type: string;
  };
  onCancel: () => void;
  onSaved: (updated: { id: string; name: string; employer_type: string }) => void;
};

export default function EmployerEditForm({ employer, onCancel, onSaved }: EmployerEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: employer.name,
      employer_type: employer.employer_type as EmployerType,
    },
  });

  // Load existing durable classification tags and trade capabilities
  const { data: roleTags = [] } = useQuery({
    queryKey: ["employer_role_tags", employer.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("employer_role_tags")
        .select("tag")
        .eq("employer_id", employer.id);
      if (error) throw error;
      return (data ?? []) as { tag: "builder" | "head_contractor" }[];
    },
  });

  const { data: tradeCaps = [] } = useQuery({
    queryKey: ["contractor_trade_capabilities", employer.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("contractor_trade_capabilities")
        .select("trade_type")
        .eq("employer_id", employer.id);
      if (error) throw error;
      return (data ?? []) as { trade_type: string }[];
    },
  });

  // Local state mirrors for editable tags/caps
  const [isBuilder, setIsBuilder] = useState(false);
  const [isHeadContractor, setIsHeadContractor] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);

  useEffect(() => {
    const tags = new Set(roleTags.map((r) => r.tag));
    setIsBuilder(tags.has("builder"));
    setIsHeadContractor(tags.has("head_contractor"));
  }, [roleTags]);

  useEffect(() => {
    setSelectedTrades(tradeCaps.map((c) => c.trade_type));
  }, [tradeCaps]);

  const desiredTags = useMemo(() => {
    const s = new Set<string>();
    if (isBuilder) s.add("builder");
    if (isHeadContractor) s.add("head_contractor");
    return s;
  }, [isBuilder, isHeadContractor]);

  const currentTags = useMemo(() => new Set(roleTags.map((r) => r.tag)), [roleTags]);
  const currentTrades = useMemo(() => new Set(tradeCaps.map((t) => t.trade_type)), [tradeCaps]);
  const desiredTrades = useMemo(() => new Set(selectedTrades), [selectedTrades]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    // Update employer core fields
    const { error, data } = await supabase
      .from("employers")
      .update({
        name: values.name.trim(),
        employer_type: values.employer_type,
      })
      .eq("id", employer.id)
      .select("id, name, employer_type")
      .single();

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }

    // Sync durable role tags
    const toAddTags = Array.from(desiredTags).filter((t) => !currentTags.has(t));
    const toRemoveTags = Array.from(currentTags).filter((t) => !desiredTags.has(t));

    if (toAddTags.length > 0) {
      const { error: tagAddErr } = await (supabase as any)
        .from("employer_role_tags")
        .insert(toAddTags.map((tag) => ({ employer_id: employer.id, tag })));
      if (tagAddErr) {
        toast({ title: "Tag update failed", description: tagAddErr.message, variant: "destructive" });
        return;
      }
    }

    if (toRemoveTags.length > 0) {
      const { error: tagDelErr } = await (supabase as any)
        .from("employer_role_tags")
        .delete()
        .eq("employer_id", employer.id)
        .in("tag", toRemoveTags);
      if (tagDelErr) {
        toast({ title: "Tag update failed", description: tagDelErr.message, variant: "destructive" });
        return;
      }
    }

    // Sync trade capabilities
    const toAddTrades = Array.from(desiredTrades).filter((t) => !currentTrades.has(t));
    const toRemoveTrades = Array.from(currentTrades).filter((t) => !desiredTrades.has(t));

    if (toAddTrades.length > 0) {
      const { error: capAddErr } = await (supabase as any)
        .from("contractor_trade_capabilities")
        .insert(toAddTrades.map((trade_type, idx) => ({ employer_id: employer.id, trade_type, is_primary: idx === 0 })));
      if (capAddErr) {
        toast({ title: "Trade capability update failed", description: capAddErr.message, variant: "destructive" });
        return;
      }
    }

    if (toRemoveTrades.length > 0) {
      const { error: capDelErr } = await (supabase as any)
        .from("contractor_trade_capabilities")
        .delete()
        .eq("employer_id", employer.id)
        .in("trade_type", toRemoveTrades);
      if (capDelErr) {
        toast({ title: "Trade capability update failed", description: capDelErr.message, variant: "destructive" });
        return;
      }
    }

    // Invalidate caches
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["employers"] }),
      queryClient.invalidateQueries({ queryKey: ["employer-detail", employer.id] }),
      queryClient.invalidateQueries({ queryKey: ["employer_role_tags"] }),
      queryClient.invalidateQueries({ queryKey: ["employer_role_tags", employer.id] }),
      queryClient.invalidateQueries({ queryKey: ["contractor_trade_capabilities"] }),
      queryClient.invalidateQueries({ queryKey: ["contractor_trade_capabilities", employer.id] }),
    ]);

    toast({ title: "Employer updated", description: "Changes saved successfully." });
    onSaved(data as { id: string; name: string; employer_type: string });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employer_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employerTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Durable classification tags */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Classification Tags</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isBuilder}
                  onChange={(e) => setIsBuilder(e.target.checked)}
                />
                Builder
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isHeadContractor}
                  onChange={(e) => setIsHeadContractor(e.target.checked)}
                />
                Head Contractor
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              These tags are also added automatically when this employer is assigned to these roles on any project.
            </p>
          </div>

          {/* Trade capabilities */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Trade Capabilities</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-auto border rounded p-2">
              {TRADE_OPTIONS.map((t) => {
                const checked = selectedTrades.includes(t.value);
                return (
                  <label key={t.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedTrades((prev) => {
                          const set = new Set(prev);
                          if (e.target.checked) set.add(t.value);
                          else set.delete(t.value);
                          return Array.from(set);
                        });
                      }}
                    />
                    {t.label}
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Trades are also added automatically when this employer is assigned to matching trade roles on projects.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
