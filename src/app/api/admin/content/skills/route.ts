import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { name, category } = body;

  // Verify admin session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Get max ID to simulate auto-increment if needed
  const { data: maxIdData } = await supabase
    .from("skills")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();
    
  const nextId = (maxIdData?.id || 0) + 1;

  const { error } = await supabase
    .from("skills")
    .insert({ id: nextId, name, category });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

