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
import { Save, AlertCircle, CheckCircle, Mail } from "lucide-react";
import { updateSetting } from "@/app/actions/settings";

interface EmailSettingsProps {
  initialSettings: Record<string, any>;
}

export function EmailSettings({ initialSettings }: EmailSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(
    initialSettings.email_notifications_enabled?.value ?? true
  );
  const [welcomeEmailEnabled, setWelcomeEmailEnabled] = useState(
    initialSettings.welcome_email_enabled?.value ?? true
  );
  const [applicationEmailEnabled, setApplicationEmailEnabled] = useState(
    initialSettings.application_email_enabled?.value ?? true
  );
  const [interviewEmailEnabled, setInterviewEmailEnabled] = useState(
    initialSettings.interview_email_enabled?.value ?? true
  );
  const [smtpHost, setSmtpHost] = useState(
    initialSettings.smtp_host?.value || ""
  );
  const [smtpPort, setSmtpPort] = useState(
    initialSettings.smtp_port?.value || "587"
  );
  const [smtpUser, setSmtpUser] = useState(
    initialSettings.smtp_user?.value || ""
  );
  const [smtpPassword, setSmtpPassword] = useState(
    initialSettings.smtp_password?.value || ""
  );
  const [fromEmail, setFromEmail] = useState(
    initialSettings.from_email?.value || ""
  );
  const [fromName, setFromName] = useState(
    initialSettings.from_name?.value || "Ajira AI"
  );
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = async () => {
    setResult(null);

    startTransition(async () => {
      const updates = [
        updateSetting("email_notifications_enabled", { value: emailNotificationsEnabled }, "email", "Admin User"),
        updateSetting("welcome_email_enabled", { value: welcomeEmailEnabled }, "email", "Admin User"),
        updateSetting("application_email_enabled", { value: applicationEmailEnabled }, "email", "Admin User"),
        updateSetting("interview_email_enabled", { value: interviewEmailEnabled }, "email", "Admin User"),
        updateSetting("smtp_host", { value: smtpHost }, "email", "Admin User"),
        updateSetting("smtp_port", { value: smtpPort }, "email", "Admin User"),
        updateSetting("smtp_user", { value: smtpUser }, "email", "Admin User"),
        updateSetting("smtp_password", { value: smtpPassword }, "email", "Admin User"),
        updateSetting("from_email", { value: fromEmail }, "email", "Admin User"),
        updateSetting("from_name", { value: fromName }, "email", "Admin User"),
      ];

      const results = await Promise.all(updates);
      const allSuccess = results.every(r => r.success);

      if (allSuccess) {
        setResult({
          success: true,
          message: "Email settings saved successfully!",
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
        <Title>Email Notifications</Title>
        <Text className="mb-6">Configure automated email notifications</Text>

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Email Notifications</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Master toggle for all email notifications
                </Text>
              </div>
              <Switch
                checked={emailNotificationsEnabled}
                onChange={setEmailNotificationsEnabled}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Welcome Email</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Send welcome email to new users
                </Text>
              </div>
              <Switch
                checked={welcomeEmailEnabled}
                onChange={setWelcomeEmailEnabled}
                disabled={isPending || !emailNotificationsEnabled}
              />
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Application Confirmation</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Send confirmation when users apply for jobs
                </Text>
              </div>
              <Switch
                checked={applicationEmailEnabled}
                onChange={setApplicationEmailEnabled}
                disabled={isPending || !emailNotificationsEnabled}
              />
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Interview Notifications</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Send email when interviews are scheduled
                </Text>
              </div>
              <Switch
                checked={interviewEmailEnabled}
                onChange={setInterviewEmailEnabled}
                disabled={isPending || !emailNotificationsEnabled}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Title>SMTP Configuration</Title>
        <Text className="mb-6">Configure email server settings</Text>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">
                <Text className="font-medium">SMTP Host</Text>
              </label>
              <TextInput
                placeholder="smtp.gmail.com"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                disabled={isPending}
              />
              <Text className="text-xs text-gray-500 mt-1">
                Your email server hostname
              </Text>
            </div>

            <div>
              <label className="block mb-2">
                <Text className="font-medium">SMTP Port</Text>
              </label>
              <TextInput
                type="number"
                placeholder="587"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                disabled={isPending}
              />
              <Text className="text-xs text-gray-500 mt-1">
                Usually 587 (TLS) or 465 (SSL)
              </Text>
            </div>
          </div>

          <div>
            <label className="block mb-2">
              <Text className="font-medium">SMTP Username</Text>
            </label>
            <TextInput
              placeholder="your-email@example.com"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              disabled={isPending}
            />
            <Text className="text-xs text-gray-500 mt-1">
              SMTP authentication username
            </Text>
          </div>

          <div>
            <label className="block mb-2">
              <Text className="font-medium">SMTP Password</Text>
            </label>
            <TextInput
              type="password"
              placeholder="••••••••"
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
              disabled={isPending}
            />
            <Text className="text-xs text-gray-500 mt-1">
              SMTP authentication password or app password
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">
                <Text className="font-medium">From Email</Text>
              </label>
              <TextInput
                type="email"
                placeholder="noreply@ajiraai.com"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                disabled={isPending}
              />
              <Text className="text-xs text-gray-500 mt-1">
                Email address shown as sender
              </Text>
            </div>

            <div>
              <label className="block mb-2">
                <Text className="font-medium">From Name</Text>
              </label>
              <TextInput
                placeholder="Ajira AI"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                disabled={isPending}
              />
              <Text className="text-xs text-gray-500 mt-1">
                Name shown as sender
              </Text>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Mail className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <Text className="font-medium text-blue-900 dark:text-blue-100">
                  Email Configuration Tips
                </Text>
                <Text className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  For Gmail: Use app-specific passwords. For SendGrid/Mailgun: Use API keys as password.
                  Test your configuration after saving to ensure emails are delivered.
                </Text>
              </div>
            </div>
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

