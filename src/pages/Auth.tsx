import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [linkConfirmed, setLinkConfirmed] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Handle email links (confirm/magic) by exchanging code or hash for a session
  useEffect(() => {
    const maybeExchange = async () => {
      try {
        const url = new URL(window.location.href);
        const hasCode = url.searchParams.get("code") || url.hash.includes("access_token");
        if (hasCode) {
          await supabase.auth.exchangeCodeForSession(window.location.href);
          setLinkConfirmed("Your link was verified. You are now signed in.");
          navigate("/", { replace: true });
        }
      } catch {}
    };
    maybeExchange();
  }, [navigate]);

  // SEO: set page title
  useEffect(() => {
    document.title = "uConstruct — Sign In / Sign Up";
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign Up Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Confirm your email",
          description:
            "We’ve sent a verification email from uConstruct. Click the link to confirm and you’ll be redirected back to uConstruct.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign In Error",
          description: error.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }

    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Enter your email",
        description: "Please enter your email address first.",
      });
      return;
    }
    try {
      setResending(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) {
        toast({
          variant: "destructive",
          title: "Couldn’t resend email",
          description: error.message,
        });
      } else {
        toast({
          title: "Verification email sent",
          description:
            "We’ve sent a new verification email from uConstruct. Please check your inbox or spam folder.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setResending(false);
    }
  };

  const handleSendMagicLink = async () => {
    if (!email) {
      toast({ title: "Enter your email" });
      return;
    }
    setSendingLink(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) {
        toast({ variant: "destructive", title: "Couldn’t send link", description: error.message });
      } else {
        toast({ title: "Check your email", description: "We’ve emailed you a sign-in link." });
      }
    } finally {
      setSendingLink(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Union Organiser</CardTitle>
          <CardDescription>
            Sign in to access the organising platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkConfirmed && (
            <div className="mb-3 text-sm rounded border border-green-300 bg-green-50 text-green-800 px-3 py-2">
              {linkConfirmed}
            </div>
          )}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <Button type="button" variant="link" className="px-0" onClick={handleResendVerification} disabled={resending || !email}>
                    {resending ? "Resending..." : "Resend verification email"}
                  </Button>
                  <Link to="/auth/reset" className="underline hover:no-underline">Forgot password?</Link>
                </div>
                <div className="pt-2">
                  <Button type="button" variant="outline" className="w-full" onClick={handleSendMagicLink} disabled={sendingLink || !email}>
                    {sendingLink ? "Sending link..." : "Email me a sign-in link"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <Button type="button" variant="link" className="px-0" onClick={handleResendVerification} disabled={resending || !email}>
                    {resending ? "Resending..." : "Resend verification email"}
                  </Button>
                  <Link to="/auth/reset" className="underline hover:no-underline">Forgot password?</Link>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;