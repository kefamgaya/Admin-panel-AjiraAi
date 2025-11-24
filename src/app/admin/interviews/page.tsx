import { createClient } from "@/utils/supabase/server";
import InterviewsTable from "@/components/admin/interviews/InterviewsTable";
import { InterviewsAnalytics } from "@/components/admin/interviews/InterviewsAnalytics";
import { getInterviewAnalytics } from "@/app/actions/interview-analytics";

export default async function InterviewsPage({
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
  const analyticsData = await getInterviewAnalytics();

  let dbQuery = supabase
    .from("interviews")
    .select("*", { count: "exact" });

  if (query) {
    dbQuery = dbQuery.or(`applicant_email.ilike.%${query}%,notes.ilike.%${query}%`);
  }

  // Apply ordering and pagination after filtering
  dbQuery = dbQuery
    .order("interview_date", { ascending: false })
    .range(from, to);

  const { data: interviews, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching interviews:", error);
    return <div>Error loading data</div>;
  }

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <InterviewsAnalytics data={analyticsData} />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Interview Management</h2>
        <InterviewsTable
            data={interviews || []}
            searchParams={params}
            totalCount={count || 0}
            currentPage={page}
            itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}

