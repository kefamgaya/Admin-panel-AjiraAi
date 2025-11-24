import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();
  const { name, code, type, region_id } = body;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let table = "";
  let payload: any = { name, code };

  if (type === "region") {
    table = "tanzania_regions";
  } else if (type === "district") {
    table = "tanzania_districts";
    if (region_id) payload.region_id = region_id;
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const { error } = await supabase
    .from(table)
    .update(payload)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!type) {
    return NextResponse.json({ error: "Type required" }, { status: 400 });
  }

  let table = "";
  if (type === "region") {
    table = "tanzania_regions";
    // Check constraints: districts linked to region
    const { count } = await supabase
      .from("tanzania_districts")
      .select("*", { count: "exact", head: true })
      .eq("region_id", id);
      
    if ((count || 0) > 0) {
       return NextResponse.json({ error: "Cannot delete region with associated districts" }, { status: 400 });
    }
  } else if (type === "district") {
    table = "tanzania_districts";
  }

  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

