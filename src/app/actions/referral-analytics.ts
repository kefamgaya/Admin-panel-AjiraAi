"use server";

import { createClient } from "@/utils/supabase/server";

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export async function getReferralAnalytics() {
  const supabase = await createClient();
  
  let allReferrals: any[] = [];
  const PAGE_SIZE = 1000;
  let page = 0;
  let hasMore = true;

  // Fetch all referrals with pagination
  while (hasMore) {
    const { data: referrals, error } = await supabase
      .from("referrals")
      .select("referrer_uid, referee_uid, status, referrer_credits_awarded, referee_credits_awarded, created_at")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
        console.error("Error fetching referral analytics data:", error);
        break;
    }

    if (referrals && referrals.length > 0) {
      allReferrals = [...allReferrals, ...referrals];
      if (referrals.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  const referrals = allReferrals;

  // 1. Status Distribution
  const statusDistribution = referrals.reduce((acc, ref) => {
    const status = ref.status ? toTitleCase(ref.status) : "Pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Total Credits Awarded
  let totalReferrerCredits = 0;
  let totalRefereeCredits = 0;
  
  referrals.forEach(ref => {
    totalReferrerCredits += ref.referrer_credits_awarded || 0;
    totalRefereeCredits += ref.referee_credits_awarded || 0;
  });

  // 3. Referrals by Month
  const referralsByMonth = referrals.reduce((acc, ref) => {
    if (!ref.created_at) return acc;
    try {
      const date = new Date(ref.created_at);
      if (isNaN(date.getTime())) return acc;
      
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    } catch (e) {
      // Ignore
    }
    return acc;
  }, {} as Record<string, number>);

  // 4. Top Referrers (users with most referrals)
  const referrerCounts = referrals.reduce((acc, ref) => {
    if (!ref.referrer_uid) return acc;
    if (!acc[ref.referrer_uid]) {
      acc[ref.referrer_uid] = {
        count: 0,
        totalCredits: 0,
        successfulReferrals: 0
      };
    }
    acc[ref.referrer_uid].count += 1;
    acc[ref.referrer_uid].totalCredits += ref.referrer_credits_awarded || 0;
    if (ref.status === 'rewarded') {
      acc[ref.referrer_uid].successfulReferrals += 1;
    }
    return acc;
  }, {} as Record<string, { count: number; totalCredits: number; successfulReferrals: number }>);

  // Get top 10 referrers
  const topReferrers = Object.entries(referrerCounts)
    .sort(([, a], [, b]) => (b as { count: number; totalCredits: number; successfulReferrals: number }).count - (a as { count: number; totalCredits: number; successfulReferrals: number }).count)
    .slice(0, 10)
    .map(([uid, data]) => ({ uid, ...(data as { count: number; totalCredits: number; successfulReferrals: number }) }));

  // Fetch user details for top referrers
  if (topReferrers.length > 0) {
    const { data: users } = await supabase
      .from("all_users")
      .select("uid, name, email, full_name")
      .in("uid", topReferrers.map(r => r.uid));

    const userMap = new Map(users?.map(u => [u.uid, u]) || []);
    
    topReferrers.forEach(referrer => {
      const user = userMap.get(referrer.uid);
      if (user) {
        (referrer as any).name = user.full_name || user.name || "Unknown";
        (referrer as any).email = user.email || "";
      }
    });
  }

  return {
    totalReferrals: referrals.length,
    successfulReferrals: referrals.filter(r => r.status === 'rewarded').length,
    pendingReferrals: referrals.filter(r => r.status === 'pending').length,
    totalCreditsAwarded: totalReferrerCredits + totalRefereeCredits,
    totalReferrerCredits,
    totalRefereeCredits,
    statusDistribution: Object.entries(statusDistribution).map(([name, value]) => ({ name, value: value as number })),
    referralsHistory: Object.entries(referralsByMonth).map(([date, count]) => ({ date, "Referrals": count as number })),
    topReferrers,
  };
}

