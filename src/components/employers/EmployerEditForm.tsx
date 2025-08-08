import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
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

    // Invalidate caches
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["employers"] }),
      queryClient.invalidateQueries({ queryKey: ["employer-detail", employer.id] }),
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
