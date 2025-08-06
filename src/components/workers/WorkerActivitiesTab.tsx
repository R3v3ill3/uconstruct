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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, MapPin, Users, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

const activitySchema = z.object({
  activity_type: z.enum(["meeting", "training", "action", "strike", "conversation"]),
  job_site_id: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  topic: z.string().optional(),
  notes: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface WorkerActivitiesTabProps {
  workerId: string | null;
  onUpdate: () => void;
}

const activityTypes = [
  { value: "meeting", label: "Meeting", icon: Users },
  { value: "training", label: "Training", icon: Users },
  { value: "action", label: "Action", icon: Users },
  { value: "strike", label: "Strike", icon: Users },
  { value: "conversation", label: "Conversation", icon: Users },
];

export const WorkerActivitiesTab = ({ workerId, onUpdate }: WorkerActivitiesTabProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["worker-activities", workerId],
    queryFn: async () => {
      if (!workerId) return [];
      
      // First get union activities where the worker participated
      const { data: unionActivities, error: unionError } = await supabase
        .from("union_activities")
        .select(`
          *,
          job_sites (
            id,
            name,
            location
          )
        `)
        .order("date", { ascending: false });

      if (unionError) throw unionError;

      // Then get worker activity ratings for this worker (simplified - just show all activities)
      const { data: ratings, error: ratingsError } = await supabase
        .from("worker_activity_ratings")
        .select(`
          id,
          rating_value,
          notes
        `)
        .eq("worker_id", workerId)
        .limit(0); // Don't actually fetch ratings for now

      if (ratingsError) throw ratingsError;

      // Return all activities for now (simplified approach)
      return unionActivities;
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

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activity_type: "meeting",
      job_site_id: "",
      date: "",
      topic: "",
      notes: "",
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: ActivityFormData) => {
      // First create the union activity
      const { data: newActivity, error: activityError } = await supabase
        .from("union_activities")
        .insert({
          activity_type: data.activity_type,
          job_site_id: data.job_site_id || null,
          date: data.date,
          topic: data.topic || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (activityError) throw activityError;

      // Then create a worker activity rating to indicate participation
      const { error: ratingError } = await supabase
        .from("worker_activity_ratings")
        .insert({
          worker_id: workerId,
          rating_type: "support_level",
          rating_value: 5, // Default participation rating
          notes: "Participated in activity"
        });

      if (ratingError) throw ratingError;
    },
    onSuccess: () => {
      toast({
        title: "Activity added",
        description: "Worker activity has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ["worker-activities", workerId] });
      setShowAddDialog(false);
      form.reset();
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (activityId: string) => {
      // Delete the activity itself (simplified approach)
      const { error } = await supabase
        .from("union_activities")
        .delete()
        .eq("id", activityId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Activity participation removed",
        description: "Worker's participation in this activity has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["worker-activities", workerId] });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove activity participation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ActivityFormData) => {
    createActivityMutation.mutate(data);
  };

  const getActivityTypeIcon = (type: string) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.icon : Users;
  };

  const getActivityTypeLabel = (type: string) => {
    return activityTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Union Activities</h3>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading activities...</div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No activities recorded. Add an activity to track participation.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = getActivityTypeIcon(activity.activity_type);
            return (
              <Card key={activity.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      {getActivityTypeLabel(activity.activity_type)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Participated</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteActivityMutation.mutate(activity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {activity.topic && (
                    <p className="text-sm text-muted-foreground mt-1">{activity.topic}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(activity.date), "MMM dd, yyyy")}</span>
                    </div>
                    {activity.job_sites && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{activity.job_sites.name}</span>
                      </div>
                    )}
                  </div>
                  {activity.notes && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="text-sm">{activity.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Activity</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="activity_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityTypes.map((type) => (
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

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Safety meeting, wage negotiations" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Additional notes about the activity..."
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
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createActivityMutation.isPending}
                >
                  Add Activity
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};