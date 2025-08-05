import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building, Hammer, Users, Truck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

type Employer = {
  id: string;
  name: string;
  abn: string | null;
  employer_type: "individual" | "small_contractor" | "large_contractor" | "principal_contractor" | "builder";
  enterprise_agreement_status: boolean | null;
  created_at: string;
};

const Employers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    abn: "",
    employer_type: "",
  });

  const queryClient = useQueryClient();

  const { data: employers = [], isLoading } = useQuery({
    queryKey: ["employers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employers")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Employer[];
    },
  });

  const createEmployerMutation = useMutation({
    mutationFn: async (employerData: typeof formData) => {
      const { data, error } = await supabase
        .from("employers")
        .insert({
          name: employerData.name,
          abn: employerData.abn || null,
          employer_type: employerData.employer_type as "individual" | "small_contractor" | "large_contractor" | "principal_contractor" | "builder",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employers"] });
      queryClient.invalidateQueries({ queryKey: ["builders"] });
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        abn: "",
        employer_type: "",
      });
      toast.success("Employer created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create employer: " + error.message);
    },
  });

  const getEmployerTypeIcon = (type: string) => {
    switch (type) {
      case "builder": return <Hammer className="h-4 w-4" />;
      case "principal_contractor": return <Building className="h-4 w-4" />;
      case "large_contractor": return <Users className="h-4 w-4" />;
      case "small_contractor": return <Users className="h-4 w-4" />;
      case "individual": return <Truck className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const getEmployerTypeBadge = (type: string) => {
    const variants = {
      builder: "default",
      principal_contractor: "secondary", 
      large_contractor: "outline",
      small_contractor: "outline",
      individual: "destructive",
    } as const;

    const labels = {
      builder: "Builder",
      principal_contractor: "Principal Contractor",
      large_contractor: "Large Contractor", 
      small_contractor: "Small Contractor",
      individual: "Individual",
    };
    
    return (
      <Badge variant={variants[type as keyof typeof variants] || "secondary"}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const filteredEmployers = employers.filter(employer => {
    if (activeTab === "all") return true;
    if (activeTab === "builders") return employer.employer_type === "builder";
    if (activeTab === "contractors") return ["principal_contractor", "large_contractor", "small_contractor"].includes(employer.employer_type);
    if (activeTab === "other") return ["individual"].includes(employer.employer_type);
    return true;
  });

  if (isLoading) {
    return <div className="p-6">Loading employers...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Employers</h1>
          <p className="text-muted-foreground">Manage builders, contractors, and other employers</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Employer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Employer</DialogTitle>
              <DialogDescription>
                Add a new employer to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Employer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., ABC Construction Pty Ltd"
                />
              </div>
              
              <div>
                <Label htmlFor="abn">ABN</Label>
                <Input
                  id="abn"
                  value={formData.abn}
                  onChange={(e) => setFormData(prev => ({ ...prev, abn: e.target.value }))}
                  placeholder="e.g., 12 345 678 901"
                />
              </div>

              <div>
                <Label htmlFor="employer_type">Employer Type *</Label>
                <Select value={formData.employer_type} onValueChange={(value) => setFormData(prev => ({ ...prev, employer_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="builder">Builder</SelectItem>
                    <SelectItem value="principal_contractor">Principal Contractor</SelectItem>
                    <SelectItem value="large_contractor">Large Contractor</SelectItem>
                    <SelectItem value="small_contractor">Small Contractor</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => createEmployerMutation.mutate(formData)}
                disabled={!formData.name || !formData.employer_type || createEmployerMutation.isPending}
                className="w-full"
              >
                {createEmployerMutation.isPending ? "Creating..." : "Create Employer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({employers.length})</TabsTrigger>
          <TabsTrigger value="builders">Builders ({employers.filter(e => e.employer_type === "builder").length})</TabsTrigger>
          <TabsTrigger value="contractors">Contractors ({employers.filter(e => ["principal_contractor", "large_contractor", "small_contractor"].includes(e.employer_type)).length})</TabsTrigger>
          <TabsTrigger value="other">Individual ({employers.filter(e => ["individual"].includes(e.employer_type)).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredEmployers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No employers found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "all" ? "Create your first employer to get started" : `No ${activeTab} found`}
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEmployers.map((employer) => (
                <Card key={employer.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getEmployerTypeIcon(employer.employer_type)}
                        <div>
                          <CardTitle className="text-lg">{employer.name}</CardTitle>
                          {employer.abn && (
                            <CardDescription className="text-sm">
                              ABN: {employer.abn}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      {getEmployerTypeBadge(employer.employer_type)}
                      {employer.enterprise_agreement_status && (
                        <Badge variant="outline" className="text-xs">
                          EBA
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Employers;