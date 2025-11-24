"use client";

import {
  Card,
  Title,
  Text,
  Grid,
  DonutChart,
  BarChart,
  AreaChart,
  Flex,
  Metric,
  ProgressBar,
  List,
  ListItem,
  Bold,
} from "@tremor/react";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  verifiedUsers: number;
  roleDistribution: { name: string; value: number }[];
  genderDistribution: { name: string; value: number }[];
  accountTypeDistribution: { name: string; value: number }[];
  growthHistory: { date: string; "New Users": number }[];
  topSkills: { name: string; value: number }[];
  locationDistribution: { name: string; value: number }[];
  ageDistribution: { name: string; value: number }[];
}

export function UsersAnalytics({ data }: { data: AnalyticsData }) {
  const valueFormatter = (number: number) => 
    Intl.NumberFormat("us").format(number).toString();

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Text>Total Users</Text>
          <Metric>{data.totalUsers}</Metric>
          <ProgressBar value={(data.activeUsers / data.totalUsers) * 100} className="mt-3" />
          <Text className="mt-2 text-xs text-gray-500">
            {Math.round((data.activeUsers / data.totalUsers) * 100)}% Active
          </Text>
        </Card>
        <Card decoration="top" decorationColor="green">
          <Text>Verified Accounts</Text>
          <Metric>{data.verifiedUsers}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
             Trusted Profiles
          </Text>
        </Card>
        <Card decoration="top" decorationColor="red">
          <Text>Blocked Users</Text>
          <Metric>{data.blockedUsers}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Restricted Access
          </Text>
        </Card>
        <Card decoration="top" decorationColor="indigo">
          <Text>Locations Covered</Text>
          <Metric>{data.locationDistribution.length}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Unique Regions
          </Text>
        </Card>
      </Grid>

      {/* Main Charts Row 1 */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>User Growth Over Time</Title>
          <Text>New user registrations by month</Text>
          <AreaChart
            className="h-72 mt-4"
            data={data.growthHistory}
            index="date"
            categories={["New Users"]}
            colors={["blue"]}
            valueFormatter={valueFormatter}
            showLegend={false}
          />
        </Card>
        
        <Card>
          <Title>Age Distribution</Title>
          <Text>Demographics by age group</Text>
          <BarChart
            className="h-72 mt-4"
            data={data.ageDistribution}
            index="name"
            categories={["value"]}
            colors={["orange"]}
            valueFormatter={valueFormatter}
          />
        </Card>
      </Grid>

      {/* Main Charts Row 2 */}
      <Grid numItems={1} numItemsLg={3} className="gap-6">
        <Card>
          <Title>Gender Demographics</Title>
          <DonutChart
            className="h-52 mt-4"
            data={data.genderDistribution}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["blue", "pink", "slate"]}
          />
        </Card>
        
        <Card>
          <Title>Role Distribution</Title>
          <DonutChart
            className="h-52 mt-4"
            data={data.roleDistribution}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]}
          />
        </Card>

        <Card>
          <Title>Account Types</Title>
          <BarChart
            className="h-52 mt-4"
            data={data.accountTypeDistribution}
            index="name"
            categories={["value"]}
            colors={["emerald"]}
            valueFormatter={valueFormatter}
            layout="vertical"
            showLegend={false}
          />
        </Card>
      </Grid>

      {/* Skills and Locations */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Top User Skills</Title>
          <div className="mt-4 h-72 overflow-y-auto">
            <List>
              {data.topSkills.map((item) => (
                <ListItem key={item.name}>
                  <span>{item.name}</span>
                  <span className="text-tremor-content-strong font-medium">{item.value}</span>
                </ListItem>
              ))}
            </List>
          </div>
        </Card>

        <Card>
          <Title>User Distribution by Location</Title>
          <BarChart
            className="h-72 mt-4"
            data={data.locationDistribution}
            index="name"
            categories={["value"]}
            colors={["indigo"]}
            valueFormatter={valueFormatter}
          />
        </Card>
      </Grid>
    </div>
  );
}
