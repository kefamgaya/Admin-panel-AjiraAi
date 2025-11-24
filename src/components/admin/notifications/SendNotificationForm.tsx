"use client";

import { useState, useTransition } from "react";
import {
  Card,
  Title,
  Text,
  TextInput,
  Textarea,
  Select,
  SelectItem,
  Button,
  Badge,
} from "@tremor/react";
import { Send, AlertCircle, CheckCircle, Info } from "lucide-react";
import { sendNotification } from "@/app/actions/send-notification";

export function SendNotificationForm() {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<"all" | "seekers" | "companies" | "specific">("all");
  const [imageUrl, setImageUrl] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // FCM validation
  const titleLength = title.length;
  const messageLength = message.length;
  const titleMaxLength = 65;
  const messageMaxLength = 240;

  const titleValid = titleLength > 0 && titleLength <= titleMaxLength;
  const messageValid = messageLength > 0 && messageLength <= messageMaxLength;
  const formValid = titleValid && messageValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValid) {
      setResult({
        success: false,
        message: "Please fix validation errors before sending",
      });
      return;
    }

    setResult(null);

    startTransition(async () => {
      const response = await sendNotification({
        title,
        message,
        recipientType,
        imageUrl: imageUrl || undefined,
        actionUrl: actionUrl || undefined,
        sentBy: "Admin User", // TODO: Get from auth context
      });

      if (response.success) {
        setResult({
          success: true,
          message: `Notification sent successfully! Delivered to ${response.delivered} of ${response.total} recipients.`,
        });
        // Reset form
        setTitle("");
        setMessage("");
        setImageUrl("");
        setActionUrl("");
      } else {
        setResult({
          success: false,
          message: response.error || "Failed to send notification",
        });
      }
    });
  };

  return (
    <Card>
      <Title>Send Push Notification</Title>
      <Text className="mb-4">Send FCM notifications to users following Firebase Cloud Messaging rules</Text>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block mb-2">
            <Text className="font-medium">
              Title <span className="text-red-500">*</span>
            </Text>
          </label>
          <TextInput
            placeholder="Enter notification title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={titleLength > 0 && !titleValid}
            disabled={isPending}
          />
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              {titleLength > 0 && (
                titleValid ? (
                  <Badge color="emerald" size="xs" icon={CheckCircle}>Valid</Badge>
                ) : (
                  <Badge color="red" size="xs" icon={AlertCircle}>Too long</Badge>
                )
              )}
            </div>
            <Text className={`text-xs ${titleLength > titleMaxLength ? "text-red-500" : "text-gray-500"}`}>
              {titleLength}/{titleMaxLength}
            </Text>
          </div>
          <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <Text className="text-xs text-blue-600 dark:text-blue-400">
              FCM recommends titles of 65 characters or less for optimal display across all devices
            </Text>
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label className="block mb-2">
            <Text className="font-medium">
              Message <span className="text-red-500">*</span>
            </Text>
          </label>
          <Textarea
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            error={messageLength > 0 && !messageValid}
            disabled={isPending}
            rows={4}
          />
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              {messageLength > 0 && (
                messageValid ? (
                  <Badge color="emerald" size="xs" icon={CheckCircle}>Valid</Badge>
                ) : (
                  <Badge color="red" size="xs" icon={AlertCircle}>Too long</Badge>
                )
              )}
            </div>
            <Text className={`text-xs ${messageLength > messageMaxLength ? "text-red-500" : "text-gray-500"}`}>
              {messageLength}/{messageMaxLength}
            </Text>
          </div>
          <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <Text className="text-xs text-blue-600 dark:text-blue-400">
              FCM recommends messages of 240 characters or less for best display. Longer messages may be truncated.
            </Text>
          </div>
        </div>

        {/* Recipient Type */}
        <div>
          <label className="block mb-2">
            <Text className="font-medium">
              Recipient Type <span className="text-red-500">*</span>
            </Text>
          </label>
          <Select
            value={recipientType}
            onValueChange={(value) => setRecipientType(value as any)}
            disabled={isPending}
          >
            <SelectItem value="all">
              All Users (Seekers + Companies)
            </SelectItem>
            <SelectItem value="seekers">
              Job Seekers Only
            </SelectItem>
            <SelectItem value="companies">
              Companies Only
            </SelectItem>
            <SelectItem value="specific">
              Specific Users (Coming Soon)
            </SelectItem>
          </Select>
          <Text className="text-xs text-gray-500 mt-1">
            Select who should receive this notification
          </Text>
        </div>

        {/* Optional: Image URL */}
        <div>
          <label className="block mb-2">
            <Text className="font-medium">Image URL (Optional)</Text>
          </label>
          <TextInput
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isPending}
          />
          <Text className="text-xs text-gray-500 mt-1">
            Add an image to your notification (must be a valid HTTPS URL)
          </Text>
        </div>

        {/* Optional: Action URL */}
        <div>
          <label className="block mb-2">
            <Text className="font-medium">Action URL (Optional)</Text>
          </label>
          <TextInput
            placeholder="/jobs/123 or https://example.com"
            value={actionUrl}
            onChange={(e) => setActionUrl(e.target.value)}
            disabled={isPending}
          />
          <Text className="text-xs text-gray-500 mt-1">
            Where users will be directed when they tap the notification
          </Text>
        </div>

        {/* FCM Compliance Notice */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <Text className="font-medium text-amber-900 dark:text-amber-100">
                FCM Compliance
              </Text>
              <Text className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                This form follows Firebase Cloud Messaging (FCM) best practices:
              </Text>
              <ul className="text-xs text-amber-700 dark:text-amber-300 mt-2 space-y-1 list-disc list-inside">
                <li>Title limited to 65 characters for optimal display</li>
                <li>Message limited to 240 characters to prevent truncation</li>
                <li>Notifications sent in batches of 500 (FCM limit)</li>
                <li>High priority delivery for Android</li>
                <li>Sound and badge support for iOS</li>
              </ul>
            </div>
          </div>
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

        {/* Submit Button */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            type="submit"
            icon={Send}
            disabled={!formValid || isPending}
            loading={isPending}
          >
            {isPending ? "Sending..." : "Send Notification"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

