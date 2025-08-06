import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { EmployerDetailModal } from "@/components/employers/EmployerDetailModal";
import { EmployerCard } from "@/components/employers/EmployerCard";

type EmployerWithEba = {
  id: string;
  name: string;
  abn: string | null;
  employer_type: "individual" | "small_contractor" | "large_contractor" | "principal_contractor" | "builder";
  enterprise_agreement_status: boolean | null;
  created_at: string;
  company_eba_records: {
    id: string;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    eba_file_number: string | null;
    fwc_document_url: string | null;
    eba_lodged_fwc: string | null;
    date_eba_signed: string | null;
    fwc_certified_date: string | null;
    nominal_expiry_date: string | null;
    sector: string | null;
  }[];
};

const Employers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [ebaStatusFilter, setEbaStatusFilter] = useState("all");
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(null);
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
        .select(`
          *,
          company_eba_records (
            id,
            contact_name,
            contact_phone,
            contact_email,
            eba_file_number,
            fwc_document_url,
            eba_lodged_fwc,
            date_eba_signed,
            fwc_certified_date,
            nominal_expiry_date,
            sector
          )
        `)
        .order("name");

      if (error) throw error;
      return data as EmployerWithEba[];
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

  const getEbaStatusForFilter = (employer: EmployerWithEba) => {
    const ebaRecord = employer.company_eba_records?.[0];
    if (!ebaRecord) return "no_eba";
    
    if (ebaRecord.fwc_certified_date) return "certified";
    if (ebaRecord.date_eba_signed) return "signed";
    if (ebaRecord.eba_lodged_fwc) return "lodged";
    return "in_progress";
  };

  const filteredEmployers = employers.filter(employer => {
    // Filter by tab
    let tabMatch = true;
    if (activeTab === "builders") tabMatch = employer.employer_type === "builder";
    else if (activeTab === "contractors") tabMatch = ["principal_contractor", "large_contractor", "small_contractor"].includes(employer.employer_type);
    else if (activeTab === "other") tabMatch = ["individual"].includes(employer.employer_type);
    
    // Filter by search term
    const searchMatch = searchTerm === "" || 
      employer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.abn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.company_eba_records?.[0]?.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.company_eba_records?.[0]?.eba_file_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by EBA status
    const ebaStatusMatch = ebaStatusFilter === "all" || getEbaStatusForFilter(employer) === ebaStatusFilter;
    
    return tabMatch && searchMatch && ebaStatusMatch;
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

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search employers by name, ABN, contact, or EBA number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={ebaStatusFilter} onValueChange={setEbaStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by EBA status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All EBA Status</SelectItem>
            <SelectItem value="certified">Certified</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="lodged">Lodged with FWC</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="no_eba">No EBA</SelectItem>
          </SelectContent>
        </Select>
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
                <EmployerCard
                  key={employer.id}
                  employer={employer}
                  onClick={() => setSelectedEmployerId(employer.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EmployerDetailModal
        employerId={selectedEmployerId}
        isOpen={!!selectedEmployerId}
        onClose={() => setSelectedEmployerId(null)}
      />
    </div>
  );
};

export default Employers;