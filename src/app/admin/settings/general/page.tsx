import { createClient } from "@/utils/supabase/server";
import GeneralSettingsForm from "@/components/admin/settings/GeneralSettingsForm";

export default async function GeneralSettingsPage() {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("platform_settings")
    .select("*");

  if (error) {
    console.error("Error fetching settings:", error);
    return <div>Error loading settings</div>;
  }

  return (
    <div className="p-6 sm:p-10">
      <GeneralSettingsForm settings={settings || []} />
    </div>
  );
}

