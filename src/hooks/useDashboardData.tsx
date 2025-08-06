import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      // Get basic counts
      const [
        { count: totalWorkers },
        { count: totalEmployers },
        { count: totalSites },
        { count: totalActivities },
        { count: totalEbas },
        { data: membershipData },
        { data: ebaData },
        { data: employerAnalytics }
      ] = await Promise.all([
        supabase.from("workers").select("*", { count: "exact", head: true }),
        supabase.from("employers").select("*", { count: "exact", head: true }),
        supabase.from("job_sites").select("*", { count: "exact", head: true }),
        supabase.from("union_activities").select("*", { count: "exact", head: true }),
        supabase.from("company_eba_records").select("*", { count: "exact", head: true }),
        supabase.from("workers").select("union_membership_status"),
        supabase.from("company_eba_records").select("nominal_expiry_date, fwc_certified_date, date_eba_signed, eba_lodged_fwc"),
        supabase.from("employer_analytics").select("*")
      ]);

      // Calculate membership stats
      const memberCount = membershipData?.filter(w => w.union_membership_status === 'member').length || 0;
      const membershipRate = totalWorkers ? (memberCount / totalWorkers) * 100 : 0;

      // Calculate EBA expiry taxonomy
      const now = new Date();
      const sixWeeks = new Date(now.getTime() + (6 * 7 * 24 * 60 * 60 * 1000));
      const threeMonths = new Date(now.getTime() + (3 * 30 * 24 * 60 * 60 * 1000));
      const sixMonths = new Date(now.getTime() + (6 * 30 * 24 * 60 * 60 * 1000));

      const ebaExpiry = {
        expired: 0,
        expiring6Weeks: 0,
        expiring3Months: 0,
        expiring6Months: 0,
        certified: 0,
        signed: 0,
        lodged: 0
      };

      ebaData?.forEach(eba => {
        if (eba.fwc_certified_date) ebaExpiry.certified++;
        if (eba.date_eba_signed) ebaExpiry.signed++;
        if (eba.eba_lodged_fwc) ebaExpiry.lodged++;

        if (eba.nominal_expiry_date) {
          const expiryDate = new Date(eba.nominal_expiry_date);
          if (expiryDate < now) {
            ebaExpiry.expired++;
          } else if (expiryDate <= sixWeeks) {
            ebaExpiry.expiring6Weeks++;
          } else if (expiryDate <= threeMonths) {
            ebaExpiry.expiring3Months++;
          } else if (expiryDate <= sixMonths) {
            ebaExpiry.expiring6Months++;
          }
        }
      });

      // Calculate member density for mapped employers
      const mappedEmployers = employerAnalytics?.filter(e => 
        e.estimated_worker_count && e.estimated_worker_count > 0 && e.current_worker_count && e.current_worker_count > 0
      ) || [];
      
      const avgMemberDensity = mappedEmployers.length > 0 
        ? mappedEmployers.reduce((sum, emp) => sum + (emp.member_density_percent || 0), 0) / mappedEmployers.length
        : 0;

      const ebaPercentage = totalEmployers ? (totalEbas / totalEmployers) * 100 : 0;

      return {
        totalWorkers: totalWorkers || 0,
        totalEmployers: totalEmployers || 0,
        totalSites: totalSites || 0,
        totalActivities: totalActivities || 0,
        totalEbas: totalEbas || 0,
        memberCount,
        membershipRate,
        ebaPercentage,
        avgMemberDensity,
        mappedEmployersCount: mappedEmployers.length,
        ebaExpiry
      };
    },
  });
};