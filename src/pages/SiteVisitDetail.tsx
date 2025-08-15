import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveDraft, loadDraft, clearDraft } from "@/lib/offlineQueue";
import { WorkerQuickPicker } from "@/components/workers/WorkerQuickPicker";

function DraftKey(svCode: string, section: string) {
	return `sv:${svCode}:draft:${section}`;
}

export default function SiteVisitDetail() {
	const { svCode = "" } = useParams();
	const [activeTab, setActiveTab] = useState("prep");

	const { data: visit } = useQuery({
		queryKey: ["site-visit", svCode],
		enabled: !!svCode,
		queryFn: async () => {
			const { data, error } = await (supabase as any)
				.from("site_visit")
				.select("id, employer_id, job_site_id, objective, estimated_workers_count, outcomes_locked")
				.eq("sv_code", svCode)
				.maybeSingle();
			if (error) throw error;
			return data;
		},
	});

	const [objective, setObjective] = useState("");
	const [estimatedWorkers, setEstimatedWorkers] = useState<number | "">("");

	useEffect(() => {
		if (!visit) return;
		setObjective(visit.objective || "");
		setEstimatedWorkers(visit.estimated_workers_count ?? "");
	}, [visit]);

	// Prep save
	const savePrep = async () => {
		if (!visit) return;
		const { error } = await (supabase as any)
			.from("site_visit")
			.update({ objective, estimated_workers_count: estimatedWorkers === "" ? null : Number(estimatedWorkers) })
			.eq("id", visit.id);
		if (error) return toast.error(error.message);
		toast.success("Saved");
		clearDraft(DraftKey(svCode, "prep"));
	};

	// WHS
	const [whsRating, setWhsRating] = useState("3");
	const [breaches, setBreaches] = useState<{ title: string; notes?: string }[]>([]);

	useEffect(() => {
		const { data: d } = loadDraft<{ objective: string; estimatedWorkers: number | "" }>(DraftKey(svCode, "prep"));
		if (d) {
			setObjective(d.objective || "");
			setEstimatedWorkers(d.estimatedWorkers ?? "");
		}
	}, [svCode]);

	useEffect(() => {
		saveDraft(DraftKey(svCode, "prep"), { objective, estimatedWorkers });
	}, [svCode, objective, estimatedWorkers]);

	const saveWHS = async () => {
		if (!visit) return;
		// Upsert assessment
		const { data: assess, error: aErr } = await (supabase as any)
			.from("whs_assessment")
			.upsert({ site_visit_id: visit.id, rating_code: whsRating })
			.select("id")
			.single();
		if (aErr) return toast.error(aErr.message);
		// Insert breaches
		for (const b of breaches) {
			if (!b.title) continue;
			const { error: bErr } = await (supabase as any)
				.from("whs_breach")
				.insert({ whs_assessment_id: assess.id, title: b.title, notes: b.notes || null, rating_code: whsRating });
			if (bErr) return toast.error(bErr.message);
		}
		toast.success("WHS saved");
		setBreaches([]);
	};

	// Entitlements
	const [ent, setEnt] = useState({
		super_paid: true,
		super_paid_to_fund: true,
		redundancy_contributions_up_to_date: true,
		wages_correct: true,
		eba_allowances_correct: true,
	});

	const saveEntitlements = async () => {
		if (!visit) return;
		const { error } = await (supabase as any)
			.from("entitlements_audit")
			.upsert({ site_visit_id: visit.id, ...ent })
			.select("id")
			.single();
		if (error) return toast.error(error.message);
		toast.success("Entitlements saved");
	};

	// Delegate
	const [delegatePresent, setDelegatePresent] = useState(false);
	const [ratio, setRatio] = useState(8);
	const saveDelegate = async () => {
		if (!visit) return;
		const { data: d, error } = await (supabase as any)
			.from("delegate_assessment")
			.upsert({ site_visit_id: visit.id, present: delegatePresent })
			.select("id")
			.single();
		if (error) return toast.error(error.message);
		const roleRatings = [
			{ role_type_code: "communication", rating_code: "3" },
			{ role_type_code: "recruitment", rating_code: "3" },
		];
		for (const rr of roleRatings) {
			await (supabase as any)
				.from("delegate_role_rating")
				.upsert({ delegate_assessment_id: d.id, ...rr });
		}
		toast.success("Delegate saved");
	};

	// DD attempts
	const [ddWorkerId, setDdWorkerId] = useState<string | null>(null);
	const [ddOutcome, setDdOutcome] = useState("follow_up");
	const saveDD = async () => {
		if (!visit || !ddWorkerId) return;
		const clientId = crypto.randomUUID();
		const payload = {
			site_visit_id: visit.id,
			worker_id: ddWorkerId,
			method_code: "in_person",
			outcome_code: ddOutcome,
			client_generated_id: clientId,
		};
		const { error } = await (supabase as any)
			.from("dd_conversion_attempt")
			.insert(payload);
		if (error) return toast.error(error.message);
		// If converted, offer to update membership immediately
		if (ddOutcome === "converted") {
			const shouldUpdate = confirm("Mark worker membership as Direct Debit active now?");
			if (shouldUpdate) {
				await (supabase as any)
					.from("worker_memberships")
					.upsert({ worker_id: ddWorkerId, payment_method: "direct_debit", dd_status: "active" as any });
			}
		}
		toast.success("DD attempt saved");
		setDdWorkerId(null);
	};

	// Print
	const PrintPreview = () => (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Print Pack Preview</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-muted-foreground">A4, 12.7mm margins. Use your browser Print. QR and sv_code shown on footer.</div>
					<div className="mt-4">
						<Button onClick={() => window.print()}>Print</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);

	if (!visit) return <div className="p-6">Loading...</div>;

	return (
		<div className="p-6">
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="prep">Prep</TabsTrigger>
					<TabsTrigger value="outcome">Outcome</TabsTrigger>
					<TabsTrigger value="print">Print</TabsTrigger>
				</TabsList>
				<TabsContent value="prep">
					<Card>
						<CardHeader>
							<CardTitle>Preparation</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label>Objective</Label>
									<Textarea value={objective} onChange={(e) => setObjective(e.target.value)} />
								</div>
								<div>
									<Label>Estimated workers</Label>
									<Input type="number" min={0} value={estimatedWorkers as any} onChange={(e) => setEstimatedWorkers(e.target.value === "" ? "" : Number(e.target.value))} />
								</div>
							</div>
							<div className="flex gap-3">
								<Button onClick={savePrep} disabled={!!visit.outcomes_locked}>Save</Button>
								<Link to={`/eba`} className="text-sm underline">View EBA tracking</Link>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="outcome">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card>
							<CardHeader><CardTitle>WHS</CardTitle></CardHeader>
							<CardContent className="space-y-3">
								<div>
									<Label>Overall rating (1 worst, 5 best)</Label>
									<select className="border rounded h-10 w-full px-2" value={whsRating} onChange={(e) => setWhsRating(e.target.value)}>
										{["1","2","3","4","5"].map((r) => <option key={r} value={r}>{r}</option>)}
									</select>
								</div>
								<div className="space-y-2">
									<Label>Breaches</Label>
									{breaches.map((b, idx) => (
										<div className="grid grid-cols-2 gap-2" key={idx}>
											<Input placeholder="Title" value={b.title} onChange={(e) => setBreaches((prev) => prev.map((x,i)=> i===idx?{...x, title:e.target.value}:x))} />
											<Input placeholder="Notes" value={b.notes || ""} onChange={(e) => setBreaches((prev) => prev.map((x,i)=> i===idx?{...x, notes:e.target.value}:x))} />
										</div>
									))}
									<Button variant="outline" onClick={() => setBreaches((prev)=> [...prev, { title: "" }])}>Add breach</Button>
								</div>
								<Button onClick={saveWHS} disabled={!!visit.outcomes_locked}>Save WHS</Button>
							</CardContent>
						</Card>
						<Card>
							<CardHeader><CardTitle>Entitlements</CardTitle></CardHeader>
							<CardContent className="space-y-2">
								{Object.entries(ent).map(([k, v]) => (
									<label key={k} className="flex items-center gap-2">
										<input type="checkbox" checked={v} onChange={(e) => setEnt((p)=> ({...p, [k]: e.target.checked}))} />
										<span className="capitalize">{k.replaceAll("_"," ")}</span>
									</label>
								))}
								<div className="p-3 rounded border bg-muted/20 text-sm">
									<strong>CBUS checks</strong> (placeholder): confirm super is paid, correct, and to CBUS. Attach evidence via Attachments.
								</div>
								<Button onClick={saveEntitlements} disabled={!!visit.outcomes_locked}>Save Entitlements</Button>
							</CardContent>
						</Card>
						<Card>
							<CardHeader><CardTitle>Delegate</CardTitle></CardHeader>
							<CardContent className="space-y-3">
								<label className="flex items-center gap-2">
									<input type="checkbox" checked={delegatePresent} onChange={(e)=> setDelegatePresent(e.target.checked)} />
									<span>Delegate present</span>
								</label>
								<Label>Ratio score (10→1)</Label>
								<Input type="number" min={1} max={10} value={ratio} onChange={(e)=> setRatio(Number(e.target.value))} />
								<Button onClick={saveDelegate} disabled={!!visit.outcomes_locked}>Save Delegate</Button>
							</CardContent>
						</Card>
						<Card>
							<CardHeader><CardTitle>Direct Debit</CardTitle></CardHeader>
							<CardContent className="space-y-3">
								<WorkerQuickPicker employerId={visit.employer_id} value={ddWorkerId || ""} onChange={(id) => setDdWorkerId(id)} />
								<div>
									<Label>Outcome</Label>
									<select className="border rounded h-10 w-full px-2" value={ddOutcome} onChange={(e) => setDdOutcome(e.target.value)}>
										<option value="converted">Converted</option>
										<option value="follow_up">Follow up</option>
										<option value="declined">Declined</option>
									</select>
								</div>
								<Button onClick={saveDD} disabled={!ddWorkerId || !!visit.outcomes_locked}>Save Attempt</Button>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
				<TabsContent value="print">
					<PrintPreview />
				</TabsContent>
			</Tabs>
		</div>
	);
}