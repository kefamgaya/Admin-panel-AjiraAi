"use server";

import { createClient } from "@/utils/supabase/server";
import { subMonths, format, startOfMonth, getUnixTime } from "date-fns";
import { getAccessToken, fetchAdMobEarnings } from "@/lib/admob";
import { revalidatePath } from "next/cache";

// Specific app ID for Ajira AI
const AJIRA_APP_ID = "ca-app-pub-1644643871385985~1470724022";

// Shared function to fetch all-time AdMob earnings from API for specific app
export async function getAllTimeAdMobEarnings(): Promise<number> {
  try {
    const clientId = process.env.ADMOB_API_CLIENT_ID;
    const clientSecret = process.env.ADMOB_API_CLIENT_SECRET;
    const refreshToken = process.env.ADMOB_API_REFRESH_TOKEN;
    const publisherId = process.env.ADMOB_PUBLISHER_ID?.replace("pub-", "");

    if (!clientId || !clientSecret || !refreshToken || !publisherId) {
      console.warn("AdMob credentials not configured, falling back to database");
      return 0;
    }

    console.log("Fetching AdMob all-time earnings for app:", AJIRA_APP_ID);

    // Fetch all-time AdMob earnings for specific app (from app launch date, using a very early date)
    const accessToken = await getAccessToken({ clientId, clientSecret, refreshToken });
    // AdMob typically has data from when the app was first published
    // Use a date 5 years ago as start date to ensure we get all historical data
    const allTimeStartDate = new Date();
    allTimeStartDate.setFullYear(allTimeStartDate.getFullYear() - 5);
    const allTimeEndDate = new Date();

    console.log(`Fetching AdMob data from ${allTimeStartDate.toISOString()} to ${allTimeEndDate.toISOString()}`);

    const admobReportData = await fetchAdMobEarnings(
      publisherId,
      accessToken,
      allTimeStartDate,
      allTimeEndDate,
      AJIRA_APP_ID // Filter by specific app ID
    );

    const totalEarnings = admobReportData.reduce((sum, row) => sum + row.earnings, 0);
    console.log(`AdMob all-time earnings fetched: $${totalEarnings.toFixed(2)} from ${admobReportData.length} data points`);

    // Sum all AdMob earnings from the report
    return totalEarnings;
  } catch (error: any) {
    console.error("Error fetching AdMob all-time earnings:", error);
    console.error("Error details:", error?.message, error?.stack);
    return 0; // Return 0 on error, will fall back to database
  }
}

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

export async function syncAdMobData(daysToSync: number = 30) {
  const supabase = await createClient();
  
  const clientId = process.env.ADMOB_API_CLIENT_ID;
  const clientSecret = process.env.ADMOB_API_CLIENT_SECRET;
  const refreshToken = process.env.ADMOB_API_REFRESH_TOKEN;
  const publisherId = process.env.ADMOB_PUBLISHER_ID?.replace("pub-", "");

  if (!clientId || !clientSecret || !refreshToken || !publisherId) {
    return { success: false, error: "AdMob credentials missing in .env.local" };
  }

  try {
    const accessToken = await getAccessToken({ clientId, clientSecret, refreshToken });
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysToSync); // Use dynamic duration

    // Use the specific app ID: ca-app-pub-1644643871385985~1470724022
    const appId = AJIRA_APP_ID;
    
    const reportData = await fetchAdMobEarnings(publisherId, accessToken, startDate, endDate, appId);

    let processedCount = 0;
    for (const row of reportData) {
      const earnedAt = new Date(row.date);
      earnedAt.setUTCHours(12, 0, 0, 0);
      const earnedAtIso = earnedAt.toISOString();
      
      const dayStart = new Date(row.date);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(row.date);
      dayEnd.setUTCHours(23, 59, 59, 999);

      const { data: existing } = await supabase
        .from("earnings")
        .select("id")
        .eq("revenue_source", "admob")
        .gte("earned_at", dayStart.toISOString())
        .lte("earned_at", dayEnd.toISOString())
        .maybeSingle();

      if (existing) {
        await supabase.from("earnings").update({
          amount: row.earnings,
          metadata: {
            impressions: row.impressions,
            clicks: row.clicks,
            ctr: row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0,
            ecpm: row.impressions > 0 ? (row.earnings / row.impressions) * 1000 : 0,
            last_synced: new Date().toISOString()
          }
        }).eq("id", existing.id);
      } else {
        await supabase.from("earnings").insert({
          revenue_source: "admob",
          amount: row.earnings,
          currency: row.currency,
          description: "AdMob Daily Earnings",
          earned_at: earnedAtIso,
          metadata: {
            impressions: row.impressions,
            clicks: row.clicks,
            ctr: row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0,
            ecpm: row.impressions > 0 ? (row.earnings / row.impressions) * 1000 : 0,
            last_synced: new Date().toISOString()
          }
        });
      }
      processedCount++;
    }

    revalidatePath("/admin/earnings");
    return { success: true, count: processedCount };

  } catch (error: any) {
    console.error("AdMob sync error:", error);
    return { success: false, error: error.message || "Failed to sync AdMob data" };
  }
}

export async function getEarningsAnalytics() {
  const supabase = await createClient();
  const now = new Date();
  const thirtyDaysAgo = subMonths(now, 1);

  try {
    // Try to fetch earnings
    // If table doesn't exist, Supabase might throw or return error code 42P01
    const { data: allEarnings, error } = await supabase
      .from("earnings")
      .select("*");

    if (error) {
      console.error("Error fetching earnings:", error);
      // Return zero data instead of throwing if it's just missing table or permission
      // But if it's a connection error, we might still want to show it?
      // Let's return zero data to allow page to render empty state.
      return {
        totalEarnings: 0,
        earningsLast30Days: 0,
        growthRate: 0,
        revenueSourceDistribution: [],
        totalAdMobRevenue: 0,
        admobLast30Days: 0,
        totalAdImpressions: 0,
        totalAdClicks: 0,
        avgCTR: 0,
        avgECPM: 0,
        subscriptionEarnings: 0,
        featuredJobEarnings: 0,
        creditsPurchaseEarnings: 0,
        earningsGrowth: [],
        topRevenueSources: [],
      };
    }

    // Check if empty
    if (!allEarnings || allEarnings.length === 0) {
        return {
            totalEarnings: 0,
            earningsLast30Days: 0,
            growthRate: 0,
            revenueSourceDistribution: [],
            totalAdMobRevenue: 0,
            admobLast30Days: 0,
            totalAdImpressions: 0,
            totalAdClicks: 0,
            avgCTR: 0,
            avgECPM: 0,
            subscriptionEarnings: 0,
            featuredJobEarnings: 0,
            creditsPurchaseEarnings: 0,
            earningsGrowth: [],
            topRevenueSources: [],
        };
    }

    // Fetch real AdMob all-time earnings from API
    const admobAllTimeFromAPI = await getAllTimeAdMobEarnings();
    
    // Calculate totals
    // Separate AdMob earnings from other earnings
    const admobEarningsFromDB = allEarnings
      .filter(e => e.revenue_source === "admob")
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    
    // Use API data if available, otherwise use database
    const totalAdMobAllTime = admobAllTimeFromAPI > 0 ? admobAllTimeFromAPI : admobEarningsFromDB;
    
    // Other earnings (non-AdMob)
    const otherEarnings = allEarnings
      .filter(e => e.revenue_source !== "admob")
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    
    // Total earnings = AdMob (from API) + other earnings
    const totalEarnings = totalAdMobAllTime + otherEarnings;
    
    const earningsLast30Days = allEarnings
      .filter(e => new Date(e.earned_at) >= thirtyDaysAgo)
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    // Revenue by source
    const revenueBySource = allEarnings.reduce((acc, e) => {
      const source = e.revenue_source || "other";
      acc[source] = (acc[source] || 0) + parseFloat(e.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const revenueSourceDistribution = Object.entries(revenueBySource).map(([name, value]) => ({
      name: name.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: value as number,
    }));

    // AdMob specific metrics
    // Use API data for all-time, database for last 30 days
    const admobEarnings = allEarnings.filter(e => e.revenue_source === "admob");
    const totalAdMobRevenue = totalAdMobAllTime; // Use API data for all-time
    const admobLast30Days = admobEarnings
      .filter(e => new Date(e.earned_at) >= thirtyDaysAgo)
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    
    // Calculate AdMob impressions from metadata
    const totalAdImpressions = admobEarnings.reduce((sum, e) => {
      // Handle both JSON object and string (if parsed improperly)
      const meta = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata;
      return sum + (meta?.impressions || 0);
    }, 0);

    const totalAdClicks = admobEarnings.reduce((sum, e) => {
      const meta = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata;
      return sum + (meta?.clicks || 0);
    }, 0);

    const avgCTR = totalAdImpressions > 0 ? (totalAdClicks / totalAdImpressions) * 100 : 0;
    const avgECPM = totalAdImpressions > 0 ? (totalAdMobRevenue / totalAdImpressions) * 1000 : 0;

    // Subscription earnings
    const subscriptionEarnings = allEarnings
      .filter(e => e.revenue_source === "subscription")
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    // Featured job earnings
    const featuredJobEarnings = allEarnings
      .filter(e => e.revenue_source === "featured_job")
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    // Credits purchase earnings
    const creditsPurchaseEarnings = allEarnings
      .filter(e => e.revenue_source === "credits_purchase")
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    // Monthly earnings growth (last 6 months)
    const monthlyDataMap = new Map<string, { date: string; earnings: number; admob: number; subscriptions: number; other: number }>();
    for (let i = 0; i < 6; i++) {
      const month = subMonths(now, i);
      const formattedMonth = format(startOfMonth(month), "MMM yyyy");
      monthlyDataMap.set(formattedMonth, { 
        date: formattedMonth, 
        earnings: 0, 
        admob: 0, 
        subscriptions: 0, 
        other: 0 
      });
    }

    allEarnings.forEach(e => {
      const earnedMonth = format(startOfMonth(new Date(e.earned_at)), "MMM yyyy");
      if (monthlyDataMap.has(earnedMonth)) {
        const entry = monthlyDataMap.get(earnedMonth)!;
        const amount = parseFloat(e.amount || 0);
        entry.earnings += amount;
        
        if (e.revenue_source === "admob") {
          entry.admob += amount;
        } else if (e.revenue_source === "subscription") {
          entry.subscriptions += amount;
        } else {
          entry.other += amount;
        }
      }
    });

    const earningsGrowth = Array.from(monthlyDataMap.values())
      .sort((a, b) => getUnixTime(new Date(a.date)) - getUnixTime(new Date(b.date)));

    // Top revenue sources
    const topRevenueSources = Object.entries(revenueBySource)
      .map(([name, amount]) => ({
        name: name.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
        amount: amount as number,
        percentage: totalEarnings > 0 ? ((amount as number) / totalEarnings) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Calculate growth rate
    const sixMonthsAgo = subMonths(now, 6);
    const earningsLastSixMonths = allEarnings
      .filter(e => new Date(e.earned_at) >= sixMonthsAgo)
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    
    const earningsPreviousSixMonths = allEarnings
      .filter(e => {
        const date = new Date(e.earned_at);
        return date < sixMonthsAgo && date >= subMonths(sixMonthsAgo, 6);
      })
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    const growthRate = earningsPreviousSixMonths > 0
      ? ((earningsLastSixMonths - earningsPreviousSixMonths) / earningsPreviousSixMonths) * 100
      : 0;

    return {
      totalEarnings,
      earningsLast30Days,
      growthRate,
      revenueSourceDistribution,
      totalAdMobRevenue,
      admobLast30Days,
      totalAdImpressions,
      totalAdClicks,
      avgCTR,
      avgECPM,
      subscriptionEarnings,
      featuredJobEarnings,
      creditsPurchaseEarnings,
      earningsGrowth,
      topRevenueSources,
    };
  } catch (error) {
    console.error("Error in getEarningsAnalytics:", error);
    // Return safe empty data
    return {
        totalEarnings: 0,
        earningsLast30Days: 0,
        growthRate: 0,
        revenueSourceDistribution: [],
        totalAdMobRevenue: 0,
        admobLast30Days: 0,
        totalAdImpressions: 0,
        totalAdClicks: 0,
        avgCTR: 0,
        avgECPM: 0,
        subscriptionEarnings: 0,
        featuredJobEarnings: 0,
        creditsPurchaseEarnings: 0,
        earningsGrowth: [],
        topRevenueSources: [],
    };
  }
}
