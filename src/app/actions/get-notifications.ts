"use server";

import { createClient } from "@/utils/supabase/server";
import { formatDistanceToNow } from "date-fns";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const supabase = await createClient();
  const notifications: Notification[] = [];

  try {
    // 1. Get recent notification history (last 10)
    const { data: history } = await supabase
      .from("notification_history")
      .select("id, title, message, sent_at")
      .order("sent_at", { ascending: false })
      .limit(5);

    if (history) {
      history.forEach((notif) => {
        notifications.push({
          id: `history-${notif.id}`,
          title: notif.title,
          message: notif.message,
          type: "system",
          read: false, // You can add a read status table later
          created_at: notif.sent_at,
          link: "/admin/notifications",
        });
      });
    }

    // 2. Get pending jobs count
    const { count: pendingJobsCount } = await supabase
      .from("latest_jobs")
      .select("*", { count: "exact", head: true })
      .eq("pending", "yes");

    if (pendingJobsCount && pendingJobsCount > 0) {
      notifications.push({
        id: "pending-jobs",
        title: "Pending Jobs",
        message: `${pendingJobsCount} job${pendingJobsCount !== 1 ? "s" : ""} awaiting approval`,
        type: "job",
        read: false,
        created_at: new Date().toISOString(),
        link: "/admin/jobs/pending",
      });
    }

    // 3. Get unverified companies count
    const { count: unverifiedCompaniesCount } = await supabase
      .from("companies")
      .select("*", { count: "exact", head: true })
      .eq("is_verified", false);

    if (unverifiedCompaniesCount && unverifiedCompaniesCount > 0) {
      notifications.push({
        id: "unverified-companies",
        title: "Unverified Companies",
        message: `${unverifiedCompaniesCount} compan${unverifiedCompaniesCount !== 1 ? "ies" : "y"} need verification`,
        type: "company",
        read: false,
        created_at: new Date().toISOString(),
        link: "/admin/users/companies",
      });
    }

    // 4. Get recent applications (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { count: recentApplicationsCount } = await supabase
      .from("job_applications")
      .select("*", { count: "exact", head: true })
      .gte("applied_at", yesterday.toISOString());

    if (recentApplicationsCount && recentApplicationsCount > 0) {
      notifications.push({
        id: "recent-applications",
        title: "New Applications",
        message: `${recentApplicationsCount} new application${recentApplicationsCount !== 1 ? "s" : ""} received`,
        type: "application",
        read: false,
        created_at: new Date().toISOString(),
        link: "/admin/applications",
      });
    }

    // 5. Get blocked users count
    const { count: blockedUsersCount } = await supabase
      .from("all_users")
      .select("*", { count: "exact", head: true })
      .eq("is_blocked", true);

    if (blockedUsersCount && blockedUsersCount > 0) {
      notifications.push({
        id: "blocked-users",
        title: "Blocked Users",
        message: `${blockedUsersCount} user${blockedUsersCount !== 1 ? "s" : ""} currently blocked`,
        type: "user",
        read: false,
        created_at: new Date().toISOString(),
        link: "/admin/users/seekers",
      });
    }

    // Sort by created_at (most recent first)
    return notifications.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 10); // Limit to 10 most recent

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

