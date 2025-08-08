import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Trash2 } from "lucide-react";

interface PendingUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
  invited_at: string | null;
}

export const PendingUsersTable = () => {
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pending_users")
        .select("id,email,full_name,role,status,created_at,invited_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPending(data || []);
    } catch (err) {
      console.error("Failed to load pending users", err);
      toast({ title: "Error", description: "Failed to load draft users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendInvite = async (row: PendingUser) => {
    setInvitingId(row.id);
    try {
      // Send Magic Link to the user's email
      const redirectUrl = `${window.location.origin}/`;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: row.email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
          data: { role: row.role, full_name: row.full_name || row.email.split("@")[0] },
        },
      });
      if (otpError) throw otpError;

      // Mark pending user as invited
      await supabase
        .from("pending_users")
        .update({ status: "invited", invited_at: new Date().toISOString() })
        .eq("id", row.id);

      toast({ title: "Invitation sent", description: `Invitation sent to ${row.email}` });
      load();
    } catch (err: any) {
      console.error("Invite error", err);
      toast({ title: "Error", description: err.message || "Failed to send invite", variant: "destructive" });
    } finally {
      setInvitingId(null);
    }
  };

  const removeDraft = async (row: PendingUser) => {
    try {
      const { error } = await supabase.from("pending_users").delete().eq("id", row.id);
      if (error) throw error;
      toast({ title: "Draft removed", description: `${row.email} was removed.` });
      setPending((prev) => prev.filter((p) => p.id !== row.id));
    } catch (err: any) {
      console.error("Delete draft error", err);
      toast({ title: "Error", description: err.message || "Failed to remove draft", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft Users</CardTitle>
        <CardDescription>Create and manage draft users before sending invitations.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading drafts...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No draft users yet.
                  </TableCell>
                </TableRow>
              )}
              {pending.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.full_name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={row.role === "admin" ? "destructive" : row.role === "viewer" ? "secondary" : "default"}>
                      {row.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status === "draft" ? "secondary" : row.status === "invited" ? "default" : "outline"}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => sendInvite(row)} disabled={invitingId === row.id}>
                        {invitingId === row.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" /> Invite
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeDraft(row)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
