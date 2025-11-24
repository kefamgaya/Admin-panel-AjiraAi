"use client";

import {
  Card,
  Grid,
  Title,
  Text,
  Metric,
  Badge,
  AreaChart,
  DonutChart,
  BarChart,
  List,
  ListItem,
  Flex,
  ProgressBar,
  Icon,
} from "@tremor/react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Smartphone,
  Eye,
  MousePointer,
  CreditCard,
  Star,
  Award,
} from "lucide-react";

interface EarningsAnalyticsProps {
  data: {
    totalEarnings: number;
    earningsLast30Days: number;
    growthRate: number;
    revenueSourceDistribution: { name: string; value: number }[];
    totalAdMobRevenue: number;
    admobLast30Days: number;
    totalAdImpressions: number;
    totalAdClicks: number;
    avgCTR: number;
    avgECPM: number;
    subscriptionEarnings: number;
    featuredJobEarnings: number;
    creditsPurchaseEarnings: number;
    earningsGrowth: { date: string; earnings: number; admob: number; subscriptions: number; other: number }[];
    topRevenueSources: { name: string; amount: number; percentage: number }[];
  };
}

export function EarningsAnalytics({ data }: EarningsAnalyticsProps) {
  const valueFormatter = (number: number) =>
    `$${Intl.NumberFormat("us").format(number).toString()}`;
  
  const numberFormatter = (number: number) =>
    Intl.NumberFormat("us").format(number).toString();

  const percentageFormatter = (number: number) => `${number.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Main KPIs */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="emerald">
          <Flex alignItems="start">
            <div>
              <Text>Total Earnings</Text>
              <Metric className="mt-2">{valueFormatter(data.totalEarnings)}</Metric>
            </div>
            <Icon icon={DollarSign} variant="light" size="xl" color="emerald" />
          </Flex>
          <Text className="mt-2 text-sm text-gray-500">
            All-time revenue
          </Text>
        </Card>

        <Card decoration="top" decorationColor="blue">
          <Flex alignItems="start">
            <div>
              <Text>Last 30 Days</Text>
              <Metric className="mt-2">{valueFormatter(data.earningsLast30Days)}</Metric>
            </div>
            <Icon icon={TrendingUp} variant="light" size="xl" color="blue" />
          </Flex>
          <Text className="mt-2 text-sm text-gray-500">
            {data.totalEarnings > 0
              ? ((data.earningsLast30Days / data.totalEarnings) * 100).toFixed(1)
              : "0"}% of total
          </Text>
        </Card>

        <Card decoration="top" decorationColor={data.growthRate >= 0 ? "emerald" : "red"}>
          <Flex alignItems="start">
            <div>
              <Text>Growth Rate</Text>
              <Metric className="mt-2">{percentageFormatter(data.growthRate)}</Metric>
            </div>
            <Icon 
              icon={data.growthRate >= 0 ? TrendingUp : TrendingDown} 
              variant="light" 
              size="xl" 
              color={data.growthRate >= 0 ? "emerald" : "red"} 
            />
          </Flex>
          <Text className="mt-2 text-sm text-gray-500">
            Last 6 months vs previous
          </Text>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <Flex alignItems="start">
            <div>
              <Text>AdMob Revenue</Text>
              <Metric className="mt-2">{valueFormatter(data.totalAdMobRevenue)}</Metric>
            </div>
            <Icon icon={Smartphone} variant="light" size="xl" color="purple" />
          </Flex>
          <Text className="mt-2 text-sm text-gray-500">
            {data.totalEarnings > 0
              ? ((data.totalAdMobRevenue / data.totalEarnings) * 100).toFixed(1)
              : "0"}% of total
          </Text>
        </Card>
      </Grid>

      {/* Earnings Growth Chart */}
      <Card>
        <Title>Earnings Over Time</Title>
        <Text className="mb-4">Revenue breakdown by source (last 6 months)</Text>
        {data.earningsGrowth.length > 0 && data.earningsGrowth.some(d => d.earnings > 0) ? (
          <AreaChart
            className="h-80"
            data={data.earningsGrowth}
            index="date"
            categories={["admob", "subscriptions", "other"]}
            colors={["purple", "blue", "amber"]}
            valueFormatter={valueFormatter}
            yAxisWidth={60}
            showLegend={true}
            showAnimation={true}
          />
        ) : (
          <div className="h-80 flex items-center justify-center">
            <Text className="text-gray-500">No earnings data available</Text>
          </div>
        )}
      </Card>

      {/* Revenue Sources & AdMob Metrics */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Revenue by Source</Title>
          <Text className="mb-4">Distribution of earnings</Text>
          {data.revenueSourceDistribution.length > 0 ? (
            <>
              <DonutChart
                className="h-64"
                data={data.revenueSourceDistribution}
                category="value"
                index="name"
                valueFormatter={valueFormatter}
                colors={["purple", "blue", "emerald", "amber", "rose"]}
                showAnimation={true}
              />
              <List className="mt-4">
                {data.revenueSourceDistribution.map((source) => (
                  <ListItem key={source.name}>
                    <Text>{source.name}</Text>
                    <Flex justifyContent="end" className="space-x-2">
                      <Text>{valueFormatter(source.value)}</Text>
                      <ProgressBar
                        value={data.totalEarnings > 0 ? (source.value / data.totalEarnings) * 100 : 0}
                        className="w-20"
                      />
                    </Flex>
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <Text className="text-gray-500">No revenue data available</Text>
            </div>
          )}
        </Card>

        <Card>
          <Title>Google AdMob Metrics</Title>
          <Text className="mb-4">Ad performance statistics</Text>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Flex alignItems="center" className="mb-2">
                <Icon icon={DollarSign} size="sm" color="purple" />
                <Text className="ml-2 font-medium">AdMob Revenue</Text>
              </Flex>
              <Metric className="text-purple-600">{valueFormatter(data.totalAdMobRevenue)}</Metric>
              <Text className="text-xs text-gray-500 mt-1">
                ${data.admobLast30Days.toFixed(2)} in last 30 days
              </Text>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Flex alignItems="center" className="mb-2">
                <Icon icon={Eye} size="sm" color="blue" />
                <Text className="ml-2 font-medium">Total Impressions</Text>
              </Flex>
              <Metric className="text-blue-600">{numberFormatter(data.totalAdImpressions)}</Metric>
              <Text className="text-xs text-gray-500 mt-1">Ad views</Text>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <Flex alignItems="center" className="mb-2">
                <Icon icon={MousePointer} size="sm" color="emerald" />
                <Text className="ml-2 font-medium">Total Clicks</Text>
              </Flex>
              <Metric className="text-emerald-600">{numberFormatter(data.totalAdClicks)}</Metric>
              <Text className="text-xs text-gray-500 mt-1">
                CTR: {percentageFormatter(data.avgCTR)}
              </Text>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <Flex alignItems="center" className="mb-2">
                <Icon icon={TrendingUp} size="sm" color="amber" />
                <Text className="ml-2 font-medium">Average eCPM</Text>
              </Flex>
              <Metric className="text-amber-600">${data.avgECPM.toFixed(2)}</Metric>
              <Text className="text-xs text-gray-500 mt-1">
                Earnings per 1000 impressions
              </Text>
            </div>
          </div>
        </Card>
      </Grid>

      {/* Revenue Breakdown Cards */}
      <Grid numItems={1} numItemsSm={3} className="gap-6">
        <Card>
          <Flex alignItems="center" className="mb-2">
            <Icon icon={CreditCard} size="sm" color="blue" />
            <Text className="ml-2 font-medium">Subscriptions</Text>
          </Flex>
          <Metric>{valueFormatter(data.subscriptionEarnings)}</Metric>
          <ProgressBar
            value={data.totalEarnings > 0 ? (data.subscriptionEarnings / data.totalEarnings) * 100 : 0}
            color="blue"
            className="mt-3"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {data.totalEarnings > 0
              ? ((data.subscriptionEarnings / data.totalEarnings) * 100).toFixed(1)
              : "0"}% of total
          </Text>
        </Card>

        <Card>
          <Flex alignItems="center" className="mb-2">
            <Icon icon={Star} size="sm" color="amber" />
            <Text className="ml-2 font-medium">Featured Jobs</Text>
          </Flex>
          <Metric>{valueFormatter(data.featuredJobEarnings)}</Metric>
          <ProgressBar
            value={data.totalEarnings > 0 ? (data.featuredJobEarnings / data.totalEarnings) * 100 : 0}
            color="amber"
            className="mt-3"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {data.totalEarnings > 0
              ? ((data.featuredJobEarnings / data.totalEarnings) * 100).toFixed(1)
              : "0"}% of total
          </Text>
        </Card>

        <Card>
          <Flex alignItems="center" className="mb-2">
            <Icon icon={Award} size="sm" color="emerald" />
            <Text className="ml-2 font-medium">Credits Purchases</Text>
          </Flex>
          <Metric>{valueFormatter(data.creditsPurchaseEarnings)}</Metric>
          <ProgressBar
            value={data.totalEarnings > 0 ? (data.creditsPurchaseEarnings / data.totalEarnings) * 100 : 0}
            color="emerald"
            className="mt-3"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {data.totalEarnings > 0
              ? ((data.creditsPurchaseEarnings / data.totalEarnings) * 100).toFixed(1)
              : "0"}% of total
          </Text>
        </Card>
      </Grid>

      {/* Top Revenue Sources */}
      <Card>
        <Title>Top Revenue Sources</Title>
        <Text className="mb-4">Highest earning categories</Text>
        {data.topRevenueSources.length > 0 ? (
          <BarChart
            className="h-72"
            data={data.topRevenueSources}
            index="name"
            categories={["amount"]}
            colors={["emerald"]}
            valueFormatter={valueFormatter}
            yAxisWidth={48}
            showAnimation={true}
          />
        ) : (
          <div className="h-72 flex items-center justify-center">
            <Text className="text-gray-500">No revenue source data available</Text>
          </div>
        )}
      </Card>
    </div>
  );
}

