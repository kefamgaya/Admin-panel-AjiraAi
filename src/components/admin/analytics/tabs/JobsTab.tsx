"use client";

import {
  Card,
  Title,
  Text,
  Grid,
  Metric,
  DonutChart,
  BarChart,
  ProgressBar,
  Badge,
} from "@tremor/react";
import { Briefcase, CheckCircle, Clock, XCircle, Star } from "lucide-react";

export function JobsTab({ data }: { data: any }) {
  const { jobs } = data;

  const valueFormatter = (number: number) =>
    Intl.NumberFormat("us").format(number).toString();

  return (
    <div className="space-y-6 mt-6">
      {/* Job KPIs */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Total Jobs</Text>
            <Briefcase className="w-5 h-5 text-blue-500" />
          </div>
          <Metric>{jobs.total.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            All job postings
          </Text>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Active Jobs</Text>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <Metric>{jobs.active.toLocaleString()}</Metric>
          <ProgressBar 
            value={(jobs.active / jobs.total) * 100} 
            color="emerald"
            className="mt-3"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {((jobs.active / jobs.total) * 100).toFixed(1)}% of total
          </Text>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <div className="flex items-center justify-between">
            <Text>Pending Approval</Text>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <Metric>{jobs.pending.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Awaiting review
          </Text>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <div className="flex items-center justify-between">
            <Text>Featured Jobs</Text>
            <Star className="w-5 h-5 text-purple-500" />
          </div>
          <Metric>{jobs.featured.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Premium listings
          </Text>
        </Card>
      </Grid>

      {/* Job Status Overview */}
      <Card>
        <Title>Job Status Distribution</Title>
        <Text className="mb-4">Breakdown of job posting statuses</Text>
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
          <div className="p-4 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-xs text-emerald-600 dark:text-emerald-400">Active</Text>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <Metric className="text-2xl text-emerald-600">{jobs.active}</Metric>
            <ProgressBar value={(jobs.active / jobs.total) * 100} color="emerald" className="mt-2" />
          </div>

          <div className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-xs text-amber-600 dark:text-amber-400">Pending</Text>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <Metric className="text-2xl text-amber-600">{jobs.pending}</Metric>
            <ProgressBar value={(jobs.pending / jobs.total) * 100} color="amber" className="mt-2" />
          </div>

          <div className="p-4 border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-xs text-rose-600 dark:text-rose-400">Rejected</Text>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <Metric className="text-2xl text-rose-600">{jobs.rejected}</Metric>
            <ProgressBar value={(jobs.rejected / jobs.total) * 100} color="rose" className="mt-2" />
          </div>

          <div className="p-4 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-xs text-purple-600 dark:text-purple-400">Featured</Text>
              <Star className="w-4 h-4 text-purple-500" />
            </div>
            <Metric className="text-2xl text-purple-600">{jobs.featured}</Metric>
            <ProgressBar value={(jobs.featured / jobs.total) * 100} color="purple" className="mt-2" />
          </div>
        </Grid>
      </Card>

      {/* Job Categories */}
      <Card>
        <Title>Top Job Categories</Title>
        <Text className="mb-4">Most popular job sectors on the platform</Text>
        <BarChart
          className="h-80"
          data={jobs.byCategory}
          index="name"
          categories={["value"]}
          colors={["purple"]}
          valueFormatter={valueFormatter}
          layout="horizontal"
        />
      </Card>

      {/* Job Activity */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Recent Activity</Title>
          <Text className="mb-4">Job postings in the last 30 days</Text>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text className="font-medium">New Jobs Posted</Text>
                <Badge color="blue" size="lg">{jobs.newLast30Days}</Badge>
              </div>
              <ProgressBar 
                value={(jobs.newLast30Days / jobs.total) * 100} 
                color="blue"
              />
              <Text className="text-xs text-gray-500 mt-2">
                {((jobs.newLast30Days / jobs.total) * 100).toFixed(1)}% of total jobs
              </Text>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <Text className="text-xs text-gray-500">Approval Rate</Text>
                <Metric className="text-xl mt-1">
                  {((jobs.active / (jobs.active + jobs.rejected)) * 100).toFixed(1)}%
                </Metric>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <Text className="text-xs text-gray-500">Featured Rate</Text>
                <Metric className="text-xl mt-1">
                  {((jobs.featured / jobs.total) * 100).toFixed(1)}%
                </Metric>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <Title>Job Status Breakdown</Title>
          <Text className="mb-4">Visual distribution of job statuses</Text>
          <DonutChart
            className="h-64"
            data={[
              { name: "Active", value: jobs.active },
              { name: "Pending", value: jobs.pending },
              { name: "Rejected", value: jobs.rejected },
            ]}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["emerald", "amber", "rose"]}
          />
        </Card>
      </Grid>
    </div>
  );
}

