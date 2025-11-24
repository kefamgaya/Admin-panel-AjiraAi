"use client";

import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
  Title,
} from "@tremor/react";
import { format } from "date-fns";

interface Conversation {
  id: number;
  user_uid: string;
  conversation_id: string;
  title: string | null;
  created_at: string;
  message_count?: number;
}

export default function AiChatTable({ data }: { data: Conversation[] }) {
  return (
    <Card>
      <Title>AI Chat Conversations</Title>
      <Text className="mb-6">Monitor AI assistant interactions</Text>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>User UID</TableHeaderCell>
            <TableHeaderCell>Conversation ID</TableHeaderCell>
            <TableHeaderCell>Title</TableHeaderCell>
            <TableHeaderCell>Messages</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Text>{format(new Date(item.created_at), "MMM d, yyyy HH:mm")}</Text>
              </TableCell>
              <TableCell><Text className="font-mono text-xs">{item.user_uid}</Text></TableCell>
              <TableCell><Text className="font-mono text-xs">{item.conversation_id}</Text></TableCell>
              <TableCell><Text className="truncate max-w-xs">{item.title || "Untitled"}</Text></TableCell>
              <TableCell><Text>{item.message_count || 0}</Text></TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Text className="text-center py-4">No conversations found</Text>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

