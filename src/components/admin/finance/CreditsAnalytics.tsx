"use client";

import {
  Card,
  Title,
  Text,
  Grid,
  DonutChart,
  BarChart,
  AreaChart,
  Metric,
  ProgressBar,
  List,
  ListItem,
} from "@tremor/react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CreditAnalyticsData {
  totalTransactions: number;
  creditsAdded: number;
  creditsUsed: number;
  netCredits: number;
  typeDistribution: { name: string; value: number }[];
  volumeHistory: { date: string; Transactions: number }[];
  flowHistory: { date: string; "Credits Added": number; "Credits Used": number }[];
  topUsageCategories: { name: string; value: number }[];
}

export function CreditsAnalytics({ data }: { data: CreditAnalyticsData }) {
  const valueFormatter = (number: number) => 
    Intl.NumberFormat("us").format(number).toString();

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Text>Total Transactions</Text>
          <Metric>{data.totalTransactions}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            All credit activities
          </Text>
        </Card>
        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Credits Added</Text>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <Metric>{data.creditsAdded.toLocaleString()}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Total credits issued
          </Text>
        </Card>
        <Card decoration="top" decorationColor="rose">
          <div className="flex items-center justify-between">
            <Text>Credits Used</Text>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <Metric>{data.creditsUsed.toLocaleString()}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Total credits consumed
          </Text>
        </Card>
        <Card decoration="top" decorationColor={data.netCredits >= 0 ? "indigo" : "amber"}>
          <Text>Net Balance</Text>
          <Metric className={data.netCredits >= 0 ? "text-indigo-600" : "text-amber-600"}>
            {data.netCredits >= 0 ? "+" : ""}{data.netCredits.toLocaleString()}
          </Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Added - Used
          </Text>
        </Card>
      </Grid>

      {/* Main Charts Row 1 */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Credits Flow Summary</Title>
          <Text>Total credits added vs used</Text>
          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <Text className="font-medium">Credits Added</Text>
                </div>
                <Text className="font-bold text-2xl text-emerald-600">{data.creditsAdded.toLocaleString()}</Text>
              </div>
              <ProgressBar value={100} color="emerald" className="h-3" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <Text className="font-medium">Credits Used</Text>
                </div>
                <Text className="font-bold text-2xl text-rose-600">{data.creditsUsed.toLocaleString()}</Text>
              </div>
              <ProgressBar 
                value={(data.creditsUsed / data.creditsAdded) * 100} 
                color="rose" 
                className="h-3" 
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <Text className="font-medium text-lg">Net Balance</Text>
                <Text className={`font-bold text-3xl ${data.netCredits >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}>
                  {data.netCredits >= 0 ? "+" : ""}{data.netCredits.toLocaleString()}
                </Text>
              </div>
              <Text className="text-xs text-gray-500 mt-1">
                {data.netCredits >= 0 ? "Surplus credits in the system" : "Deficit - more used than added"}
              </Text>
            </div>
          </div>
        </Card>
        
        <Card>
          <Title>Transaction Activity</Title>
          <Text>Breakdown by transaction count</Text>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Text className="text-xs text-gray-600 dark:text-gray-400">Total Transactions</Text>
                <Metric className="text-2xl mt-1">{data.totalTransactions}</Metric>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <Text className="text-xs text-gray-600 dark:text-gray-400">Avg per Transaction</Text>
                <Metric className="text-2xl mt-1">
                  {Math.round((data.creditsAdded + data.creditsUsed) / data.totalTransactions)}
                </Metric>
              </div>
            </div>

            <div className="mt-6">
              <Text className="font-medium mb-3">Transaction Types</Text>
              <div className="space-y-2">
                {data.typeDistribution.map((item, index) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <Text>{item.name}</Text>
                      <Text className="font-semibold">{item.value}</Text>
                    </div>
                    <ProgressBar 
                      value={(item.value / data.totalTransactions) * 100}
                      color={["emerald", "rose", "amber", "blue", "indigo"][index % 5] as any}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Grid>

      {/* Main Charts Row 2 */}
      <Grid numItems={1} className="gap-6">
        <Card>
          <Title>Top Usage Categories</Title>
          <Text>Where credits are being spent most</Text>
          <div className="mt-6">
            {data.topUsageCategories.length > 0 ? (
              <div className="space-y-4">
                {data.topUsageCategories.map((item, index) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' :
                          index === 1 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                          index === 2 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600'
                        }`}>
                          <Text className="font-bold text-sm">#{index + 1}</Text>
                        </div>
                        <div>
                          <Text className="font-medium">{item.name}</Text>
                          <Text className="text-xs text-gray-500">
                            {((item.value / data.creditsUsed) * 100).toFixed(1)}% of total usage
                          </Text>
                        </div>
                      </div>
                      <div className="text-right">
                        <Text className="font-bold text-lg text-rose-600">{item.value.toLocaleString()}</Text>
                        <Text className="text-xs text-gray-500">credits</Text>
                      </div>
                    </div>
                    <ProgressBar 
                      value={(item.value / data.creditsUsed) * 100}
                      color="rose"
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Text className="text-gray-500">No usage data available yet</Text>
              </div>
            )}
          </div>
        </Card>
      </Grid>
    </div>
  );
}

