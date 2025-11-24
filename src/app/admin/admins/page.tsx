import { createClient } from "@/utils/supabase/server";
import { Title, Text } from "@tremor/react";
import { AdminAnalytics } from "@/components/admin/admins/AdminAnalytics";
import { AdminsTable } from "@/components/admin/admins/AdminsTable";
import { getAdminAnalytics } from "@/app/actions/admin-management";

export default async function AdminsPage() {
  const supabase = await createClient();

  try {
    // Fetch analytics
    const { success, analytics, error: analyticsError } = await getAdminAnalytics();

    if (!success) {
      console.error("Error fetching analytics:", analyticsError);
    }

    // Fetch all admins
    const { data: admins, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admins:", error);
      throw error;
    }

    return (
      <div className="p-6 space-y-6">
        <div>
          <Title>Administrator Management</Title>
          <Text className="mt-2">
            Manage admin accounts, roles, and permissions
          </Text>
        </div>

        {/* Analytics */}
        {success && analytics && (
          <AdminAnalytics data={analytics} />
        )}

        {/* Admins Table */}
        <div className="mt-8">
          <Title>Administrators</Title>
          <Text className="mt-2 mb-4">
            All admin accounts with their roles and status
          </Text>
          <AdminsTable admins={admins || []} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading admins page:", error);
    return (
      <div className="p-6">
        <Title>Error</Title>
        <Text className="mt-2 text-red-500">
          Failed to load administrator data. Please try again later.
        </Text>
      </div>
    );
  }
}
