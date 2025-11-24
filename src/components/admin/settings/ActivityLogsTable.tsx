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
} from "@tremor/react";
import { format } from "date-fns";

interface ActivityLog {
  id: number;
  admin_uid: string;
  action: string;
  resource_type: string;
  details: any;
  created_at: string;
  admin_name?: string; // joined
}

export default function ActivityLogsTable({ data }: { data: ActivityLog[] }) {
  return (
    <Card>
      <Title className="mb-4">System Activity Logs</Title>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Time</TableHeaderCell>
            <TableHeaderCell>Admin</TableHeaderCell>
            <TableHeaderCell>Action</TableHeaderCell>
            <TableHeaderCell>Resource</TableHeaderCell>
            <TableHeaderCell>Details</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Text>{format(new Date(log.created_at), "MMM d, HH:mm:ss")}</Text>
              </TableCell>
              <TableCell>
                <Text className="font-medium">{log.admin_name || log.admin_uid}</Text>
              </TableCell>
              <TableCell>
                <Badge color="blue" size="xs">{log.action}</Badge>
              </TableCell>
              <TableCell>
                <Text>{log.resource_type}</Text>
              </TableCell>
              <TableCell>
                <Text className="truncate max-w-xs text-xs font-mono" title={JSON.stringify(log.details)}>
                  {JSON.stringify(log.details)}
                </Text>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Text className="text-center py-4">No activity recorded</Text>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

