"use client";

import {
  Card,
  Title,
  Text,
  Grid,
  Metric,
  AreaChart,
  DonutChart,
  ProgressBar,
  Badge,
} from "@tremor/react";
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Activity,
  ThumbsUp,
  ThumbsDown,
  Clock,
  MessageCircle
} from "lucide-react";

export function AIChatAnalytics({ data }: { data: any }) {
  const { overview, messages, feedback, growth } = data;

  const valueFormatter = (number: number) =>
    Intl.NumberFormat("us").format(number).toString();

  const messageDistribution = [
    { name: "User Messages", value: messages.userMessages },
    { name: "AI Responses", value: messages.assistantMessages },
  ];

  const feedbackDistribution = [
    { name: "Likes", value: feedback.likes },
    { name: "Dislikes", value: feedback.dislikes },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Total Conversations</Text>
            <MessageSquare className="w-5 h-5 text-blue-500" />
          </div>
          <Metric>{overview.totalConversations.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            {overview.conversationsLast30Days} in last 30 days
          </Text>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <div className="flex items-center justify-between">
            <Text>Total Messages</Text>
            <MessageCircle className="w-5 h-5 text-purple-500" />
          </div>
          <Metric>{overview.totalMessages.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            {overview.messagesLast30Days} in last 30 days
          </Text>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Unique Users</Text>
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <Metric>{overview.uniqueUsers.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            {overview.activeConversations} active conversations
          </Text>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <div className="flex items-center justify-between">
            <Text>Satisfaction Rate</Text>
            <ThumbsUp className="w-5 h-5 text-amber-500" />
          </div>
          <Metric>{feedback.satisfactionRate}%</Metric>
          <ProgressBar 
            value={parseFloat(feedback.satisfactionRate)} 
            color="amber"
            className="mt-3"
          />
        </Card>
      </Grid>

      {/* Growth Chart */}
      <Card>
        <Title>AI Chat Activity Over Time</Title>
        <Text className="mb-4">Conversations and messages trend</Text>
        <AreaChart
          className="h-72"
          data={growth}
          index="month"
          categories={["conversations", "messages"]}
          colors={["blue", "purple"]}
          valueFormatter={valueFormatter}
        />
      </Card>

      {/* Message Distribution and Feedback */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Message Distribution</Title>
          <Text className="mb-4">User messages vs AI responses</Text>
          <DonutChart
            className="h-72"
            data={messageDistribution}
            category="value"
            index="name"
            valueFormatter={valueFormatter}
            colors={["blue", "purple"]}
          />
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <Text className="text-sm">User Messages</Text>
              <Badge color="blue">{messages.userMessages}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <Text className="text-sm">AI Responses</Text>
              <Badge color="purple">{messages.assistantMessages}</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <Title>User Feedback</Title>
          <Text className="mb-4">Likes vs Dislikes on AI responses</Text>
          {feedback.total > 0 ? (
            <>
              <DonutChart
                className="h-72"
                data={feedbackDistribution}
                category="value"
                index="name"
                valueFormatter={valueFormatter}
                colors={["emerald", "red"]}
              />
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-emerald-500" />
                    <Text className="text-sm">Likes</Text>
                  </div>
                  <Badge color="emerald">{feedback.likes}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                    <Text className="text-sm">Dislikes</Text>
                  </div>
                  <Badge color="red">{feedback.dislikes}</Badge>
                </div>
              </div>
            </>
          ) : (
            <div className="h-72 flex items-center justify-center">
              <Text className="text-gray-500">No feedback data available</Text>
            </div>
          )}
        </Card>
      </Grid>

      {/* Engagement Metrics */}
      <Card>
        <Title>Engagement Metrics</Title>
        <Text className="mb-4">Key performance indicators</Text>
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <Text className="text-xs text-gray-500">Avg Messages/Conv</Text>
            </div>
            <Metric className="text-2xl">{overview.avgMessagesPerConversation}</Metric>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <Text className="text-xs text-gray-500">Avg Message Length</Text>
            </div>
            <Metric className="text-2xl">{overview.avgMessageLength}</Metric>
            <Text className="text-xs text-gray-500 mt-1">characters</Text>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <Text className="text-xs text-gray-500">Avg Duration</Text>
            </div>
            <Metric className="text-2xl">{overview.avgConversationDuration}</Metric>
            <Text className="text-xs text-gray-500 mt-1">minutes</Text>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <Text className="text-xs text-gray-500">Feedback Rate</Text>
            </div>
            <Metric className="text-2xl">{feedback.feedbackRate}%</Metric>
            <Text className="text-xs text-gray-500 mt-1">of AI responses</Text>
          </div>
        </Grid>
      </Card>

      {/* Activity Summary */}
      <Card>
        <Title>Recent Activity</Title>
        <Text className="mb-4">Last 30 days performance</Text>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <Text className="font-medium">Conversations (30 days)</Text>
              <Badge color="blue" size="lg">{overview.conversationsLast30Days}</Badge>
            </div>
            <ProgressBar 
              value={(overview.conversationsLast30Days / overview.totalConversations) * 100}
              color="blue"
              className="h-3"
            />
            <Text className="text-xs text-gray-500 mt-1">
              {((overview.conversationsLast30Days / overview.totalConversations) * 100).toFixed(1)}% of total
            </Text>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <Text className="font-medium">Messages (30 days)</Text>
              <Badge color="purple" size="lg">{overview.messagesLast30Days}</Badge>
            </div>
            <ProgressBar 
              value={(overview.messagesLast30Days / overview.totalMessages) * 100}
              color="purple"
              className="h-3"
            />
            <Text className="text-xs text-gray-500 mt-1">
              {((overview.messagesLast30Days / overview.totalMessages) * 100).toFixed(1)}% of total
            </Text>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <Text className="font-medium">Active Conversations (7 days)</Text>
              <Badge color="emerald" size="lg">{overview.activeConversations}</Badge>
            </div>
            <ProgressBar 
              value={(overview.activeConversations / overview.totalConversations) * 100}
              color="emerald"
              className="h-3"
            />
            <Text className="text-xs text-gray-500 mt-1">
              {((overview.activeConversations / overview.totalConversations) * 100).toFixed(1)}% of total
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

