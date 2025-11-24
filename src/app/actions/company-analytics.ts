"use server";

import { createClient } from "@/utils/supabase/server";
import { differenceInDays } from "date-fns";

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export async function getCompanyAnalytics() {
  const supabase = await createClient();
  
  let allCompanies: any[] = [];
  const PAGE_SIZE = 1000;
  let page = 0;
  let hasMore = true;

  // Fetch all companies with pagination
  while (hasMore) {
    const { data: companies, error } = await supabase
      .from("companies")
      .select("company_size, industry, location, is_verified, subscription_plan, jobs_posted, is_blocked, created_at")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
        console.error("Error fetching company analytics data:", error);
        break;
    }

    if (companies && companies.length > 0) {
      allCompanies = [...allCompanies, ...companies];
      if (companies.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  const companies = allCompanies;

  // 1. Industry Distribution
  const industryDistribution = companies.reduce((acc, company) => {
    const industry = company.industry ? toTitleCase(company.industry) : "Unspecified";
    acc[industry] = (acc[industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Company Size Distribution
  const sizeDistribution = companies.reduce((acc, company) => {
    const size = company.company_size || "Unknown";
    acc[size] = (acc[size] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 3. Location Distribution
  const locationDistribution = companies.reduce((acc, company) => {
    if (company.location) {
      const normalizedLocation = toTitleCase(company.location.trim());
      acc[normalizedLocation] = (acc[normalizedLocation] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // 4. Subscription Plans
  const subscriptionDistribution = companies.reduce((acc, company) => {
    const plan = company.subscription_plan ? toTitleCase(company.subscription_plan) : "Free";
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 5. Growth (New Companies by Month)
  const growthByMonth = companies.reduce((acc, company) => {
    if (!company.created_at) return acc;
    try {
      const date = new Date(company.created_at);
      if (isNaN(date.getTime())) return acc; 
      
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    } catch (e) {
      // Ignore parsing errors
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalCompanies: companies.length,
    verifiedCompanies: companies.filter(c => c.is_verified).length,
    blockedCompanies: companies.filter(c => c.is_blocked).length,
    activeJobPosters: companies.filter(c => (c.jobs_posted || 0) > 0).length,
    industryDistribution: Object.entries(industryDistribution)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10) // Top 10 industries
        .map(([name, value]) => ({ name, value: value as number })),
    sizeDistribution: Object.entries(sizeDistribution).map(([name, value]) => ({ name, value: value as number })),
    locationDistribution: Object.entries(locationDistribution)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([name, value]) => ({ name, value: value as number })),
    subscriptionDistribution: Object.entries(subscriptionDistribution).map(([name, value]) => ({ name, value: value as number })),
    growthHistory: Object.entries(growthByMonth).map(([date, count]) => ({ date, "New Companies": count as number })),
  };
}

