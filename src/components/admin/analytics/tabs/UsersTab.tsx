"use client";

import {
  Card,
  Title,
  Text,
  Grid,
  Metric,
  DonutChart,
  BarChart,
  List,
  ListItem,
  ProgressBar,
  Badge,
} from "@tremor/react";
import { Users, UserCheck, UserX, Award, MapPin, Wrench } from "lucide-react";

export function UsersTab({ data }: { data: any }) {
  const { users } = data;

  const valueFormatter = (number: number) =>
    Intl.NumberFormat("us").format(number).toString();

  return (
    <div className="space-y-6 mt-6">
      {/* User KPIs */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Total Users</Text>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <Metric>{users.total.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            All registered users
          </Text>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Active Users</Text>
            <UserCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <Metric>{users.active.toLocaleString()}</Metric>
          <ProgressBar 
            value={(users.active / users.total) * 100} 
            color="emerald"
            className="mt-3"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {((users.active / users.total) * 100).toFixed(1)}% of total
          </Text>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <div className="flex items-center justify-between">
            <Text>Verified Users</Text>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <Metric>{users.verified.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Trusted accounts
          </Text>
        </Card>

        <Card decoration="top" decorationColor="rose">
          <div className="flex items-center justify-between">
            <Text>Blocked Users</Text>
            <UserX className="w-5 h-5 text-rose-500" />
          </div>
          <Metric>{users.blocked.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Restricted access
          </Text>
        </Card>
      </Grid>

      {/* User Distribution */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>User Roles Distribution</Title>
          <Text>Breakdown by user type</Text>
          <DonutChart
            className="h-72 mt-4"
            data={users.byRole}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["blue", "purple", "amber", "emerald", "rose", "slate"]}
          />
        </Card>

        <Card>
          <Title>User Activity Summary</Title>
          <Text>Key user metrics at a glance</Text>
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text className="font-medium">New Users (Last 30 Days)</Text>
                <Badge color="blue">{users.newLast30Days}</Badge>
              </div>
              <ProgressBar 
                value={(users.newLast30Days / users.total) * 100} 
                color="blue"
              />
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text className="font-medium">Active Rate</Text>
                <Badge color="emerald">{((users.active / users.total) * 100).toFixed(1)}%</Badge>
              </div>
              <ProgressBar 
                value={(users.active / users.total) * 100} 
                color="emerald"
              />
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text className="font-medium">Verification Rate</Text>
                <Badge color="purple">{((users.verified / users.total) * 100).toFixed(1)}%</Badge>
              </div>
              <ProgressBar 
                value={(users.verified / users.total) * 100} 
                color="purple"
              />
            </div>
          </div>
        </Card>
      </Grid>

      {/* Top Locations and Skills */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-500" />
            <Title>Top User Locations</Title>
          </div>
          <Text className="mb-4">Geographic distribution of users</Text>
          <BarChart
            className="h-72"
            data={users.topLocations}
            index="name"
            categories={["value"]}
            colors={["blue"]}
            valueFormatter={valueFormatter}
            layout="horizontal"
          />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-purple-500" />
            <Title>Top User Skills</Title>
          </div>
          <Text className="mb-4">Most common skills in the platform</Text>
          <div className="h-72 overflow-y-auto">
            <List>
              {users.topSkills.map((skill: any, index: number) => (
                <ListItem key={skill.name}>
                  <div className="flex items-center gap-2">
                    <Badge size="xs" color={index < 3 ? "blue" : "slate"}>
                      #{index + 1}
                    </Badge>
                    <span>{skill.name}</span>
                  </div>
                  <span className="text-tremor-content-strong font-medium">{skill.value}</span>
                </ListItem>
              ))}
            </List>
          </div>
        </Card>
      </Grid>

      {/* User Status Breakdown */}
      <Card>
        <Title>Detailed User Status</Title>
        <Text className="mb-4">Comprehensive breakdown of user accounts</Text>
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <Text className="text-xs text-gray-500 mb-1">Total</Text>
            <Metric className="text-2xl">{users.total}</Metric>
          </div>
          <div className="p-4 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <Text className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Active</Text>
            <Metric className="text-2xl text-emerald-600">{users.active}</Metric>
          </div>
          <div className="p-4 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Text className="text-xs text-purple-600 dark:text-purple-400 mb-1">Verified</Text>
            <Metric className="text-2xl text-purple-600">{users.verified}</Metric>
          </div>
          <div className="p-4 border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <Text className="text-xs text-rose-600 dark:text-rose-400 mb-1">Blocked</Text>
            <Metric className="text-2xl text-rose-600">{users.blocked}</Metric>
          </div>
        </Grid>
      </Card>
    </div>
  );
}

