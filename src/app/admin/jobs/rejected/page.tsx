import { createClient } from "@/utils/supabase/server";
import JobsTable from "@/components/admin/jobs/JobsTable";

export default async function RejectedJobsPage({
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

  let dbQuery = supabase
    .from("latest_jobs")
    .select("*", { count: "exact" })
    .not("rejection_reason", "is", null); // Filter for jobs with rejection_reason (rejected jobs)

  if (query) {
    dbQuery = dbQuery.or(`job_name.ilike.%${query}%,company.ilike.%${query}%`);
  }

  // Apply ordering and pagination after filtering
  dbQuery = dbQuery
    .order("Time", { ascending: false })
    .range(from, to);

  const { data: jobs, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching rejected jobs:", error);
    return <div>Error loading data</div>;
  }

    // Jobs with rejection_reason are rejected
    const rejectedJobs = jobs || [];

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Rejected Jobs</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Jobs that have been rejected and are not visible to users
        </p>
        <JobsTable 
            data={rejectedJobs} 
            searchParams={params} 
            totalCount={count || 0}
            currentPage={page}
            itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}

