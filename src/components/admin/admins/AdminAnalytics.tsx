"use client";

import {
  Card,
  Title,
  Text,
  Grid,
  Metric,
  DonutChart,
  ProgressBar,
  Badge,
} from "@tremor/react";
import { Shield, Users, CheckCircle, XCircle, Activity } from "lucide-react";

export function AdminAnalytics({ data }: { data: any }) {
  const { totalAdmins, activeAdmins, inactiveAdmins, recentLogins, roleDistribution } = data;

  const valueFormatter = (number: number) =>
    Intl.NumberFormat("us").format(number).toString();

  const statusData = [
    { name: "Active", value: activeAdmins },
    { name: "Inactive", value: inactiveAdmins },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Total Admins</Text>
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <Metric>{totalAdmins.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            All admin accounts
          </Text>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Active</Text>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <Metric>{activeAdmins.toLocaleString()}</Metric>
          <ProgressBar 
            value={totalAdmins > 0 ? (activeAdmins / totalAdmins) * 100 : 0} 
            color="emerald"
            className="mt-3"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {totalAdmins > 0 ? ((activeAdmins / totalAdmins) * 100).toFixed(1) : "0"}% of total
          </Text>
        </Card>

        <Card decoration="top" decorationColor="red">
          <div className="flex items-center justify-between">
            <Text>Inactive</Text>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <Metric>{inactiveAdmins.toLocaleString()}</Metric>
          <ProgressBar 
            value={totalAdmins > 0 ? (inactiveAdmins / totalAdmins) * 100 : 0} 
            color="red"
            className="mt-3"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {totalAdmins > 0 ? ((inactiveAdmins / totalAdmins) * 100).toFixed(1) : "0"}% of total
          </Text>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <div className="flex items-center justify-between">
            <Text>Recent Logins</Text>
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <Metric>{recentLogins.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Last 7 days
          </Text>
        </Card>
      </Grid>

      {/* Status and Role Distribution */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Admin Status</Title>
          <Text className="mb-4">Active vs Inactive administrators</Text>
          {totalAdmins > 0 ? (
            <>
              <DonutChart
                className="h-72"
                data={statusData}
                category="value"
                index="name"
                valueFormatter={valueFormatter}
                colors={["emerald", "red"]}
              />
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <Text className="text-sm">Active</Text>
                  </div>
                  <Badge color="emerald">{activeAdmins}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <Text className="text-sm">Inactive</Text>
                  </div>
                  <Badge color="red">{inactiveAdmins}</Badge>
                </div>
              </div>
            </>
          ) : (
            <div className="h-72 flex items-center justify-center">
              <Text className="text-gray-500">No admin data available</Text>
            </div>
          )}
        </Card>

        <Card>
          <Title>Role Distribution</Title>
          <Text className="mb-4">Administrators by role</Text>
          {roleDistribution.length > 0 ? (
            <>
              <DonutChart
                className="h-72"
                data={roleDistribution}
                category="value"
                index="name"
                valueFormatter={valueFormatter}
                colors={["blue", "purple", "amber", "emerald", "cyan"]}
              />
              <div className="mt-4 space-y-2">
                {roleDistribution.map((role: any) => (
                  <div key={role.name} className="flex justify-between items-center">
                    <Text className="text-sm capitalize">{role.name}</Text>
                    <Badge color="blue">{role.value}</Badge>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-72 flex items-center justify-center">
              <Text className="text-gray-500">No role data available</Text>
            </div>
          )}
        </Card>
      </Grid>

      {/* Summary Card */}
      <Card>
        <Title>Admin Overview</Title>
        <Text className="mb-4">Key statistics and metrics</Text>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Text className="text-sm font-medium mb-2">Total Administrators</Text>
            <Metric className="text-2xl text-blue-600">{totalAdmins}</Metric>
            <Text className="text-xs text-gray-500 mt-1">All admin accounts</Text>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <Text className="text-sm font-medium mb-2">Active Rate</Text>
            <Metric className="text-2xl text-emerald-600">
              {totalAdmins > 0 ? ((activeAdmins / totalAdmins) * 100).toFixed(1) : "0"}%
            </Metric>
            <Text className="text-xs text-gray-500 mt-1">Currently active</Text>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Text className="text-sm font-medium mb-2">Recent Activity</Text>
            <Metric className="text-2xl text-purple-600">{recentLogins}</Metric>
            <Text className="text-xs text-gray-500 mt-1">Logins in last 7 days</Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

