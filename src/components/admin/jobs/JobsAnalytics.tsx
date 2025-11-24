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
  CategoryBar,
} from "@tremor/react";

interface JobAnalyticsData {
  totalJobs: number;
  activeJobs: number;
  featuredJobs: number;
  pendingJobs: number;
  statusDistribution: { name: string; value: number }[];
  categoryDistribution: { name: string; value: number }[];
  typeDistribution: { name: string; value: number }[];
  locationDistribution: { name: string; value: number }[];
  growthHistory: { date: string; "New Jobs": number }[];
}

export function JobsAnalytics({ data }: { data: JobAnalyticsData }) {
  const valueFormatter = (number: number) => 
    Intl.NumberFormat("us").format(number).toString();

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Text>Total Jobs</Text>
          <Metric>{data.totalJobs}</Metric>
          <ProgressBar value={(data.activeJobs / data.totalJobs) * 100} className="mt-3" />
          <Text className="mt-2 text-xs text-gray-500">
            {Math.round((data.activeJobs / data.totalJobs) * 100)}% Active
          </Text>
        </Card>
        <Card decoration="top" decorationColor="amber">
          <Text>Pending Approval</Text>
          <Metric>{data.pendingJobs}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
             Requires Review
          </Text>
        </Card>
        <Card decoration="top" decorationColor="purple">
          <Text>Featured Jobs</Text>
          <Metric>{data.featuredJobs}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Premium Listings
          </Text>
        </Card>
        <Card decoration="top" decorationColor="teal">
          <Text>Job Types</Text>
          <div className="mt-4">
            <CategoryBar
              values={data.typeDistribution.map((item) => Math.round((item.value / data.totalJobs) * 100))}
              colors={["emerald", "cyan", "amber", "rose", "indigo"]}
              className="mt-3"
              showLabels={false}
            />
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {data.typeDistribution.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-xs text-gray-500">
                  <span 
                    className={`w-2 h-2 rounded-full ${
                      ["bg-emerald-500", "bg-cyan-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500"][index % 5]
                    }`} 
                  />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Grid>

      {/* Main Charts Row 1 */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Job Postings Over Time</Title>
          <Text>New job listings by month</Text>
          <AreaChart
            className="h-72 mt-4"
            data={data.growthHistory}
            index="date"
            categories={["New Jobs"]}
            colors={["blue"]}
            valueFormatter={valueFormatter}
            showLegend={false}
          />
        </Card>
        
        <Card>
          <Title>Top Job Categories</Title>
          <Text>Distribution by industry sector</Text>
          <BarChart
            className="h-72 mt-4"
            data={data.categoryDistribution}
            index="name"
            categories={["value"]}
            colors={["violet"]}
            valueFormatter={valueFormatter}
            layout="horizontal"
          />
        </Card>
      </Grid>

      {/* Main Charts Row 2 */}
      <Grid numItems={1} numItemsLg={3} className="gap-6">
        <Card>
          <Title>Job Status</Title>
          <DonutChart
            className="h-52 mt-4"
            data={data.statusDistribution}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["emerald", "amber", "rose"]}
          />
        </Card>
        
        <Card>
          <Title>Employment Types</Title>
          <DonutChart
             className="h-52 mt-4"
             data={data.typeDistribution}
             category="value"
             index="name"
             valueFormatter={valueFormatter}
             colors={["cyan", "blue", "indigo", "violet"]}
          />
        </Card>

        <Card>
          <Title>Top Locations</Title>
          <div className="mt-4 h-52 overflow-y-auto">
            <List>
              {data.locationDistribution.map((item) => (
                <ListItem key={item.name}>
                  <span>{item.name}</span>
                  <span className="text-tremor-content-strong font-medium">{item.value}</span>
                </ListItem>
              ))}
            </List>
          </div>
        </Card>
      </Grid>
    </div>
  );
}

