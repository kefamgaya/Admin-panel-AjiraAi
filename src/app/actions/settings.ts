"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const supabase = await createClient();

  try {
    const { data: settings, error } = await supabase
      .from("platform_settings")
      .select("*")
      .order("category", { ascending: true });

    if (error) throw error;

    // Group settings by category
    const groupedSettings = (settings || []).reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {} as Record<string, any[]>);

    return { success: true, settings: groupedSettings };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { success: false, error: "Failed to fetch settings" };
  }
}

export async function updateSetting(
  settingKey: string,
  settingValue: any,
  category: string,
  updatedBy: string
) {
  const supabase = await createClient();

  try {
    // Check if setting exists
    const { data: existing } = await supabase
      .from("platform_settings")
      .select("id")
      .eq("setting_key", settingKey)
      .single();

    if (existing) {
      // Update existing setting
      const { error } = await supabase
        .from("platform_settings")
        .update({
          setting_value: settingValue,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy,
        })
        .eq("setting_key", settingKey);

      if (error) throw error;
    } else {
      // Insert new setting
      const { error } = await supabase
        .from("platform_settings")
        .insert({
          setting_key: settingKey,
          setting_value: settingValue,
          category,
          updated_by: updatedBy,
        });

      if (error) throw error;
    }

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating setting:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update setting",
    };
  }
}

export async function deleteSetting(settingKey: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("platform_settings")
      .delete()
      .eq("setting_key", settingKey);

    if (error) throw error;

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting setting:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete setting",
    };
  }
}

