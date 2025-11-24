import { createClient } from "@/utils/supabase/server";
import SeekersTable from "@/components/admin/users/SeekersTable";
import { UsersAnalytics } from "@/components/admin/users/UsersAnalytics";
import { getUserAnalytics } from "@/app/actions/user-analytics";

export default async function SeekersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; startDate?: string; endDate?: string; range?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const query = params.q;
  const page = Number(params.page) || 1;
  const itemsPerPage = 10;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Fetch analytics data
  const analyticsData = await getUserAnalytics();

  let dbQuery = supabase
    .from("all_users")
    .select("*", { count: "exact" });

  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  // Apply date range filter if provided
  if (params.startDate && params.endDate) {
    dbQuery = dbQuery
      .gte("registration_date", params.startDate)
      .lte("registration_date", params.endDate);
  }

  // Apply ordering and pagination after filtering
  dbQuery = dbQuery
    .order("registration_date", { ascending: false })
    .range(from, to);

  const { data: seekers, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching seekers:", error);
    return <div>Error loading data</div>;
  }

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <UsersAnalytics data={analyticsData} />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <SeekersTable 
            data={seekers || []} 
            searchParams={params} 
            totalCount={count || 0}
            currentPage={page}
            itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
