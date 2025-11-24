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

interface CompanyAnalyticsData {
  totalCompanies: number;
  verifiedCompanies: number;
  blockedCompanies: number;
  activeJobPosters: number;
  industryDistribution: { name: string; value: number }[];
  sizeDistribution: { name: string; value: number }[];
  locationDistribution: { name: string; value: number }[];
  subscriptionDistribution: { name: string; value: number }[];
  growthHistory: { date: string; "New Companies": number }[];
}

export function CompanyAnalytics({ data }: { data: CompanyAnalyticsData }) {
  const valueFormatter = (number: number) => 
    Intl.NumberFormat("us").format(number).toString();

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Text>Total Companies</Text>
          <Metric>{data.totalCompanies}</Metric>
          <ProgressBar value={(data.verifiedCompanies / data.totalCompanies) * 100} className="mt-3" />
          <Text className="mt-2 text-xs text-gray-500">
            {Math.round((data.verifiedCompanies / data.totalCompanies) * 100)}% Verified
          </Text>
        </Card>
        <Card decoration="top" decorationColor="emerald">
          <Text>Active Recruiters</Text>
          <Metric>{data.activeJobPosters}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
             Posted at least one job
          </Text>
        </Card>
        <Card decoration="top" decorationColor="orange">
          <Text>Subscription Plans</Text>
          <div className="mt-4">
            <CategoryBar
              values={data.subscriptionDistribution.map((item) => Math.round((item.value / data.totalCompanies) * 100))}
              colors={["emerald", "cyan", "amber", "rose", "indigo"]}
              className="mt-3"
              showLabels={false}
            />
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {data.subscriptionDistribution.map((item, index) => (
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
        <Card decoration="top" decorationColor="red">
          <Text>Blocked Companies</Text>
          <Metric>{data.blockedCompanies}</Metric>
          <Text className="mt-2 text-xs text-gray-500">
            Restricted Access
          </Text>
        </Card>
      </Grid>

      {/* Main Charts Row 1 */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Company Growth Over Time</Title>
          <Text>New company registrations by month</Text>
          <AreaChart
            className="h-72 mt-4"
            data={data.growthHistory}
            index="date"
            categories={["New Companies"]}
            colors={["blue"]}
            valueFormatter={valueFormatter}
            showLegend={false}
          />
        </Card>
        
        <Card>
          <Title>Industry Distribution</Title>
          <Text>Top industries represented</Text>
          <BarChart
            className="h-72 mt-4"
            data={data.industryDistribution}
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
          <Title>Company Size</Title>
          <DonutChart
            className="h-52 mt-4"
            data={data.sizeDistribution}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["cyan", "blue", "indigo", "violet", "purple"]}
          />
        </Card>
        
        <Card>
          <Title>Subscriptions</Title>
          <DonutChart
             className="h-52 mt-4"
             data={data.subscriptionDistribution}
             category="value"
             index="name"
             valueFormatter={valueFormatter}
             colors={["emerald", "teal", "cyan"]}
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

