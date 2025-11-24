"use client";

import { useState, useTransition } from "react";
import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
  Badge,
  Button,
  TextInput,
  Dialog,
  DialogPanel,
  Title,
} from "@tremor/react";
import { Search, Eye, MessageSquare, User, Calendar, ThumbsUp, ThumbsDown } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { format } from "date-fns";

interface Conversation {
  id: number;
  user_uid: string;
  conversation_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
  user_name?: string;
  user_email?: string;
  last_message?: string;
  feedback_count?: number;
}

export function AIChatTable({
  conversations,
  currentPage,
  totalPages,
  searchQuery,
}: {
  conversations: Conversation[];
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}) {
  const [search, setSearch] = useState(searchQuery);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    startTransition(() => {
      window.location.href = `?${params.toString()}`;
    });
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedSearch(value);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    startTransition(() => {
      window.location.href = `?${params.toString()}`;
    });
  };

  const viewDetails = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <Card>
        {/* Search */}
        <div className="mb-4">
          <TextInput
            icon={Search}
            placeholder="Search by user, conversation ID, or title..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Messages</TableHeaderCell>
              <TableHeaderCell>Feedback</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell>Last Updated</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conversations.map((conversation) => (
              <TableRow key={conversation.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <Text className="font-medium">{conversation.user_name || "Unknown"}</Text>
                    <Text className="text-xs text-gray-500">{conversation.user_email || conversation.user_uid}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col max-w-xs">
                    <Text className="font-medium truncate">
                      {conversation.title || "Untitled Conversation"}
                    </Text>
                    <Text className="text-xs text-gray-500 truncate">
                      ID: {conversation.conversation_id}
                    </Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge color="blue" size="sm">
                    {conversation.message_count}
                  </Badge>
                </TableCell>
                <TableCell>
                  {conversation.feedback_count && conversation.feedback_count > 0 ? (
                    <Badge color="emerald" size="sm">
                      {conversation.feedback_count}
                    </Badge>
                  ) : (
                    <Text className="text-gray-400">-</Text>
                  )}
                </TableCell>
                <TableCell>
                  <Text className="text-sm">
                    {format(new Date(conversation.created_at), "MMM dd, yyyy")}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {format(new Date(conversation.created_at), "HH:mm")}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text className="text-sm">
                    {format(new Date(conversation.updated_at), "MMM dd, yyyy")}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {format(new Date(conversation.updated_at), "HH:mm")}
                  </Text>
                </TableCell>
                <TableCell>
                  <Button
                    size="xs"
                    variant="secondary"
                    icon={Eye}
                    onClick={() => viewDetails(conversation)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Text className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </Text>
            <div className="flex gap-2">
              <Button
                size="xs"
                variant="secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
              >
                Previous
              </Button>
              <Button
                size="xs"
                variant="secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
        <DialogPanel className="max-w-4xl">
          {selectedConversation && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <Title>{selectedConversation.title || "Untitled Conversation"}</Title>
                  <Text className="text-sm text-gray-500 mt-1">
                    Conversation ID: {selectedConversation.conversation_id}
                  </Text>
                </div>
                <Badge color="blue" size="lg">
                  {selectedConversation.message_count} messages
                </Badge>
              </div>

              {/* User Info */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <Text className="font-semibold">User Information</Text>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text className="text-xs text-gray-500">Name</Text>
                    <Text className="font-medium">{selectedConversation.user_name || "Unknown"}</Text>
                  </div>
                  <div>
                    <Text className="text-xs text-gray-500">Email</Text>
                    <Text className="font-medium">{selectedConversation.user_email || "N/A"}</Text>
                  </div>
                  <div>
                    <Text className="text-xs text-gray-500">User UID</Text>
                    <Text className="font-mono text-xs">{selectedConversation.user_uid}</Text>
                  </div>
                  <div>
                    <Text className="text-xs text-gray-500">Feedback Count</Text>
                    <Text className="font-medium">{selectedConversation.feedback_count || 0}</Text>
                  </div>
                </div>
              </Card>

              {/* Conversation Stats */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <Text className="font-semibold">Conversation Stats</Text>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text className="text-xs text-gray-500">Created</Text>
                    <Text className="font-medium">
                      {format(new Date(selectedConversation.created_at), "PPpp")}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-xs text-gray-500">Last Updated</Text>
                    <Text className="font-medium">
                      {format(new Date(selectedConversation.updated_at), "PPpp")}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-xs text-gray-500">Total Messages</Text>
                    <Badge color="blue">{selectedConversation.message_count}</Badge>
                  </div>
                  <div>
                    <Text className="text-xs text-gray-500">User Feedback</Text>
                    <Badge color={selectedConversation.feedback_count && selectedConversation.feedback_count > 0 ? "emerald" : "gray"}>
                      {selectedConversation.feedback_count || 0}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Last Message Preview */}
              {selectedConversation.last_message && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <Text className="font-semibold">Last Message</Text>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <Text className="text-sm whitespace-pre-wrap">
                      {selectedConversation.last_message.length > 500
                        ? `${selectedConversation.last_message.substring(0, 500)}...`
                        : selectedConversation.last_message}
                    </Text>
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="secondary"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogPanel>
      </Dialog>
    </>
  );
}

