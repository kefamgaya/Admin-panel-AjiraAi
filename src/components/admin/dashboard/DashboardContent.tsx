"use client";

import { Card, Grid, Title, Text, Metric, Flex, BadgeDelta, AreaChart, Button, List, ListItem, Badge, ProgressBar, DonutChart, Callout } from "@tremor/react";
import { Users, Briefcase, FileText, TrendingUp, DollarSign, Building2, AlertCircle, CheckCircle, Clock, ArrowRight, TrendingDown, Activity } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type DashboardData = {
  overview: {
    totalUsers: number;
    totalCompanies: number;
    totalJobs: number;
    totalApplications: number;
  };
  today: {
    newUsers: number;
    newJobs: number;
    newApplications: number;
    earnings: number;
  };
  revenue: {
    total: number;
    growth: number;
    chartData: any[];
  };
  users: {
    active: number;
    growth: number;
  };
  jobs: {
    posted: number;
    growth: number;
  };
  applications: {
    active: number;
    growth: number;
  };
  earnings: {
    total7d: number;
    bySource: Record<string, number>;
    today: number;
  };
  pending: {
    jobs: number;
    blockedUsers: number;
    unverifiedCompanies: number;
  };
  recent: {
    users: any[];
    jobs: any[];
    applications: any[];
  };
  top: {
    companies: any[];
    skills: any[];
  };
};

const valueFormatter = (number: number) =>
  `$${new Intl.NumberFormat("us").format(number).toString()}`;

export default function DashboardContent({ data }: { data: DashboardData }) {
  const categories = [
    {
      title: "Active Users (30d)",
      metric: data.users.active.toLocaleString(),
      delta: `${data.users.growth.toFixed(1)}%`,
      deltaType: data.users.growth >= 0 ? "increase" : "decrease",
      icon: Users,
      color: "blue",
      subtitle: `${data.today.newUsers} new today`,
    },
    {
      title: "Jobs Posted (30d)",
      metric: data.jobs.posted.toLocaleString(),
      delta: `${data.jobs.growth.toFixed(1)}%`,
      deltaType: data.jobs.growth >= 0 ? "increase" : "decrease",
      icon: Briefcase,
      color: "amber",
      subtitle: `${data.today.newJobs} new today`,
    },
    {
      title: "Applications (30d)",
      metric: data.applications.active.toLocaleString(),
      delta: `${data.applications.growth.toFixed(1)}%`,
      deltaType: data.applications.growth >= 0 ? "increase" : "decrease",
      icon: FileText,
      color: "indigo",
      subtitle: `${data.today.newApplications} new today`,
    },
    {
      title: "Revenue (30d)",
      metric: valueFormatter(data.revenue.total),
      delta: `${data.revenue.growth.toFixed(1)}%`,
      deltaType: data.revenue.growth >= 0 ? "increase" : "decrease",
      icon: TrendingUp,
      color: "emerald",
      subtitle: `${valueFormatter(data.today.earnings)} today`,
    },
  ];

  // Prepare earnings donut chart data
  const earningsChartData = Object.entries(data.earnings.bySource).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: parseFloat(value.toFixed(2)),
  }));

  // Calculate total pending actions
  const totalPending = data.pending.jobs + data.pending.blockedUsers + data.pending.unverifiedCompanies;

  return (
    <main className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title className="text-2xl font-bold">Dashboard</Title>
          <Text className="mt-1">Welcome back! Here's what's happening with your platform.</Text>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/analytics">
            <Button variant="secondary" icon={Activity}>
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Platform Overview - Total Stats */}
      <div>
        <Title className="mb-4">Platform Overview</Title>
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
          <Card decoration="top" decorationColor="blue">
            <Flex alignItems="start" className="space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="truncate">
                <Text>Total Users</Text>
                <Metric className="mt-1">{data.overview.totalUsers.toLocaleString()}</Metric>
              </div>
            </Flex>
          </Card>
          
          <Card decoration="top" decorationColor="purple">
            <Flex alignItems="start" className="space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="truncate">
                <Text>Companies</Text>
                <Metric className="mt-1">{data.overview.totalCompanies.toLocaleString()}</Metric>
              </div>
            </Flex>
          </Card>
          
          <Card decoration="top" decorationColor="amber">
            <Flex alignItems="start" className="space-x-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
                <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="truncate">
                <Text>Total Jobs</Text>
                <Metric className="mt-1">{data.overview.totalJobs.toLocaleString()}</Metric>
              </div>
            </Flex>
          </Card>
          
          <Card decoration="top" decorationColor="emerald">
            <Flex alignItems="start" className="space-x-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="truncate">
                <Text>Applications</Text>
                <Metric className="mt-1">{data.overview.totalApplications.toLocaleString()}</Metric>
              </div>
            </Flex>
          </Card>
        </Grid>
      </div>

      {/* Key Metrics (30 days) */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
        {categories.map((item) => (
          <Card key={item.title} decoration="top" decorationColor={item.color as any}>
            <Flex alignItems="start">
              <div className="truncate flex-1">
                <Text>{item.title}</Text>
                <Metric className="truncate mt-1">{item.metric}</Metric>
              </div>
              <BadgeDelta deltaType={item.deltaType as any} size="xs">{item.delta}</BadgeDelta>
            </Flex>
            <Flex className="mt-3">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {item.subtitle}
              </Text>
            </Flex>
          </Card>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid numItems={1} numItemsLg={3} className="gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <Title>Revenue Trend</Title>
          <Text>Last 30 days credit transactions</Text>
          <AreaChart
            className="h-72 mt-4"
            data={data.revenue.chartData}
            index="date"
            categories={["Revenue"]}
            colors={["emerald"]}
            valueFormatter={valueFormatter}
            showAnimation
          />
        </Card>

        {/* Earnings by Source */}
        <Card>
          <Title>Earnings by Source</Title>
          <Text>Last 7 days breakdown</Text>
          {earningsChartData.length > 0 ? (
            <>
              <DonutChart
                className="mt-4"
                data={earningsChartData}
                category="value"
                index="name"
                valueFormatter={valueFormatter}
                colors={["emerald", "blue", "amber", "rose", "indigo"]}
                showAnimation
              />
              <List className="mt-4">
                {earningsChartData.map((item) => (
                  <ListItem key={item.name}>
                    <Text>{item.name}</Text>
                    <Text className="font-medium">{valueFormatter(item.value)}</Text>
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <div className="flex items-center justify-center h-48">
              <Text className="text-gray-500">No earnings data available</Text>
            </div>
          )}
        </Card>
      </Grid>

      {/* Pending Actions & Recent Activity */}
      <Grid numItems={1} numItemsLg={2} className="gap-4">
        {/* Pending Actions */}
        <Card>
          <Flex>
            <Title>Pending Actions</Title>
            <Badge color="amber" icon={Clock}>{totalPending}</Badge>
          </Flex>
          <List className="mt-4">
            <ListItem>
              <Flex justifyContent="start" className="space-x-2 truncate">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <Text className="truncate">Jobs Awaiting Approval</Text>
              </Flex>
              <Flex justifyContent="end" className="space-x-2">
                <Text className="font-medium">{data.pending.jobs}</Text>
                <Link href="/admin/jobs/pending">
                  <ArrowRight className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-600" />
                </Link>
              </Flex>
            </ListItem>
            <ListItem>
              <Flex justifyContent="start" className="space-x-2 truncate">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <Text className="truncate">Blocked Users</Text>
              </Flex>
              <Flex justifyContent="end" className="space-x-2">
                <Text className="font-medium">{data.pending.blockedUsers}</Text>
                <Link href="/admin/users/seekers">
                  <ArrowRight className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-600" />
                </Link>
              </Flex>
            </ListItem>
            <ListItem>
              <Flex justifyContent="start" className="space-x-2 truncate">
                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <Text className="truncate">Unverified Companies</Text>
              </Flex>
              <Flex justifyContent="end" className="space-x-2">
                <Text className="font-medium">{data.pending.unverifiedCompanies}</Text>
                <Link href="/admin/users/companies">
                  <ArrowRight className="w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-600" />
                </Link>
              </Flex>
            </ListItem>
          </List>
        </Card>

        {/* Recent Users */}
        <Card>
          <Flex>
            <Title>Recent Users</Title>
            <Link href="/admin/users/seekers">
              <Button variant="light" size="xs" icon={ArrowRight} iconPosition="right">
                View All
              </Button>
            </Link>
          </Flex>
          <List className="mt-4">
            {data.recent.users.length > 0 ? (
              data.recent.users.map((user) => (
                <ListItem key={user.id}>
                  <Flex justifyContent="start" className="space-x-2 truncate">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                        </Text>
                      </div>
                    </div>
                    <div className="truncate">
                      <Text className="truncate font-medium">{user.full_name || user.email}</Text>
                      <Text className="text-xs text-gray-500 truncate">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </Text>
                    </div>
                  </Flex>
                  <Badge size="xs" color={user.account_type === 'premium' ? 'amber' : 'gray'}>
                    {user.account_type || 'free'}
                  </Badge>
                </ListItem>
              ))
            ) : (
              <Text className="text-gray-500 text-center py-4">No recent users</Text>
            )}
          </List>
        </Card>
      </Grid>

      {/* Recent Jobs & Top Companies */}
      <Grid numItems={1} numItemsLg={2} className="gap-4">
        {/* Recent Jobs */}
        <Card>
          <Flex>
            <Title>Recent Jobs</Title>
            <Link href="/admin/jobs">
              <Button variant="light" size="xs" icon={ArrowRight} iconPosition="right">
                View All
              </Button>
            </Link>
          </Flex>
          <List className="mt-4">
            {data.recent.jobs.length > 0 ? (
              data.recent.jobs.map((job) => (
                <ListItem key={job.id}>
                  <Flex justifyContent="start" className="space-x-2 truncate">
                    <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="truncate">
                      <Text className="truncate font-medium">{job.title}</Text>
                      <Text className="text-xs text-gray-500 truncate">
                        {job.company_name} • {formatDistanceToNow(new Date(job.Time), { addSuffix: true })}
                      </Text>
                    </div>
                  </Flex>
                  <Badge 
                    size="xs" 
                    color={
                      job.approval_status === 'approved' ? 'emerald' : 
                      job.approval_status === 'pending' ? 'amber' : 
                      'red'
                    }
                  >
                    {job.approval_status}
                  </Badge>
                </ListItem>
              ))
            ) : (
              <Text className="text-gray-500 text-center py-4">No recent jobs</Text>
            )}
          </List>
        </Card>

        {/* Top Companies */}
        <Card>
          <Flex>
            <Title>Top Companies</Title>
            <Link href="/admin/users/companies">
              <Button variant="light" size="xs" icon={ArrowRight} iconPosition="right">
                View All
              </Button>
            </Link>
          </Flex>
          <List className="mt-4">
            {data.top.companies.length > 0 ? (
              data.top.companies.map((company, index) => (
                <ListItem key={company.id}>
                  <Flex justifyContent="start" className="space-x-2 truncate">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Text className="text-xs font-medium text-purple-600 dark:text-purple-400">
                          #{index + 1}
                        </Text>
                      </div>
                    </div>
                    <div className="truncate">
                      <Text className="truncate font-medium">{company.company_name}</Text>
                      <Text className="text-xs text-gray-500 truncate">
                        {company.industry || 'No industry'}
                      </Text>
                    </div>
                  </Flex>
                  <Badge size="xs" color="emerald" icon={CheckCircle}>
                    Verified
                  </Badge>
                </ListItem>
              ))
            ) : (
              <Text className="text-gray-500 text-center py-4">No companies yet</Text>
            )}
          </List>
        </Card>
      </Grid>
    </main>
  );
}
