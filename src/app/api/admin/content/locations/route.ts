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

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { name, code, type, region_id, country = 'tanzania' } = body;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!name || !type) {
    return NextResponse.json({ error: "Name and Type are required" }, { status: 400 });
  }

  const table = getTableName(country, type);
  if (!table) {
    return NextResponse.json({ error: "Invalid country or type combination" }, { status: 400 });
  }

  let payload: any = { name, code };

  if (type === "district") {
    if (!region_id) return NextResponse.json({ error: "Region ID required for district" }, { status: 400 });
    payload.region_id = region_id;
  }

  const { error } = await supabase
    .from(table)
    .insert(payload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
