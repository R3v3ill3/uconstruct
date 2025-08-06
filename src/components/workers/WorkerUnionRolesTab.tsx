import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Award, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

const unionRoleSchema = z.object({
  name: z.enum(["site_delegate", "hsr", "shop_steward", "organising_committee"]),
  job_site_id: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  is_senior: z.boolean().default(false),
  gets_paid_time: z.boolean().default(false),
  rating: z.string().optional(),
  experience_level: z.string().optional(),
  notes: z.string().optional(),
});

type UnionRoleFormData = z.infer<typeof unionRoleSchema>;

interface WorkerUnionRolesTabProps {
  workerId: string | null;
  onUpdate: () => void;
}

const unionRoleTypes = [
  { value: "site_delegate", label: "Site Delegate" },
  { value: "hsr", label: "Health & Safety Representative" },
  { value: "shop_steward", label: "Shop Steward" },
  { value: "organising_committee", label: "Organising Committee" },
];

export const WorkerUnionRolesTab = ({ workerId, onUpdate }: WorkerUnionRolesTabProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: unionRoles = [], isLoading } = useQuery({
    queryKey: ["worker-union-roles", workerId],
    queryFn: async () => {
      if (!workerId) return [];
      
      const { data, error } = await supabase
        .from("union_roles")
        .select(`
          *,
          job_sites (
            id,
            name,
            location
          )
        `)
        .eq("worker_id", workerId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!workerId,
  });

  const { data: jobSites = [] } = useQuery({
    queryKey: ["job-sites-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_sites")
        .select("id, name, location")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<UnionRoleFormData>({
    resolver: zodResolver(unionRoleSchema),
    defaultValues: {
      name: "site_delegate",
      job_site_id: "",
      start_date: "",
      end_date: "",
      is_senior: false,
      gets_paid_time: false,
      rating: "",
      experience_level: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: UnionRoleFormData) => {
      const cleanedData = {
        ...data,
        worker_id: workerId,
        job_site_id: data.job_site_id || null,
        end_date: data.end_date || null,
        rating: data.rating || null,
        experience_level: data.experience_level || null,
        notes: data.notes || null,
      };

      const { error } = await supabase
        .from("union_roles")
        .insert(cleanedData);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Union role added",
        description: "Union role has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ["worker-union-roles", workerId] });
      setShowAddDialog(false);
      form.reset();
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add union role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UnionRoleFormData) => {
      const cleanedData = {
        ...data,
        job_site_id: data.job_site_id || null,
        end_date: data.end_date || null,
        rating: data.rating || null,
        experience_level: data.experience_level || null,
        notes: data.notes || null,
      };

      const { error } = await supabase
        .from("union_roles")
        .update(cleanedData)
        .eq("id", editingRole.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Union role updated",
        description: "Union role has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["worker-union-roles", workerId] });
      setEditingRole(null);
      form.reset();
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update union role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("union_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Union role deleted",
        description: "Union role has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["worker-union-roles", workerId] });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete union role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UnionRoleFormData) => {
    if (editingRole) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    form.reset({
      name: role.name,
      job_site_id: role.job_site_id || "",
      start_date: role.start_date,
      end_date: role.end_date || "",
      is_senior: role.is_senior || false,
      gets_paid_time: role.gets_paid_time || false,
      rating: role.rating || "",
      experience_level: role.experience_level || "",
      notes: role.notes || "",
    });
  };

  const getRoleLabel = (name: string) => {
    return unionRoleTypes.find(type => type.value === name)?.label || name;
  };

  const isActiveRole = (role: any) => {
    return !role.end_date || new Date(role.end_date) > new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Union Roles</h3>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading union roles...</div>
      ) : unionRoles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No union roles assigned. Add a role to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {unionRoles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    {getRoleLabel(role.name)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={isActiveRole(role) ? "default" : "secondary"}>
                      {isActiveRole(role) ? "Active" : "Ended"}
                    </Badge>
                    {role.is_senior && (
                      <Badge variant="outline">Senior</Badge>
                    )}
                    {role.gets_paid_time && (
                      <Badge variant="outline">Paid Time</Badge>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleEdit(role)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {role.job_sites && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{role.job_sites.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(role.start_date), "MMM dd, yyyy")}
                      {role.end_date && ` - ${format(new Date(role.end_date), "MMM dd, yyyy")}`}
                    </span>
                  </div>
                  {role.experience_level && (
                    <div>
                      <span className="text-muted-foreground">Experience: </span>
                      <span>{role.experience_level}</span>
                    </div>
                  )}
                  {role.rating && (
                    <div>
                      <span className="text-muted-foreground">Rating: </span>
                      <span>{role.rating}</span>
                    </div>
                  )}
                </div>
                {role.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <p className="text-sm">{role.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={showAddDialog || !!editingRole} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingRole(null);
            form.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Union Role" : "Add New Union Role"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unionRoleTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="job_site_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Site (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job site" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No specific site</SelectItem>
                        {jobSites.map((site) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name} - {site.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_senior"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Senior Role</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gets_paid_time"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Gets Paid Time</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="experienced">Experienced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Excellent, Good" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Additional notes about this role..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingRole(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingRole ? "Update" : "Add"} Role
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};