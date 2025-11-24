import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Helper function to get table name based on country and type
function getTableName(country: string, type: string): string | null {
  const validCountries = ['kenya', 'uganda', 'rwanda', 'tanzania'];
  if (!validCountries.includes(country.toLowerCase())) {
    return null;
  }

  if (type === "region") {
    return `${country.toLowerCase()}_regions`;
  } else if (type === "district") {
    // Only Tanzania has districts
    if (country.toLowerCase() === 'tanzania') {
      return 'tanzania_districts';
    }
    return null;
  }
  return null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();
  const { name, code, type, region_id, country = 'tanzania' } = body;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const table = getTableName(country, type);
  if (!table) {
    return NextResponse.json({ error: "Invalid country or type combination" }, { status: 400 });
  }

  let payload: any = { name, code };

  if (type === "district") {
    if (region_id) payload.region_id = region_id;
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
  const country = url.searchParams.get("country") || 'tanzania';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!type) {
    return NextResponse.json({ error: "Type required" }, { status: 400 });
  }

  const table = getTableName(country, type);
  if (!table) {
    return NextResponse.json({ error: "Invalid country or type combination" }, { status: 400 });
  }

  // Check constraints: districts linked to region (only for Tanzania)
  if (type === "region" && country.toLowerCase() === 'tanzania') {
    const { count } = await supabase
      .from("tanzania_districts")
      .select("*", { count: "exact", head: true })
      .eq("region_id", id);
      
    if ((count || 0) > 0) {
       return NextResponse.json({ error: "Cannot delete region with associated districts" }, { status: 400 });
    }
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
