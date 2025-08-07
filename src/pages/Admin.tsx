import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Shield, Users, UserCheck, UserX, UserPlus, RefreshCw } from "lucide-react";
import { Navigate } from "react-router-dom";
import { InviteUserDialog } from "@/components/admin/InviteUserDialog";
import { RoleHierarchyManager } from "@/components/admin/RoleHierarchyManager";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  scoped_sites: string[];
  scoped_employers: string[];
}

interface Employer {
  id: string;
  name: string;
}

interface JobSite {
  id: string;
  name: string;
  location: string;
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      setUserRole(profile?.role || null);
    };

    checkUserRole();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (usersError) throw usersError;
        setUsers(usersData || []);

        // Fetch employers for scoping
        const { data: employersData, error: employersError } = await supabase
          .from("employers")
          .select("id, name")
          .order("name");

        if (employersError) throw employersError;
        setEmployers(employersData || []);

        // Fetch job sites for scoping
        const { data: sitesData, error: sitesError } = await supabase
          .from("job_sites")
          .select("id, name, location")
          .order("name");

        if (sitesError) throw sitesError;
        setJobSites(sitesData || []);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (userRole === "admin") {
      fetchData();
    }
  }, [userRole, toast]);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      // Mirror into role assignments (non-blocking)
      const assignedBy = user?.id || null;
      if (assignedBy) {
        await supabase.from("user_role_assignments").insert({
          user_id: userId,
          role: newRole,
          assigned_by: assignedBy,
          is_active: true,
          start_date: new Date().toISOString().slice(0,10),
        });
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Success",
        description: "User role updated successfully"
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const updateUserScoping = async (userId: string, scopedSites: string[], scopedEmployers: string[]) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          scoped_sites: scopedSites,
          scoped_employers: scopedEmployers
        })
        .eq("id", userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { 
          ...user, 
          scoped_sites: scopedSites,
          scoped_employers: scopedEmployers 
        } : user
      ));

      toast({
        title: "Success",
        description: "User permissions updated successfully"
      });
    } catch (error) {
      console.error("Error updating user scoping:", error);
      toast({
        title: "Error",
        description: "Failed to update user permissions",
        variant: "destructive"
      });
    }
  };

  const syncUsers = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.rpc('sync_auth_users');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const result = data[0];
        toast({
          title: "Success",
          description: result.message
        });
        
        // Refresh user data
        if (result.synced_count > 0) {
          window.location.reload();
        }
      }
    } catch (error: any) {
      console.error("Error syncing users:", error);
      toast({
        title: "Error",
        description: "Failed to sync users",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const refreshUserData = () => {
    window.location.reload();
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "lead_organiser":
        return "default";
      case "organiser":
        return "default";
      case "delegate":
        return "outline";
      case "viewer":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "lead_organiser":
        return <Users className="h-4 w-4" />;
      case "organiser":
        return <UserCheck className="h-4 w-4" />;
      case "delegate":
        return <UserPlus className="h-4 w-4" />;
      case "viewer":
        return <UserX className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  // Redirect if not admin
  if (!user || userRole === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading user data...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setInviteDialogOpen(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
          <Button 
            variant="outline" 
            onClick={syncUsers} 
            disabled={syncing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync Users
          </Button>
          <Badge variant="destructive" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Administrator
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === "admin").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organisers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === "organiser").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viewers</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === "viewer").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user roles and permissions for the system
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Scoped Access</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name || "No name"}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.role === "organiser" && (
                        <>
                          <div className="text-xs text-muted-foreground">
                            Sites: {user.scoped_sites?.length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Employers: {user.scoped_employers?.length || 0}
                          </div>
                        </>
                      )}
                      {user.role !== "organiser" && (
                        <div className="text-xs text-muted-foreground">Full access</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="lead_organiser">Lead Organiser</SelectItem>
                          <SelectItem value="organiser">Organiser</SelectItem>
                          <SelectItem value="delegate">Delegate</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      {user.role === "organiser" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // For now, just show a toast - could open a dialog for scoping
                            toast({
                              title: "Scoping",
                              description: "Detailed permission scoping coming soon"
                            });
                          }}
                        >
                          Scope
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RoleHierarchyManager users={users} />

      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSuccess={refreshUserData}
      />
    </div>
  );
};

export default Admin;