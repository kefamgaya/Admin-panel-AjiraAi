"use client";

import {
  Card,
  Title,
  Text,
  Grid,
  Metric,
  ProgressBar,
  AreaChart,
  Badge,
  BarChart,
} from "@tremor/react";
import { Users, Briefcase, FileText, DollarSign, TrendingUp, TrendingDown, Building, Calendar } from "lucide-react";

export function OverviewTab({ data }: { data: any }) {
  const { overview, monthlyGrowth } = data;

  const valueFormatter = (number: number) =>
    Intl.NumberFormat("us").format(number).toString();

  return (
    <div className="space-y-6 mt-6">
      {/* Key Metrics Grid */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Total Users</Text>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <Metric>{overview.totalUsers.toLocaleString()}</Metric>
          <div className="flex items-center gap-2 mt-2">
            {overview.userGrowthRate >= 0 ? (
              <Badge color="emerald" icon={TrendingUp}>
                +{overview.userGrowthRate.toFixed(1)}%
              </Badge>
            ) : (
              <Badge color="rose" icon={TrendingDown}>
                {overview.userGrowthRate.toFixed(1)}%
              </Badge>
            )}
            <Text className="text-xs text-gray-500">vs last month</Text>
          </div>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <div className="flex items-center justify-between">
            <Text>Total Jobs</Text>
            <Briefcase className="w-5 h-5 text-purple-500" />
          </div>
          <Metric>{overview.totalJobs.toLocaleString()}</Metric>
          <div className="flex items-center gap-2 mt-2">
            {overview.jobGrowthRate >= 0 ? (
              <Badge color="emerald" icon={TrendingUp}>
                +{overview.jobGrowthRate.toFixed(1)}%
              </Badge>
            ) : (
              <Badge color="rose" icon={TrendingDown}>
                {overview.jobGrowthRate.toFixed(1)}%
              </Badge>
            )}
            <Text className="text-xs text-gray-500">vs last month</Text>
          </div>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <div className="flex items-center justify-between">
            <Text>Applications</Text>
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <Metric>{overview.totalApplications.toLocaleString()}</Metric>
          <ProgressBar 
            value={(overview.shortlistedApplications / overview.totalApplications) * 100} 
            color="emerald"
            className="mt-3"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {((overview.shortlistedApplications / overview.totalApplications) * 100).toFixed(1)}% Shortlisted
          </Text>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Total Revenue</Text>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <Metric>${overview.totalRevenue.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            ${overview.revenueLastMonth.toLocaleString()} this month
          </Text>
        </Card>
      </Grid>

      {/* Secondary Metrics */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={5} className="gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-500" />
            <Text className="font-medium">Active Users</Text>
          </div>
          <Metric className="text-2xl">{overview.activeUsers.toLocaleString()}</Metric>
          <ProgressBar 
            value={(overview.activeUsers / overview.totalUsers) * 100} 
            color="blue"
            className="mt-2"
          />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-4 h-4 text-gray-500" />
            <Text className="font-medium">Companies</Text>
          </div>
          <Metric className="text-2xl">{overview.totalCompanies.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-1">
            {overview.verifiedCompanies} verified
          </Text>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <Text className="font-medium">Active Jobs</Text>
          </div>
          <Metric className="text-2xl">{overview.activeJobs.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-1">
            {overview.featuredJobs} featured
          </Text>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Text className="font-medium">Interviews</Text>
          </div>
          <Metric className="text-2xl">{overview.totalInterviews.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-1">
            {overview.scheduledInterviews} scheduled
          </Text>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <Text className="font-medium">Resumes Generated</Text>
          </div>
          <Metric className="text-2xl">{overview.totalResumesGenerated.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-1">
            {overview.resumesLast30Days} last 30 days
          </Text>
        </Card>
      </Grid>

      {/* Growth Chart */}
      <Card>
        <Title>Platform Growth (Last 6 Months)</Title>
        <Text>User registrations, job postings, and applications over time</Text>
        <AreaChart
          className="h-80 mt-4"
          data={monthlyGrowth}
          index="month"
          categories={["users", "jobs", "applications"]}
          colors={["blue", "purple", "amber"]}
          valueFormatter={valueFormatter}
        />
      </Card>

      {/* Status Overview */}
      <Grid numItems={1} numItemsLg={3} className="gap-6">
        <Card>
          <Title className="mb-4">Job Status</Title>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <Text>Active</Text>
                <Text className="font-semibold">{overview.activeJobs}</Text>
              </div>
              <ProgressBar value={(overview.activeJobs / overview.totalJobs) * 100} color="emerald" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <Text>Pending</Text>
                <Text className="font-semibold">{overview.pendingJobs}</Text>
              </div>
              <ProgressBar value={(overview.pendingJobs / overview.totalJobs) * 100} color="amber" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <Text>Featured</Text>
                <Text className="font-semibold">{overview.featuredJobs}</Text>
              </div>
              <ProgressBar value={(overview.featuredJobs / overview.totalJobs) * 100} color="purple" />
            </div>
          </div>
        </Card>

        <Card>
          <Title className="mb-4">User Status</Title>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <Text>Active</Text>
                <Text className="font-semibold">{overview.activeUsers}</Text>
              </div>
              <ProgressBar value={(overview.activeUsers / overview.totalUsers) * 100} color="emerald" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <Text>Verified</Text>
                <Text className="font-semibold">{overview.verifiedUsers}</Text>
              </div>
              <ProgressBar value={(overview.verifiedUsers / overview.totalUsers) * 100} color="blue" />
            </div>
          </div>
        </Card>

        <Card>
          <Title className="mb-4">Subscriptions</Title>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <Text>Active</Text>
                <Text className="font-semibold">{overview.activeSubscriptions}</Text>
              </div>
              <ProgressBar value={100} color="emerald" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <Text>Paid Plans</Text>
                <Text className="font-semibold">{overview.paidSubscriptions}</Text>
              </div>
              <ProgressBar value={(overview.paidSubscriptions / overview.activeSubscriptions) * 100} color="purple" />
            </div>
          </div>
        </Card>
      </Grid>
    </div>
  );
}

