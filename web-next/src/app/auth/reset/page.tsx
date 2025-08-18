"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export const dynamic = "force-dynamic";

function PasswordResetInner() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const { toast } = useToast();

  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.href).then(async () => {
      const { data } = await supabase.auth.getSession();
      setHasRecoverySession(!!data.session);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset` });
    setSubmitting(false);
    if (error) return toast({ variant: "destructive", title: "Couldn’t send reset email", description: error.message });
    toast({ title: "Check your email", description: "We sent a link to reset your password." });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) return toast({ variant: "destructive", title: "Password too short", description: "Use at least 8 characters." });
    if (newPassword !== confirmPassword) return toast({ variant: "destructive", title: "Passwords do not match" });
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSubmitting(false);
    if (error) return toast({ variant: "destructive", title: "Couldn’t update password", description: error.message });
    toast({ title: "Password updated", description: "You’re signed in." });
    router.push("/dashboard");
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasRecoverySession ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <Button type="submit">{submitting ? "Updating..." : "Update Password"}</Button>
            </form>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit">{submitting ? "Sending..." : "Send reset link"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <PasswordResetInner />
    </Suspense>
  );
}

