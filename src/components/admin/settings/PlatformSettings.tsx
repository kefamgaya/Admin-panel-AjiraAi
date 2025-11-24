"use client";

import { useState, useTransition } from "react";
import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
  Switch,
  Select,
  SelectItem,
} from "@tremor/react";
import { Save, AlertCircle, CheckCircle } from "lucide-react";
import { updateSetting } from "@/app/actions/settings";

interface PlatformSettingsProps {
  initialSettings: Record<string, any>;
}

export function PlatformSettings({ initialSettings }: PlatformSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [registrationEnabled, setRegistrationEnabled] = useState(
    initialSettings.registration_enabled?.value ?? true
  );
  const [adminRegistrationEnabled, setAdminRegistrationEnabled] = useState(
    initialSettings.admin_registration_enabled?.value ?? false
  );
  const [jobPostingEnabled, setJobPostingEnabled] = useState(
    initialSettings.job_posting_enabled?.value ?? true
  );
  const [aiChatEnabled, setAiChatEnabled] = useState(
    initialSettings.ai_chat_enabled?.value ?? true
  );
  const [resumeGenerationEnabled, setResumeGenerationEnabled] = useState(
    initialSettings.resume_generation_enabled?.value ?? true
  );
  const [defaultLanguage, setDefaultLanguage] = useState(
    initialSettings.default_language?.value || "en"
  );
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = async () => {
    setResult(null);

    startTransition(async () => {
      const updates = [
        updateSetting("registration_enabled", { value: registrationEnabled }, "platform", "Admin User"),
        updateSetting("admin_registration_enabled", { value: adminRegistrationEnabled }, "platform", "Admin User"),
        updateSetting("job_posting_enabled", { value: jobPostingEnabled }, "platform", "Admin User"),
        updateSetting("ai_chat_enabled", { value: aiChatEnabled }, "platform", "Admin User"),
        updateSetting("resume_generation_enabled", { value: resumeGenerationEnabled }, "platform", "Admin User"),
        updateSetting("default_language", { value: defaultLanguage }, "platform", "Admin User"),
      ];

      const results = await Promise.all(updates);
      const allSuccess = results.every(r => r.success);

      if (allSuccess) {
        setResult({
          success: true,
          message: "Platform settings saved successfully!",
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
        <Title>Feature Toggles</Title>
        <Text className="mb-6">Enable or disable platform features</Text>

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">User Registration</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Allow new users to register on the platform
                </Text>
              </div>
              <Switch
                checked={registrationEnabled}
                onChange={setRegistrationEnabled}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Admin Registration</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Allow new admin users to register via /admin/register page
                </Text>
              </div>
              <Switch
                checked={adminRegistrationEnabled}
                onChange={setAdminRegistrationEnabled}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Job Posting</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Allow companies to post new jobs
                </Text>
              </div>
              <Switch
                checked={jobPostingEnabled}
                onChange={setJobPostingEnabled}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">AI Chat Assistant</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Enable AI-powered career assistant for users
                </Text>
              </div>
              <Switch
                checked={aiChatEnabled}
                onChange={setAiChatEnabled}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Resume Generation</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Allow users to generate AI-powered resumes
                </Text>
              </div>
              <Switch
                checked={resumeGenerationEnabled}
                onChange={setResumeGenerationEnabled}
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Title>Platform Limits</Title>
        <Text className="mb-6">Configure usage limits and quotas</Text>

        <div className="space-y-6">
          <div>
            <label className="block mb-2">
              <Text className="font-medium">Default Language</Text>
            </label>
            <Select
              value={defaultLanguage}
              onValueChange={setDefaultLanguage}
              disabled={isPending}
            >
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="sw">Swahili</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </Select>
            <Text className="text-xs text-gray-500 mt-1">
              Default language for new users
            </Text>
          </div>
        </div>
      </Card>

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
      <div className="flex justify-end">
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
  );
}

