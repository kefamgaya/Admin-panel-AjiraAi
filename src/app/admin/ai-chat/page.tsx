import { createClient } from "@/utils/supabase/server";
import { Title, Text } from "@tremor/react";
import { AIChatAnalytics } from "@/components/admin/ai-chat/AIChatAnalytics";
import { AIChatTable } from "@/components/admin/ai-chat/AIChatTable";
import { getAIChatAnalytics } from "@/app/actions/ai-chat-analytics";

export default async function AIChatPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const supabase = await createClient();
  const currentPage = Number(searchParams.page) || 1;
  const searchQuery = searchParams.search || "";
  const itemsPerPage = 20;

  try {
    // Fetch analytics
    const analyticsData = await getAIChatAnalytics();

    // Build query for conversations
    let query = supabase
      .from("ai_chat_conversations")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false });

    // Apply search filter
    if (searchQuery) {
      query = query.or(
        `user_uid.ilike.%${searchQuery}%,conversation_id.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`
      );
    }

    // Get total count
    const { count: totalCount } = await query;
    const totalPages = Math.ceil((totalCount || 0) / itemsPerPage);

    // Fetch paginated conversations
    const { data: conversations, error } = await query
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    if (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }

    // Enrich conversations with message counts and user info
    const enrichedConversations = await Promise.all(
      (conversations || []).map(async (conv) => {
        // Get message count
        const { count: messageCount } = await supabase
          .from("ai_chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.conversation_id);

        // Get last message
        const { data: lastMessage } = await supabase
          .from("ai_chat_messages")
          .select("content")
          .eq("conversation_id", conv.conversation_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get feedback count
        const { count: feedbackCount } = await supabase
          .from("ai_chat_message_feedback")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.conversation_id);

        // Get user info
        const { data: user } = await supabase
          .from("all_users")
          .select("name, email")
          .eq("uid", conv.user_uid)
          .single();

        return {
          ...conv,
          message_count: messageCount || 0,
          last_message: lastMessage?.content || null,
          feedback_count: feedbackCount || 0,
          user_name: user?.name || null,
          user_email: user?.email || null,
        };
      })
    );

    return (
      <div className="p-6 space-y-6">
        <div>
          <Title>AI Chat Analytics</Title>
          <Text className="mt-2">
            Monitor AI assistant conversations, user engagement, and feedback
          </Text>
        </div>

        <AIChatAnalytics data={analyticsData} />

        <div className="mt-8">
          <Title>Conversations</Title>
          <Text className="mt-2 mb-4">
            All AI chat conversations with users
          </Text>
          <AIChatTable
            conversations={enrichedConversations}
            currentPage={currentPage}
            totalPages={totalPages}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading AI chat page:", error);
    return (
      <div className="p-6">
        <Title>Error</Title>
        <Text className="mt-2 text-red-500">
          Failed to load AI chat data. Please try again later.
        </Text>
      </div>
    );
  }
}
