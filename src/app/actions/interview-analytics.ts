"use server";

import { createClient } from "@/utils/supabase/server";
import { isAfter, isBefore, parseISO, startOfDay } from "date-fns";

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export async function getInterviewAnalytics() {
  const supabase = await createClient();
  
  let allInterviews: any[] = [];
  const PAGE_SIZE = 1000;
  let page = 0;
  let hasMore = true;

  // Fetch all interviews with pagination
  while (hasMore) {
    const { data: interviews, error } = await supabase
      .from("interviews")
      .select("status, interview_type, interview_date, created_at")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
        console.error("Error fetching interview analytics data:", error);
        break;
    }

    if (interviews && interviews.length > 0) {
      allInterviews = [...allInterviews, ...interviews];
      if (interviews.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  const interviews = allInterviews;

  // 1. Status Distribution
  const statusDistribution = interviews.reduce((acc, interview) => {
    const status = interview.status ? toTitleCase(interview.status) : "Scheduled";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Type Distribution
  const typeDistribution = interviews.reduce((acc, interview) => {
    const type = interview.interview_type ? toTitleCase(interview.interview_type) : "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 3. Upcoming vs Past
  let upcoming = 0;
  let past = 0;
  const today = startOfDay(new Date());

  interviews.forEach(interview => {
      if (interview.interview_date) {
          try {
              const date = new Date(interview.interview_date);
              if (isBefore(date, today)) {
                  past++;
              } else {
                  upcoming++;
              }
          } catch {
              // ignore invalid dates
          }
      }
  });

  // 4. Growth (Interviews Scheduled by Month - using created_at)
  const growthByMonth = interviews.reduce((acc, interview) => {
    if (!interview.created_at) return acc;
    try {
      const date = new Date(interview.created_at);
      if (isNaN(date.getTime())) return acc; 
      
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    } catch (e) {
      // Ignore
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalInterviews: interviews.length,
    upcomingInterviews: upcoming,
    completedInterviews: past, // Assuming past date means completed for simplicity or use status
    scheduledToday: interviews.filter(i => {
        if(!i.interview_date) return false;
        try { return new Date(i.interview_date).toDateString() === new Date().toDateString(); } 
        catch { return false; }
    }).length,
    statusDistribution: Object.entries(statusDistribution).map(([name, value]) => ({ name, value })),
    typeDistribution: Object.entries(typeDistribution).map(([name, value]) => ({ name, value })),
    growthHistory: Object.entries(growthByMonth).map(([date, count]) => ({ date, "Interviews Scheduled": count })),
  };
}

