import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Users, Search, Building, MapPin, Mail, Phone, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UnallocatedWorker {
  id: string;
  first_name: string;
  surname: string;
  member_number: string | null;
  union_membership_status: string;
  email: string | null;
  mobile_phone: string | null;
  allocation_status: 'no_employer' | 'no_job_site' | 'allocated';
  employer_id: string | null;
  job_site_id: string | null;
  employer_name: string | null;
  job_site_name: string | null;
}

export function UnallocatedWorkspace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch unallocated workers
  const { data: unallocatedWorkers = [], isLoading } = useQuery({
    queryKey: ['unallocated-workers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unallocated_workers_analysis')
        .select('*')
        .order('surname', { ascending: true });
      
      if (error) throw error;
      return data as UnallocatedWorker[];
    },
  });

  // Fetch employers for assignment
  const { data: employers = [] } = useQuery({
    queryKey: ['employers-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employers')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch job sites for assignment
  const { data: jobSites = [] } = useQuery({
    queryKey: ['job-sites-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_sites')
        .select('id, name, location')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Filter workers based on search and filters
  const filteredWorkers = unallocatedWorkers.filter(worker => {
    const matchesSearch = searchTerm === "" || 
      `${worker.first_name} ${worker.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.member_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || worker.allocation_status === statusFilter;
    const matchesMembership = membershipFilter === "all" || worker.union_membership_status === membershipFilter;

    return matchesSearch && matchesStatus && matchesMembership;
  });

  // Group workers by allocation status
  const workersByStatus = {
    no_employer: filteredWorkers.filter(w => w.allocation_status === 'no_employer'),
    no_job_site: filteredWorkers.filter(w => w.allocation_status === 'no_job_site'),
    all: filteredWorkers,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'no_employer':
        return <Badge variant="destructive">No Employer</Badge>;
      case 'no_job_site':
        return <Badge variant="outline">No Job Site</Badge>;
      default:
        return <Badge variant="secondary">Allocated</Badge>;
    }
  };

  const getMembershipBadge = (status: string) => {
    switch (status) {
      case 'member':
        return <Badge variant="default">Member</Badge>;
      case 'non_member':
        return <Badge variant="secondary">Non-Member</Badge>;
      case 'potential_member':
        return <Badge variant="outline">Potential</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const WorkerTable = ({ workers }: { workers: UnallocatedWorker[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Member #</TableHead>
          <TableHead>Membership</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Current Assignment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workers.map((worker) => (
          <TableRow key={worker.id}>
            <TableCell>
              <div className="font-medium">{worker.first_name} {worker.surname}</div>
            </TableCell>
            <TableCell>
              {worker.member_number ? (
                <Badge variant="outline">{worker.member_number}</Badge>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>{getMembershipBadge(worker.union_membership_status)}</TableCell>
            <TableCell>
              <div className="space-y-1 text-sm">
                {worker.email && (
                  <div className="flex items-center gap-1">
                    <Mail size={12} />
                    <span className="truncate max-w-32">{worker.email}</span>
                  </div>
                )}
                {worker.mobile_phone && (
                  <div className="flex items-center gap-1">
                    <Phone size={12} />
                    <span>{worker.mobile_phone}</span>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1 text-sm">
                {worker.employer_name && (
                  <div className="flex items-center gap-1">
                    <Building size={12} />
                    <span className="truncate max-w-32">{worker.employer_name}</span>
                  </div>
                )}
                {worker.job_site_name && (
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span className="truncate max-w-32">{worker.job_site_name}</span>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(worker.allocation_status)}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Assign
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading unallocated workers...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Unallocated Workers</h1>
            <p className="text-muted-foreground mt-2">
              Manage workers who are missing employer or job site assignments
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Employer</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workersByStatus.no_employer.length}</div>
              <p className="text-xs text-muted-foreground">
                Workers without employer assignment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Job Site</CardTitle>
              <MapPin className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workersByStatus.no_job_site.length}</div>
              <p className="text-xs text-muted-foreground">
                Workers without job site assignment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Unallocated</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredWorkers.length}</div>
              <p className="text-xs text-muted-foreground">
                All workers needing assignment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter size={16} />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or member number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Allocation Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="no_employer">No Employer</SelectItem>
                    <SelectItem value="no_job_site">No Job Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Membership Status</label>
                <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="member">Members</SelectItem>
                    <SelectItem value="non_member">Non-Members</SelectItem>
                    <SelectItem value="potential_member">Potential Members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workers Tables */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All Unallocated ({workersByStatus.all.length})
            </TabsTrigger>
            <TabsTrigger value="no_employer">
              No Employer ({workersByStatus.no_employer.length})
            </TabsTrigger>
            <TabsTrigger value="no_job_site">
              No Job Site ({workersByStatus.no_job_site.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Unallocated Workers</CardTitle>
              </CardHeader>
              <CardContent>
                {workersByStatus.all.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No unallocated workers found</h3>
                    <p className="text-muted-foreground">
                      All workers are properly assigned to employers and job sites.
                    </p>
                  </div>
                ) : (
                  <WorkerTable workers={workersByStatus.all} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="no_employer">
            <Card>
              <CardHeader>
                <CardTitle>Workers Without Employer</CardTitle>
              </CardHeader>
              <CardContent>
                {workersByStatus.no_employer.length === 0 ? (
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No workers without employers</h3>
                    <p className="text-muted-foreground">
                      All workers have been assigned to employers.
                    </p>
                  </div>
                ) : (
                  <WorkerTable workers={workersByStatus.no_employer} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="no_job_site">
            <Card>
              <CardHeader>
                <CardTitle>Workers Without Job Site</CardTitle>
              </CardHeader>
              <CardContent>
                {workersByStatus.no_job_site.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No workers without job sites</h3>
                    <p className="text-muted-foreground">
                      All workers have been assigned to job sites.
                    </p>
                  </div>
                ) : (
                  <WorkerTable workers={workersByStatus.no_job_site} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}