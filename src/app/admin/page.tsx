"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProfileRole } from "@/hooks/useProfileRole";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPage() {
  const supabase = supabaseBrowser();
  const { toast } = useToast();
  const router = useRouter();
  const { role, isLoading } = useProfileRole();
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, role, router]);

  const sendInvite = async () => {
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({ email: inviteEmail, options: { emailRedirectTo: `${window.location.origin}/auth` } });
    setSending(false);
    if (error) return toast({ variant: "destructive", title: "Invite failed", description: error.message });
    toast({ title: "Invite sent", description: "Magic link emailed." });
  };

  const syncUsers = async () => {
    const { error } = await supabase.rpc("sync_auth_users");
    if (error) return toast({ variant: "destructive", title: "Sync failed", description: error.message });
    toast({ title: "Users synced" });
  };

  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users", search],
    enabled: role === "admin",
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_profiles", { _search: search || null, _limit: 100, _offset: 0 });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "organiser" | "lead_organiser" }) => {
      const { error } = await supabase.rpc("admin_update_user_role", { _user_id: userId, _role: role });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast({ title: "Updated" }); },
    onError: (e: any) => { toast({ variant: "destructive", title: "Update failed", description: e?.message || String(e) }); },
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <Card>
        <CardHeader>
          <CardTitle>Invites</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 items-end">
          <div className="grid gap-2 w-80">
            <Label>Email</Label>
            <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <Button onClick={sendInvite} disabled={!inviteEmail || sending}>{sending ? "Sending..." : "Send magic link"}</Button>
          <div className="ml-auto">
            <Button variant="outline" onClick={syncUsers}>Sync users</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="grid gap-2 w-80">
              <Label>Search</Label>
              <Input placeholder="name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}>Refresh</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td className="p-2 text-muted-foreground" colSpan={3}>Loading...</td></tr>
                )}
                {!isLoading && users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-2">{u.full_name || "—"}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">
                      <Select value={u.role} onValueChange={(val) => updateRoleMutation.mutate({ userId: u.id, role: val as any })}>
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="lead_organiser">Lead organiser</SelectItem>
                          <SelectItem value="organiser">Organiser</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {!isLoading && users.length === 0 && (
                  <tr><td className="p-2 text-muted-foreground" colSpan={3}>No users</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

