"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleCompanyVerification(uid: string, isVerified: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("companies")
    .update({ is_verified: isVerified })
    .eq("uid", uid);

  if (error) {
    throw new Error(`Failed to update verification status: ${error.message}`);
  }

  revalidatePath("/admin/users/companies");
  return { success: true };
}

export async function toggleCompanyBlockStatus(uid: string, isBlocked: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("companies")
    .update({ 
      is_blocked: isBlocked,
      blocked_at: isBlocked ? new Date().toISOString() : null,
      blocked_by: isBlocked ? "admin" : null
    })
    .eq("uid", uid);

  if (error) {
    throw new Error(`Failed to update block status: ${error.message}`);
  }

  revalidatePath("/admin/users/companies");
  return { success: true };
}

