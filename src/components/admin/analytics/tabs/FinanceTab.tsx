"use client";

import {
  Card,
  Title,
  Text,
  Grid,
  Metric,
  ProgressBar,
  Badge,
} from "@tremor/react";
import { DollarSign, TrendingUp, TrendingDown, Users, Gift, CreditCard } from "lucide-react";

export function FinanceTab({ data }: { data: any }) {
  const { finance } = data;

  return (
    <div className="space-y-6 mt-6">
      {/* Financial KPIs */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Total Revenue</Text>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <Metric>${finance.totalRevenue.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            All-time earnings
          </Text>
        </Card>

        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>This Month</Text>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <Metric>${finance.revenueLastMonth.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Current month revenue
          </Text>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <div className="flex items-center justify-between">
            <Text>Credits Issued</Text>
            <Gift className="w-5 h-5 text-purple-500" />
          </div>
          <Metric>{finance.totalCreditsIssued.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Total credits added
          </Text>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <div className="flex items-center justify-between">
            <Text>Credits Used</Text>
            <TrendingDown className="w-5 h-5 text-amber-500" />
          </div>
          <Metric>{finance.totalCreditsUsed.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Total credits consumed
          </Text>
        </Card>
      </Grid>

      {/* Revenue Breakdown */}
      <Card>
        <Title>Revenue Overview</Title>
        <Text className="mb-4">Financial performance metrics</Text>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <Text className="font-medium">Total Revenue</Text>
            </div>
            <Metric className="text-3xl text-emerald-600">${finance.totalRevenue.toLocaleString()}</Metric>
            <ProgressBar value={100} color="emerald" className="mt-3" />
          </div>

          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <Text className="font-medium">This Month</Text>
            </div>
            <Metric className="text-3xl text-blue-600">${finance.revenueLastMonth.toLocaleString()}</Metric>
            <ProgressBar 
              value={(finance.revenueLastMonth / finance.totalRevenue) * 100} 
              color="blue" 
              className="mt-3" 
            />
            <Text className="text-xs text-gray-500 mt-1">
              {((finance.revenueLastMonth / finance.totalRevenue) * 100).toFixed(1)}% of total
            </Text>
          </div>

          <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-purple-500" />
              <Text className="font-medium">Avg per Month</Text>
            </div>
            <Metric className="text-3xl text-purple-600">
              ${(finance.totalRevenue / 6).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Metric>
            <Text className="text-xs text-gray-500 mt-3">
              Based on last 6 months
            </Text>
          </div>
        </div>
      </Card>

      {/* Credits Economy */}
      <Card>
        <Title>Credits Economy</Title>
        <Text className="mb-4">Platform credit system overview</Text>
        <Grid numItems={1} numItemsSm={2} className="gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text className="font-medium">Credits Issued</Text>
                <Badge color="emerald" size="lg">{finance.totalCreditsIssued.toLocaleString()}</Badge>
              </div>
              <ProgressBar value={100} color="emerald" className="h-3" />
            </div>

            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text className="font-medium">Credits Used</Text>
                <Badge color="rose" size="lg">{finance.totalCreditsUsed.toLocaleString()}</Badge>
              </div>
              <ProgressBar 
                value={(finance.totalCreditsUsed / finance.totalCreditsIssued) * 100} 
                color="rose" 
                className="h-3" 
              />
              <Text className="text-xs text-gray-500 mt-1">
                {((finance.totalCreditsUsed / finance.totalCreditsIssued) * 100).toFixed(1)}% utilization
              </Text>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text className="font-medium">Net Balance</Text>
                <Badge 
                  color={finance.netCredits >= 0 ? "indigo" : "amber"} 
                  size="lg"
                >
                  {finance.netCredits >= 0 ? "+" : ""}{finance.netCredits.toLocaleString()}
                </Badge>
              </div>
              <Text className="text-xs text-gray-500">
                {finance.netCredits >= 0 ? "Surplus in system" : "Deficit"}
              </Text>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <Text className="text-sm font-medium mb-3">Credit Metrics</Text>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text className="text-xs text-gray-500">Total Issued</Text>
                  <Text className="font-semibold">{finance.totalCreditsIssued}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-xs text-gray-500">Total Used</Text>
                  <Text className="font-semibold">{finance.totalCreditsUsed}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-xs text-gray-500">Net Balance</Text>
                  <Text className={`font-semibold ${finance.netCredits >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {finance.netCredits >= 0 ? "+" : ""}{finance.netCredits}
                  </Text>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                  <Text className="text-xs text-gray-500">Utilization Rate</Text>
                  <Text className="font-semibold">
                    {((finance.totalCreditsUsed / finance.totalCreditsIssued) * 100).toFixed(1)}%
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Grid>
      </Card>

      {/* Referral Program */}
      <Card>
        <Title>Referral Program Performance</Title>
        <Text className="mb-4">User acquisition through referrals</Text>
        <Grid numItems={1} numItemsSm={3} className="gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <Text className="font-medium">Total Referrals</Text>
            </div>
            <Metric className="text-2xl text-blue-600">{finance.totalReferrals}</Metric>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <Text className="font-medium">Successful</Text>
            </div>
            <Metric className="text-2xl text-emerald-600">{finance.successfulReferrals}</Metric>
            <ProgressBar 
              value={(finance.successfulReferrals / finance.totalReferrals) * 100} 
              color="emerald" 
              className="mt-2" 
            />
            <Text className="text-xs text-gray-500 mt-1">
              {((finance.successfulReferrals / finance.totalReferrals) * 100).toFixed(1)}% success rate
            </Text>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-purple-500" />
              <Text className="font-medium">Credits Awarded</Text>
            </div>
            <Metric className="text-2xl text-purple-600">{finance.referralCreditsAwarded}</Metric>
            <Text className="text-xs text-gray-500 mt-2">
              Total referral rewards
            </Text>
          </div>
        </Grid>
      </Card>
    </div>
  );
}

