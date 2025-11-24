"use client";

import {
  Card,
  Title,
  Text,
  Grid,
  Metric,
  ProgressBar,
  Badge,
} from "@tremor/react";
import { Calendar, FileText, Briefcase, TrendingUp, Users, CheckCircle } from "lucide-react";

export function EngagementTab({ data }: { data: any }) {
  const { engagement, overview } = data;

  return (
    <div className="space-y-6 mt-6">
      {/* Engagement KPIs */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Total Interviews</Text>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <Metric>{engagement.totalInterviews.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            All scheduled interviews
          </Text>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Scheduled</Text>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <Metric>{engagement.scheduledInterviews.toLocaleString()}</Metric>
          <ProgressBar 
            value={(engagement.scheduledInterviews / engagement.totalInterviews) * 100} 
            color="emerald"
            className="mt-3"
          />
        </Card>

        <Card decoration="top" decorationColor="purple">
          <div className="flex items-center justify-between">
            <Text>Application Rate</Text>
            <FileText className="w-5 h-5 text-purple-500" />
          </div>
          <Metric>{engagement.applicationRate}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Applications per job
          </Text>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <div className="flex items-center justify-between">
            <Text>Interview Rate</Text>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <Metric>{engagement.interviewRate}%</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Of all applications
          </Text>
        </Card>
      </Grid>

      {/* Engagement Funnel */}
      <Card>
        <Title>Engagement Funnel</Title>
        <Text className="mb-4">User journey from job posting to interview</Text>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <Text className="font-medium">Jobs Posted</Text>
              </div>
              <Badge color="blue" size="lg">{overview.totalJobs}</Badge>
            </div>
            <ProgressBar value={100} color="blue" className="h-3" />
            <Text className="text-xs text-gray-500 mt-1">Starting point</Text>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <Text className="font-medium">Applications Received</Text>
              </div>
              <Badge color="purple" size="lg">{overview.totalApplications}</Badge>
            </div>
            <ProgressBar 
              value={(overview.totalApplications / overview.totalJobs) * 10} 
              color="purple" 
              className="h-3" 
            />
            <Text className="text-xs text-gray-500 mt-1">
              {engagement.applicationRate} applications per job
            </Text>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <Text className="font-medium">Shortlisted Candidates</Text>
              </div>
              <Badge color="emerald" size="lg">{overview.shortlistedApplications}</Badge>
            </div>
            <ProgressBar 
              value={(overview.shortlistedApplications / overview.totalApplications) * 100} 
              color="emerald" 
              className="h-3" 
            />
            <Text className="text-xs text-gray-500 mt-1">
              {((overview.shortlistedApplications / overview.totalApplications) * 100).toFixed(1)}% of applications
            </Text>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <Text className="font-medium">Interviews Scheduled</Text>
              </div>
              <Badge color="amber" size="lg">{engagement.totalInterviews}</Badge>
            </div>
            <ProgressBar 
              value={(engagement.totalInterviews / overview.totalApplications) * 100} 
              color="amber" 
              className="h-3" 
            />
            <Text className="text-xs text-gray-500 mt-1">
              {engagement.interviewRate}% of applications
            </Text>
          </div>
        </div>
      </Card>

      {/* Engagement Metrics */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Interview Statistics</Title>
          <Text className="mb-4">Breakdown of interview activities</Text>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <Text className="font-medium">Total Interviews</Text>
              <Metric className="text-xl">{engagement.totalInterviews}</Metric>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <Text className="font-medium">Scheduled</Text>
              <Metric className="text-xl text-emerald-600">{engagement.scheduledInterviews}</Metric>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Text className="font-medium">Completed</Text>
              <Metric className="text-xl text-blue-600">{engagement.completedInterviews}</Metric>
            </div>
          </div>
        </Card>

        <Card>
          <Title>Conversion Rates</Title>
          <Text className="mb-4">Key engagement conversion metrics</Text>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <Text className="font-medium">Job → Application</Text>
                <Badge color="purple">{engagement.applicationRate} avg</Badge>
              </div>
              <ProgressBar value={parseFloat(engagement.applicationRate) * 10} color="purple" className="h-2" />
              <Text className="text-xs text-gray-500 mt-1">
                Applications per job posting
              </Text>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Text className="font-medium">Application → Interview</Text>
                <Badge color="amber">{engagement.interviewRate}%</Badge>
              </div>
              <ProgressBar value={parseFloat(engagement.interviewRate)} color="amber" className="h-2" />
              <Text className="text-xs text-gray-500 mt-1">
                Percentage of applications leading to interviews
              </Text>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Text className="font-medium">Application → Shortlist</Text>
                <Badge color="emerald">
                  {((overview.shortlistedApplications / overview.totalApplications) * 100).toFixed(1)}%
                </Badge>
              </div>
              <ProgressBar 
                value={(overview.shortlistedApplications / overview.totalApplications) * 100} 
                color="emerald" 
                className="h-2" 
              />
              <Text className="text-xs text-gray-500 mt-1">
                Success rate for candidates
              </Text>
            </div>
          </div>
        </Card>
      </Grid>

      {/* Platform Activity Summary */}
      <Card>
        <Title>Platform Activity Summary</Title>
        <Text className="mb-4">Overall engagement across the platform</Text>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 text-center border border-gray-200 dark:border-gray-800 rounded-lg">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <Metric className="text-xl">{overview.totalUsers}</Metric>
            <Text className="text-xs text-gray-500 mt-1">Total Users</Text>
          </div>
          <div className="p-4 text-center border border-gray-200 dark:border-gray-800 rounded-lg">
            <Briefcase className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <Metric className="text-xl">{overview.totalJobs}</Metric>
            <Text className="text-xs text-gray-500 mt-1">Jobs Posted</Text>
          </div>
          <div className="p-4 text-center border border-gray-200 dark:border-gray-800 rounded-lg">
            <FileText className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <Metric className="text-xl">{overview.totalApplications}</Metric>
            <Text className="text-xs text-gray-500 mt-1">Applications</Text>
          </div>
          <div className="p-4 text-center border border-gray-200 dark:border-gray-800 rounded-lg">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
            <Metric className="text-xl">{engagement.totalInterviews}</Metric>
            <Text className="text-xs text-gray-500 mt-1">Interviews</Text>
          </div>
          <div className="p-4 text-center border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <FileText className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
            <Metric className="text-xl text-indigo-600">{engagement.totalResumesGenerated}</Metric>
            <Text className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Resumes Generated</Text>
          </div>
        </div>
      </Card>

      {/* Resume Generation Stats */}
      <Card>
        <Title>Resume/CV Generation</Title>
        <Text className="mb-4">AI-powered resume creation activity</Text>
        <Grid numItems={1} numItemsSm={2} className="gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text className="font-medium">Total Generated</Text>
                <Badge color="indigo" size="lg">{engagement.totalResumesGenerated}</Badge>
              </div>
              <ProgressBar value={100} color="indigo" className="h-3" />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text className="font-medium">Last 30 Days</Text>
                <Badge color="blue" size="lg">{engagement.resumesLast30Days}</Badge>
              </div>
              <ProgressBar 
                value={(engagement.resumesLast30Days / engagement.totalResumesGenerated) * 100} 
                color="blue" 
                className="h-3" 
              />
              <Text className="text-xs text-gray-500 mt-1">
                {((engagement.resumesLast30Days / engagement.totalResumesGenerated) * 100).toFixed(1)}% of total
              </Text>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <Text className="text-sm font-medium mb-3">Resume Metrics</Text>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text className="text-xs text-gray-500">Total Generated</Text>
                <Text className="font-semibold">{engagement.totalResumesGenerated}</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-xs text-gray-500">Recent (30 days)</Text>
                <Text className="font-semibold">{engagement.resumesLast30Days}</Text>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                <Text className="text-xs text-gray-500">Avg per User</Text>
                <Text className="font-semibold">
                  {(engagement.totalResumesGenerated / overview.totalUsers).toFixed(2)}
                </Text>
              </div>
            </div>
          </div>
        </Grid>
      </Card>
    </div>
  );
}

