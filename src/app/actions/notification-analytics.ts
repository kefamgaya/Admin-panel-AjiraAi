"use server";

import { createClient } from "@/utils/supabase/server";
import { subMonths, format, startOfMonth } from "date-fns";

// Helper function to fetch all data with pagination
async function fetchAllData(
  supabase: any,
  table: string,
  select: string
): Promise<any[]> {
  let allData: any[] = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error, count } = await supabase
      .from(table)
      .select(select, { count: "exact" })
      .range(from, from + batchSize - 1);

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      throw error;
    }

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      from += batchSize;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  return allData;
}

export async function getNotificationAnalytics() {
  const supabase = await createClient();

  try {
    // Fetch all notification history
    const notifications = await fetchAllData(
      supabase,
      "notification_history",
      "id, title, message, recipient_type, recipient_uids, sent_at, sent_by, delivery_count, read_count"
    );

    const now = new Date();
    const last30Days = subMonths(now, 1);
    const last7Days = new Date();
    last7Days.setDate(now.getDate() - 7);

    // Basic metrics
    const totalNotifications = notifications.length;
    const totalDelivered = notifications.reduce((sum, n) => sum + (n.delivery_count || 0), 0);
    const totalRead = notifications.reduce((sum, n) => sum + (n.read_count || 0), 0);

    // Recent activity
    const notificationsLast30Days = notifications.filter(
      n => n.sent_at && new Date(n.sent_at) >= last30Days
    ).length;

    const notificationsLast7Days = notifications.filter(
      n => n.sent_at && new Date(n.sent_at) >= last7Days
    ).length;

    const deliveredLast30Days = notifications
      .filter(n => n.sent_at && new Date(n.sent_at) >= last30Days)
      .reduce((sum, n) => sum + (n.delivery_count || 0), 0);

    // Delivery and read rates
    const deliveryRate = totalNotifications > 0 
      ? ((totalDelivered / (totalNotifications * 100)) * 100).toFixed(1)
      : "0";
    
    const readRate = totalDelivered > 0 
      ? ((totalRead / totalDelivered) * 100).toFixed(1)
      : "0";

    // Recipient type distribution
    const recipientTypeDistribution = notifications.reduce((acc, notif) => {
      const type = notif.recipient_type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average recipients per notification
    const avgRecipientsPerNotification = totalNotifications > 0
      ? (notifications.reduce((sum, n) => {
          const recipientCount = Array.isArray(n.recipient_uids) ? n.recipient_uids.length : 0;
          return sum + recipientCount;
        }, 0) / totalNotifications).toFixed(1)
      : "0";

    // Growth history (last 6 months)
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = i === 0 ? now : startOfMonth(subMonths(now, i - 1));
      
      const monthNotifications = notifications.filter(n => {
        if (!n.sent_at) return false;
        const date = new Date(n.sent_at);
        return date >= monthStart && date < monthEnd;
      });

      const monthSent = monthNotifications.length;
      const monthDelivered = monthNotifications.reduce((sum, n) => sum + (n.delivery_count || 0), 0);
      const monthRead = monthNotifications.reduce((sum, n) => sum + (n.read_count || 0), 0);

      monthlyGrowth.push({
        month: format(monthStart, "MMM yyyy"),
        sent: monthSent,
        delivered: monthDelivered,
        read: monthRead,
      });
    }

    // Most active senders
    const senderActivity = notifications.reduce((acc, notif) => {
      const sender = notif.sent_by || "System";
      if (!acc[sender]) {
        acc[sender] = {
          count: 0,
          delivered: 0,
          read: 0,
        };
      }
      acc[sender].count += 1;
      acc[sender].delivered += notif.delivery_count || 0;
      acc[sender].read += notif.read_count || 0;
      return acc;
    }, {} as Record<string, { count: number; delivered: number; read: number }>);

    const topSenders = Object.entries(senderActivity)
      .sort(([, a], [, b]) => (b as { count: number; delivered: number; read: number }).count - (a as { count: number; delivered: number; read: number }).count)
      .slice(0, 10)
      .map(([sender, stats]) => ({
        sender,
        ...(stats as { count: number; delivered: number; read: number }),
      }));

    // Engagement metrics
    const avgDeliveryRate = totalNotifications > 0
      ? ((totalDelivered / totalNotifications) * 100).toFixed(1)
      : "0";

    const avgReadRate = totalDelivered > 0
      ? ((totalRead / totalDelivered) * 100).toFixed(1)
      : "0";

    return {
      overview: {
        totalNotifications,
        totalDelivered,
        totalRead,
        notificationsLast30Days,
        notificationsLast7Days,
        deliveredLast30Days,
        avgRecipientsPerNotification,
      },
      engagement: {
        deliveryRate: avgDeliveryRate,
        readRate: avgReadRate,
        totalDelivered,
        totalRead,
      },
      recipientTypes: Object.entries(recipientTypeDistribution)
        .map(([name, value]) => ({ name, value: value as number }))
        .sort((a, b) => b.value - a.value),
      growth: monthlyGrowth,
      topSenders,
    };
  } catch (error) {
    console.error("Error fetching notification analytics:", error);
    throw error;
  }
}

