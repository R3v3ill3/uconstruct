import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const setMeta = (title: string, description: string, canonical?: string) => {
  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", description);
  else {
    const m = document.createElement("meta");
    m.name = "description";
    m.content = description;
    document.head.appendChild(m);
  }
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = canonical || window.location.href;
};

const densityBadge = (pct?: number | null) => {
  const v = typeof pct === 'number' ? pct : 0;
  if (v >= 60) return <Badge variant="default">{v}%</Badge>;
  if (v >= 30) return <Badge variant="secondary">{v}%</Badge>;
  return <Badge variant="destructive">{v}%</Badge>;
};

const PatchWall = () => {
  const { user } = useAuth();

  useEffect(() => {
    setMeta(
      "Patch Wall Charts",
      "Colour-coded organisers' patch overview by site and employer.",
      window.location.origin + "/patch/walls"
    );
  }, []);

  const organiserId = user?.id;

  const { data: projects = [] } = useQuery({
    queryKey: ["wall-projects", organiserId],
    enabled: !!organiserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_organisers")
        .select("project_id")
        .eq("organiser_id", organiserId as string);
      if (error) throw error;
      return (data || []).map((d: any) => d.project_id);
    },
  });

  const { data: sites = [] } = useQuery({
    queryKey: ["wall-sites", projects],
    enabled: projects.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_sites")
        .select("id, name, location")
        .in("project_id", projects as string[]);
      if (error) throw error;
      return data || [];
    },
  });

  const siteIds = useMemo(() => (sites || []).map((s: any) => s.id), [sites]);

  const { data: siteEmployers = [] } = useQuery({
    queryKey: ["wall-site-employers", siteIds],
    enabled: siteIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_employers")
        .select(`
          job_site_id,
          employers(id, name, employer_type)
        `)
        .in("job_site_id", siteIds);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ["employer-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employer_analytics")
        .select("employer_id, member_density_percent");
      if (error) throw error;
      return data || [];
    },
  });

  const getDensity = (employerId: string) =>
    (analytics as any[]).find((a) => a.employer_id === employerId)?.member_density_percent as number | undefined;

  return (
    <main>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Patch Wall Charts</h1>
        <p className="text-sm text-muted-foreground">Colour-coded by member density</p>
      </header>

      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>By Worksite</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Member Density</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sites as any[]).flatMap((s) =>
                  (siteEmployers as any[])
                    .filter((se) => se.job_site_id === s.id)
                    .map((se, i) => (
                      <TableRow key={`${s.id}-${se.employers?.id}-${i}`}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{se.employers?.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{se.employers?.employer_type || 'contractor'}</Badge>
                        </TableCell>
                        <TableCell>{densityBadge(getDensity(se.employers?.id))}</TableCell>
                      </TableRow>
                    ))
                )}
                {sites.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No sites in your patch yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>By Employer Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {['builder', 'head_contractor', 'contractor', 'trade_subbie'].map((cat) => {
                const employersInCat = (siteEmployers as any[])
                  .map((se) => se.employers)
                  .filter((e: any) => e && (e.employer_type || 'contractor') === cat);
                const unique = Array.from(new Map(employersInCat.map((e: any) => [e.id, e])).values());
                return (
                  <Card key={cat} className="p-4">
                    <div className="mb-2 font-medium capitalize">{cat.replace('_', ' ')}</div>
                    <div className="flex flex-wrap gap-2">
                      {unique.map((e: any) => (
                        <div key={e.id} className="flex items-center gap-2">
                          <Badge variant="outline">{e.name}</Badge>
                          {densityBadge(getDensity(e.id))}
                        </div>
                      ))}
                      {unique.length === 0 && (
                        <div className="text-sm text-muted-foreground">None</div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default PatchWall;
