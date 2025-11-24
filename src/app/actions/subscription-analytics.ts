"use server";

import { createClient } from "@/utils/supabase/server";
import { isAfter, isBefore } from "date-fns";

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export async function getSubscriptionAnalytics() {
  const supabase = await createClient();
  
  let allSubscriptions: any[] = [];
  const PAGE_SIZE = 1000;
  let page = 0;
  let hasMore = true;

  // Fetch all subscription history with pagination
  while (hasMore) {
    const { data: subscriptions, error } = await supabase
      .from("subscription_history")
      .select("plan, status, start_date, end_date, amount, created_at, company_uid")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
        console.error("Error fetching subscription analytics data:", error);
        break;
    }

    if (subscriptions && subscriptions.length > 0) {
      allSubscriptions = [...allSubscriptions, ...subscriptions];
      if (subscriptions.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  const subscriptions = allSubscriptions;

  // 1. Plan Distribution
  const planDistribution = subscriptions.reduce((acc, sub) => {
    const plan = sub.plan ? toTitleCase(sub.plan) : "Free";
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Status Distribution
  const statusDistribution = subscriptions.reduce((acc, sub) => {
    const status = sub.status ? toTitleCase(sub.status) : "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 3. Revenue Calculation
  let totalRevenue = 0;
  let activeRevenue = 0;
  
  subscriptions.forEach(sub => {
    const amount = parseFloat(sub.amount) || 0;
    totalRevenue += amount;
    
    if (sub.status === 'active' && sub.end_date) {
      try {
        const endDate = new Date(sub.end_date);
        if (isAfter(endDate, new Date())) {
          activeRevenue += amount;
        }
      } catch {}
    }
  });

  // 4. Subscriptions by Month
  const subscriptionsByMonth = subscriptions.reduce((acc, sub) => {
    if (!sub.created_at) return acc;
    try {
      const date = new Date(sub.created_at);
      if (isNaN(date.getTime())) return acc;
      
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    } catch (e) {
      // Ignore
    }
    return acc;
  }, {} as Record<string, number>);

  // 5. Revenue by Month
  const revenueByMonth = subscriptions.reduce((acc, sub) => {
    if (!sub.created_at) return acc;
    try {
      const date = new Date(sub.created_at);
      if (isNaN(date.getTime())) return acc;
      
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      const amount = parseFloat(sub.amount) || 0;
      acc[monthYear] = (acc[monthYear] || 0) + amount;
    } catch (e) {
      // Ignore
    }
    return acc;
  }, {} as Record<string, number>);

  // 6. Top Subscribers (companies with most subscriptions or highest spend)
  const companySpending = subscriptions.reduce((acc, sub) => {
    if (!sub.company_uid) return acc;
    if (!acc[sub.company_uid]) {
      acc[sub.company_uid] = {
        count: 0,
        totalSpent: 0,
        activeSubscriptions: 0,
        currentPlan: sub.plan || "Free"
      };
    }
    acc[sub.company_uid].count += 1;
    acc[sub.company_uid].totalSpent += parseFloat(sub.amount) || 0;
    if (sub.status === 'active') {
      acc[sub.company_uid].activeSubscriptions += 1;
      acc[sub.company_uid].currentPlan = sub.plan || "Free";
    }
    return acc;
  }, {} as Record<string, { count: number; totalSpent: number; activeSubscriptions: number; currentPlan: string }>);

  // Get top 10 subscribers by total spend
  const topSubscribers = Object.entries(companySpending)
    .sort(([, a], [, b]) => (b as { count: number; totalSpent: number; activeSubscriptions: number; currentPlan: string }).totalSpent - (a as { count: number; totalSpent: number; activeSubscriptions: number; currentPlan: string }).totalSpent)
    .slice(0, 10)
    .map(([uid, data]) => ({ uid, ...(data as { count: number; totalSpent: number; activeSubscriptions: number; currentPlan: string }) }));

  // Fetch company details for top subscribers
  if (topSubscribers.length > 0) {
    const { data: companies } = await supabase
      .from("companies")
      .select("uid, company_name, email")
      .in("uid", topSubscribers.map(s => s.uid));

    const companyMap = new Map(companies?.map(c => [c.uid, c]) || []);
    
    topSubscribers.forEach(subscriber => {
      const company = companyMap.get(subscriber.uid);
      if (company) {
        (subscriber as any).name = company.company_name || "Unknown";
        (subscriber as any).email = company.email || "";
      }
    });
  }

  return {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    cancelledSubscriptions: subscriptions.filter(s => s.status === 'cancelled').length,
    totalRevenue,
    activeRevenue,
    planDistribution: Object.entries(planDistribution).map(([name, value]) => ({ name, value: value as number })),
    statusDistribution: Object.entries(statusDistribution).map(([name, value]) => ({ name, value: value as number })),
    subscriptionsHistory: Object.entries(subscriptionsByMonth).map(([date, count]) => ({ date, "Subscriptions": count as number })),
    revenueHistory: Object.entries(revenueByMonth).map(([date, revenue]) => ({ date, "Revenue": revenue as number })),
    topSubscribers,
  };
}

