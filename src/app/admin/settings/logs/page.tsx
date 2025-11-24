import { createClient } from "@/utils/supabase/server";
import ActivityLogsTable from "@/components/admin/settings/ActivityLogsTable";

export default async function ActivityLogsPage() {
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from("admin_activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching logs:", error);
    return <div>Error loading logs</div>;
  }

  // Enrich with admin names if possible, though admin_users might not have all UIDs if they are from auth table directly
  // We'll try to map from admin_users table first
  const adminUids = [...new Set(logs?.map(l => l.admin_uid) || [])];
  let adminMap: Record<string, string> = {};

  if (adminUids.length > 0) {
    const { data: admins } = await supabase
      .from("admin_users")
      .select("uid, full_name")
      .in("uid", adminUids);
      
    admins?.forEach(a => {
      adminMap[a.uid] = a.full_name;
    });
  }

  const enrichedLogs = logs?.map(log => ({
    ...log,
    admin_name: adminMap[log.admin_uid] || "System/Unknown"
  })) || [];

  return (
    <div className="p-6 sm:p-10">
      <ActivityLogsTable data={enrichedLogs} />
    </div>
  );
}

