"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAdminAnalytics() {
  const supabase = await createClient();

  try {
    const { data: admins, error } = await supabase
      .from("admin_users")
      .select("*");

    if (error) throw error;

    const totalAdmins = admins?.length || 0;
    const activeAdmins = admins?.filter(a => a.is_active).length || 0;
    const inactiveAdmins = totalAdmins - activeAdmins;

    // Role distribution
    const roleDistribution = (admins || []).reduce((acc, admin) => {
      const role = admin.role || "Unknown";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent logins (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogins = admins?.filter(
      a => a.last_login && new Date(a.last_login) >= sevenDaysAgo
    ).length || 0;

    return {
      success: true,
      analytics: {
        totalAdmins,
        activeAdmins,
        inactiveAdmins,
        recentLogins,
        roleDistribution: Object.entries(roleDistribution).map(([name, value]) => ({
          name,
          value,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return { success: false, error: "Failed to fetch analytics" };
  }
}

export async function createAdmin(data: {
  uid: string;
  email: string;
  full_name: string;
  role: string;
  permissions: any;
  created_by: string;
}) {
  const supabase = await createClient();

  try {
    // Check if admin already exists
    const { data: existing } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", data.email)
      .single();

    if (existing) {
      return { success: false, error: "Admin with this email already exists" };
    }

    const { error } = await supabase.from("admin_users").insert({
      uid: data.uid,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      permissions: data.permissions,
      is_active: true,
      created_by: data.created_by,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error) {
    console.error("Error creating admin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create admin",
    };
  }
}

export async function updateAdmin(
  id: number,
  data: {
    full_name?: string;
    role?: string;
    permissions?: any;
  }
) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("admin_users")
      .update(data)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error) {
    console.error("Error updating admin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update admin",
    };
  }
}

export async function toggleAdminStatus(id: number, isActive: boolean) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("admin_users")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error) {
    console.error("Error toggling admin status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

export async function deleteAdmin(id: number) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error) {
    console.error("Error deleting admin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete admin",
    };
  }
}

