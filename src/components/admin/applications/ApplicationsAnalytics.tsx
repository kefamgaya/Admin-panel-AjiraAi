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
} from "@tremor/react";

interface ApplicationAnalyticsData {
  totalApplications: number;
  shortlisted: number;
  rejected: number;
  pending: number;
  avgRating: string;
  statusDistribution: { name: string; value: number }[];
  ratingDistribution: { name: string; value: number }[];
  growthHistory: { date: string; "New Applications": number }[];
}

export function ApplicationsAnalytics({ data }: { data: ApplicationAnalyticsData }) {
  const valueFormatter = (number: number) => 
    Intl.NumberFormat("us").format(number).toString();

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Text>Total Applications</Text>
          <Metric>{data.totalApplications}</Metric>
          <ProgressBar value={(data.shortlisted / data.totalApplications) * 100} className="mt-3" />
          <Text className="mt-2 text-xs text-gray-500">
            {Math.round((data.shortlisted / data.totalApplications) * 100)}% Shortlisted
          </Text>
        </Card>
        <Card decoration="top" decorationColor="emerald">
          <Text>Shortlisted</Text>
          <Metric>{data.shortlisted}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
             Qualified Candidates
          </Text>
        </Card>
        <Card decoration="top" decorationColor="indigo">
          <Text>Avg AI Rating</Text>
          <Metric>{data.avgRating} / 10</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Candidate Quality Score
          </Text>
        </Card>
        <Card decoration="top" decorationColor="amber">
          <Text>Pending Review</Text>
          <Metric>{data.pending}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Awaiting Action
          </Text>
        </Card>
      </Grid>

      {/* Main Charts Row 1 */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Application Volume Over Time</Title>
          <Text>New applications received by month</Text>
          <AreaChart
            className="h-72 mt-4"
            data={data.growthHistory}
            index="date"
            categories={["New Applications"]}
            colors={["blue"]}
            valueFormatter={valueFormatter}
            showLegend={false}
          />
        </Card>
        
        <Card>
          <Title>Application Status</Title>
          <Text>Current pipeline distribution</Text>
          <DonutChart
            className="h-72 mt-4"
            data={data.statusDistribution}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["emerald", "rose", "amber", "slate"]}
          />
        </Card>
      </Grid>

      {/* Main Charts Row 2 */}
      <Grid numItems={1} className="gap-6">
        <Card>
          <Title>AI Rating Distribution</Title>
          <Text>Candidate quality breakdown based on AI analysis</Text>
          <BarChart
            className="h-64 mt-4"
            data={data.ratingDistribution}
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

