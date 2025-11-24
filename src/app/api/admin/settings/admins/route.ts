import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { email, full_name, role, permissions } = body;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Note: This only creates the record in admin_users table. 
  // The actual Auth user must exist or be created separately.
  // For now, we generate a placeholder UID if not provided or just use a random one
  // In a real app, you'd probably lookup the user by email from auth.users via Admin API
  // or invite them.
  const placeholderUid = crypto.randomUUID();

  const { error } = await supabase
    .from("admin_users")
    .insert({
      uid: placeholderUid, 
      email,
      full_name,
      role,
      permissions,
      created_by: user.id
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("admin_activity_logs").insert({
    admin_uid: user.id,
    action: "create_admin",
    resource_type: "admin_users",
    details: { email, role }
  });

  return NextResponse.json({ success: true });
}

