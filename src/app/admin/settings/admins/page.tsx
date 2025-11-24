import { createClient } from "@/utils/supabase/server";
import AdminsTable from "@/components/admin/settings/AdminsTable";

export default async function AdminsPage() {
  const supabase = await createClient();

  const { data: admins, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admins:", error);
    return <div>Error loading admins</div>;
  }

  return (
    <div className="p-6 sm:p-10">
      <AdminsTable data={admins || []} />
    </div>
  );
}

