import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkersList } from "@/components/workers/WorkersList";
import { WorkersFilters } from "@/components/workers/WorkersFilters";
import { WorkerForm } from "@/components/workers/WorkerForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Search, Filter, Download, Users, Upload } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface WorkerFilters {
  search: string;
  unionStatus: string[];
  jobSites: string[];
  employmentStatus: string[];
  hasEmail: boolean | null;
  hasMobile: boolean | null;
}

const Workers = () => {
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManualWorkerOpen, setIsManualWorkerOpen] = useState(false);
  const [filters, setFilters] = useState<WorkerFilters>({
    search: "",
    unionStatus: [],
    jobSites: [],
    employmentStatus: [],
    hasEmail: null,
    hasMobile: null,
  });
  const { toast } = useToast();

  const { data: workers, isLoading, refetch } = useQuery({
    queryKey: ["workers", filters],
    queryFn: async () => {
      let query = supabase
        .from("workers")
        .select(`
          *,
          worker_placements(
            id,
            job_title,
            employment_status,
            start_date,
            end_date,
            job_sites(name),
            employers(name)
          )
        `);

      // Apply search filter
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,surname.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Apply union status filter
      if (filters.unionStatus.length > 0) {
        query = query.in("union_membership_status", filters.unionStatus as ("member" | "potential" | "non_member" | "declined")[]);
      }

      // Apply email filter
      if (filters.hasEmail === true) {
        query = query.not("email", "is", null);
      } else if (filters.hasEmail === false) {
        query = query.is("email", null);
      }

      // Apply mobile filter
      if (filters.hasMobile === true) {
        query = query.not("mobile_phone", "is", null);
      } else if (filters.hasMobile === false) {
        query = query.is("mobile_phone", null);
      }

      const { data, error } = await query.order("surname", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const handleExport = () => {
    if (!workers || workers.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no workers matching your current filters.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["First Name", "Surname", "Email", "Mobile", "Union Status", "Current Job Site"];
    const csvContent = [
      headers.join(","),
      ...workers.map(worker => [
        worker.first_name || "",
        worker.surname || "",
        worker.email || "",
        worker.mobile_phone || "",
        worker.union_membership_status || "",
        worker.worker_placements?.[0]?.job_sites?.name || ""
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workers-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `${workers.length} workers exported to CSV.`,
    });
  };

  return (
    <div className="flex h-full w-full">
      {/* Desktop Filters Sidebar */}
      <div className="hidden lg:flex w-80 border-r border-border bg-card">
        <WorkersFilters 
          filters={filters} 
          onFiltersChange={setFilters}
          className="w-full p-6"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Workers</h1>
                <p className="text-sm text-muted-foreground">
                  {workers ? `${workers.length} workers` : "Loading..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Filter Toggle */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filter Workers</SheetTitle>
                  </SheetHeader>
                  <WorkersFilters 
                    filters={filters} 
                    onFiltersChange={setFilters}
                    className="mt-6"
                  />
                </SheetContent>
              </Sheet>

              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Workers
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsManualWorkerOpen(true)}>
                    Manually enter worker details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/upload?table=workers')}>
                    Upload list
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Add Worker
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Worker</DialogTitle>
                  </DialogHeader>
                  <WorkerForm 
                    onSuccess={() => {
                      setIsAddDialogOpen(false);
                      refetch();
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Dialog open={isManualWorkerOpen} onOpenChange={setIsManualWorkerOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Worker</DialogTitle>
                  </DialogHeader>
                  <WorkerForm 
                    onSuccess={() => {
                      setIsManualWorkerOpen(false);
                      refetch();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search workers by name, email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Workers List */}
        <div className="flex-1 overflow-auto">
          <WorkersList 
            workers={workers || []}
            loading={isLoading}
            onWorkerUpdate={refetch}
          />
        </div>
      </div>
    </div>
  );
};

export default Workers;