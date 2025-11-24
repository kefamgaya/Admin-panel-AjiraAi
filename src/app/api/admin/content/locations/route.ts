import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { name, code, type, region_id } = body;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!name || !type) {
    return NextResponse.json({ error: "Name and Type are required" }, { status: 400 });
  }

  let table = "";
  let payload: any = { name, code };

  if (type === "region") {
    // For now assuming Tanzania Regions, but could be extended to others based on logic
    // Or we could have a `country` param to switch tables
    // Defaulting to tanzania_regions for MVP as per schema
    table = "tanzania_regions";
  } else if (type === "district") {
    if (!region_id) return NextResponse.json({ error: "Region ID required for district" }, { status: 400 });
    table = "tanzania_districts";
    payload.region_id = region_id;
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const { error } = await supabase
    .from(table)
    .insert(payload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

