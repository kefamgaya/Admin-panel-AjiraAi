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
import { Search, Eye, Bell, Users, Calendar, Send, Eye as EyeIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { format } from "date-fns";

interface Notification {
  id: number;
  title: string;
  message: string;
  recipient_type: string;
  recipient_uids: string[];
  sent_at: string;
  sent_by: string;
  delivery_count: number;
  read_count: number;
}

export function NotificationsTable({
  notifications,
  currentPage,
  totalPages,
  searchQuery,
}: {
  notifications: Notification[];
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}) {
  const [search, setSearch] = useState(searchQuery);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
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

  const viewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailsOpen(true);
  };

  const getRecipientTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "all":
        return "blue";
      case "seekers":
        return "emerald";
      case "companies":
        return "purple";
      case "specific":
        return "amber";
      default:
        return "gray";
    }
  };

  const getDeliveryRateColor = (delivered: number, total: number) => {
    const rate = total > 0 ? (delivered / total) * 100 : 0;
    if (rate >= 90) return "emerald";
    if (rate >= 70) return "amber";
    return "red";
  };

  return (
    <>
      <Card>
        {/* Search */}
        <div className="mb-4">
          <TextInput
            icon={Search}
            placeholder="Search by title, message, or sender..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Recipient Type</TableHeaderCell>
              <TableHeaderCell>Recipients</TableHeaderCell>
              <TableHeaderCell>Delivered</TableHeaderCell>
              <TableHeaderCell>Read</TableHeaderCell>
              <TableHeaderCell>Sent By</TableHeaderCell>
              <TableHeaderCell>Sent At</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.map((notification) => {
              const recipientCount = notification.recipient_uids?.length || 0;
              const deliveryRate = recipientCount > 0 
                ? ((notification.delivery_count / recipientCount) * 100).toFixed(0)
                : "0";
              const readRate = notification.delivery_count > 0
                ? ((notification.read_count / notification.delivery_count) * 100).toFixed(0)
                : "0";

              return (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div className="flex flex-col max-w-xs">
                      <Text className="font-medium truncate">{notification.title}</Text>
                      <Text className="text-xs text-gray-500 truncate">
                        {notification.message.substring(0, 50)}
                        {notification.message.length > 50 ? "..." : ""}
                      </Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      color={getRecipientTypeBadgeColor(notification.recipient_type)}
                      size="sm"
                    >
                      {notification.recipient_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge color="blue" size="sm">
                      {recipientCount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <Badge 
                        color={getDeliveryRateColor(notification.delivery_count, recipientCount)}
                        size="sm"
                      >
                        {notification.delivery_count}
                      </Badge>
                      <Text className="text-xs text-gray-500 mt-1">{deliveryRate}%</Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <Badge color="purple" size="sm">
                        {notification.read_count}
                      </Badge>
                      <Text className="text-xs text-gray-500 mt-1">{readRate}%</Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Text className="text-sm">{notification.sent_by || "System"}</Text>
                  </TableCell>
                  <TableCell>
                    <Text className="text-sm">
                      {format(new Date(notification.sent_at), "MMM dd, yyyy")}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {format(new Date(notification.sent_at), "HH:mm")}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="xs"
                      variant="secondary"
                      icon={Eye}
                      onClick={() => viewDetails(notification)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
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
          {selectedNotification && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Title>{selectedNotification.title}</Title>
                  <Text className="text-sm text-gray-500 mt-1">
                    ID: {selectedNotification.id}
                  </Text>
                </div>
                <Badge 
                  color={getRecipientTypeBadgeColor(selectedNotification.recipient_type)}
                  size="lg"
                >
                  {selectedNotification.recipient_type}
                </Badge>
              </div>

              {/* Message Content */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <Text className="font-semibold">Message Content</Text>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Text className="font-medium mb-2">{selectedNotification.title}</Text>
                  <Text className="text-sm whitespace-pre-wrap">
                    {selectedNotification.message}
                  </Text>
                </div>
              </Card>

              {/* Delivery Stats */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Send className="w-4 h-4 text-gray-500" />
                  <Text className="font-semibold">Delivery Statistics</Text>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Text className="text-xs text-gray-500">Recipients</Text>
                    <Badge color="blue" size="lg">
                      {selectedNotification.recipient_uids?.length || 0}
                    </Badge>
                  </div>
                  <div>
                    <Text className="text-xs text-gray-500">Delivered</Text>
                    <Badge color="emerald" size="lg">
                      {selectedNotification.delivery_count}
                    </Badge>
                  </div>
                  <div>
                    <Text className="text-xs text-gray-500">Read</Text>
                    <Badge color="purple" size="lg">
                      {selectedNotification.read_count}
                    </Badge>
                  </div>
                  <div>
                    <Text className="text-xs text-gray-500">Delivery Rate</Text>
                    <Text className="font-bold text-lg">
                      {selectedNotification.recipient_uids?.length > 0
                        ? ((selectedNotification.delivery_count / selectedNotification.recipient_uids.length) * 100).toFixed(1)
                        : "0"}%
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Sender Info */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Text className="font-semibold">Sender Information</Text>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text className="text-xs text-gray-500">Sent By</Text>
                    <Text className="font-medium">{selectedNotification.sent_by || "System"}</Text>
                  </div>
                  <div>
                    <Text className="text-xs text-gray-500">Sent At</Text>
                    <Text className="font-medium">
                      {format(new Date(selectedNotification.sent_at), "PPpp")}
                    </Text>
                  </div>
                </div>
              </Card>

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
