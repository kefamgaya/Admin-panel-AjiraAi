"use client";

import {
  Card,
  Title,
  Text,
  Grid,
  DonutChart,
  BarChart,
  AreaChart,
  Metric,
  ProgressBar,
  List,
  ListItem,
} from "@tremor/react";

interface InterviewAnalyticsData {
  totalInterviews: number;
  upcomingInterviews: number;
  completedInterviews: number;
  scheduledToday: number;
  statusDistribution: { name: string; value: number }[];
  typeDistribution: { name: string; value: number }[];
  growthHistory: { date: string; "Interviews Scheduled": number }[];
}

export function InterviewsAnalytics({ data }: { data: InterviewAnalyticsData }) {
  const valueFormatter = (number: number) => 
    Intl.NumberFormat("us").format(number).toString();

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Text>Total Interviews</Text>
          <Metric>{data.totalInterviews}</Metric>
          <ProgressBar value={(data.upcomingInterviews / data.totalInterviews) * 100} className="mt-3" />
          <Text className="mt-2 text-xs text-gray-500">
            {Math.round((data.upcomingInterviews / data.totalInterviews) * 100)}% Upcoming
          </Text>
        </Card>
        <Card decoration="top" decorationColor="emerald">
          <Text>Scheduled Today</Text>
          <Metric>{data.scheduledToday}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
             Happening Now
          </Text>
        </Card>
        <Card decoration="top" decorationColor="indigo">
          <Text>Upcoming</Text>
          <Metric>{data.upcomingInterviews}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Future Appointments
          </Text>
        </Card>
        <Card decoration="top" decorationColor="slate">
          <Text>Completed/Past</Text>
          <Metric>{data.completedInterviews}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Past Dates
          </Text>
        </Card>
      </Grid>

      {/* Main Charts Row 1 */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Scheduling Volume</Title>
          <Text>New interviews scheduled over time</Text>
          <AreaChart
            className="h-72 mt-4"
            data={data.growthHistory}
            index="date"
            categories={["Interviews Scheduled"]}
            colors={["blue"]}
            valueFormatter={valueFormatter}
            showLegend={false}
          />
        </Card>
        
        <Card>
          <Title>Interview Types</Title>
          <Text>Distribution by format</Text>
          <DonutChart
            className="h-72 mt-4"
            data={data.typeDistribution}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["cyan", "violet", "indigo", "rose"]}
          />
        </Card>
      </Grid>

      {/* Main Charts Row 2 */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Interview Status Distribution</Title>
          <Text>Breakdown by current status</Text>
          <DonutChart
            className="h-64 mt-4"
            data={data.statusDistribution}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["emerald", "amber", "rose", "slate", "blue"]}
          />
        </Card>

        <Card>
          <Title>Status Breakdown</Title>
          <Text>Detailed count by status</Text>
          <div className="mt-4 space-y-3">
            {data.statusDistribution.map((item, index) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Text className="font-medium">{item.name}</Text>
                  <Text className="font-bold text-tremor-content-strong">{item.value}</Text>
                </div>
                <ProgressBar 
                  value={(item.value / data.totalInterviews) * 100} 
                  color={["emerald", "amber", "rose", "slate", "blue"][index % 5] as any}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </Card>
      </Grid>
    </div>
  );
}

