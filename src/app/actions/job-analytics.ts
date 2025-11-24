"use server";

import { createClient } from "@/utils/supabase/server";
import { differenceInDays, isAfter, isBefore, parseISO } from "date-fns";

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export async function getJobAnalytics() {
  const supabase = await createClient();
  
  let allJobs: any[] = [];
  const PAGE_SIZE = 1000;
  let page = 0;
  let hasMore = true;

  // Fetch all jobs with pagination
  while (hasMore) {
    // Removed 'created_at' as it does not exist in the latest_jobs schema
    const { data: jobs, error } = await supabase
      .from("latest_jobs")
      .select("id, category, type, location, approved, pending, rejected, is_featured, Time, deadline")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
        console.error("Error fetching job analytics data:", error);
        break;
    }

    if (jobs && jobs.length > 0) {
      allJobs = [...allJobs, ...jobs];
      if (jobs.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  const jobs = allJobs;

  // 1. Job Status
  const statusDistribution = {
    Approved: jobs.filter(j => j.approved === 'yes').length,
    Pending: jobs.filter(j => j.pending === 'yes').length,
    Rejected: jobs.filter(j => j.rejected === 'yes').length,
  };

  // 2. Category Distribution
  const categoryDistribution = jobs.reduce((acc, job) => {
    const category = job.category ? toTitleCase(job.category) : "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 3. Job Type Distribution (Full Time, Part Time, etc.)
  const typeDistribution = jobs.reduce((acc, job) => {
    const type = job.type ? toTitleCase(job.type) : "Not Specified";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 4. Location Distribution
  const locationDistribution = jobs.reduce((acc, job) => {
    if (job.location) {
      const normalizedLocation = toTitleCase(job.location.trim());
      acc[normalizedLocation] = (acc[normalizedLocation] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // 5. Growth (New Jobs by Month)
  // Uses 'Time' field based on schema inspection
  const growthByMonth = jobs.reduce((acc, job) => {
    const dateStr = job.Time;
    if (!dateStr) return acc;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return acc; 
      
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    } catch (e) {
      // Ignore
    }
    return acc;
  }, {} as Record<string, number>);

  // 6. Active vs Expired (based on deadline)
  const activeJobsCount = jobs.filter(j => {
      if (!j.deadline) return true; // Assume active if no deadline? Or filter out. Let's assume active.
      try {
          const deadline = new Date(j.deadline);
          return isAfter(deadline, new Date());
      } catch {
          return true;
      }
  }).length;

  return {
    totalJobs: jobs.length,
    activeJobs: activeJobsCount,
    featuredJobs: jobs.filter(j => j.is_featured).length,
    pendingJobs: statusDistribution.Pending,
    statusDistribution: Object.entries(statusDistribution).map(([name, value]) => ({ name, value })),
    categoryDistribution: Object.entries(categoryDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, value]) => ({ name, value })),
    typeDistribution: Object.entries(typeDistribution).map(([name, value]) => ({ name, value })),
    locationDistribution: Object.entries(locationDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, value]) => ({ name, value })),
    growthHistory: Object.entries(growthByMonth).map(([date, count]) => ({ date, "New Jobs": count })),
  };
}
