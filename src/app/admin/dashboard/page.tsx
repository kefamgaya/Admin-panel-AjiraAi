import { createClient } from "@/utils/supabase/server";
import DashboardContent from "@/components/admin/dashboard/DashboardContent";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { getAllTimeAdMobEarnings } from "@/app/actions/earnings-analytics";

// Force dynamic rendering to prevent RSC 404 errors
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// Helper function to fetch all data with pagination
async function fetchAllData(queryBuilder: any) {
  let allData: any[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error, count } = await queryBuilder
      .range(offset, offset + limit - 1)
      .select("*", { count: "exact" });

    if (error) {
      console.error("Error fetching data:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allData = allData.concat(data);
    offset += limit;

    if (count !== null && offset >= count) {
      break;
    }
  }
  return allData;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();
  const threeDaysAgo = subDays(now, 3).toISOString();
  const thirtyDaysAgo = subDays(now, 30).toISOString();
  const sixtyDaysAgo = subDays(now, 60).toISOString();
  const sevenDaysAgo = subDays(now, 7).toISOString();

  // Parallel fetch all critical data
  const [
    // Total counts
    { count: totalUsers },
    { count: totalCompanies },
    { count: totalJobs },
    { count: totalApplications },
    
    // Today's activity
    { count: todayUsers },
    { count: todayJobs },
    { count: todayApplications },
    
    // Active users (last_3_reward_date within past 3 days)
    { count: activeUsers30d },
    { count: prevActiveUsers },
    
    // Jobs and apps
    { count: jobs30d },
    { count: apps30d },
    { count: prevJobs },
    { count: prevApps },
    
    // Pending actions
    { count: pendingJobs },
    { count: blockedUsers },
    { count: unverifiedCompanies },
    
    // Revenue data (earnings table, not credit transactions)
    earningsResult,
    prevEarningsResult,
    earnings7dResult,
    todayEarningsResult,
    
    // Recent activity
    recentUsersResult,
    recentJobsResult,
    recentAppsResult,
    
    // Top performers
    topCompaniesResult,
    topSkillsResult,
  ] = await Promise.all([
    // Total counts
    supabase.from('all_users').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('latest_jobs').select('*', { count: 'exact', head: true }),
    supabase.from('job_applications').select('*', { count: 'exact', head: true }),
    
    // Today's activity
    supabase.from('all_users').select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart).lte('created_at', todayEnd),
    supabase.from('latest_jobs').select('*', { count: 'exact', head: true })
      .gte('Time', todayStart).lte('Time', todayEnd),
    supabase.from('job_applications').select('*', { count: 'exact', head: true })
      .gte('applied_at', todayStart).lte('applied_at', todayEnd),
    
    // Active users (last_3_reward_date within past 3 days)
    supabase.from('all_users').select('*', { count: 'exact', head: true })
      .gte('last_3_reward_date', threeDaysAgo),
    supabase.from('all_users').select('*', { count: 'exact', head: true })
      .gte('last_3_reward_date', thirtyDaysAgo)
      .lt('last_3_reward_date', threeDaysAgo),
    
    // Jobs and apps (last 30 days)
    supabase.from('latest_jobs').select('*', { count: 'exact', head: true })
      .gte('Time', thirtyDaysAgo),
    supabase.from('job_applications').select('*', { count: 'exact', head: true })
      .gte('applied_at', thirtyDaysAgo),
    
    // Previous 30 days (for growth comparison)
    supabase.from('latest_jobs').select('*', { count: 'exact', head: true })
      .gte('Time', sixtyDaysAgo).lt('Time', thirtyDaysAgo),
    supabase.from('job_applications').select('*', { count: 'exact', head: true })
      .gte('applied_at', sixtyDaysAgo).lt('applied_at', thirtyDaysAgo),
    
    // Pending actions
    supabase.from('latest_jobs').select('*', { count: 'exact', head: true })
      .eq('approval_status', 'pending'),
    supabase.from('all_users').select('*', { count: 'exact', head: true })
      .eq('is_blocked', true),
    supabase.from('companies').select('*', { count: 'exact', head: true })
      .eq('is_verified', false),
    
    // Revenue data from earnings table (last 30 days)
    supabase.from('earnings')
      .select('amount, revenue_source, earned_at')
      .gte('earned_at', thirtyDaysAgo)
      .order('earned_at', { ascending: false }),
    supabase.from('earnings')
      .select('amount, revenue_source, earned_at')
      .gte('earned_at', sixtyDaysAgo)
      .lt('earned_at', thirtyDaysAgo),
    supabase.from('earnings')
      .select('amount, revenue_source, earned_at')
      .gte('earned_at', sevenDaysAgo)
      .order('earned_at', { ascending: false }),
    supabase.from('earnings')
      .select('amount')
      .gte('earned_at', todayStart)
      .lte('earned_at', todayEnd),
    
    // Recent activity (last 5)
    supabase.from('all_users')
      .select('id, email, full_name, created_at, account_type')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('latest_jobs')
      .select('id, title, company_name, Time, approval_status')
      .order('Time', { ascending: false })
      .limit(5),
    supabase.from('job_applications')
      .select('id, job_id, user_id, applied_at, status')
      .order('applied_at', { ascending: false })
      .limit(5),
    
    // Top performers
    supabase.from('companies')
      .select('id, company_name, industry, created_at')
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('skills')
      .select('id, skill_name, category')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  // Fetch real AdMob all-time earnings from API
  const admobAllTimeFromAPI = await getAllTimeAdMobEarnings();

  // Calculate revenue from earnings table
  // Separate AdMob earnings from other earnings
  const admobEarningsFromDB = earningsResult.data
    ?.filter(item => item.revenue_source === "admob")
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) || 0;
  
  const otherEarnings30d = earningsResult.data
    ?.filter(item => item.revenue_source !== "admob")
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) || 0;
  
  // Use API data for AdMob if available, otherwise use database
  // For 30-day revenue, we use database data since API gives all-time
  const admobRevenue30d = admobEarningsFromDB; // Use DB for 30-day period
  const currentRevenue = admobRevenue30d + otherEarnings30d;
  
  const prevRevenue = prevEarningsResult.data?.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) || 0;
  const revenueGrowth = prevRevenue === 0 ? (currentRevenue > 0 ? 100 : 0) : ((currentRevenue - prevRevenue) / prevRevenue) * 100;

  // Calculate earnings (last 7 days)
  const totalEarnings7d = earnings7dResult.data?.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) || 0;
  const todayEarnings = todayEarningsResult.data?.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) || 0;
  
  // Group earnings by source (last 7 days)
  const earningsBySource = (earnings7dResult.data || []).reduce((acc, item) => {
    const source = item.revenue_source || 'other';
    acc[source] = (acc[source] || 0) + parseFloat(item.amount || 0);
    return acc;
  }, {} as Record<string, number>);
  
  // Add all-time AdMob earnings to the data
  const allTimeAdMobEarnings = admobAllTimeFromAPI > 0 ? admobAllTimeFromAPI : admobEarningsFromDB;

  // Chart Data for last 30 days (from earnings table)
  const chartMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = subDays(now, i);
    chartMap.set(format(d, 'yyyy-MM-dd'), 0);
  }
  
  earningsResult.data?.forEach(item => {
    const day = item.earned_at.split('T')[0];
    if (chartMap.has(day)) {
      chartMap.set(day, (chartMap.get(day) || 0) + parseFloat(item.amount || 0));
    }
  });

  const chartData = Array.from(chartMap.entries())
    .map(([date, Revenue]) => ({ date, Revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate growth rates
  const userGrowth = (prevActiveUsers || 0) === 0 ? ((activeUsers30d || 0) > 0 ? 100 : 0) : (((activeUsers30d || 0) - (prevActiveUsers || 0)) / (prevActiveUsers || 0)) * 100;
  const jobsGrowth = (prevJobs || 0) === 0 ? ((jobs30d || 0) > 0 ? 100 : 0) : (((jobs30d || 0) - (prevJobs || 0)) / (prevJobs || 0)) * 100;
  const appsGrowth = (prevApps || 0) === 0 ? ((apps30d || 0) > 0 ? 100 : 0) : (((apps30d || 0) - (prevApps || 0)) / (prevApps || 0)) * 100;

  const dashboardData = {
    // Overview stats
    overview: {
      totalUsers: totalUsers || 0,
      totalCompanies: totalCompanies || 0,
      totalJobs: totalJobs || 0,
      totalApplications: totalApplications || 0,
    },
    
    // Today's activity
    today: {
      newUsers: todayUsers || 0,
      newJobs: todayJobs || 0,
      newApplications: todayApplications || 0,
      earnings: todayEarnings,
    },
    
    // 30-day metrics
    revenue: {
      total: currentRevenue,
      growth: revenueGrowth,
      chartData: chartData,
    },
    users: {
      active: activeUsers30d || 0,
      growth: userGrowth,
    },
    jobs: {
      posted: jobs30d || 0,
      growth: jobsGrowth,
    },
    applications: {
      active: apps30d || 0,
      growth: appsGrowth,
    },
    
    // Earnings (last 7 days)
    earnings: {
      total7d: totalEarnings7d,
      bySource: earningsBySource,
      today: todayEarnings,
      allTimeAdMob: allTimeAdMobEarnings, // Real all-time AdMob earnings from API
    },
    
    // Pending actions
    pending: {
      jobs: pendingJobs || 0,
      blockedUsers: blockedUsers || 0,
      unverifiedCompanies: unverifiedCompanies || 0,
    },
    
    // Recent activity
    recent: {
      users: recentUsersResult.data || [],
      jobs: recentJobsResult.data || [],
      applications: recentAppsResult.data || [],
    },
    
    // Top performers
    top: {
      companies: topCompaniesResult.data || [],
      skills: topSkillsResult.data || [],
    },
  };

  return <DashboardContent data={dashboardData} />;
}
