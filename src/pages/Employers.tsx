import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building, Search, Upload as UploadIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { EmployerDetailModal } from "@/components/employers/EmployerDetailModal";
import { EmployerCard } from "@/components/employers/EmployerCard";
import { TRADE_OPTIONS } from "@/constants/trades";
import { useSearchParams, Link } from "react-router-dom";

// Types
interface EmployerWithEba {
  id: string;
  name: string;
  abn: string | null;
  employer_type: "individual" | "small_contractor" | "large_contractor" | "principal_contractor" | "builder";
  enterprise_agreement_status: boolean | null;
  created_at: string;
  company_eba_records: Array<{
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
  }>;
}

interface ProjectRoleRow {
  project_id: string;
  employer_id: string;
  role: "head_contractor" | "contractor" | "trade_subcontractor" | "builder";
}

const Employers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [ebaStatusFilter, setEbaStatusFilter] = useState("all");
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    abn: "",
    employer_type: "",
    is_builder_tag: false,
    is_head_contractor_tag: false,
    trade_capabilities: [] as string[],
  });

  // Contractor type filter (uses durable tags & trade capabilities)
  const [contractorTypeFilter, setContractorTypeFilter] = useState<string>("all");

  // Project filter state
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProjectRole, setSelectedProjectRole] = useState<"all" | "head_contractor" | "contractor" | "trade_subcontractor">("all");
  const [sortOption, setSortOption] = useState<"none" | "workers_desc" | "members_desc" | "projects_desc" | "eba_expiry_asc">("none");

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const p = searchParams.get("project");
    if (p) setSelectedProjectId(p);
  }, [searchParams]);

  const queryClient = useQueryClient();

  // Employers
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
      return (data ?? []) as EmployerWithEba[];
    },
  });

  // Durable employer role tags (builder/head_contractor)
  const { data: roleTags = [] } = useQuery({
    queryKey: ["employer_role_tags"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("employer_role_tags")
        .select("employer_id, tag");
      if (error) throw error;
      return (data ?? []) as { employer_id: string; tag: "builder" | "head_contractor" }[];
    },
  });

  // Durable trade capabilities
  const { data: tradeCaps = [] } = useQuery({
    queryKey: ["contractor_trade_capabilities"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("contractor_trade_capabilities")
        .select("employer_id, trade_type");
      if (error) throw error;
      return (data ?? []) as { employer_id: string; trade_type: string }[];
    },
  });

  // Projects (for filter)
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", "filter-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  // Project roles view
  const { data: projectRoles = [], isLoading: isProjectRolesLoading } = useQuery({
    queryKey: ["project_roles", selectedProjectId],
    enabled: !!selectedProjectId,
    queryFn: async () => {
      if (!selectedProjectId) return [] as ProjectRoleRow[];
      const { data, error } = await (supabase as any)
        .from("v_project_current_roles")
        .select("project_id, employer_id, role")
        .eq("project_id", selectedProjectId);
      if (error) throw error;
      return (data ?? []) as ProjectRoleRow[];
    },
  });

  // Project site contractors view
  const { data: projectSiteContractors = [] } = useQuery({
    queryKey: ["project_site_contractors", selectedProjectId],
    enabled: !!selectedProjectId,
    queryFn: async () => {
      if (!selectedProjectId) return [] as { employer_id: string }[];
      const { data, error } = await (supabase as any)
        .from("v_project_site_contractors")
        .select("employer_id")
        .eq("project_id", selectedProjectId);
      if (error) throw error;
      return (data ?? []) as { employer_id: string }[];
    },
  });

  // Analytics for sorting
  const { data: employerAnalytics = [] } = useQuery({
    queryKey: ["employer_analytics"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("employer_analytics")
        .select("employer_id, current_worker_count, member_count");
      if (error) throw error;
      return (data ?? []) as { employer_id: string; current_worker_count: number | null; member_count: number | null }[];
    },
  });

  // Project involvement for sorting (distinct project counts per employer)
  const { data: perAll = [] } = useQuery({
    queryKey: ["project_employer_roles", "all-min"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_employer_roles")
        .select("project_id, employer_id");
      if (error) throw error;
      return (data ?? []) as { project_id: string; employer_id: string }[];
    },
  });
  const { data: pctAll = [] } = useQuery({
    queryKey: ["project_contractor_trades", "all-min"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_contractor_trades")
        .select("project_id, employer_id");
      if (error) throw error;
      return (data ?? []) as { project_id: string; employer_id: string }[];
    },
  });

  // Create employer
  const createEmployerMutation = useMutation({
    mutationFn: async (employerData: typeof formData) => {
      const { data, error } = await supabase
        .from("employers")
        .insert({
          name: employerData.name,
          abn: employerData.abn || null,
          employer_type: employerData.employer_type as EmployerWithEba["employer_type"],
        })
        .select()
        .single();
      if (error) throw error;
      const created = data as { id: string };

      // Role tags
      const tagRows: any[] = [];
      if (employerData.is_builder_tag) tagRows.push({ employer_id: created.id, tag: "builder" });
      if (employerData.is_head_contractor_tag) tagRows.push({ employer_id: created.id, tag: "head_contractor" });
      if (tagRows.length > 0) {
        const { error: tagErr } = await (supabase as any)
          .from("employer_role_tags")
          .insert(tagRows);
        if (tagErr) throw tagErr;
      }

      // Trade capabilities
      if (employerData.trade_capabilities.length > 0) {
        const rows = employerData.trade_capabilities.map((t, idx) => ({
          employer_id: created.id,
          trade_type: t,
          is_primary: idx === 0,
        }));
        const { error: capErr } = await (supabase as any)
          .from("contractor_trade_capabilities")
          .insert(rows);
        if (capErr) throw capErr;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employers"] });
      queryClient.invalidateQueries({ queryKey: ["builders"] });
      queryClient.invalidateQueries({ queryKey: ["employer_role_tags"] });
      queryClient.invalidateQueries({ queryKey: ["contractor_trade_capabilities"] });
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        abn: "",
        employer_type: "",
        is_builder_tag: false,
        is_head_contractor_tag: false,
        trade_capabilities: [],
      });
      toast.success("Employer created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create employer: " + (error as Error).message);
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

  // Build map of roles per employer within selected project
  const roleByEmployerId = new Map<string, Array<ProjectRoleRow["role"]>>();
  if (selectedProjectId) {
    for (const row of projectRoles) {
      const arr = roleByEmployerId.get(row.employer_id) ?? [];
      if (!arr.includes(row.role)) arr.push(row.role);
      roleByEmployerId.set(row.employer_id, arr);
    }
    for (const sc of projectSiteContractors) {
      const arr = roleByEmployerId.get(sc.employer_id) ?? [];
      if (!arr.includes("trade_subcontractor")) arr.push("trade_subcontractor");
      roleByEmployerId.set(sc.employer_id, arr);
    }
  }
  // Precompute tag/capability sets
  const builderIds = new Set(roleTags.filter((r) => r.tag === "builder").map((r) => r.employer_id));
  const headContractorIds = new Set(roleTags.filter((r) => r.tag === "head_contractor").map((r) => r.employer_id));
  const tradesByEmployer = new Map<string, Set<string>>();
  for (const c of tradeCaps) {
    const set = tradesByEmployer.get(c.employer_id) ?? new Set<string>();
    set.add(c.trade_type);
    tradesByEmployer.set(c.employer_id, set);
  }
  
  // Precompute contractor ids (head contractor tag OR any trade capability)
  const contractorIds = (() => {
    const s = new Set<string>();
    for (const id of headContractorIds) s.add(id);
    for (const id of tradesByEmployer.keys()) s.add(id);
    return s;
  })();
  
  // Precompute analytics maps for sorting
  const analyticsByEmployer = new Map<string, { workers: number; members: number }>();
  (employerAnalytics as Array<{ employer_id: string; current_worker_count: number | null; member_count: number | null }>).forEach((row) => {
    analyticsByEmployer.set(row.employer_id, {
      workers: Number(row.current_worker_count ?? 0),
      members: Number(row.member_count ?? 0),
    });
  });

  // Distinct project counts per employer
  const projectIdsByEmployer = new Map<string, Set<string>>();
  (perAll as Array<{ project_id: string; employer_id: string }>).forEach((r) => {
    if (!projectIdsByEmployer.has(r.employer_id)) projectIdsByEmployer.set(r.employer_id, new Set<string>());
    projectIdsByEmployer.get(r.employer_id)!.add(r.project_id);
  });
  (pctAll as Array<{ project_id: string; employer_id: string }>).forEach((r) => {
    if (!projectIdsByEmployer.has(r.employer_id)) projectIdsByEmployer.set(r.employer_id, new Set<string>());
    projectIdsByEmployer.get(r.employer_id)!.add(r.project_id);
  });
  const projectCountByEmployer = new Map<string, number>();
  for (const [eid, set] of projectIdsByEmployer) {
    projectCountByEmployer.set(eid, set.size);
  }

  // Earliest EBA expiry per employer (null if none)
  const ebaExpiryByEmployer = new Map<string, Date | null>();
  for (const emp of employers) {
    const dates = (emp.company_eba_records ?? [])
      .map((r) => (r.nominal_expiry_date ? new Date(r.nominal_expiry_date) : null))
      .filter((d): d is Date => !!d && !isNaN(d.getTime()));
    if (dates.length === 0) ebaExpiryByEmployer.set(emp.id, null);
    else ebaExpiryByEmployer.set(emp.id, new Date(Math.min(...dates.map((d) => d.getTime()))));
  }
  
  // Final filtered list
  const filteredEmployers = employers.filter((employer) => {
    let tabMatch = true;
    if (activeTab === "builders") tabMatch = builderIds.has(employer.id);
    else if (activeTab === "contractors") tabMatch = contractorIds.has(employer.id);
    else if (activeTab === "other") tabMatch = employer.employer_type === "individual";

    const q = searchTerm.toLowerCase();
    const searchMatch =
      q === "" ||
      employer.name.toLowerCase().includes(q) ||
      (employer.abn || "").toLowerCase().includes(q) ||
      (employer.company_eba_records?.[0]?.contact_name || "").toLowerCase().includes(q) ||
      (employer.company_eba_records?.[0]?.eba_file_number || "").toLowerCase().includes(q);

    const ebaStatusMatch = ebaStatusFilter === "all" || getEbaStatusForFilter(employer) === ebaStatusFilter;

    let projectRoleMatch = true;
    if (selectedProjectId) {
      const roles = roleByEmployerId.get(employer.id) ?? [];
      if (roles.length === 0) projectRoleMatch = false;
      else if (selectedProjectRole !== "all") projectRoleMatch = roles.includes(selectedProjectRole);
    }

    // New contractor type filter using durable tags + trade capabilities
    const contractorTypeMatch = (() => {
      if (contractorTypeFilter === "all") return true;
      if (contractorTypeFilter === "builder") return builderIds.has(employer.id);
      if (contractorTypeFilter === "head_contractor") return headContractorIds.has(employer.id);
      // Otherwise treat as trade enum
      const tset = tradesByEmployer.get(employer.id);
      return tset?.has(contractorTypeFilter) ?? false;
    })();

    return tabMatch && searchMatch && ebaStatusMatch && projectRoleMatch && contractorTypeMatch;
  });
  
  const sortedEmployers = (() => {
    if (sortOption === "none") return filteredEmployers;
    const arr = [...filteredEmployers];
    arr.sort((a, b) => {
      switch (sortOption) {
        case "workers_desc": {
          const aw = analyticsByEmployer.get(a.id)?.workers ?? 0;
          const bw = analyticsByEmployer.get(b.id)?.workers ?? 0;
          return bw - aw;
        }
        case "members_desc": {
          const am = analyticsByEmployer.get(a.id)?.members ?? 0;
          const bm = analyticsByEmployer.get(b.id)?.members ?? 0;
          return bm - am;
        }
        case "projects_desc": {
          const ap = projectCountByEmployer.get(a.id) ?? 0;
          const bp = projectCountByEmployer.get(b.id) ?? 0;
          return bp - ap;
        }
        case "eba_expiry_asc": {
          const ad = ebaExpiryByEmployer.get(a.id);
          const bd = ebaExpiryByEmployer.get(b.id);
          const at = ad ? ad.getTime() : Number.POSITIVE_INFINITY;
          const bt = bd ? bd.getTime() : Number.POSITIVE_INFINITY;
          return at - bt;
        }
        default:
          return 0;
      }
    });
    return arr;
  })();

  const searchQ = searchTerm.trim().toLowerCase();
  const searchSuggestions = searchQ
    ? employers.filter((e) => e.name.toLowerCase().includes(searchQ)).slice(0, 8)
    : [];

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

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/upload?table=employers">
              <UploadIcon className="h-4 w-4 mr-2" />Upload Employers
            </Link>
          </Button>
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
                <DialogDescription>Add a new employer to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Employer Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., ABC Construction Pty Ltd"
                  />
                </div>

                <div>
                  <Label htmlFor="abn">ABN</Label>
                  <Input
                    id="abn"
                    value={formData.abn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, abn: e.target.value }))}
                    placeholder="e.g., 12 345 678 901"
                  />
                </div>

                <div>
                  <Label htmlFor="employer_type">Employer Type *</Label>
                  <Select
                    value={formData.employer_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, employer_type: value }))}
                  >
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="is_builder_tag"
                      type="checkbox"
                      checked={formData.is_builder_tag}
                      onChange={(e) => setFormData((p) => ({ ...p, is_builder_tag: e.target.checked }))}
                    />
                    <Label htmlFor="is_builder_tag">Tag as Builder</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="is_head_contractor_tag"
                      type="checkbox"
                      checked={formData.is_head_contractor_tag}
                      onChange={(e) => setFormData((p) => ({ ...p, is_head_contractor_tag: e.target.checked }))}
                    />
                    <Label htmlFor="is_head_contractor_tag">Tag as Head Contractor</Label>
                  </div>
                </div>

                <div>
                  <Label>Trade capabilities (optional)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto border rounded p-2">
                    {TRADE_OPTIONS.map((t) => {
                      const checked = formData.trade_capabilities.includes(t.value);
                      return (
                        <label key={t.value} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setFormData((p) => {
                                const set = new Set(p.trade_capabilities);
                                if (e.target.checked) set.add(t.value);
                                else set.delete(t.value);
                                return { ...p, trade_capabilities: Array.from(set) };
                              });
                            }}
                          />
                          {t.label}
                        </label>
                      );
                    })}
                  </div>
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
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search employers by name, ABN, contact, or EBA number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsSearchOpen(false);
            }}
            onBlur={() => setTimeout(() => setIsSearchOpen(false), 100)}
            className="pl-10 h-12 text-base"
          />
          {isSearchOpen && searchQ && searchSuggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-2 rounded-md border bg-popover shadow-md">
              <ul className="max-h-64 overflow-auto py-1">
                {searchSuggestions.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-accent focus:bg-accent focus:outline-none"
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={() => {
                        setSelectedEmployerId(e.id);
                        setIsSearchOpen(false);
                      }}
                    >
                      <div className="font-medium">{e.name}</div>
                      {e.abn ? <div className="text-xs text-muted-foreground">ABN: {e.abn}</div> : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as typeof sortOption)}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sort: Default (A–Z)</SelectItem>
              <SelectItem value="workers_desc">Workers (high → low)</SelectItem>
              <SelectItem value="members_desc">Members (high → low)</SelectItem>
              <SelectItem value="projects_desc">Projects (high → low)</SelectItem>
              <SelectItem value="eba_expiry_asc">EBA expiry (soonest)</SelectItem>
            </SelectContent>
          </Select>

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

          {/* New contractor type filter using durable tags & trades */}
          <Select value={contractorTypeFilter} onValueChange={setContractorTypeFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Filter by Contractor Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contractor Types</SelectItem>
              <SelectItem value="builder">Builder</SelectItem>
              <SelectItem value="head_contractor">Head Contractor</SelectItem>
              {TRADE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  Trade: {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedProjectId || "all"} onValueChange={(v) => setSelectedProjectId(v === "all" ? "" : v)}>
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue placeholder="Filter by Project (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedProjectRole}
            onValueChange={(v) => setSelectedProjectRole(v as "all" | "head_contractor" | "contractor" | "trade_subcontractor")}
            disabled={!selectedProjectId || isProjectRolesLoading}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Filter by Project Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="head_contractor">Head Contractor</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
              <SelectItem value="trade_subcontractor">Trade Sub-contractor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({employers.length})</TabsTrigger>
          <TabsTrigger value="builders">Builders ({employers.filter((e) => builderIds.has(e.id)).length})</TabsTrigger>
          <TabsTrigger value="contractors">
            Contractors ({employers.filter((e) => contractorIds.has(e.id)).length})
          </TabsTrigger>
          <TabsTrigger value="other">Individual ({employers.filter((e) => ["individual"].includes(e.employer_type)).length})</TabsTrigger>
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
              {sortedEmployers.map((employer) => (
                <EmployerCard key={employer.id} employer={employer} onClick={() => setSelectedEmployerId(employer.id)} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EmployerDetailModal employerId={selectedEmployerId} isOpen={!!selectedEmployerId} onClose={() => setSelectedEmployerId(null)} />
    </div>
  );
};

export default Employers;
