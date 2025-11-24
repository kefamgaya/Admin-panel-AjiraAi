import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();
  const { featured } = body;

  // Verify admin session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updates: any = { is_featured: featured };
  
  if (featured) {
    // Set featured expiration to 7 days from now by default
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    updates.featured_until = expiry.toISOString();
  } else {
    updates.featured_until = null;
  }

  const { error } = await supabase
    .from("latest_jobs")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}


