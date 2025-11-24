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
  List,
  ListItem,
} from "@tremor/react";
import { 
  Bell, 
  Send, 
  Eye, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  UserPlus,
  UserMinus
} from "lucide-react";

export function NotificationsAnalytics({ data }: { data: any }) {
  const { overview, engagement, subscribers, recipientTypes, growth, subscriberGrowth, topSenders } = data;

  const valueFormatter = (number: number) =>
    Intl.NumberFormat("us").format(number).toString();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center justify-between">
            <Text>Total Sent</Text>
            <Bell className="w-5 h-5 text-blue-500" />
          </div>
          <Metric>{overview.totalNotifications.toLocaleString()}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            {overview.notificationsLast30Days} in last 30 days
          </Text>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <div className="flex items-center justify-between">
            <Text>Delivered</Text>
            <Send className="w-5 h-5 text-emerald-500" />
          </div>
          <Metric>{overview.totalDelivered.toLocaleString()}</Metric>
          <ProgressBar 
            value={parseFloat(engagement.deliveryRate)} 
            color="emerald"
            className="mt-3"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {engagement.deliveryRate}% delivery rate
          </Text>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <div className="flex items-center justify-between">
            <Text>Read</Text>
            <Eye className="w-5 h-5 text-purple-500" />
          </div>
          <Metric>{overview.totalRead.toLocaleString()}</Metric>
          <ProgressBar 
            value={parseFloat(engagement.readRate)} 
            color="purple"
            className="mt-3"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {engagement.readRate}% read rate
          </Text>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <div className="flex items-center justify-between">
            <Text>Avg Recipients</Text>
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <Metric>{overview.avgRecipientsPerNotification}</Metric>
          <Text className="text-xs text-gray-500 mt-2">
            Per notification
          </Text>
        </Card>
      </Grid>

      {/* Subscriber Metrics */}
      <Card>
        <Title>Subscriber Metrics</Title>
        <Text className="mb-4">FCM token subscribers and growth</Text>
        <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-cyan-500" />
              <Text className="font-medium">Total Subscribers</Text>
            </div>
            <Metric className="text-3xl text-cyan-600">
              {subscribers?.totalSubscribers?.toLocaleString() || 0}
            </Metric>
            <Text className="text-xs text-gray-500 mt-2">
              Users with FCM tokens
            </Text>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-5 h-5 text-emerald-500" />
              <Text className="font-medium">New Subscribers</Text>
            </div>
            <Metric className="text-3xl text-emerald-600">
              {subscribers?.newSubscribersLast30Days?.toLocaleString() || 0}
            </Metric>
            <div className="flex items-center gap-1 mt-2">
              {parseFloat(subscribers?.subscriberGrowthRate || "0") >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <Text className={`text-xs ${parseFloat(subscribers?.subscriberGrowthRate || "0") >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {subscribers?.subscriberGrowthRate || "0.0"}% growth (30 days)
              </Text>
            </div>
          </div>

          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <UserMinus className="w-5 h-5 text-rose-500" />
              <Text className="font-medium">Unsubscribe Rate</Text>
            </div>
            <Metric className="text-3xl text-rose-600">
              {subscribers?.unsubscribeRate || "0.0"}%
            </Metric>
            <ProgressBar 
              value={parseFloat(subscribers?.unsubscribeRate || "0")} 
              color="rose"
              className="mt-3"
            />
            <Text className="text-xs text-gray-500 mt-1">
              {subscribers?.unsubscribedUsers || 0} of {subscribers?.totalUsers || 0} users
            </Text>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <Text className="font-medium">Subscription Rate</Text>
            </div>
            <Metric className="text-3xl text-blue-600">
              {subscribers?.totalUsers > 0 
                ? ((subscribers?.totalSubscribers / subscribers?.totalUsers) * 100).toFixed(1)
                : "0.0"}%
            </Metric>
            <ProgressBar 
              value={subscribers?.totalUsers > 0 
                ? (subscribers?.totalSubscribers / subscribers?.totalUsers) * 100
                : 0} 
              color="blue"
              className="mt-3"
            />
            <Text className="text-xs text-gray-500 mt-1">
              Active subscribers
            </Text>
          </div>
        </Grid>
      </Card>

      {/* Subscriber Growth Chart */}
      {subscriberGrowth && subscriberGrowth.length > 0 && (
        <Card>
          <Title>Subscriber Growth</Title>
          <Text className="mb-4">New subscribers over time</Text>
          <AreaChart
            className="h-72"
            data={subscriberGrowth}
            index="month"
            categories={["subscribers"]}
            colors={["cyan"]}
            valueFormatter={valueFormatter}
          />
        </Card>
      )}

      {/* Growth Chart */}
      <Card>
        <Title>Notification Activity Over Time</Title>
        <Text className="mb-4">Sent, delivered, and read notifications trend</Text>
        {growth.length > 0 && growth.some((g: any) => g.sent > 0) ? (
          <AreaChart
            className="h-72"
            data={growth}
            index="month"
            categories={["sent", "delivered", "read"]}
            colors={["blue", "emerald", "purple"]}
            valueFormatter={valueFormatter}
          />
        ) : (
          <div className="h-72 flex items-center justify-center">
            <Text className="text-gray-500">No notification data available</Text>
          </div>
        )}
      </Card>

      {/* Recipient Types and Engagement */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Recipient Types</Title>
          <Text className="mb-4">Distribution by recipient category</Text>
          {recipientTypes.length > 0 ? (
            <>
              <DonutChart
                className="h-72"
                data={recipientTypes}
                category="value"
                index="name"
                valueFormatter={valueFormatter}
                colors={["blue", "emerald", "purple", "amber", "cyan"]}
              />
              <div className="mt-4 space-y-2">
                {recipientTypes.slice(0, 5).map((type: any) => (
                  <div key={type.name} className="flex justify-between items-center">
                    <Text className="text-sm capitalize">{type.name}</Text>
                    <Badge color="blue">{type.value}</Badge>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-72 flex items-center justify-center">
              <Text className="text-gray-500">No recipient data available</Text>
            </div>
          )}
        </Card>

        <Card>
          <Title>Engagement Metrics</Title>
          <Text className="mb-4">Delivery and read performance</Text>
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <Text className="font-medium">Delivery Rate</Text>
              </div>
              <Metric className="text-3xl text-emerald-600">{engagement.deliveryRate}%</Metric>
              <ProgressBar 
                value={parseFloat(engagement.deliveryRate)} 
                color="emerald"
                className="mt-3 h-3"
              />
              <Text className="text-xs text-gray-500 mt-2">
                {engagement.totalDelivered} of {overview.totalNotifications} sent
              </Text>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-purple-500" />
                <Text className="font-medium">Read Rate</Text>
              </div>
              <Metric className="text-3xl text-purple-600">{engagement.readRate}%</Metric>
              <ProgressBar 
                value={parseFloat(engagement.readRate)} 
                color="purple"
                className="mt-3 h-3"
              />
              <Text className="text-xs text-gray-500 mt-2">
                {engagement.totalRead} of {engagement.totalDelivered} delivered
              </Text>
            </div>
          </div>
        </Card>
      </Grid>

      {/* Top Senders */}
      {topSenders.length > 0 && (
        <Card>
          <Title>Top Notification Senders</Title>
          <Text className="mb-4">Most active admins sending notifications</Text>
          <List>
            {topSenders.slice(0, 5).map((sender: any, index: number) => (
              <ListItem key={sender.sender}>
                <div className="flex items-center gap-3">
                  <Badge 
                    size="xs" 
                    color={index === 0 ? "amber" : index === 1 ? "slate" : index === 2 ? "orange" : "blue"}
                  >
                    #{index + 1}
                  </Badge>
                  {index < 3 && (
                    <Award 
                      className={`w-4 h-4 ${
                        index === 0 ? "text-amber-500" : 
                        index === 1 ? "text-slate-400" : 
                        "text-orange-600"
                      }`}
                    />
                  )}
                  <div className="flex-1">
                    <Text className="font-medium">{sender.sender}</Text>
                    <Text className="text-xs text-gray-500">
                      {sender.count} sent • {sender.delivered} delivered • {sender.read} read
                    </Text>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color="blue" size="sm">{sender.count}</Badge>
                </div>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {/* Recent Activity Summary */}
      <Card>
        <Title>Recent Activity</Title>
        <Text className="mb-4">Last 30 days performance</Text>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <Text className="font-medium">Notifications Sent (30 days)</Text>
              <Badge color="blue" size="lg">{overview.notificationsLast30Days}</Badge>
            </div>
            <ProgressBar 
              value={overview.totalNotifications > 0 ? (overview.notificationsLast30Days / overview.totalNotifications) * 100 : 0}
              color="blue"
              className="h-3"
            />
            <Text className="text-xs text-gray-500 mt-1">
              {overview.totalNotifications > 0 
                ? ((overview.notificationsLast30Days / overview.totalNotifications) * 100).toFixed(1)
                : "0"}% of total
            </Text>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <Text className="font-medium">Delivered (30 days)</Text>
              <Badge color="emerald" size="lg">{overview.deliveredLast30Days}</Badge>
            </div>
            <ProgressBar 
              value={overview.totalDelivered > 0 ? (overview.deliveredLast30Days / overview.totalDelivered) * 100 : 0}
              color="emerald"
              className="h-3"
            />
            <Text className="text-xs text-gray-500 mt-1">
              {overview.totalDelivered > 0 
                ? ((overview.deliveredLast30Days / overview.totalDelivered) * 100).toFixed(1)
                : "0"}% of total delivered
            </Text>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <Text className="font-medium">Active (7 days)</Text>
              <Badge color="purple" size="lg">{overview.notificationsLast7Days}</Badge>
            </div>
            <ProgressBar 
              value={overview.totalNotifications > 0 ? (overview.notificationsLast7Days / overview.totalNotifications) * 100 : 0}
              color="purple"
              className="h-3"
            />
            <Text className="text-xs text-gray-500 mt-1">
              {overview.totalNotifications > 0 
                ? ((overview.notificationsLast7Days / overview.totalNotifications) * 100).toFixed(1)
                : "0"}% of total
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

