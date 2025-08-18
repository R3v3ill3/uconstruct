"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const supabase = supabaseBrowser();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);

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
    </main>
  );
}

