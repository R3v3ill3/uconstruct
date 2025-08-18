"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
export const dynamic = "force-dynamic";

function AuthInner() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sendingLink, setSendingLink] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Handle OAuth/magic link and recovery
    supabase.auth.exchangeCodeForSession(window.location.href).then(async ({ error }) => {
      if (!error) {
        router.replace("/dashboard");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    router.push("/dashboard");
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    setLoading(false);
    if (error) return toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    toast({ title: "Check your email", description: "We sent a confirmation link." });
  };

  const handleSendMagicLink = async () => {
    setSendingLink(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    setSendingLink(false);
    if (error) return toast({ title: "Magic link failed", description: error.message, variant: "destructive" });
    toast({ title: "Check your email", description: "Magic link sent." });
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{tab === "signin" ? "Sign in" : "Create account"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            {tab === "signin" ? (
              <>
                <Button onClick={handleSignIn} disabled={loading} className="w-full">
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <Button variant="outline" onClick={handleSendMagicLink} disabled={sendingLink || !email} className="w-full">
                  {sendingLink ? "Sending..." : "Send magic link"}
                </Button>
              </>
            ) : (
              <Button onClick={handleSignUp} disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create account"}
              </Button>
            )}
          </div>
          <div className="text-sm">
            <button className="underline" onClick={() => setTab(tab === "signin" ? "signup" : "signin")}>Switch to {tab === "signin" ? "Sign up" : "Sign in"}</button>
            <span className="mx-2">·</span>
            <Link href="/auth/reset" className="underline">Forgot password?</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AuthInner />
    </Suspense>
  );
}

