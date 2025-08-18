"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabaseBrowser } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WorkerImport from "@/components/upload/WorkerImport";

export const dynamic = "force-dynamic";

function UploadInner() {
  const supabase = supabaseBrowser();
  const { toast } = useToast();
  const sp = useSearchParams();
  const router = useRouter();

  const [selectedEmployer, setSelectedEmployer] = useState<{ id: string; name: string } | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>(sp.get("table") || "");
  const [parsedCSV, setParsedCSV] = useState<any[] | null>(null);
  const [columnMappings, setColumnMappings] = useState<any[]>([]);
  const preSelectedEmployerId = sp.get("employerId");
  const preSelectedEmployerName = sp.get("employerName");

  const { data: employers } = useQuery({
    queryKey: ["employers"],
    queryFn: async () => {
      const { data } = await supabase.from("employers").select("id, name").order("name");
      return (data || []) as { id: string; name: string }[];
    },
  });

  useEffect(() => {
    if (preSelectedEmployerId && preSelectedEmployerName && !selectedEmployer) {
      setSelectedEmployer({ id: preSelectedEmployerId, name: decodeURIComponent(preSelectedEmployerName) });
      setSelectedTable("workers");
    }
  }, [preSelectedEmployerId, preSelectedEmployerName, selectedEmployer]);

  useEffect(() => {
    if (!sp.get("table")) {
      setSelectedEmployer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable]);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const rows = text.split(/\r?\n/).filter(Boolean).map((line) => {
      const parts = line.split(",");
      return { first_name: parts[0] || "", surname: parts[1] || "", mobile_phone: parts[2] || "", email: parts[3] || "", company_name: parts[4] || "" };
    });
    setParsedCSV(rows);
    setColumnMappings(["first_name", "surname", "mobile_phone", "email", "company_name"]);
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Upload</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="grid gap-2 w-60">
              <Label>Table</Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger><SelectValue placeholder="Select a table" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="workers">Workers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <input type="file" accept=".csv" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
            </div>
            <div className="ml-auto">
              <Button variant="outline" onClick={() => { setParsedCSV(null); setSelectedEmployer(preSelectedEmployerId ? selectedEmployer : null); }}>Reset</Button>
            </div>
          </div>
          {selectedTable === "workers" && (
            <div className="grid gap-2 w-96">
              <Label htmlFor="employer-select">Company</Label>
              <Select value={selectedEmployer?.id || ""} onValueChange={(value) => {
                const employer = (employers || []).find((e) => e.id === value);
                if (employer) setSelectedEmployer(employer);
              }}>
                <SelectTrigger id="employer-select"><SelectValue placeholder="Select employer" /></SelectTrigger>
                <SelectContent>
                  {(employers || []).map((e) => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedTable === "workers" && parsedCSV && columnMappings.length > 0 && (
        <WorkerImport csvData={parsedCSV} selectedEmployer={selectedEmployer || undefined} onImportComplete={() => { toast({ title: "Upload complete" }); router.push("/workers"); }} onBack={() => setParsedCSV(null)} />
      )}
    </main>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <UploadInner />
    </Suspense>
  );
}

