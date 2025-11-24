"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface RegisterAdminData {
  uid: string;
  email: string;
  fullName: string;
  role: string;
  permissions?: Record<string, boolean>;
  createdBy?: string;
}

export async function registerAdminInDatabase(data: RegisterAdminData) {
  const supabase = await createClient();

  try {
    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from("admin_users")
      .select("uid, email")
      .eq("uid", data.uid)
      .or(`email.eq.${data.email}`)
      .single();

    if (existingAdmin) {
      return {
        success: false,
        error: existingAdmin.uid === data.uid 
          ? "Admin user with this UID already exists"
          : "Admin user with this email already exists",
      };
    }

    // Insert new admin user
    const { error } = await supabase
      .from("admin_users")
      .insert({
        uid: data.uid,
        email: data.email,
        full_name: data.fullName,
        role: data.role || "admin",
        permissions: data.permissions || {},
        is_active: true,
        created_by: data.createdBy || null,
      });

    if (error) {
      console.error("Error registering admin:", error);
      return {
        success: false,
        error: error.message || "Failed to register admin user",
      };
    }

    revalidatePath("/admin/admins");
    return {
      success: true,
      message: "Admin user registered successfully",
    };
  } catch (error: any) {
    console.error("Error in registerAdminInDatabase:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

