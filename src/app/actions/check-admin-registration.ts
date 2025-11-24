"use server";

import { createClient } from "@/utils/supabase/server";

export async function isAdminRegistrationEnabled(): Promise<boolean> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "admin_registration_enabled")
      .single();

    if (error || !data) {
      // Default to false if setting doesn't exist
      return false;
    }

    // setting_value is JSONB, so we need to access the value property
    return data.setting_value?.value ?? false;
  } catch (error) {
    console.error("Error checking admin registration setting:", error);
    // Default to false on error for security
    return false;
  }
}

