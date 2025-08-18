"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabaseBrowser } from "@/integrations/supabase/client";

type NavItem = { path: string; label: string; roles?: string[] };

const baseItems: NavItem[] = [
  { path: "/", label: "Home" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/projects", label: "Projects" },
  { path: "/employers", label: "Employers" },
  { path: "/workers", label: "Workers" },
  { path: "/upload", label: "Upload" },
  { path: "/unallocated-workspace", label: "Unallocated" },
];

export default function HeaderNav() {
  const supabase = supabaseBrowser();
  const { user, signOut } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { if (!cancelled) setRole(null); return; }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (!cancelled) setRole((data as any)?.role || null);
    })();
    return () => { cancelled = true; };
  }, [supabase, user]);

  const items = useMemo(() => {
    const visible: NavItem[] = [...baseItems];
    if (role === 'organiser' || role === 'lead_organiser' || role === 'admin') {
      // Insert Patch after Home
      visible.splice(1, 0, { path: "/mypatch", label: "Patch" });
      // Show Site Visits
      visible.splice(2, 0, { path: "/site-visits", label: "Site Visits" });
    }
    if (role === 'admin') {
      visible.push({ path: "/admin", label: "Administration" });
    }
    // Viewers/delegates: do not include Site Visits
    if (!(role === 'organiser' || role === 'lead_organiser' || role === 'admin')) {
      return visible.filter(i => i.path !== '/site-visits');
    }
    return visible;
  }, [role]);

  return (
    <nav className="container mx-auto flex items-center gap-4 p-4 text-sm">
      {items.map(it => (
        <Link key={it.path} href={it.path as any}>{it.label}</Link>
      ))}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{user?.email}</span>
        <button onClick={signOut} className="text-xs underline">Sign Out</button>
      </div>
    </nav>
  );
}

