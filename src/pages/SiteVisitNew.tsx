import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { JobSiteEmployerManager } from "@/components/employers/JobSiteEmployerManager";

export default function SiteVisitNew() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { toast } = useToast();
	const [jobSiteId, setJobSiteId] = useState("");
	const [selectedEmployerIds, setSelectedEmployerIds] = useState<string[]>([]);
	const [scheduledAt, setScheduledAt] = useState<string>("");
	const [objective, setObjective] = useState("");
	const [estimatedWorkers, setEstimatedWorkers] = useState<number | "">("");
	const [isCreating, setIsCreating] = useState(false);

	// Check user role on mount
	const { data: userProfile } = useQuery({
		queryKey: ["user-profile", user?.id],
		enabled: !!user?.id,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("role")
				.eq("id", user!.id)
				.single();
			if (error) throw error;
			return data;
		},
	});

	// Check if user has permission to create site visits
	const canAccessFeature = userProfile?.role && ['admin', 'organiser', 'lead_organiser'].includes(userProfile.role);

	// Redirect if user doesn't have permission
	useEffect(() => {
		if (userProfile && !canAccessFeature) {
			toast({
				title: "Access Denied",
				description: "You don't have permission to create site visits.",
				variant: "destructive",
			});
			navigate("/");
		}
	}, [userProfile, canAccessFeature, navigate, toast]);

	// Load all job sites
	const { data: allJobSites = [] } = useQuery({
		queryKey: ["all-job-sites"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("job_sites")
				.select("id, name, location, project:projects(name)")
				.order("created_at", { ascending: false });
			
			if (error) throw error;
			return data || [];
		},
	});

	// Auto-select employers when job site changes
	useEffect(() => {
		if (!jobSiteId) {
			setSelectedEmployerIds([]);
			return;
		}

		const loadEmployersForJobSite = async () => {
			try {
				// Get employers through site_contractor_trades
				const { data: siteContractors, error: siteError } = await supabase
					.from("site_contractor_trades")
					.select("employer_id")
					.eq("job_site_id", jobSiteId);

				if (siteError) throw siteError;

				// Get employers through project relationships
				const { data: jobSite, error: jobSiteError } = await supabase
					.from("job_sites")
					.select(`
						project_id,
						project:projects(
							project_employer_roles(employer_id)
						)
					`)
					.eq("id", jobSiteId)
					.single();

				if (jobSiteError) throw jobSiteError;

				// Combine employer IDs from both sources
				const employerIds = new Set<string>();
				
				// Add direct site contractors
				siteContractors?.forEach(sc => {
					if (sc.employer_id) employerIds.add(sc.employer_id);
				});

				// Add project employers
				jobSite?.project?.project_employer_roles?.forEach(per => {
					if (per.employer_id) employerIds.add(per.employer_id);
				});

				setSelectedEmployerIds(Array.from(employerIds));
			} catch (error) {
				console.error("Error loading employers for job site:", error);
			}
		};

		loadEmployersForJobSite();
	}, [jobSiteId]);

	const canCreate = useMemo(() => 
		jobSiteId && selectedEmployerIds.length > 0 && canAccessFeature && !isCreating, 
		[jobSiteId, selectedEmployerIds.length, canAccessFeature, isCreating]
	);

	const createVisit = async () => {
		if (!canCreate) return;
		
		// Validate required fields
		if (!jobSiteId) {
			toast({
				title: "Validation Error",
				description: "Please select a job site.",
				variant: "destructive",
			});
			return;
		}
		
		if (selectedEmployerIds.length === 0) {
			toast({
				title: "Validation Error", 
				description: "Please select at least one employer.",
				variant: "destructive",
			});
			return;
		}

		// Validate scheduled time if provided
		if (scheduledAt) {
			const scheduledTime = new Date(scheduledAt).getTime();
			if (scheduledTime < Date.now()) {
				toast({
					title: "Invalid Date",
					description: "Scheduled time must be in the future.",
					variant: "destructive",
				});
				return;
			}
		}

		setIsCreating(true);
		
		try {
			const svCode = Math.random().toString(36).slice(2, 8).toUpperCase();
			
			// Create site visit for each selected employer
			const siteVisitPromises = selectedEmployerIds.map(async (employerId) => {
				const payload: any = {
					employer_id: employerId,
					job_site_id: jobSiteId,
					objective: objective || null,
					sv_code: `${svCode}-${employerId.slice(0, 4)}`, // Unique code per employer
					estimated_workers_count: typeof estimatedWorkers === "number" ? estimatedWorkers : null,
				};
				
				if (scheduledAt) {
					payload.scheduled_at = new Date(scheduledAt).toISOString();
				}

				return supabase
					.from("site_visit")
					.insert(payload)
					.select("id, sv_code")
					.single();
			});

			const results = await Promise.all(siteVisitPromises);
			const failedInserts = results.filter(result => result.error);
			
			if (failedInserts.length > 0) {
				console.error("Some site visits failed to create:", failedInserts);
				toast({
					title: "Partial Success",
					description: `${results.length - failedInserts.length} of ${results.length} site visits created successfully.`,
					variant: "destructive",
				});
			} else {
				toast({
					title: "Site Visits Created",
					description: `${results.length} site visit(s) created successfully.`,
				});
			}
			
			// Navigate to the first created site visit
			const firstSuccess = results.find(result => !result.error);
			if (firstSuccess?.data) {
				navigate(`/site-visits/${firstSuccess.data.sv_code}`);
			} else {
				navigate("/site-visits");
			}
		} catch (error) {
			console.error("Unexpected error:", error);
			toast({
				title: "Unexpected Error",
				description: "An unexpected error occurred. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsCreating(false);
		}
	};

	// Show loading state while checking permissions
	if (!userProfile) {
		return (
			<div className="p-6">
				<Card>
					<CardContent className="flex items-center justify-center py-8">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
							<p className="text-muted-foreground">Loading...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Don't render form if user doesn't have access
	if (!canAccessFeature) {
		return null;
	}

	return (
		<div className="p-6">
			<Card>
				<CardHeader>
					<CardTitle>Plan a Site Visit</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<Label>Job Site</Label>
							<Select value={jobSiteId} onValueChange={setJobSiteId}>
								<SelectTrigger>
									<SelectValue placeholder="Select a job site" />
								</SelectTrigger>
								<SelectContent>
									{allJobSites.map((site: any) => (
										<SelectItem key={site.id} value={site.id}>
											{site.name || site.location || site.id}
											{site.project?.name && (
												<span className="text-sm text-muted-foreground ml-2">
													({site.project.name})
												</span>
											)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						
						{jobSiteId && (
							<div className="md:col-span-2">
								<JobSiteEmployerManager
									jobSiteId={jobSiteId}
									selectedEmployerIds={selectedEmployerIds}
									onEmployerSelectionChange={setSelectedEmployerIds}
								/>
							</div>
						)}

						<div>
							<Label>Scheduled Date/Time</Label>
							<Input 
								type="datetime-local" 
								value={scheduledAt} 
								onChange={(e) => setScheduledAt(e.target.value)} 
							/>
						</div>
						<div>
							<Label>Objective</Label>
							<Input 
								value={objective} 
								onChange={(e) => setObjective(e.target.value)} 
								placeholder="Optional objective" 
							/>
						</div>
						<div>
							<Label>Estimated workers</Label>
							<Input 
								type="number" 
								min={0} 
								value={estimatedWorkers as any} 
								onChange={(e) => setEstimatedWorkers(e.target.value === "" ? "" : Number(e.target.value))} 
							/>
						</div>
					</div>
					<div className="flex gap-3">
						<Button 
							onClick={createVisit} 
							disabled={!canCreate}
						>
							{isCreating ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Creating...
								</>
							) : (
								"Create Visit"
							)}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}