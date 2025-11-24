"use server";

import { createClient } from "@/utils/supabase/server";
import { differenceInDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { getAccessToken, fetchAdMobEarnings } from "@/lib/admob";

// Specific app ID for Ajira AI
const AJIRA_APP_ID = "ca-app-pub-1644643871385985~1470724022";

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

// Helper function to fetch all data with pagination
async function fetchAllData(supabase: any, tableName: string, selectQuery: string) {
  let allData: any[] = [];
  const PAGE_SIZE = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select(selectQuery)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      break;
    }

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  return allData;
}

export async function getPlatformAnalytics() {
  const supabase = await createClient();
  
  // Fetch all data with unlimited pagination
  const [
    users,
    companies,
    jobs,
    applications,
    interviews,
    credits,
    referrals,
    subscriptions,
    resumes,
    earnings
  ] = await Promise.all([
    fetchAllData(supabase, "all_users", "uid, role, registration_date, is_blocked, accounttype, location, skills"),
    fetchAllData(supabase, "companies", "uid, created_at, is_verified, is_blocked, subscription_plan, jobs_posted, industry, location"),
    fetchAllData(supabase, "latest_jobs", "id, Time, approved, pending, rejected, is_featured, category, type, location"),
    fetchAllData(supabase, "job_applications", "id, applied_at, status, ai_rating"),
    fetchAllData(supabase, "interviews", "id, created_at, status, interview_type"),
    fetchAllData(supabase, "credit_transactions", "id, amount, transaction_type, created_at"),
    fetchAllData(supabase, "referrals", "id, created_at, status, referrer_credits_awarded, referee_credits_awarded"),
    fetchAllData(supabase, "subscription_history", "id, created_at, amount, status, plan"),
    fetchAllData(supabase, "generated_resumes", "id, user_uid, resume_type, template, created_at"),
    fetchAllData(supabase, "earnings", "id, amount, currency, revenue_source, earned_at, created_at")
  ]);

  // Calculate growth metrics (last 30 days vs previous 30 days)
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const newUsersLast30 = users.filter(u => u.registration_date && new Date(u.registration_date) >= last30Days).length;
  const newUsersPrevious30 = users.filter(u => u.registration_date && new Date(u.registration_date) >= previous30Days && new Date(u.registration_date) < last30Days).length;
  const userGrowthRate = newUsersPrevious30 > 0 ? ((newUsersLast30 - newUsersPrevious30) / newUsersPrevious30) * 100 : 0;

  const newJobsLast30 = jobs.filter(j => j.Time && new Date(j.Time) >= last30Days).length;
  const newJobsPrevious30 = jobs.filter(j => j.Time && new Date(j.Time) >= previous30Days && new Date(j.Time) < last30Days).length;
  const jobGrowthRate = newJobsPrevious30 > 0 ? ((newJobsLast30 - newJobsPrevious30) / newJobsPrevious30) * 100 : 0;

  // Fetch real AdMob all-time earnings from API
  let admobAllTimeEarnings = 0;
  try {
    const clientId = process.env.ADMOB_API_CLIENT_ID;
    const clientSecret = process.env.ADMOB_API_CLIENT_SECRET;
    const refreshToken = process.env.ADMOB_API_REFRESH_TOKEN;
    const publisherId = process.env.ADMOB_PUBLISHER_ID?.replace("pub-", "");

    if (clientId && clientSecret && refreshToken && publisherId) {
      // Fetch all-time AdMob earnings (from app launch date, using a very early date)
      const accessToken = await getAccessToken({ clientId, clientSecret, refreshToken });
      // AdMob typically has data from when the app was first published
      // Use a date 5 years ago as start date to ensure we get all historical data
      const allTimeStartDate = new Date();
      allTimeStartDate.setFullYear(allTimeStartDate.getFullYear() - 5);
      const allTimeEndDate = new Date();

      const admobReportData = await fetchAdMobEarnings(
        publisherId,
        accessToken,
        allTimeStartDate,
        allTimeEndDate,
        AJIRA_APP_ID // Filter by specific app ID
      );

      // Sum all AdMob earnings from the report
      admobAllTimeEarnings = admobReportData.reduce((sum, row) => sum + row.earnings, 0);
    }
  } catch (error) {
    console.error("Error fetching AdMob all-time earnings:", error);
    // Fall back to database earnings if API call fails
  }

  // Revenue calculations from earnings table (primary source)
  // Separate AdMob earnings from other earnings
  const admobEarningsFromDB = earnings
    .filter(e => e.revenue_source === "admob")
    .reduce((sum, earning) => {
      const amount = parseFloat(earning.amount as any) || 0;
      return sum + amount;
    }, 0);

  // Use real AdMob API data if available, otherwise use database
  const totalAdMobRevenue = admobAllTimeEarnings > 0 ? admobAllTimeEarnings : admobEarningsFromDB;

  // Other earnings (non-AdMob)
  const otherEarnings = earnings
    .filter(e => e.revenue_source !== "admob")
    .reduce((sum, earning) => {
      const amount = parseFloat(earning.amount as any) || 0;
      return sum + amount;
    }, 0);

  // Total revenue = AdMob + other earnings
  const totalRevenue = totalAdMobRevenue + otherEarnings;
  
  // This month's revenue (current month)
  const currentMonthStart = startOfMonth(now);
  
  // Get this month's AdMob earnings from API if available
  let admobThisMonthEarnings = 0;
  try {
    const clientId = process.env.ADMOB_API_CLIENT_ID;
    const clientSecret = process.env.ADMOB_API_CLIENT_SECRET;
    const refreshToken = process.env.ADMOB_API_REFRESH_TOKEN;
    const publisherId = process.env.ADMOB_PUBLISHER_ID?.replace("pub-", "");

    if (clientId && clientSecret && refreshToken && publisherId) {
      const accessToken = await getAccessToken({ clientId, clientSecret, refreshToken });
      const admobReportData = await fetchAdMobEarnings(
        publisherId,
        accessToken,
        currentMonthStart,
        now,
        AJIRA_APP_ID // Filter by specific app ID
      );
      admobThisMonthEarnings = admobReportData.reduce((sum, row) => sum + row.earnings, 0);
    }
  } catch (error) {
    console.error("Error fetching AdMob this month earnings:", error);
  }

  // This month's earnings from database (AdMob)
  const admobThisMonthFromDB = earnings
    .filter(earning => {
      if (earning.revenue_source !== "admob" || !earning.earned_at) return false;
      const earnedDate = new Date(earning.earned_at);
      return earnedDate >= currentMonthStart;
    })
    .reduce((sum, earning) => {
      const amount = parseFloat(earning.amount as any) || 0;
      return sum + amount;
    }, 0);

  // Use API data if available, otherwise use database
  const admobThisMonth = admobThisMonthEarnings > 0 ? admobThisMonthEarnings : admobThisMonthFromDB;

  // Other earnings this month
  const otherEarningsThisMonth = earnings
    .filter(earning => {
      if (earning.revenue_source === "admob" || !earning.earned_at) return false;
      const earnedDate = new Date(earning.earned_at);
      return earnedDate >= currentMonthStart;
    })
    .reduce((sum, earning) => {
      const amount = parseFloat(earning.amount as any) || 0;
      return sum + amount;
    }, 0);

  const revenueLastMonth = admobThisMonth + otherEarningsThisMonth;

  // User analytics
  const activeUsers = users.filter(u => !u.is_blocked).length;
  const verifiedUsers = users.filter(u => u.accounttype === 'verified').length;
  
  const usersByRole = users.reduce((acc, user) => {
    const role = user.role ? toTitleCase(user.role) : "Unknown";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Job analytics
  const activeJobs = jobs.filter(j => j.approved === 'yes').length;
  const pendingJobs = jobs.filter(j => j.pending === 'yes').length;
  const featuredJobs = jobs.filter(j => j.is_featured).length;

  const jobsByCategory = jobs.reduce((acc, job) => {
    const category = job.category ? toTitleCase(job.category) : "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Application analytics
  const totalApplications = applications.length;
  const shortlistedApplications = applications.filter(a => a.status === 'shortlisted').length;
  const avgAIRating = applications.length > 0
    ? applications.reduce((sum, a) => sum + (Number(a.ai_rating) || 0), 0) / applications.filter(a => a.ai_rating).length
    : 0;

  // Interview analytics
  const totalInterviews = interviews.length;
  const scheduledInterviews = interviews.filter(i => i.status === 'scheduled').length;

  // Credit analytics
  const totalCreditsIssued = credits.filter(c => c.amount > 0).reduce((sum, c) => sum + c.amount, 0);
  const totalCreditsUsed = Math.abs(credits.filter(c => c.amount < 0).reduce((sum, c) => sum + c.amount, 0));

  // Referral analytics
  const totalReferrals = referrals.length;
  const successfulReferrals = referrals.filter(r => r.status === 'rewarded').length;

  // Company analytics
  const totalCompanies = companies.length;
  const verifiedCompanies = companies.filter(c => c.is_verified).length;
  const activeRecruiters = companies.filter(c => (c.jobs_posted || 0) > 0).length;

  // Subscription analytics
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const paidSubscriptions = subscriptions.filter(s => s.plan && s.plan.toLowerCase() !== 'free').length;

  // Resume/CV analytics
  const totalResumesGenerated = resumes.length;
  const resumesLast30Days = resumes.filter(r => r.created_at && new Date(r.created_at) >= last30Days).length;
  
  const resumesByType = resumes.reduce((acc, resume) => {
    const type = resume.resume_type ? toTitleCase(resume.resume_type) : "Standard";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const resumesByTemplate = resumes.reduce((acc, resume) => {
    const template = resume.template ? toTitleCase(resume.template) : "Default";
    acc[template] = (acc[template] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Growth over time (last 6 months)
  const monthlyGrowth = [];
  const monthlyRevenue: number[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));
    const monthLabel = monthStart.toLocaleString('default', { month: 'short', year: '2-digit' });

    const usersInMonth = users.filter(u => {
      if (!u.registration_date) return false;
      const date = new Date(u.registration_date);
      return date >= monthStart && date <= monthEnd;
    }).length;

    const jobsInMonth = jobs.filter(j => {
      if (!j.Time) return false;
      const date = new Date(j.Time);
      return date >= monthStart && date <= monthEnd;
    }).length;

    const applicationsInMonth = applications.filter(a => {
      if (!a.applied_at) return false;
      const date = new Date(a.applied_at);
      return date >= monthStart && date <= monthEnd;
    }).length;

    // Calculate revenue for this month
    const revenueInMonth = earnings
      .filter(earning => {
        if (!earning.earned_at) return false;
        const earnedDate = new Date(earning.earned_at);
        return earnedDate >= monthStart && earnedDate <= monthEnd;
      })
      .reduce((sum, earning) => {
        const amount = parseFloat(earning.amount as any) || 0;
        return sum + amount;
      }, 0);
    
    monthlyRevenue.push(revenueInMonth);

    monthlyGrowth.push({
      month: monthLabel,
      users: usersInMonth,
      jobs: jobsInMonth,
      applications: applicationsInMonth
    });
  }
  
  // Calculate average monthly revenue from last 6 months
  const avgMonthlyRevenue = monthlyRevenue.length > 0
    ? monthlyRevenue.reduce((sum, rev) => sum + rev, 0) / monthlyRevenue.length
    : 0;

  // Top locations
  const userLocations = users.reduce((acc, user) => {
    if (user.location) {
      const location = toTitleCase(user.location.trim());
      acc[location] = (acc[location] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topLocations = Object.entries(userLocations)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  // Top skills
  const skillCounts: Record<string, number> = {};
  users.forEach(user => {
    if (user.skills && typeof user.skills === 'object') {
      Object.values(user.skills).forEach((skill: any) => {
        if (typeof skill === 'string') {
          const normalizedSkill = toTitleCase(skill.trim());
          skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
        }
      });
    }
  });

  const topSkills = Object.entries(skillCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  return {
    // Overview metrics
    overview: {
      totalUsers: users.length,
      activeUsers,
      verifiedUsers,
      totalCompanies,
      verifiedCompanies,
      activeRecruiters,
      totalJobs: jobs.length,
      activeJobs,
      pendingJobs,
      featuredJobs,
      totalApplications,
      shortlistedApplications,
      totalInterviews,
      scheduledInterviews,
      totalRevenue,
      revenueLastMonth,
      activeSubscriptions,
      paidSubscriptions,
      userGrowthRate,
      jobGrowthRate,
      totalResumesGenerated,
      resumesLast30Days,
    },

    // User metrics
    users: {
      total: users.length,
      active: activeUsers,
      blocked: users.filter(u => u.is_blocked).length,
      verified: verifiedUsers,
      byRole: Object.entries(usersByRole).map(([name, value]) => ({ name, value })),
      newLast30Days: newUsersLast30,
      topLocations,
      topSkills,
    },

    // Job metrics
    jobs: {
      total: jobs.length,
      active: activeJobs,
      pending: pendingJobs,
      rejected: jobs.filter(j => j.rejected === 'yes').length,
      featured: featuredJobs,
      byCategory: Object.entries(jobsByCategory)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([name, value]) => ({ name, value })),
      newLast30Days: newJobsLast30,
    },

    // Application metrics
    applications: {
      total: totalApplications,
      shortlisted: shortlistedApplications,
      rejected: applications.filter(a => a.status === 'rejected').length,
      pending: applications.filter(a => a.status === 'pending' || !a.status).length,
      avgAIRating: avgAIRating.toFixed(1),
    },

    // Financial metrics
    finance: {
      totalRevenue,
      revenueLastMonth,
      avgMonthlyRevenue,
      totalCreditsIssued,
      totalCreditsUsed,
      netCredits: totalCreditsIssued - totalCreditsUsed,
      totalReferrals,
      successfulReferrals,
      referralCreditsAwarded: referrals.reduce((sum, r) => sum + (r.referrer_credits_awarded || 0) + (r.referee_credits_awarded || 0), 0),
    },

    // Engagement metrics
    engagement: {
      totalInterviews,
      scheduledInterviews,
      completedInterviews: interviews.filter(i => i.status === 'completed').length,
      applicationRate: jobs.length > 0 ? (totalApplications / jobs.length).toFixed(2) : "0",
      interviewRate: totalApplications > 0 ? ((totalInterviews / totalApplications) * 100).toFixed(1) : "0",
      totalResumesGenerated,
      resumesLast30Days,
    },

    // Resume/CV metrics
    resumes: {
      total: totalResumesGenerated,
      last30Days: resumesLast30Days,
      byType: Object.entries(resumesByType).map(([name, value]) => ({ name, value })),
      byTemplate: Object.entries(resumesByTemplate)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([name, value]) => ({ name, value })),
    },

    // Growth data
    monthlyGrowth,
  };
}

