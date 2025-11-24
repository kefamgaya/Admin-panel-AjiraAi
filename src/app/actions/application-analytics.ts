"use server";

import { createClient } from "@/utils/supabase/server";

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export async function getApplicationAnalytics() {
  const supabase = await createClient();
  
  let allApplications: any[] = [];
  const PAGE_SIZE = 1000;
  let page = 0;
  let hasMore = true;

  // Fetch all applications with pagination
  while (hasMore) {
    const { data: applications, error } = await supabase
      .from("job_applications")
      .select("status, ai_rating, applied_at")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
        console.error("Error fetching application analytics data:", error);
        break;
    }

    if (applications && applications.length > 0) {
      allApplications = [...allApplications, ...applications];
      if (applications.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  const applications = allApplications;

  // 1. Status Distribution
  const statusDistribution = applications.reduce((acc, app) => {
    const status = app.status ? toTitleCase(app.status) : "Pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. AI Rating Distribution
  const ratingDistribution = applications.reduce((acc, app) => {
    if (app.ai_rating) {
      const rating = Math.floor(Number(app.ai_rating)); // Group by integer rating (0-10)
      const label = `${rating}-${rating + 1} Stars`;
      acc[label] = (acc[label] || 0) + 1;
    } else {
        acc["Unrated"] = (acc["Unrated"] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // 3. Growth (New Applications by Month)
  const growthByMonth = applications.reduce((acc, app) => {
    if (!app.applied_at) return acc;
    try {
      const date = new Date(app.applied_at);
      if (isNaN(date.getTime())) return acc; 
      
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    } catch (e) {
      // Ignore
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalApplications: applications.length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    pending: applications.filter(a => a.status === 'pending' || !a.status).length,
    avgRating: (applications.reduce((sum, app) => sum + (Number(app.ai_rating) || 0), 0) / (applications.filter(a => a.ai_rating).length || 1)).toFixed(1),
    statusDistribution: Object.entries(statusDistribution).map(([name, value]) => ({ name, value: value as number })),
    ratingDistribution: Object.entries(ratingDistribution)
        .sort((a, b) => {
            if (a[0] === "Unrated") return 1;
            if (b[0] === "Unrated") return -1;
            return parseInt(a[0]) - parseInt(b[0]);
        })
        .map(([name, value]) => ({ name, value: value as number })),
    growthHistory: Object.entries(growthByMonth).map(([date, count]) => ({ date, "New Applications": count as number })),
  };
}

