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
import { FileText, CheckCircle, XCircle, Clock, Star } from "lucide-react";

export function ApplicationsTab({ data }: { data: any }) {
  const { applications } = data;

  const valueFormatter = (number: number) =>
    Intl.NumberFormat("us").format(number).toString();

  return (
    <div className="space-y-6 mt-6">
      {/* Application KPIs */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Total Applications</Text>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <Metric>{applications.total.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            All submitted applications
          </Text>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Shortlisted</Text>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <Metric>{applications.shortlisted.toLocaleString()}</Metric>
          <ProgressBar 
            value={(applications.shortlisted / applications.total) * 100} 
            color="emerald"
            className="mt-3"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {((applications.shortlisted / applications.total) * 100).toFixed(1)}% success rate
          </Text>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <div className="flex items-center justify-between">
            <Text>Pending Review</Text>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <Metric>{applications.pending.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Awaiting decision
          </Text>
        </Card>

        <Card decoration="top" decorationColor="indigo">
          <div className="flex items-center justify-between">
            <Text>Avg AI Rating</Text>
            <Star className="w-5 h-5 text-indigo-500" />
          </div>
          <Metric>{applications.avgAIRating} / 10</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Quality score
          </Text>
        </Card>
      </Grid>

      {/* Application Status Distribution */}
      <Card>
        <Title>Application Status Overview</Title>
        <Text className="mb-4">Current state of all applications</Text>
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <Text className="text-xs text-gray-500 mb-1">Total</Text>
            <Metric className="text-2xl">{applications.total}</Metric>
          </div>

          <div className="p-4 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Text className="text-xs text-emerald-600 dark:text-emerald-400">Shortlisted</Text>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <Metric className="text-2xl text-emerald-600">{applications.shortlisted}</Metric>
            <ProgressBar value={(applications.shortlisted / applications.total) * 100} color="emerald" className="mt-2" />
          </div>

          <div className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Text className="text-xs text-amber-600 dark:text-amber-400">Pending</Text>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <Metric className="text-2xl text-amber-600">{applications.pending}</Metric>
            <ProgressBar value={(applications.pending / applications.total) * 100} color="amber" className="mt-2" />
          </div>

          <div className="p-4 border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <Text className="text-xs text-rose-600 dark:text-rose-400">Rejected</Text>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <Metric className="text-2xl text-rose-600">{applications.rejected}</Metric>
            <ProgressBar value={(applications.rejected / applications.total) * 100} color="rose" className="mt-2" />
          </div>
        </Grid>
      </Card>

      {/* Application Metrics */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Application Status Distribution</Title>
          <Text className="mb-4">Visual breakdown of application states</Text>
          <DonutChart
            className="h-72"
            data={[
              { name: "Shortlisted", value: applications.shortlisted },
              { name: "Pending", value: applications.pending },
              { name: "Rejected", value: applications.rejected },
            ]}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["emerald", "amber", "rose"]}
          />
        </Card>

        <Card>
          <Title>Application Quality Metrics</Title>
          <Text className="mb-4">AI-powered candidate assessment</Text>
          <div className="space-y-6 mt-6">
            <div>
              <div className="flex justify-between mb-2">
                <Text className="font-medium">Average AI Rating</Text>
                <Badge color="indigo" size="lg">{applications.avgAIRating} / 10</Badge>
              </div>
              <ProgressBar 
                value={parseFloat(applications.avgAIRating) * 10} 
                color="indigo"
                className="h-3"
              />
              <Text className="text-xs text-gray-500 mt-1">
                Overall candidate quality score
              </Text>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <Text className="text-xs text-gray-500">Success Rate</Text>
                <Metric className="text-2xl text-emerald-600 mt-1">
                  {((applications.shortlisted / applications.total) * 100).toFixed(1)}%
                </Metric>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                <Text className="text-xs text-gray-500">Rejection Rate</Text>
                <Metric className="text-2xl text-rose-600 mt-1">
                  {((applications.rejected / applications.total) * 100).toFixed(1)}%
                </Metric>
              </div>
            </div>
          </div>
        </Card>
      </Grid>

      {/* Application Performance */}
      <Card>
        <Title>Application Performance Summary</Title>
        <Text className="mb-4">Key performance indicators</Text>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Text className="text-sm font-medium mb-2">Total Applications</Text>
            <Metric className="text-3xl text-blue-600">{applications.total}</Metric>
            <Text className="text-xs text-gray-500 mt-2">All time submissions</Text>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <Text className="text-sm font-medium mb-2">Qualified Candidates</Text>
            <Metric className="text-3xl text-emerald-600">{applications.shortlisted}</Metric>
            <Text className="text-xs text-gray-500 mt-2">Moved to next stage</Text>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <Text className="text-sm font-medium mb-2">Quality Score</Text>
            <Metric className="text-3xl text-indigo-600">{applications.avgAIRating}</Metric>
            <Text className="text-xs text-gray-500 mt-2">Average AI rating</Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

