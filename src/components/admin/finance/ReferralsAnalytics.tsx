"use client";

import {
  Card,
  Title,
  Text,
  Grid,
  DonutChart,
  Metric,
  ProgressBar,
  List,
  ListItem,
  Badge,
} from "@tremor/react";
import { Users, Award, TrendingUp, Gift } from "lucide-react";

interface ReferralAnalyticsData {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalCreditsAwarded: number;
  totalReferrerCredits: number;
  totalRefereeCredits: number;
  statusDistribution: { name: string; value: number }[];
  referralsHistory: { date: string; Referrals: number }[];
  topReferrers: Array<{
    uid: string;
    count: number;
    totalCredits: number;
    successfulReferrals: number;
    name?: string;
    email?: string;
  }>;
}

export function ReferralsAnalytics({ data }: { data: ReferralAnalyticsData }) {
  const valueFormatter = (number: number) => 
    Intl.NumberFormat("us").format(number).toString();

  const successRate = data.totalReferrals > 0 
    ? ((data.successfulReferrals / data.totalReferrals) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Total Referrals</Text>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <Metric>{data.totalReferrals}</Metric>
          <ProgressBar value={(data.successfulReferrals / data.totalReferrals) * 100} className="mt-3" />
          <Text className="mt-2 text-xs text-gray-500">
            {successRate}% Success Rate
          </Text>
        </Card>
        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Successful</Text>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <Metric>{data.successfulReferrals}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Completed & Rewarded
          </Text>
        </Card>
        <Card decoration="top" decorationColor="amber">
          <div className="flex items-center justify-between">
            <Text>Pending</Text>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <Metric>{data.pendingReferrals}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Awaiting Completion
          </Text>
        </Card>
        <Card decoration="top" decorationColor="purple">
          <div className="flex items-center justify-between">
            <Text>Credits Awarded</Text>
            <Gift className="w-5 h-5 text-purple-500" />
          </div>
          <Metric>{data.totalCreditsAwarded.toLocaleString()}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Total Distributed
          </Text>
        </Card>
      </Grid>

      {/* Main Charts Row 1 */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Credits Distribution</Title>
          <Text>Breakdown of awarded credits</Text>
          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <Text className="font-medium">Referrer Credits</Text>
                </div>
                <Text className="font-bold text-2xl text-emerald-600">{data.totalReferrerCredits.toLocaleString()}</Text>
              </div>
              <ProgressBar value={100} color="emerald" className="h-3" />
              <Text className="text-xs text-gray-500 mt-1">
                {((data.totalReferrerCredits / data.totalCreditsAwarded) * 100).toFixed(1)}% of total
              </Text>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <Text className="font-medium">Referee Credits</Text>
                </div>
                <Text className="font-bold text-2xl text-blue-600">{data.totalRefereeCredits.toLocaleString()}</Text>
              </div>
              <ProgressBar 
                value={(data.totalRefereeCredits / data.totalReferrerCredits) * 100} 
                color="blue" 
                className="h-3" 
              />
              <Text className="text-xs text-gray-500 mt-1">
                {((data.totalRefereeCredits / data.totalCreditsAwarded) * 100).toFixed(1)}% of total
              </Text>
            </div>
          </div>
        </Card>
        
        <Card>
          <Title>Referral Status</Title>
          <Text>Distribution by status</Text>
          <DonutChart
            className="h-64 mt-4"
            data={data.statusDistribution}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["emerald", "amber", "rose", "slate"]}
          />
        </Card>
      </Grid>

      {/* Top Referrers Section */}
      <Card>
        <Title>Top Referrers 🏆</Title>
        <Text>Users with the most successful referrals</Text>
        <div className="mt-6">
          {data.topReferrers.length > 0 ? (
            <div className="space-y-4">
              {data.topReferrers.map((referrer, index) => (
                <div key={referrer.uid} className="space-y-2">
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
                        <Text className="font-semibold">{referrer.name || "Unknown User"}</Text>
                        <Text className="text-xs text-gray-500">{referrer.email || referrer.uid}</Text>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <Badge color="emerald" size="xs">
                          {referrer.successfulReferrals} successful
                        </Badge>
                        <Text className="text-xs text-gray-500 mt-1">
                          {referrer.totalCredits} credits earned
                        </Text>
                      </div>
                      <Text className="font-bold text-2xl text-blue-600">{referrer.count}</Text>
                    </div>
                  </div>
                  <ProgressBar 
                    value={(referrer.count / data.topReferrers[0].count) * 100}
                    color={index === 0 ? "blue" : "slate"}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Text className="text-gray-500">No referral data available yet</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

