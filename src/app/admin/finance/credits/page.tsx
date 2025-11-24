import { createClient } from "@/utils/supabase/server";
import CreditsTable from "@/components/admin/finance/CreditsTable";
import { CreditsAnalytics } from "@/components/admin/finance/CreditsAnalytics";
import { getCreditAnalytics } from "@/app/actions/credit-analytics";

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const query = params.q;
  const page = Number(params.page) || 1;
  const itemsPerPage = 20;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Fetch analytics data
  const analyticsData = await getCreditAnalytics();

  let dbQuery = supabase
    .from("credit_transactions")
    .select("*, all_users(name, email)", { count: "exact" });

  if (query) {
    dbQuery = dbQuery.or(`description.ilike.%${query}%,reference_id.ilike.%${query}%`);
  }

  // Apply ordering and pagination after filtering
  dbQuery = dbQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: transactions, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching credit transactions:", error);
    return <div>Error loading data</div>;
  }

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <CreditsAnalytics data={analyticsData} />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Credit Transaction History</h2>
        <CreditsTable
            data={transactions || []}
            searchParams={params}
            totalCount={count || 0}
            currentPage={page}
            itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}

