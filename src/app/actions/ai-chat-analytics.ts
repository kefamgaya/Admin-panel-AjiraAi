"use server";

import { createClient } from "@/utils/supabase/server";
import { subMonths, format, startOfMonth } from "date-fns";

// Helper function to fetch all data with pagination
async function fetchAllData(
  supabase: any,
  table: string,
  select: string
): Promise<any[]> {
  let allData: any[] = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error, count } = await supabase
      .from(table)
      .select(select, { count: "exact" })
      .range(from, from + batchSize - 1);

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      throw error;
    }

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      from += batchSize;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  return allData;
}

export async function getAIChatAnalytics() {
  const supabase = await createClient();

  try {
    // Fetch all data with unlimited pagination
    const [conversations, messages, feedback] = await Promise.all([
      fetchAllData(supabase, "ai_chat_conversations", "id, user_uid, conversation_id, title, created_at, updated_at"),
      fetchAllData(supabase, "ai_chat_messages", "id, conversation_id, user_uid, role, content, created_at"),
      fetchAllData(supabase, "ai_chat_message_feedback", "id, message_id, user_uid, feedback_type, created_at")
    ]);

    const now = new Date();
    const last30Days = subMonths(now, 1);
    const last7Days = subMonths(now, 0);
    last7Days.setDate(now.getDate() - 7);

    // Basic metrics
    const totalConversations = conversations.length;
    const totalMessages = messages.length;
    const totalFeedback = feedback.length;

    // User messages vs AI responses
    const userMessages = messages.filter(m => m.role === 'user').length;
    const assistantMessages = messages.filter(m => m.role === 'assistant').length;

    // Recent activity
    const conversationsLast30Days = conversations.filter(
      c => c.created_at && new Date(c.created_at) >= last30Days
    ).length;

    const messagesLast30Days = messages.filter(
      m => m.created_at && new Date(m.created_at) >= last30Days
    ).length;

    const conversationsLast7Days = conversations.filter(
      c => c.created_at && new Date(c.created_at) >= last7Days
    ).length;

    // Unique users
    const uniqueUsers = new Set(conversations.map(c => c.user_uid)).size;

    // Average messages per conversation
    const avgMessagesPerConversation = totalConversations > 0 
      ? (totalMessages / totalConversations).toFixed(2) 
      : "0";

    // Feedback analysis
    const likes = feedback.filter(f => f.feedback_type === 'like').length;
    const dislikes = feedback.filter(f => f.feedback_type === 'dislike').length;
    const feedbackRate = assistantMessages > 0 
      ? ((totalFeedback / assistantMessages) * 100).toFixed(1)
      : "0";
    const satisfactionRate = totalFeedback > 0 
      ? ((likes / totalFeedback) * 100).toFixed(1)
      : "0";

    // Growth history (last 6 months)
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = i === 0 ? now : startOfMonth(subMonths(now, i - 1));
      
      const monthConversations = conversations.filter(c => {
        if (!c.created_at) return false;
        const date = new Date(c.created_at);
        return date >= monthStart && date < monthEnd;
      }).length;

      const monthMessages = messages.filter(m => {
        if (!m.created_at) return false;
        const date = new Date(m.created_at);
        return date >= monthStart && date < monthEnd;
      }).length;

      monthlyGrowth.push({
        month: format(monthStart, "MMM yyyy"),
        conversations: monthConversations,
        messages: monthMessages,
      });
    }

    // Most active users (by conversation count)
    const userConversationCount = conversations.reduce((acc, conv) => {
      acc[conv.user_uid] = (acc[conv.user_uid] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topUsers = Object.entries(userConversationCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([uid, count]) => ({ uid, conversations: count }));

    // Message length analysis
    const messageLengths = messages
      .filter(m => m.role === 'user' && m.content)
      .map(m => m.content.length);
    
    const avgMessageLength = messageLengths.length > 0
      ? Math.round(messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length)
      : 0;

    // Conversation duration (time between first and last message)
    const conversationDurations = conversations.map(conv => {
      const convMessages = messages
        .filter(m => m.conversation_id === conv.conversation_id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      if (convMessages.length < 2) return 0;
      
      const first = new Date(convMessages[0].created_at);
      const last = new Date(convMessages[convMessages.length - 1].created_at);
      return (last.getTime() - first.getTime()) / 1000 / 60; // in minutes
    }).filter(d => d > 0);

    const avgConversationDuration = conversationDurations.length > 0
      ? Math.round(conversationDurations.reduce((a, b) => a + b, 0) / conversationDurations.length)
      : 0;

    // Active conversations (with messages in last 7 days)
    const activeConversations = new Set(
      messages
        .filter(m => m.created_at && new Date(m.created_at) >= last7Days)
        .map(m => m.conversation_id)
    ).size;

    return {
      overview: {
        totalConversations,
        totalMessages,
        uniqueUsers,
        activeConversations,
        conversationsLast30Days,
        messagesLast30Days,
        conversationsLast7Days,
        avgMessagesPerConversation,
        avgMessageLength,
        avgConversationDuration,
      },
      messages: {
        total: totalMessages,
        userMessages,
        assistantMessages,
        avgPerConversation: avgMessagesPerConversation,
      },
      feedback: {
        total: totalFeedback,
        likes,
        dislikes,
        feedbackRate,
        satisfactionRate,
      },
      growth: monthlyGrowth,
      topUsers,
    };
  } catch (error) {
    console.error("Error fetching AI chat analytics:", error);
    throw error;
  }
}

