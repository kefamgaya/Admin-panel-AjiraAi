import { Title, Text, Callout, Flex } from "@tremor/react";
import { AlertCircle } from "lucide-react";
import { getEarningsAnalytics } from "@/app/actions/earnings-analytics";
import { EarningsAnalytics } from "@/components/admin/earnings/EarningsAnalytics";
import { SyncAdMobButton } from "@/components/admin/earnings/SyncAdMobButton";

export default async function EarningsPage() {
  let analyticsData;
  let error: string | null = null;

  try {
    analyticsData = await getEarningsAnalytics();
  } catch (err: any) {
    console.error("Error fetching earnings data:", err);
    error = `Failed to load earnings data: ${err.message || "Unknown error"}`;
  }

  return (
    <main className="p-4 md:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title>Platform Earnings</Title>
          <Text className="mt-2">
            Track all revenue sources including Google AdMob, subscriptions, featured jobs, and credit purchases
          </Text>
        </div>
        <SyncAdMobButton />
      </div>

      {error && (
        <Callout
          className="mt-4 mb-6"
          title="Data Fetching Error"
          icon={AlertCircle}
          color="rose"
        >
          {error}
        </Callout>
      )}

      {analyticsData && <EarningsAnalytics data={analyticsData} />}

      {!analyticsData && !error && (
        <div className="flex items-center justify-center h-64">
          <Text className="text-gray-500">Loading earnings data...</Text>
        </div>
      )}
    </main>
  );
}

