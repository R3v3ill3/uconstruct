
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TRADE_OPTIONS } from "@/constants/trades";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

type Employer = { id: string; name: string };

export type TradeAssignment = {
  employer_id: string;
  trade_type: string;
};

export function TradeContractorsManager({
  assignments,
  onChange,
}: {
  assignments: TradeAssignment[];
  onChange: (list: TradeAssignment[]) => void;
}) {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [open, setOpen] = useState(false);
  const [chosenEmployer, setChosenEmployer] = useState("");
  const [chosenTrade, setChosenTrade] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("employers").select("id, name").order("name");
      setEmployers((data ?? []) as Employer[]);
    };
    load();
  }, []);

  const employerName = useMemo(() => {
    const map = new Map(employers.map((e) => [e.id, e.name]));
    return (id: string) => map.get(id) ?? id;
  }, [employers]);

  const addAssignment = () => {
    if (!chosenEmployer || !chosenTrade) return;
    const exists = assignments.some(
      (a) => a.employer_id === chosenEmployer && a.trade_type === chosenTrade
    );
    if (exists) return;
    onChange([...assignments, { employer_id: chosenEmployer, trade_type: chosenTrade }]);
    setChosenEmployer("");
    setChosenTrade("");
    setOpen(false);
  };

  const removeAt = (idx: number) => {
    const copy = [...assignments];
    copy.splice(idx, 1);
    onChange(copy);
  };

  return (
    <div className="space-y-2">
      <Label>Trade contractors</Label>

      <div className="flex flex-wrap gap-2">
        {assignments.map((a, idx) => (
          <Badge key={`${a.employer_id}-${a.trade_type}`} variant="secondary" className="flex items-center gap-1">
            {employerName(a.employer_id)} — {TRADE_OPTIONS.find(t => t.value === a.trade_type)?.label ?? a.trade_type}
            <button onClick={() => removeAt(idx)} className="ml-1 hover:text-destructive" aria-label="Remove">
              <Trash2 className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add trade contractor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add trade contractor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div>
                <Label>Employer</Label>
                <Select value={chosenEmployer} onValueChange={setChosenEmployer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employer" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {employers.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Trade type</Label>
                <Select value={chosenTrade} onValueChange={setChosenTrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {TRADE_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-1">
                <Button onClick={addAssignment}>Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
