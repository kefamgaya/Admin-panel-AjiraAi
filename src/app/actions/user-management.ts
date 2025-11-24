"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserAccountType(uid: string, accountType: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("all_users")
    .update({ accounttype: accountType })
    .eq("uid", uid);

  if (error) {
    throw new Error(`Failed to update account type: ${error.message}`);
  }

  revalidatePath("/admin/users/seekers");
  return { success: true };
}

export async function toggleUserBlockStatus(uid: string, isBlocked: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("all_users")
    .update({ 
      is_blocked: isBlocked,
      blocked_at: isBlocked ? new Date().toISOString() : null,
      blocked_by: isBlocked ? "admin" : null // You could fetch actual admin ID if available
    })
    .eq("uid", uid);

  if (error) {
    throw new Error(`Failed to update block status: ${error.message}`);
  }

  revalidatePath("/admin/users/seekers");
  return { success: true };
}

