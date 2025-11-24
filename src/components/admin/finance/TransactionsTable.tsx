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
  Badge,
  TextInput,
} from "@tremor/react";
import { Search } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface Transaction {
  id: number;
  user_uid: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export default function TransactionsTable({ data }: { data: Transaction[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.filter((item) => {
    const term = searchQuery.toLowerCase();
    return (
      item.transaction_type.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.user_name && item.user_name.toLowerCase().includes(term)) ||
      (item.user_email && item.user_email.toLowerCase().includes(term)) ||
      (item.reference_id && item.reference_id.toLowerCase().includes(term))
    );
  });

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "purchase": return "emerald";
      case "refund": return "red";
      case "referral_reward": return "blue";
      case "bonus": return "purple";
      case "usage": return "orange";
      default: return "gray";
    }
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title>Transactions</Title>
          <Text>View all system credit transactions and payments</Text>
        </div>
        <div className="w-full sm:w-72">
          <TextInput
            icon={Search}
            placeholder="Search by user, type, or reference..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>User</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell>Reference</TableHeaderCell>
            <TableHeaderCell className="text-right">Amount</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Text>{format(new Date(item.created_at), "MMM d, yyyy HH:mm")}</Text>
              </TableCell>
              <TableCell>
                <div>
                  <Text className="font-medium">{item.user_name || "Unknown User"}</Text>
                  <Text className="text-xs text-gray-500">{item.user_email || item.user_uid}</Text>
                </div>
              </TableCell>
              <TableCell>
                <Badge color={getTypeColor(item.transaction_type)} size="xs">
                  {item.transaction_type}
                </Badge>
              </TableCell>
              <TableCell>
                <Text className="truncate max-w-xs" title={item.description || ""}>
                  {item.description || "-"}
                </Text>
              </TableCell>
              <TableCell>
                <Text className="font-mono text-xs">{item.reference_id || "-"}</Text>
              </TableCell>
              <TableCell className="text-right">
                <Text color={item.amount >= 0 ? "emerald" : "red"} className="font-medium">
                  {item.amount > 0 ? "+" : ""}{item.amount}
                </Text>
              </TableCell>
            </TableRow>
          ))}
          {filteredData.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Text className="text-center py-4">No transactions found</Text>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

