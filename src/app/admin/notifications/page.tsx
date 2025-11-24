import { createClient } from "@/utils/supabase/server";
import { Title, Text, TabGroup, TabList, Tab, TabPanels, TabPanel } from "@tremor/react";
import { NotificationsAnalytics } from "@/components/admin/notifications/NotificationsAnalytics";
import { NotificationsTable } from "@/components/admin/notifications/NotificationsTable";
import { SendNotificationForm } from "@/components/admin/notifications/SendNotificationForm";
import { getNotificationAnalytics } from "@/app/actions/notification-analytics";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const supabase = await createClient();
  const currentPage = Number(searchParams.page) || 1;
  const searchQuery = searchParams.search || "";
  const itemsPerPage = 20;

  try {
    // Fetch analytics
    const analyticsData = await getNotificationAnalytics();

    // Build query for notifications
    let query = supabase
      .from("notification_history")
      .select("*", { count: "exact" })
      .order("sent_at", { ascending: false });

    // Apply search filter
    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%,sent_by.ilike.%${searchQuery}%`
      );
    }

    // Get total count
    const { count: totalCount } = await query;
    const totalPages = Math.ceil((totalCount || 0) / itemsPerPage);

    // Fetch paginated notifications
    const { data: notifications, error } = await query
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    if (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }

    return (
      <div className="p-6 space-y-6">
        <div>
          <Title>Push Notifications</Title>
          <Text className="mt-2">
            Send and manage Firebase Cloud Messaging (FCM) notifications
          </Text>
        </div>

        <TabGroup>
          <TabList>
            <Tab>Analytics</Tab>
            <Tab>Send Notification</Tab>
            <Tab>History</Tab>
          </TabList>
          <TabPanels>
            {/* Analytics Tab */}
            <TabPanel>
              <div className="mt-6">
                <NotificationsAnalytics data={analyticsData} />
              </div>
            </TabPanel>

            {/* Send Notification Tab */}
            <TabPanel>
              <div className="mt-6">
                <SendNotificationForm />
              </div>
            </TabPanel>

            {/* History Tab */}
            <TabPanel>
              <div className="mt-6">
                <NotificationsTable
                  notifications={notifications || []}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  searchQuery={searchQuery}
                />
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    );
  } catch (error) {
    console.error("Error loading notifications page:", error);
    return (
      <div className="p-6">
        <Title>Error</Title>
        <Text className="mt-2 text-red-500">
          Failed to load notifications data. Please try again later.
        </Text>
      </div>
    );
  }
}
