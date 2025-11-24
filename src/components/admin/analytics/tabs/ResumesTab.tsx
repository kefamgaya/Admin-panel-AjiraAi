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
import { FileText, TrendingUp, Award, Sparkles } from "lucide-react";

export function ResumesTab({ data }: { data: any }) {
  const { resumes, overview } = data;

  const valueFormatter = (number: number) =>
    Intl.NumberFormat("us").format(number).toString();

  return (
    <div className="space-y-6 mt-6">
      {/* Resume KPIs */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="indigo">
          <div className="flex items-center justify-between">
            <Text>Total Generated</Text>
            <FileText className="w-5 h-5 text-indigo-500" />
          </div>
          <Metric>{resumes.total.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            All-time resume generations
          </Text>
        </Card>

        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Last 30 Days</Text>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <Metric>{resumes.last30Days.toLocaleString()}</Metric>
          <ProgressBar 
            value={(resumes.last30Days / resumes.total) * 100} 
            color="blue"
            className="mt-3"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {((resumes.last30Days / resumes.total) * 100).toFixed(1)}% of total
          </Text>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <div className="flex items-center justify-between">
            <Text>Avg per User</Text>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <Metric>{(resumes.total / overview.totalUsers).toFixed(2)}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Resumes per registered user
          </Text>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Adoption Rate</Text>
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </div>
          <Metric>
            {((resumes.total / overview.totalUsers) * 100).toFixed(1)}%
          </Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Users who generated resumes
          </Text>
        </Card>
      </Grid>

      {/* Resume Generation Overview */}
      <Card>
        <Title>Resume Generation Activity</Title>
        <Text className="mb-4">AI-powered resume creation statistics</Text>
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <Text className="text-xs text-gray-500 mb-1">Total Generated</Text>
            <Metric className="text-2xl">{resumes.total}</Metric>
          </div>

          <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Text className="text-xs text-blue-600 dark:text-blue-400 mb-1">Last 30 Days</Text>
            <Metric className="text-2xl text-blue-600">{resumes.last30Days}</Metric>
          </div>

          <div className="p-4 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Text className="text-xs text-purple-600 dark:text-purple-400 mb-1">Avg per User</Text>
            <Metric className="text-2xl text-purple-600">
              {(resumes.total / overview.totalUsers).toFixed(2)}
            </Metric>
          </div>

          <div className="p-4 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <Text className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Unique Users</Text>
            <Metric className="text-2xl text-emerald-600">
              {Math.min(resumes.total, overview.totalUsers)}
            </Metric>
          </div>
        </Grid>
      </Card>

      {/* Resume Types and Templates */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Resume Types</Title>
          <Text className="mb-4">Distribution by resume type</Text>
          {resumes.byType.length > 0 ? (
            <DonutChart
              className="h-72"
              data={resumes.byType}
              category="value"
              index="name"
              valueFormatter={valueFormatter}
              colors={["indigo", "blue", "purple", "cyan", "violet"]}
            />
          ) : (
            <div className="h-72 flex items-center justify-center">
              <Text className="text-gray-500">No resume type data available</Text>
            </div>
          )}
        </Card>

        <Card>
          <Title>Popular Templates</Title>
          <Text className="mb-4">Most used resume templates</Text>
          {resumes.byTemplate.length > 0 ? (
            <BarChart
              className="h-72"
              data={resumes.byTemplate}
              index="name"
              categories={["value"]}
              colors={["purple"]}
              valueFormatter={valueFormatter}
              layout="horizontal"
            />
          ) : (
            <div className="h-72 flex items-center justify-center">
              <Text className="text-gray-500">No template data available</Text>
            </div>
          )}
        </Card>
      </Grid>

      {/* Resume Generation Insights */}
      <Card>
        <Title>Generation Insights</Title>
        <Text className="mb-4">Key metrics and trends</Text>
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <Text className="font-medium">Total Resumes Generated</Text>
              <Badge color="indigo" size="lg">{resumes.total}</Badge>
            </div>
            <ProgressBar value={100} color="indigo" className="h-3" />
            <Text className="text-xs text-gray-500 mt-1">
              Helping users create professional resumes
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Text className="text-sm font-medium mb-2">Recent Activity</Text>
              <Metric className="text-2xl text-blue-600">{resumes.last30Days}</Metric>
              <Text className="text-xs text-gray-500 mt-1">Last 30 days</Text>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Text className="text-sm font-medium mb-2">User Engagement</Text>
              <Metric className="text-2xl text-purple-600">
                {(resumes.total / overview.totalUsers).toFixed(2)}
              </Metric>
              <Text className="text-xs text-gray-500 mt-1">Resumes per user</Text>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <Text className="text-sm font-medium mb-2">Adoption Rate</Text>
              <Metric className="text-2xl text-emerald-600">
                {((resumes.total / overview.totalUsers) * 100).toFixed(1)}%
              </Metric>
              <Text className="text-xs text-gray-500 mt-1">Of all users</Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Template Popularity */}
      {resumes.byTemplate.length > 0 && (
        <Card>
          <Title>Template Performance</Title>
          <Text className="mb-4">Ranking of resume templates by usage</Text>
          <div className="space-y-3">
            {resumes.byTemplate.slice(0, 5).map((template: any, index: number) => (
              <div key={template.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      size="xs" 
                      color={index === 0 ? "purple" : index === 1 ? "blue" : index === 2 ? "indigo" : "slate"}
                    >
                      #{index + 1}
                    </Badge>
                    <Text className="font-medium">{template.name}</Text>
                  </div>
                  <Text className="font-bold">{template.value}</Text>
                </div>
                <ProgressBar 
                  value={(template.value / resumes.total) * 100}
                  color={index === 0 ? "purple" : index === 1 ? "blue" : index === 2 ? "indigo" : "slate"}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

