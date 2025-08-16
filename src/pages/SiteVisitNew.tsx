import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SingleEmployerPicker } from "@/components/projects/SingleEmployerPicker";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function SiteVisitNew() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { toast } = useToast();
	const [employerId, setEmployerId] = useState("");
	const [jobSiteId, setJobSiteId] = useState("");
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

	const { data: sites = [] } = useQuery({
		queryKey: ["sites-by-employer", employerId],
		enabled: !!employerId,
		queryFn: async () => {
			// Filter sites by the selected employer - check both direct employer assignments and project relationships
			const { data, error } = await supabase
				.from("job_sites")
				.select(`
					id, 
					name, 
					location,
					project:projects(
						id,
						project_employer_roles(
							employer_id
						)
					)
				`)
				.order("created_at", { ascending: false });
			
			if (error) throw error;
			
			// Filter sites that are either directly associated with the employer or through project relationships
			const filteredSites = (data || []).filter(site => {
				if (!site.project) return false;
				return site.project.project_employer_roles.some(
					(role: any) => role.employer_id === employerId
				);
			});
			
			return filteredSites;
		},
	});

	const canCreate = useMemo(() => 
		employerId && jobSiteId && canAccessFeature && !isCreating, 
		[employerId, jobSiteId, canAccessFeature, isCreating]
	);

	const createVisit = async () => {
		if (!canCreate) return;
		
		// Validate required fields
		if (!employerId) {
			toast({
				title: "Validation Error",
				description: "Please select an employer.",
				variant: "destructive",
			});
			return;
		}
		
		if (!jobSiteId) {
			toast({
				title: "Validation Error", 
				description: "Please select a job site.",
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
			const payload: any = {
				employer_id: employerId,
				job_site_id: jobSiteId,
				objective: objective || null,
				sv_code: svCode,
				estimated_workers_count: typeof estimatedWorkers === "number" ? estimatedWorkers : null,
			};
			
			if (scheduledAt) {
				payload.scheduled_at = new Date(scheduledAt).toISOString();
			}

			const { data, error } = await supabase
				.from("site_visit")
				.insert(payload)
				.select("id, sv_code")
				.single();
				
			if (error) {
				console.error("Site visit creation error:", error);
				toast({
					title: "Error Creating Site Visit",
					description: error.message || "Failed to create site visit. Please try again.",
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "Site Visit Created",
				description: `Site visit ${data.sv_code} has been created successfully.`,
			});
			
			navigate(`/site-visits/${data.sv_code}`);
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
							<SingleEmployerPicker 
								label="Employer" 
								selectedId={employerId} 
								onChange={setEmployerId} 
							/>
						</div>
						<div>
							<Label>Job Site</Label>
							<select 
								className="border rounded h-10 w-full px-2" 
								value={jobSiteId} 
								onChange={(e) => setJobSiteId(e.target.value)}
								disabled={!employerId}
							>
								<option value="">
									{!employerId ? "Select an employer first" : "Select site"}
								</option>
								{sites.map((site: any) => (
									<option key={site.id} value={site.id}>
										{site.name || site.location || site.id}
									</option>
								))}
							</select>
							{employerId && sites.length === 0 && (
								<p className="text-sm text-muted-foreground mt-1">
									No job sites found for selected employer
								</p>
							)}
						</div>
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