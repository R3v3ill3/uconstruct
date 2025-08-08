import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Calendar, Users, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedActivityCreationDialog } from "@/components/activities/EnhancedActivityCreationDialog";
import { toast } from "sonner";

const Activities = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch activities with related data
  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ["union-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("union_activities")
        .select(`
          *,
          job_sites (
            name,
            location
          )
        `)
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch templates for the creation dialog
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

  // Fetch job sites for the creation dialog
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

  const handleActivitySubmit = async ({ formData, selectedWorkers, delegations }: any) => {
    try {
      const { data: activity, error: activityError } = await supabase
        .from("union_activities")
        .insert({
          activity_type: formData.activity_type,
          custom_activity_type: formData.custom_activity_type,
          template_id: formData.template_id,
          date: formData.date,
          job_site_id: formData.job_site_id,
          topic: formData.topic,
          notes: formData.notes,
          total_participants: selectedWorkers?.length || 0,
          total_delegates: delegations?.length || 0,
          assignment_metadata: {
            participants: selectedWorkers,
            delegations,
          },
        })
        .select()
        .single();

      if (activityError) throw activityError;

      if (selectedWorkers && selectedWorkers.length > 0) {
        const participantInserts = selectedWorkers.map((participant: any) => ({
          activity_id: activity.id,
          worker_id: participant.workerId,
          assignment_method: participant.method,
          assignment_source_id: participant.sourceId,
        }));

        const { error: participantsError } = await supabase
          .from("activity_participants")
          .insert(participantInserts);

        if (participantsError) throw participantsError;
      }

      if (delegations && delegations.length > 0) {
        const delegationInserts = delegations.flatMap((delegation: any) =>
          delegation.assignedWorkerIds.map((assignedWorkerId: string) => ({
            activity_id: activity.id,
            delegate_worker_id: delegation.delegateWorkerId,
            assigned_worker_id: assignedWorkerId,
            assignment_type: delegation.assignmentType,
            source_activity_id: delegation.sourceActivityId,
          }))
        );

        if (delegationInserts.length > 0) {
          const { error: delegationsError } = await supabase
            .from("activity_delegations")
            .insert(delegationInserts);

          if (delegationsError) throw delegationsError;
        }
      }

      toast.success("Activity created successfully!");
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating activity:", error);
      toast.error("Failed to create activity. Please try again.");
    }
  };

  const handleCustomActivityCreate = async (name: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from("activity_templates")
        .insert({
          name,
          description,
          category: "custom",
          is_predefined: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Custom activity type created!");
      return data;
    } catch (error) {
      console.error("Error creating custom activity:", error);
      toast.error("Failed to create custom activity type.");
      throw error;
    }
  };

  const getActivityTypeDisplay = (activity: any) => {
    if (activity.activity_type === "custom" && activity.custom_activity_type) {
      return activity.custom_activity_type;
    }
    return activity.activity_type;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "organising": "bg-primary",
      "industrial_action": "bg-destructive",
      "consultation": "bg-secondary",
      "custom": "bg-muted",
    };
    return colors[category as keyof typeof colors] || "bg-muted";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Union Activities</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track union activities, participant assignments, and delegations
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Activity
        </Button>
      </div>

      <div className="grid gap-6">
        {activities && activities.length > 0 ? (
          activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3">
                      <span>{getActivityTypeDisplay(activity)}</span>
                      <Badge className="bg-primary text-white">
                        {activity.activity_type}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {activity.topic && (
                        <span className="font-medium">{activity.topic}</span>
                      )}
                      {activity.job_sites && (
                        <span className="text-muted-foreground ml-2">
                          at {activity.job_sites.name}, {activity.job_sites.location}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{activity.total_participants || 0} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span>{activity.total_delegates || 0} delegates</span>
                  </div>
                </div>
                {activity.notes && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {activity.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No activities found</h3>
                <p className="mb-4">Start by creating your first union activity.</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <EnhancedActivityCreationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        templates={templates || []}
        jobSites={jobSites || []}
        onSubmit={handleActivitySubmit}
        onCustomActivityCreate={handleCustomActivityCreate}
        isLoading={false}
      />
    </div>
  );
};

export default Activities;