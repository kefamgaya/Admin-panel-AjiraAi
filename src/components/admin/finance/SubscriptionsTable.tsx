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
  Button,
  TextInput,
  Dialog,
  DialogPanel,
  Grid,
  List,
  ListItem,
} from "@tremor/react";
import { Search, MoreHorizontal, Building, Calendar, DollarSign, CreditCard, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { format } from "date-fns";

interface Subscription {
  id: number;
  company_uid: string;
  plan: string;
  status: string;
  start_date: string;
  end_date: string | null;
  amount: string;
  payment_method: string | null;
  created_at: string;
  companies?: {
    company_name: string | null;
    email: string | null;
  } | null;
}

export default function SubscriptionsTable({ 
  data, 
  searchParams,
  totalCount,
  currentPage,
  itemsPerPage
}: { 
  data: Subscription[],
  searchParams: { q?: string; page?: string },
  totalCount: number,
  currentPage: number,
  itemsPerPage: number
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(window.location.search);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
    setIsSearching(false);
  }, 300);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
        return format(new Date(dateString), "MMM d, yyyy");
    } catch {
        return "N/A";
    }
  };

  const handleViewDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDialogOpen(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Title>Subscription History</Title>
            <Text>Track all subscription transactions and renewals ({totalCount} total)</Text>
          </div>
          <div className="w-full sm:w-64">
            <TextInput
              icon={Search}
              placeholder="Search subscriptions..."
              onChange={(e) => {
                setIsSearching(true);
                handleSearch(e.target.value);
              }}
              defaultValue={searchParams.q}
            />
          </div>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Company</TableHeaderCell>
              <TableHeaderCell>Plan</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Period</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <Text className="font-medium">{item.companies?.company_name || "Unknown"}</Text>
                    <Text className="text-xs text-gray-500">{item.companies?.email || item.company_uid}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    size="xs" 
                    color={
                      item.plan?.toLowerCase() === 'premium' ? 'purple' : 
                      item.plan?.toLowerCase() === 'pro' ? 'blue' :
                      item.plan?.toLowerCase() === 'basic' ? 'cyan' : 'slate'
                    }
                  >
                    {item.plan || "Free"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Text className="font-semibold text-green-600">${parseFloat(item.amount).toLocaleString()}</Text>
                </TableCell>
                <TableCell>
                  <Badge 
                    size="xs" 
                    color={
                      item.status === 'active' ? 'emerald' : 
                      item.status === 'cancelled' ? 'rose' :
                      item.status === 'expired' ? 'amber' : 'slate'
                    }
                    icon={
                      item.status === 'active' ? CheckCircle : 
                      item.status === 'cancelled' ? XCircle : Clock
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs">
                    <Text>{formatDate(item.start_date)}</Text>
                    <Text className="text-gray-500">to {formatDate(item.end_date)}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                      size="xs" 
                      variant="secondary" 
                      icon={MoreHorizontal}
                      onClick={() => handleViewDetails(item)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {data.length === 0 && (
          <div className="p-6 text-center">
            <Text>No subscriptions found matching your criteria.</Text>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
            <div className="flex items-center gap-2">
                <Text className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
                </Text>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    size="xs"
                    variant="secondary"
                    icon={ChevronLeft}
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Previous
                </Button>
                <Button
                    size="xs"
                    variant="secondary"
                    icon={ChevronRight}
                    iconPosition="right"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} static={true}>
        <DialogPanel className="max-w-2xl w-full">
            {selectedSubscription && (
                <div className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <Title className="text-xl font-bold">Subscription Details</Title>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                color={
                                  selectedSubscription.status === 'active' ? 'emerald' : 
                                  selectedSubscription.status === 'cancelled' ? 'rose' :
                                  selectedSubscription.status === 'expired' ? 'amber' : 'slate'
                                }
                                icon={
                                  selectedSubscription.status === 'active' ? CheckCircle : 
                                  selectedSubscription.status === 'cancelled' ? XCircle : Clock
                                }
                              >
                                {selectedSubscription.status}
                              </Badge>
                              <Badge 
                                color={
                                  selectedSubscription.plan?.toLowerCase() === 'premium' ? 'purple' : 
                                  selectedSubscription.plan?.toLowerCase() === 'pro' ? 'blue' :
                                  selectedSubscription.plan?.toLowerCase() === 'basic' ? 'cyan' : 'slate'
                                }
                              >
                                {selectedSubscription.plan || "Free"}
                              </Badge>
                            </div>
                        </div>
                        <Button variant="light" color="slate" icon={X} onClick={() => setIsDialogOpen(false)} className="shrink-0" />
                    </div>

                    <Grid numItems={1} className="gap-6">
                        <Card>
                            <Title className="mb-4 flex items-center gap-2">
                              <Building className="w-4 h-4" /> Company Information
                            </Title>
                            <List>
                                <ListItem>
                                    <span>Company Name</span>
                                    <span className="font-medium">{selectedSubscription.companies?.company_name || "Unknown"}</span>
                                </ListItem>
                                <ListItem>
                                    <span>Email</span>
                                    <span className="text-xs">{selectedSubscription.companies?.email || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <span>Company UID</span>
                                    <span className="font-mono text-xs">{selectedSubscription.company_uid}</span>
                                </ListItem>
                            </List>
                        </Card>

                        <Card>
                            <Title className="mb-4 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" /> Payment Details
                            </Title>
                            <List>
                                <ListItem>
                                    <span>Amount</span>
                                    <span className="font-bold text-lg text-green-600">${parseFloat(selectedSubscription.amount).toLocaleString()}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-gray-500" />
                                        <span>Payment Method</span>
                                    </div>
                                    <span>{selectedSubscription.payment_method || "N/A"}</span>
                                </ListItem>
                            </List>
                        </Card>

                        <Card>
                            <Title className="mb-4 flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Subscription Period
                            </Title>
                            <List>
                                <ListItem>
                                    <span>Start Date</span>
                                    <span>{formatDate(selectedSubscription.start_date)}</span>
                                </ListItem>
                                <ListItem>
                                    <span>End Date</span>
                                    <span>{formatDate(selectedSubscription.end_date)}</span>
                                </ListItem>
                                <ListItem>
                                    <span>Created</span>
                                    <span>{formatDate(selectedSubscription.created_at)}</span>
                                </ListItem>
                            </List>
                        </Card>
                    </Grid>
                </div>
            )}
        </DialogPanel>
      </Dialog>
    </>
  );
}
