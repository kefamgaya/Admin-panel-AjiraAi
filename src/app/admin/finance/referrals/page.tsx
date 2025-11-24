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

  // Fetch analytics data (handle errors gracefully)
  let analyticsData;
  try {
    analyticsData = await getReferralAnalytics();
  } catch (analyticsError) {
    console.error("Error fetching referral analytics:", analyticsError);
    analyticsData = {
      totalReferrals: 0,
      successfulReferrals: 0,
      pendingReferrals: 0,
      totalCreditsAwarded: 0,
      totalReferrerCredits: 0,
      totalRefereeCredits: 0,
      statusDistribution: [],
      referralsHistory: [],
      topReferrers: [],
    };
  }

  // Fetch referrals - using simpler approach that's more reliable
  let dbQuery = supabase
    .from("referrals")
    .select("*", { count: "exact" });

  if (query) {
    dbQuery = dbQuery.ilike("referral_code", `%${query}%`);
  }

  // Apply ordering and pagination after filtering
  dbQuery = dbQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: referralsData, error: referralsError, count } = await dbQuery;

  if (referralsError) {
    console.error("Error fetching referrals:", referralsError);
    console.error("Error details:", JSON.stringify(referralsError, null, 2));
    return (
      <div className="p-6 sm:p-10">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Error loading referral data
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            {referralsError.message || "An error occurred while fetching referrals"}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">
            Error code: {referralsError.code || "Unknown"}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            Please check the server logs for more details.
          </p>
        </div>
      </div>
    );
  }

  // Fetch user details separately for better reliability
  const referrerUids = [...new Set(referralsData?.map(r => r.referrer_uid).filter(Boolean) || [])];
  const refereeUids = [...new Set(referralsData?.map(r => r.referee_uid).filter(Boolean) || [])];
  const allUids = [...new Set([...referrerUids, ...refereeUids])];

  let users: any[] = [];
  if (allUids.length > 0) {
    const { data: usersData, error: usersError } = await supabase
      .from("all_users")
      .select("uid, name, email, full_name")
      .in("uid", allUids);

    if (usersError) {
      console.warn("Error fetching user details:", usersError);
    } else {
      users = usersData || [];
    }
  }

  const userMap = new Map(users.map(u => [u.uid, u]));

  // Join data manually
  const referrals = referralsData?.map(ref => ({
    ...ref,
    referrer: userMap.get(ref.referrer_uid) || null,
    referee: userMap.get(ref.referee_uid) || null,
  })) || [];

  // Transform the data to match the expected format
  const transformedReferrals = referrals.map(ref => {
    const referrer = ref.referrer as any;
    const referee = ref.referee as any;
    
    return {
      ...ref,
      referrer: referrer ? {
        name: referrer.full_name || referrer.name || null,
        email: referrer.email || null,
      } : null,
      referee: referee ? {
        name: referee.full_name || referee.name || null,
        email: referee.email || null,
      } : null,
    };
  }) || [];

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

