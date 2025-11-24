import { createClient } from "@/utils/supabase/server";
import CompaniesTable from "@/components/admin/users/CompaniesTable";
import { CompanyAnalytics } from "@/components/admin/users/CompanyAnalytics";
import { getCompanyAnalytics } from "@/app/actions/company-analytics";

export default async function CompaniesPage({
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
  const analyticsData = await getCompanyAnalytics();

  let dbQuery = supabase
    .from("companies")
    .select("*", { count: "exact" });

  if (query) {
    dbQuery = dbQuery.or(`company_name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  // Apply ordering and pagination after filtering
  dbQuery = dbQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: companies, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching companies:", error);
    return <div>Error loading data</div>;
  }

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <CompanyAnalytics data={analyticsData} />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Company Management</h2>
        <CompaniesTable 
            data={companies || []} 
            searchParams={params} 
            totalCount={count || 0}
            currentPage={page}
            itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
