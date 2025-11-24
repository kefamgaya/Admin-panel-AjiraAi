import { createClient } from "@/utils/supabase/server";
import ReferralsTable from "@/components/admin/finance/ReferralsTable";
import { ReferralsAnalytics } from "@/components/admin/finance/ReferralsAnalytics";
import { getReferralAnalytics } from "@/app/actions/referral-analytics";

export default async function ReferralsPage({
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
  const analyticsData = await getReferralAnalytics();

  let dbQuery = supabase
    .from("referrals")
    .select(`
      *,
      referrer:all_users!referrals_referrer_uid_fkey(name, email, full_name),
      referee:all_users!referrals_referee_uid_fkey(name, email, full_name)
    `, { count: "exact" });

  if (query) {
    dbQuery = dbQuery.or(`referral_code.ilike.%${query}%`);
  }

  // Apply ordering and pagination after filtering
  dbQuery = dbQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: referrals, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching referrals:", error);
    return <div>Error loading data</div>;
  }

  // Transform the data to match the expected format
  const transformedReferrals = referrals?.map(ref => ({
    ...ref,
    referrer: {
      name: (ref.referrer as any)?.full_name || (ref.referrer as any)?.name || null,
      email: (ref.referrer as any)?.email || null,
    },
    referee: {
      name: (ref.referee as any)?.full_name || (ref.referee as any)?.name || null,
      email: (ref.referee as any)?.email || null,
    }
  })) || [];

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <ReferralsAnalytics data={analyticsData} />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Referral History</h2>
        <ReferralsTable
            data={transformedReferrals}
            searchParams={params}
            totalCount={count || 0}
            currentPage={page}
            itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}

