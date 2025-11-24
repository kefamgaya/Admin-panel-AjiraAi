import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { settings } = body; 
  // Expect settings to be an array of { key, value, category }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // We'll iterate and upsert
  // Using a loop for now or Promise.all
  const updates = settings.map(async (setting: any) => {
    return supabase
      .from("platform_settings")
      .upsert({
        setting_key: setting.key,
        setting_value: setting.value,
        category: setting.category || 'general',
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'setting_key' });
  });

  await Promise.all(updates);

  // Log activity
  await supabase.from("admin_activity_logs").insert({
    admin_uid: user.id,
    action: "update_settings",
    resource_type: "platform_settings",
    details: { count: settings.length },
    ip_address: "unknown" // request headers could get this
  });

  return NextResponse.json({ success: true });
}

