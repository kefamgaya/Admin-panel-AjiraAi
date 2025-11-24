"use client";

import {
  Card,
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Select,
  SelectItem,
  Grid,
  Col,
  Metric,
  AreaChart,
  DonutChart,
  Legend,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@tremor/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, BarChart2, Bell } from "lucide-react";
import NotificationsTable from "./NotificationsTable";

interface NotificationHistoryItem {
  id: number;
  title: string;
  message: string;
  recipient_type: string;
  sent_at: string;
  delivery_count: number;
  read_count: number;
}

export default function NotificationsDashboard({ history }: { history: NotificationHistoryItem[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipient_type: "all_users"
  });

  // Calculate Metrics
  const totalSent = history.reduce((acc, curr) => acc + (curr.delivery_count || 0), 0);
  const totalRead = history.reduce((acc, curr) => acc + (curr.read_count || 0), 0);
  const readRate = totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) : "0";
  const totalCampaigns = history.length;

  // Chart Data: Sent over time (aggregated by date)
  const chartData = history.reduce((acc: any[], curr) => {
    const date = new Date(curr.sent_at).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.Sent += curr.delivery_count || 0;
      existing.Read += curr.read_count || 0;
    } else {
      acc.push({
        date,
        Sent: curr.delivery_count || 0,
        Read: curr.read_count || 0
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleSend = async () => {
    if (!formData.title || !formData.message) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to send");

      alert(`Notification Sent! Success: ${data.sent}, Failed: ${data.failed}`);
      setFormData({ title: "", message: "", recipient_type: "all_users" });
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Title>Notification Center</Title>
          <Text>Manage push notifications and analyze performance</Text>
        </div>
      </div>

      <TabGroup>
        <TabList className="mt-4">
          <Tab icon={Send}>Send Notification</Tab>
          <Tab icon={BarChart2}>Analytics & History</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Col numColSpan={1} numColSpanLg={2}>
                <Card>
                  <Title className="mb-4">Compose Message</Title>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Title</label>
                      <TextInput 
                        placeholder="e.g. New Feature Alert!" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Message</label>
                      <Textarea 
                        placeholder="Write your message here..." 
                        rows={5}
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-1 block">Recipient Audience</label>
                      <Select 
                        value={formData.recipient_type} 
                        onValueChange={val => setFormData({...formData, recipient_type: val})}
                      >
                        <SelectItem value="all_users">All Users</SelectItem>
                        <SelectItem value="seekers">Job Seekers Only</SelectItem>
                        <SelectItem value="companies">Companies Only</SelectItem>
                      </Select>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button 
                        loading={loading} 
                        onClick={handleSend}
                        icon={Send}
                        disabled={!formData.title || !formData.message}
                      >
                        Send Notification
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Card className="bg-blue-50 dark:bg-blue-900/10">
                <Title className="text-blue-700 dark:text-blue-400">Tips</Title>
                <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-blue-800 dark:text-blue-300">
                  <li>Keep titles short and punchy (under 40 chars).</li>
                  <li>Use emojis to increase engagement 🚀.</li>
                  <li>Target specific audiences to reduce noise.</li>
                  <li>Best times to send are Tuesday/Wednesday mornings.</li>
                </ul>
              </Card>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div className="mt-6 space-y-6">
              {/* Analytics Cards */}
              <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
                <Card decoration="top" decorationColor="blue">
                  <Text>Total Campaigns</Text>
                  <Metric>{totalCampaigns}</Metric>
                </Card>
                <Card decoration="top" decorationColor="emerald">
                  <Text>Total Delivered</Text>
                  <Metric>{totalSent.toLocaleString()}</Metric>
                </Card>
                <Card decoration="top" decorationColor="indigo">
                  <Text>Total Read</Text>
                  <Metric>{totalRead.toLocaleString()}</Metric>
                </Card>
                <Card decoration="top" decorationColor="amber">
                  <Text>Read Rate</Text>
                  <Metric>{readRate}%</Metric>
                </Card>
              </Grid>

              {/* Performance Chart */}
              <Card>
                <Title>Delivery Performance (Last 30 Days)</Title>
                <AreaChart
                  className="h-72 mt-4"
                  data={chartData}
                  index="date"
                  categories={["Sent", "Read"]}
                  colors={["emerald", "blue"]}
                  yAxisWidth={40}
                />
              </Card>

              {/* History Table */}
              <NotificationsTable data={history} />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

