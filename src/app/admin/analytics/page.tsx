import { getPlatformAnalytics } from "@/app/actions/platform-analytics";
import { AnalyticsTabs } from "@/components/admin/analytics/AnalyticsTabs";

export default async function AnalyticsPage() {
  const analyticsData = await getPlatformAnalytics();

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive insights into your platform's performance and growth
        </p>
      </div>

      <AnalyticsTabs data={analyticsData} />
    </div>
  );
}
