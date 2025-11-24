import { createClient } from "@/utils/supabase/server";
import JobsTable from "@/components/admin/jobs/JobsTable";
import { JobsAnalytics } from "@/components/admin/jobs/JobsAnalytics";
import { getJobAnalytics } from "@/app/actions/job-analytics";

export default async function AllJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const query = params.q;
  const page = Number(params.page) || 1;
  const itemsPerPage = 10;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Fetch analytics data
  const analyticsData = await getJobAnalytics();

  let dbQuery = supabase
    .from("latest_jobs")
    .select("*", { count: "exact" });

  if (query) {
    dbQuery = dbQuery.or(`job_name.ilike.%${query}%,company.ilike.%${query}%`);
  }

  // Apply ordering and pagination after filtering
  dbQuery = dbQuery
    .order("Time", { ascending: false }) // Using 'Time' based on schema inspection
    .range(from, to);

  const { data: jobs, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching jobs:", error);
    return <div>Error loading data</div>;
  }

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <JobsAnalytics data={analyticsData} />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">All Jobs</h2>
        <JobsTable 
            data={jobs || []} 
            searchParams={params} 
            totalCount={count || 0}
            currentPage={page}
            itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
