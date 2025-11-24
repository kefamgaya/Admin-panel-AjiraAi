import { createClient } from "@/utils/supabase/server";
import SubscriptionsTable from "@/components/admin/finance/SubscriptionsTable";
import { SubscriptionsAnalytics } from "@/components/admin/finance/SubscriptionsAnalytics";
import { getSubscriptionAnalytics } from "@/app/actions/subscription-analytics";

export default async function SubscriptionsPage({
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
  const analyticsData = await getSubscriptionAnalytics();

  let dbQuery = supabase
    .from("subscription_history")
    .select("*", { count: "exact" });

  if (query) {
    dbQuery = dbQuery.or(`plan.ilike.%${query}%,status.ilike.%${query}%`);
  }

  // Apply ordering and pagination after filtering
  dbQuery = dbQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: subscriptions, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching subscriptions:", error);
    return <div>Error loading data</div>;
  }

  // Manually fetch company details for the subscriptions
  const companyUids = [...new Set(subscriptions?.map(s => s.company_uid).filter(Boolean) || [])];
  
  let companyMap: Record<string, { company_name: string | null; email: string | null }> = {};
  
  if (companyUids.length > 0) {
    const { data: companies } = await supabase
      .from("companies")
      .select("uid, company_name, email")
      .in("uid", companyUids);
      
    companies?.forEach(c => {
      companyMap[c.uid] = {
        company_name: c.company_name,
        email: c.email
      };
    });
  }

  // Enrich subscriptions with company data
  const enrichedSubscriptions = subscriptions?.map(sub => ({
    ...sub,
    companies: companyMap[sub.company_uid] || null
  })) || [];

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <SubscriptionsAnalytics data={analyticsData} />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Subscription History</h2>
        <SubscriptionsTable
            data={enrichedSubscriptions}
            searchParams={params}
            totalCount={count || 0}
            currentPage={page}
            itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}

