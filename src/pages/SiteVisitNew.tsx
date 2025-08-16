import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SingleEmployerPicker } from "@/components/projects/SingleEmployerPicker";

export default function SiteVisitNew() {
	const navigate = useNavigate();
	const [employerId, setEmployerId] = useState("");
	const [jobSiteId, setJobSiteId] = useState("");
	const [scheduledAt, setScheduledAt] = useState<string>("");
	const [objective, setObjective] = useState("");
	const [estimatedWorkers, setEstimatedWorkers] = useState<number | "">("");

	const { data: sites = [] } = useQuery({
		queryKey: ["sites-by-employer", employerId],
		enabled: !!employerId,
		queryFn: async () => {
			// Fetch sites where organiser has access; fallback to all sites if no join exists
			const { data, error } = await (supabase as any)
				.from("job_sites")
				.select("id, name, location")
				.order("created_at", { ascending: false });
			if (error) throw error;
			return data || [];
		},
	});

	const canCreate = useMemo(() => employerId && jobSiteId, [employerId, jobSiteId]);

	const createVisit = async () => {
		const svCode = Math.random().toString(36).slice(2, 8).toUpperCase();
		const payload: any = {
			employer_id: employerId,
			job_site_id: jobSiteId,
			objective: objective || null,
			sv_code: svCode,
			estimated_workers_count: typeof estimatedWorkers === "number" ? estimatedWorkers : null,
		};
		if (scheduledAt) {
			const sched = new Date(scheduledAt).getTime();
			if (sched < Date.now()) {
				alert("Scheduled time must be in the future");
				return;
			}
			payload.scheduled_at = new Date(scheduledAt).toISOString();
		}
		const { data, error } = await (supabase as any)
			.from("site_visit")
			.insert(payload)
			.select("id, sv_code")
			.single();
		if (error) {
			alert(error.message);
			return;
		}
		navigate(`/site-visits/${(data as any).sv_code}`);
	};

	return (
		<div className="p-6">
			<Card>
				<CardHeader>
					<CardTitle>Plan a Site Visit</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<SingleEmployerPicker label="Employer" selectedId={employerId} onChange={setEmployerId} />
						</div>
						<div>
							<Label>Job Site</Label>
							<select className="border rounded h-10 w-full px-2" value={jobSiteId} onChange={(e) => setJobSiteId(e.target.value)}>
								<option value="">Select site</option>
								{(sites as any[]).map((s) => (
									<option key={s.id} value={s.id}>{s.name || s.location || s.id}</option>
								))}
							</select>
						</div>
						<div>
							<Label>Scheduled Date/Time</Label>
							<Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
						</div>
						<div>
							<Label>Objective</Label>
							<Input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Optional objective" />
						</div>
						<div>
							<Label>Estimated workers</Label>
							<Input type="number" min={0} value={estimatedWorkers as any} onChange={(e) => setEstimatedWorkers(e.target.value === "" ? "" : Number(e.target.value))} />
						</div>
					</div>
					<div className="flex gap-3">
						<Button onClick={createVisit} disabled={!canCreate}>Create Visit</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}