import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkerQuickPicker } from "@/components/workers/WorkerQuickPicker";
import { toast } from "sonner";
import { StatusSummary } from "@/components/StatusSummary";

export default function SiteVisitMobile() {
	const { svCode = "" } = useParams();
	const [visit, setVisit] = useState<any>(null);
	const [section, setSection] = useState<"home" | "whs" | "dd">("home");

	useEffect(() => {
		(async () => {
			const { data } = await (supabase as any)
				.from("site_visit")
				.select("id, employer_id, job_site_id, status_code, started_at, completed_at, scheduled_at")
				.eq("sv_code", svCode)
				.maybeSingle();
			setVisit(data);
		})();
	}, [svCode]);

	const [whsRating, setWhsRating] = useState("3");
	const saveWHS = async () => {
		if (!visit) return;
		const { error } = await (supabase as any)
			.from("whs_assessment")
			.upsert({ site_visit_id: visit.id, rating_code: whsRating });
		if (error) return toast.error(error.message);
		toast.success("Saved");
		setSection("home");
	};

	const [ddWorkerId, setDdWorkerId] = useState<string | null>(null);
	const [ddOutcome, setDdOutcome] = useState("follow_up");
	const [ddFollowUpAt, setDdFollowUpAt] = useState<string>("");
	const saveDD = async () => {
		if (!visit || !ddWorkerId) return;
		if (ddOutcome === "follow_up" && !ddFollowUpAt) {
			return toast.error("Follow-up date/time required for follow-up outcome");
		}
		const { error } = await (supabase as any)
			.from("dd_conversion_attempt")
			.insert({
				site_visit_id: visit.id,
				worker_id: ddWorkerId,
				method_code: "in_person",
				outcome_code: ddOutcome,
				follow_up_at: ddOutcome === "follow_up" && ddFollowUpAt ? new Date(ddFollowUpAt).toISOString() : null,
				client_generated_id: crypto.randomUUID(),
			});
		if (error) return toast.error(error.message);
		toast.success("Saved");
		setDdWorkerId(null);
		setSection("home");
	};

	const startVisit = async () => {
		if (!visit) return;
		const { error } = await (supabase as any).from("site_visit").update({ status_code: "in_progress", started_at: new Date().toISOString() }).eq("id", visit.id);
		if (error) return toast.error(error.message);
		const v = { ...visit, status_code: "in_progress", started_at: new Date().toISOString() };
		setVisit(v);
		toast.success("Visit started");
	}
	const completeVisit = async () => {
		if (!visit) return;
		const { error } = await (supabase as any).from("site_visit").update({ status_code: "completed", completed_at: new Date().toISOString(), outcomes_locked: true }).eq("id", visit.id);
		if (error) return toast.error(error.message);
		const v = { ...visit, status_code: "completed", completed_at: new Date().toISOString(), outcomes_locked: true };
		setVisit(v);
		toast.success("Visit completed");
	}
	if (!visit) return <div className="p-4">Loading...</div>;

	return (
		<div className="p-4 space-y-4">
			<div className="text-xs text-muted-foreground">
				<StatusSummary visit={visit} />
			</div>
			{section === "home" && (
				<div className="space-y-3">
					<div className="grid grid-cols-2 gap-3">
						<Button className="h-24" onClick={() => setSection("whs")}>WHS</Button>
						<Button className="h-24" onClick={() => setSection("dd")}>Direct Debit</Button>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<Button variant="outline" onClick={startVisit} disabled={visit?.status_code === "in_progress" || visit?.status_code === "completed"}>Start</Button>
						<Button variant="outline" onClick={completeVisit} disabled={visit?.status_code !== "in_progress"}>Complete</Button>
					</div>
				</div>
			)}
			{section === "whs" && (
				<Card>
					<CardHeader><CardTitle>WHS Quick</CardTitle></CardHeader>
					<CardContent className="space-y-3">
						<Label>Rating (1–5)</Label>
						<select className="border rounded h-10 w-full px-2" value={whsRating} onChange={(e) => setWhsRating(e.target.value)}>
							{["1","2","3","4","5"].map((r) => <option key={r} value={r}>{r}</option>)}
						</select>
						<Button onClick={saveWHS}>Save</Button>
						<Button variant="outline" onClick={() => setSection("home")}>Back</Button>
					</CardContent>
				</Card>
			)}
			{section === "dd" && (
				<Card>
					<CardHeader><CardTitle>DD Quick</CardTitle></CardHeader>
					<CardContent className="space-y-3">
						<WorkerQuickPicker employerId={visit.employer_id} value={ddWorkerId || ""} onChange={(id) => setDdWorkerId(id)} />
						<Label>Outcome</Label>
						<select className="border rounded h-10 w-full px-2" value={ddOutcome} onChange={(e) => setDdOutcome(e.target.value)}>
							<option value="converted">Converted</option>
							<option value="already_on_dd">Already on DD</option>
							<option value="follow_up">Follow up</option>
							<option value="declined">Declined</option>
						</select>
						{ddOutcome === "follow_up" && (
							<div>
								<Label>Follow up at</Label>
								<Input type="datetime-local" value={ddFollowUpAt} onChange={(e) => setDdFollowUpAt(e.target.value)} />
							</div>
						)}
						<Button onClick={saveDD} disabled={!ddWorkerId}>Save</Button>
						<Button variant="outline" onClick={() => setSection("home")}>Back</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}