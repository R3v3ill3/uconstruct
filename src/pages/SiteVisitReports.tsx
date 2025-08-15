import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Rectangle, XAxis, YAxis } from "recharts";

export default function SiteVisitReports() {
	const { data: visits = [] } = useQuery({
		queryKey: ["visit-outcomes"],
		queryFn: async () => {
			const { data, error } = await (supabase as any)
				.from("visit_compliance_summary")
				.select("site_visit_id, overall_score, classification_code")
				.order("site_visit_id", { ascending: false })
				.limit(200);
			if (error) throw error;
			return data || [];
		},
	});

	const { data: dd = [] } = useQuery({
		queryKey: ["dd-funnel"],
		queryFn: async () => {
			const { data, error } = await (supabase as any)
				.from("dd_conversion_attempt")
				.select("outcome_code")
				.limit(1000);
			if (error) throw error;
			return data || [];
		},
	});

	const funnel = useMemo(() => {
		const total = dd.length;
		const converted = dd.filter((x: any) => x.outcome_code === "converted").length;
		const followUp = dd.filter((x: any) => x.outcome_code === "follow_up").length;
		const declined = dd.filter((x: any) => x.outcome_code === "declined").length;
		return [
			{ stage: "Attempts", value: total },
			{ stage: "Follow up", value: followUp },
			{ stage: "Converted", value: converted },
			{ stage: "Declined", value: declined },
		];
	}, [dd]);

	const { data: heat = [] } = useQuery({
		queryKey: ["site-heat"],
		queryFn: async () => {
			const { data, error } = await (supabase as any)
				.from("visit_compliance_summary")
				.select("classification_code")
				.limit(1000);
			if (error) throw error;
			return data || [];
		},
	});

	const heatBuckets = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const r of heat as any[]) {
			counts[r.classification_code || "unknown"] = (counts[r.classification_code || "unknown"] || 0) + 1;
		}
		return Object.entries(counts).map(([k, v]) => ({ label: k, value: v }));
	}, [heat]);

	return (
		<div className="p-6 space-y-6">
			<Card>
				<CardHeader><CardTitle>Visit outcomes</CardTitle></CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr>
									<th className="text-left p-2">Visit</th>
									<th className="text-left p-2">Score</th>
									<th className="text-left p-2">Classification</th>
								</tr>
							</thead>
							<tbody>
								{(visits as any[]).map((v) => (
									<tr key={v.site_visit_id} className="border-t">
										<td className="p-2">{v.site_visit_id}</td>
										<td className="p-2">{v.overall_score?.toFixed?.(1) ?? "-"}</td>
										<td className="p-2">{v.classification_code || "-"}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle>DD conversion funnel</CardTitle></CardHeader>
				<CardContent>
					<ChartContainer config={{ attempts: { label: "Attempts", color: "hsl(215 100% 50%)" } }}>
						<BarChart data={funnel}>
							<CartesianGrid vertical={false} />
							<XAxis dataKey="stage" tickLine={false} axisLine={false} />
							<YAxis allowDecimals={false} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<Bar dataKey="value" fill="var(--color-attempts)" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle>Compliance heatmap (by classification)</CardTitle></CardHeader>
				<CardContent>
					<ChartContainer config={{ a: { color: "hsl(150 70% 40%)" }, b: { color: "hsl(40 80% 50%)" }, c: { color: "hsl(0 80% 50%)" } }}>
						<BarChart data={heatBuckets}>
							<CartesianGrid vertical={false} />
							<XAxis dataKey="label" tickLine={false} axisLine={false} />
							<YAxis allowDecimals={false} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<Bar dataKey="value" fill="var(--color-a)" radius={[4,4,0,0]} />
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>
		</div>
	);
}