import { createClient } from "@/utils/supabase/server";
import ApplicationsTable from "@/components/admin/applications/ApplicationsTable";
import { ApplicationsAnalytics } from "@/components/admin/applications/ApplicationsAnalytics";
import { getApplicationAnalytics } from "@/app/actions/application-analytics";

export default async function ApplicationsPage({
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
  const analyticsData = await getApplicationAnalytics();

  let dbQuery = supabase
    .from("job_applications")
    .select("*, latest_jobs(job_name, company)", { count: "exact" });

  if (query) {
    dbQuery = dbQuery.or(`applicant_name.ilike.%${query}%,applicant_email.ilike.%${query}%`);
  }

  // Apply ordering and pagination after filtering
  dbQuery = dbQuery
    .order("applied_at", { ascending: false })
    .range(from, to);

  const { data: applications, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching applications:", error);
    return <div>Error loading data</div>;
  }

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <ApplicationsAnalytics data={analyticsData} />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Job Applications</h2>
        <ApplicationsTable 
            data={applications || []} 
            searchParams={params} 
            totalCount={count || 0}
            currentPage={page}
            itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
