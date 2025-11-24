import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { name } = body;

  // Verify admin session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Get max ID to simulate auto-increment if needed, or let DB handle it if serial
  // The table schema says id is integer, no default value shown in previous `list_tables` output for `job_categories` except `updatable`.
  // Let's check if it auto-increments or if we need to provide ID.
  // Ideally we'd let the DB handle it. Let's try inserting without ID first.
  
  // However, the previous `list_tables` showed `job_categories` id has no default value sequence.
  // Let's check the schema again to be safe or just find the max ID + 1.
  
  const { data: maxIdData } = await supabase
    .from("job_categories")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();
    
  const nextId = (maxIdData?.id || 0) + 1;

  const { error } = await supabase
    .from("job_categories")
    .insert({ id: nextId, name, job_count: 0 });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

