"use client";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const supabase = getBrowserSupabase();

export function EbaQuickAttach({ siteVisitId }: { siteVisitId: string }) {
  const [link, setLink] = useState("");
  const [ebaId, setEbaId] = useState<string>("");
  const [existing, setExisting] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_visit_eba_snapshot")
        .select("eba_id, document_url")
        .eq("site_visit_id", siteVisitId)
        .maybeSingle();
      setExisting(data);
      setLink((data as any)?.document_url || "");
      setEbaId((data as any)?.eba_id || "");
    })();
  }, [siteVisitId]);

  const save = async () => {
    const { error } = await supabase
      .from("site_visit_eba_snapshot")
      .upsert({ site_visit_id: siteVisitId, eba_id: ebaId || null, document_url: link || null });
    if (error) return toast.error((error as any).message);
    toast.success("EBA link saved");
  };

  return (
    <div className="space-y-2 p-3 rounded border">
      <div className="text-sm font-medium">EBA quick attach</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        <div>
          <Label>EBA record (optional)</Label>
          <Input value={ebaId} onChange={(e) => setEbaId(e.target.value)} placeholder="company_eba_records.id" />
        </div>
        <div>
          <Label>Document URL</Label>
          <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <Button onClick={save} size="sm">Save EBA link</Button>
    </div>
  );
}

