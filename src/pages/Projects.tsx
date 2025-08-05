import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, MapPin, Calendar, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

type Project = {
  id: string;
  name: string;
  value: number | null;
  proposed_start_date: string | null;
  proposed_finish_date: string | null;
  roe_email: string | null;
  created_at: string;
  main_job_site?: {
    name: string;
    location: string;
  };
  builder?: {
    name: string;
  };
  project_eba_details?: {
    status: 'yes' | 'no' | 'pending';
    registration_number: string | null;
    eba_title: string | null;
    bargaining_status: string | null;
  };
  project_organisers: Array<{
    organiser: {
      first_name: string;
      last_name: string;
      email: string;
    };
  }>;
};

const Projects = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    builder_id: "",
    proposed_start_date: "",
    proposed_finish_date: "",
    roe_email: "",
  });

  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          main_job_site:job_sites!main_job_site_id(name, location),
          builder:employers!builder_id(name),
          project_eba_details(*),
          project_organisers(
            organiser:organisers(first_name, last_name, email)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
  });

  const { data: employers = [] } = useQuery({
    queryKey: ["employers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employers")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: typeof formData) => {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: projectData.name,
          value: projectData.value ? parseFloat(projectData.value) : null,
          builder_id: projectData.builder_id || null,
          proposed_start_date: projectData.proposed_start_date || null,
          proposed_finish_date: projectData.proposed_finish_date || null,
          roe_email: projectData.roe_email || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        value: "",
        builder_id: "",
        proposed_start_date: "",
        proposed_finish_date: "",
        roe_email: "",
      });
      toast.success("Project created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create project: " + error.message);
    },
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "Not specified";
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getEBAStatusBadge = (status: string) => {
    const variants = {
      yes: "default",
      no: "destructive",
      pending: "secondary",
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="p-6">Loading projects...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage construction projects and their details</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new construction project to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Southbank Redevelopment"
                />
              </div>
              
              <div>
                <Label htmlFor="value">Project Value (AUD)</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="e.g., 50000000"
                />
              </div>

              <div>
                <Label htmlFor="builder">Builder</Label>
                <Select value={formData.builder_id} onValueChange={(value) => setFormData(prev => ({ ...prev, builder_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select builder" />
                  </SelectTrigger>
                  <SelectContent>
                    {employers.map((employer) => (
                      <SelectItem key={employer.id} value={employer.id}>
                        {employer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Proposed Start</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.proposed_start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, proposed_start_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="finish_date">Proposed Finish</Label>
                  <Input
                    id="finish_date"
                    type="date"
                    value={formData.proposed_finish_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, proposed_finish_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="roe_email">ROE Email</Label>
                <Input
                  id="roe_email"
                  type="email"
                  value={formData.roe_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, roe_email: e.target.value }))}
                  placeholder="rightofentry@example.com"
                />
              </div>

              <Button 
                onClick={() => createProjectMutation.mutate(formData)}
                disabled={!formData.name || createProjectMutation.isPending}
                className="w-full"
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">Create your first project to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Building2 className="h-4 w-4" />
                      {project.builder?.name || "No builder assigned"}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-muted-foreground">EBA Status</div>
                    {project.project_eba_details ? 
                      getEBAStatusBadge(project.project_eba_details.status) : 
                      <Badge variant="secondary">NOT SET</Badge>
                    }
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Project Value:</span>
                      <span>{formatCurrency(project.value)}</span>
                    </div>
                    
                    {project.main_job_site && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">Main Site:</span>
                        <span>{project.main_job_site.name} ({project.main_job_site.location})</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Timeline:</span>
                      <span>
                        {project.proposed_start_date ? new Date(project.proposed_start_date).toLocaleDateString() : "TBD"} - {" "}
                        {project.proposed_finish_date ? new Date(project.proposed_finish_date).toLocaleDateString() : "TBD"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {project.project_organisers.length > 0 && (
                      <div>
                        <span className="font-semibold block mb-2">Organisers:</span>
                        {project.project_organisers.map((po, index) => (
                          <div key={index} className="text-sm">
                            {po.organiser.first_name} {po.organiser.last_name}
                            {po.organiser.email && (
                              <span className="text-muted-foreground ml-2">({po.organiser.email})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {project.roe_email && (
                      <div>
                        <span className="font-semibold">ROE Email:</span>
                        <span className="ml-2">{project.roe_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;