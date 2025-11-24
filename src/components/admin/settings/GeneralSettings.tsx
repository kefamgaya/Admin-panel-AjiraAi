"use client";

import { useState, useTransition } from "react";
import {
  Card,
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Badge,
  Switch,
} from "@tremor/react";
import { Save, AlertCircle, CheckCircle } from "lucide-react";
import { updateSetting } from "@/app/actions/settings";

interface GeneralSettingsProps {
  initialSettings: Record<string, any>;
}

export function GeneralSettings({ initialSettings }: GeneralSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [siteName, setSiteName] = useState(
    initialSettings.site_name?.value || "Ajira AI"
  );
  const [siteDescription, setSiteDescription] = useState(
    initialSettings.site_description?.value || ""
  );
  const [contactEmail, setContactEmail] = useState(
    initialSettings.contact_email?.value || ""
  );
  const [supportEmail, setSupportEmail] = useState(
    initialSettings.support_email?.value || ""
  );
  const [maintenanceMode, setMaintenanceMode] = useState(
    initialSettings.maintenance_mode?.value || false
  );
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = async () => {
    setResult(null);

    startTransition(async () => {
      const updates = [
        updateSetting("site_name", { value: siteName }, "general", "Admin User"),
        updateSetting("site_description", { value: siteDescription }, "general", "Admin User"),
        updateSetting("contact_email", { value: contactEmail }, "general", "Admin User"),
        updateSetting("support_email", { value: supportEmail }, "general", "Admin User"),
        updateSetting("maintenance_mode", { value: maintenanceMode }, "general", "Admin User"),
      ];

      const results = await Promise.all(updates);
      const allSuccess = results.every(r => r.success);

      if (allSuccess) {
        setResult({
          success: true,
          message: "General settings saved successfully!",
        });
      } else {
        setResult({
          success: false,
          message: "Failed to save some settings. Please try again.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <Title>General Settings</Title>
        <Text className="mb-6">Configure basic platform information</Text>

        <div className="space-y-6">
          {/* Site Name */}
          <div>
            <label className="block mb-2">
              <Text className="font-medium">Site Name</Text>
            </label>
            <TextInput
              placeholder="Ajira AI"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              disabled={isPending}
            />
            <Text className="text-xs text-gray-500 mt-1">
              The name of your platform displayed across the site
            </Text>
          </div>

          {/* Site Description */}
          <div>
            <label className="block mb-2">
              <Text className="font-medium">Site Description</Text>
            </label>
            <Textarea
              placeholder="AI-powered job matching platform..."
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              disabled={isPending}
              rows={3}
            />
            <Text className="text-xs text-gray-500 mt-1">
              Brief description used for SEO and social media
            </Text>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block mb-2">
              <Text className="font-medium">Contact Email</Text>
            </label>
            <TextInput
              type="email"
              placeholder="contact@ajiraai.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              disabled={isPending}
            />
            <Text className="text-xs text-gray-500 mt-1">
              Primary contact email for general inquiries
            </Text>
          </div>

          {/* Support Email */}
          <div>
            <label className="block mb-2">
              <Text className="font-medium">Support Email</Text>
            </label>
            <TextInput
              type="email"
              placeholder="support@ajiraai.com"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              disabled={isPending}
            />
            <Text className="text-xs text-gray-500 mt-1">
              Email for customer support and help requests
            </Text>
          </div>

          {/* Maintenance Mode */}
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Maintenance Mode</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Enable to show maintenance page to all users
                </Text>
              </div>
              <Switch
                checked={maintenanceMode}
                onChange={setMaintenanceMode}
                disabled={isPending}
              />
            </div>
            {maintenanceMode && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <Text className="text-xs text-amber-700 dark:text-amber-300">
                    When enabled, all users will see a maintenance page. Only admins can access the platform.
                  </Text>
                </div>
              </div>
            )}
          </div>

          {/* Result Message */}
          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <Text className={result.success ? "text-emerald-900 dark:text-emerald-100" : "text-red-900 dark:text-red-100"}>
                  {result.message}
                </Text>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              icon={Save}
              onClick={handleSave}
              disabled={isPending}
              loading={isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

