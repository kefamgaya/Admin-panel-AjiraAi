"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveJob(id: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("latest_jobs")
    .update({ 
      approved: "yes",
      pending: "no",
      rejected: "no",
      rejection_reason: null
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to approve job: ${error.message}`);
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/admin/jobs/pending");
  return { success: true };
}

export async function rejectJob(id: number, reason: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("latest_jobs")
    .update({ 
      approved: "no",
      pending: "no",
      rejected: "yes",
      rejection_reason: reason
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to reject job: ${error.message}`);
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/admin/jobs/pending");
  return { success: true };
}

export async function unrejectJob(id: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("latest_jobs")
    .update({ 
      rejected: "no",
      rejection_reason: null,
      pending: "yes" // Set back to pending for review
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to unreject job: ${error.message}`);
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/admin/jobs/rejected");
  revalidatePath("/admin/jobs/pending");
  return { success: true };
}

export async function toggleFeatureJob(id: number, isFeatured: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("latest_jobs")
    .update({ 
      is_featured: isFeatured,
      featured_until: isFeatured ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null // Default 7 days
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to toggle feature status: ${error.message}`);
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/admin/jobs/featured");
  return { success: true };
}

