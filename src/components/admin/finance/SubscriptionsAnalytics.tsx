"use client";

import {
  Card,
  Title,
  Text,
  Grid,
  DonutChart,
  Metric,
  ProgressBar,
  Badge,
} from "@tremor/react";
import { CreditCard, TrendingUp, XCircle, DollarSign, Crown } from "lucide-react";

interface SubscriptionAnalyticsData {
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  totalRevenue: number;
  activeRevenue: number;
  planDistribution: { name: string; value: number }[];
  statusDistribution: { name: string; value: number }[];
  subscriptionsHistory: { date: string; Subscriptions: number }[];
  revenueHistory: { date: string; Revenue: number }[];
  topSubscribers: Array<{
    uid: string;
    count: number;
    totalSpent: number;
    activeSubscriptions: number;
    currentPlan: string;
    name?: string;
    email?: string;
  }>;
}

export function SubscriptionsAnalytics({ data }: { data: SubscriptionAnalyticsData }) {
  const valueFormatter = (number: number) => 
    Intl.NumberFormat("us").format(number).toString();

  const activeRate = data.totalSubscriptions > 0 
    ? ((data.activeSubscriptions / data.totalSubscriptions) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Total Subscriptions</Text>
            <CreditCard className="w-5 h-5 text-blue-500" />
          </div>
          <Metric>{data.totalSubscriptions}</Metric>
          <ProgressBar value={(data.activeSubscriptions / data.totalSubscriptions) * 100} className="mt-3" />
          <Text className="mt-2 text-xs text-gray-500">
            {activeRate}% Active
          </Text>
        </Card>
        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Active</Text>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <Metric>{data.activeSubscriptions}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Currently Active
          </Text>
        </Card>
        <Card decoration="top" decorationColor="rose">
          <div className="flex items-center justify-between">
            <Text>Cancelled</Text>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <Metric>{data.cancelledSubscriptions}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Churned Customers
          </Text>
        </Card>
        <Card decoration="top" decorationColor="green">
          <div className="flex items-center justify-between">
            <Text>Total Revenue</Text>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <Metric>${data.totalRevenue.toLocaleString()}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            All-Time Earnings
          </Text>
        </Card>
      </Grid>

      {/* Main Charts Row 1 */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Revenue Breakdown</Title>
          <Text>Current vs total revenue</Text>
          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <Text className="font-medium">Active MRR</Text>
                </div>
                <Text className="font-bold text-2xl text-emerald-600">${data.activeRevenue.toLocaleString()}</Text>
              </div>
              <ProgressBar value={(data.activeRevenue / data.totalRevenue) * 100} color="emerald" className="h-3" />
              <Text className="text-xs text-gray-500 mt-1">
                {((data.activeRevenue / data.totalRevenue) * 100).toFixed(1)}% of total
              </Text>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <Text className="font-medium">Total Revenue</Text>
                </div>
                <Text className="font-bold text-2xl text-blue-600">${data.totalRevenue.toLocaleString()}</Text>
              </div>
              <ProgressBar value={100} color="blue" className="h-3" />
              <Text className="text-xs text-gray-500 mt-1">
                Lifetime value
              </Text>
            </div>
          </div>
        </Card>
        
        <Card>
          <Title>Subscription Plans</Title>
          <Text>Distribution by plan type</Text>
          <DonutChart
            className="h-64 mt-4"
            data={data.planDistribution}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["emerald", "blue", "amber", "purple", "rose"]}
          />
        </Card>
      </Grid>

      {/* Top Subscribers Section */}
      <Card>
        <Title>Top Subscribers 👑</Title>
        <Text>Companies with highest subscription spend</Text>
        <div className="mt-6">
          {data.topSubscribers.length > 0 ? (
            <div className="space-y-4">
              {data.topSubscribers.map((subscriber, index) => (
                <div key={subscriber.uid} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                        index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                        index === 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-600' :
                        index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div>
                        <Text className="font-semibold">{subscriber.name || "Unknown Company"}</Text>
                        <Text className="text-xs text-gray-500">{subscriber.email || subscriber.uid}</Text>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <Badge color="purple" size="xs" icon={Crown}>
                          {subscriber.currentPlan}
                        </Badge>
                        <Text className="text-xs text-gray-500 mt-1">
                          {subscriber.activeSubscriptions} active
                        </Text>
                      </div>
                      <div>
                        <Text className="font-bold text-2xl text-green-600">${subscriber.totalSpent.toLocaleString()}</Text>
                        <Text className="text-xs text-gray-500">{subscriber.count} subscriptions</Text>
                      </div>
                    </div>
                  </div>
                  <ProgressBar 
                    value={(subscriber.totalSpent / data.topSubscribers[0].totalSpent) * 100}
                    color={index === 0 ? "green" : "slate"}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Text className="text-gray-500">No subscription data available yet</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

