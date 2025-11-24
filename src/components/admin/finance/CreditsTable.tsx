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
import { Search, MoreHorizontal, TrendingUp, TrendingDown, Calendar, User, FileText, Hash, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { format } from "date-fns";

interface CreditTransaction {
  id: number;
  user_uid: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
  all_users?: {
    name: string | null;
    email: string | null;
  } | null;
}

export default function CreditsTable({ 
  data, 
  searchParams,
  totalCount,
  currentPage,
  itemsPerPage
}: { 
  data: CreditTransaction[],
  searchParams: { q?: string; page?: string },
  totalCount: number,
  currentPage: number,
  itemsPerPage: number
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CreditTransaction | null>(null);
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

  const formatDate = (dateString: string) => {
    try {
        return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
        return "N/A";
    }
  };

  const handleViewDetails = (transaction: CreditTransaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Title>Credit Transactions</Title>
            <Text>Track all credit activities and usage ({totalCount} total)</Text>
          </div>
          <div className="w-full sm:w-64">
            <TextInput
              icon={Search}
              placeholder="Search transactions..."
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
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <Text className="font-medium">{item.all_users?.name || "Unknown"}</Text>
                    <Text className="text-xs text-gray-500">{item.all_users?.email || item.user_uid}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    size="xs" 
                    color={
                      item.transaction_type === 'bonus' ? 'emerald' : 
                      item.transaction_type === 'purchase' ? 'blue' :
                      item.transaction_type === 'usage' ? 'rose' :
                      item.transaction_type === 'refund' ? 'amber' : 'slate'
                    }
                  >
                    {item.transaction_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {item.amount > 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <Text className="font-semibold text-emerald-600">+{item.amount}</Text>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 text-rose-500" />
                        <Text className="font-semibold text-rose-600">{item.amount}</Text>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Text className="truncate max-w-[200px]" title={item.description || ""}>
                    {item.description || "N/A"}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text className="text-xs">{formatDate(item.created_at)}</Text>
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
            <Text>No transactions found matching your criteria.</Text>
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
            {selectedTransaction && (
                <div className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <Title className="text-xl font-bold">Transaction Details</Title>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                color={
                                  selectedTransaction.transaction_type === 'bonus' ? 'emerald' : 
                                  selectedTransaction.transaction_type === 'purchase' ? 'blue' :
                                  selectedTransaction.transaction_type === 'usage' ? 'rose' :
                                  selectedTransaction.transaction_type === 'refund' ? 'amber' : 'slate'
                                }
                              >
                                {selectedTransaction.transaction_type}
                              </Badge>
                              {selectedTransaction.amount > 0 ? (
                                <Badge color="emerald" icon={TrendingUp}>+{selectedTransaction.amount} Credits</Badge>
                              ) : (
                                <Badge color="rose" icon={TrendingDown}>{selectedTransaction.amount} Credits</Badge>
                              )}
                            </div>
                        </div>
                        <Button variant="light" color="slate" icon={X} onClick={() => setIsDialogOpen(false)} className="shrink-0" />
                    </div>

                    <Grid numItems={1} className="gap-6">
                        <Card>
                            <Title className="mb-4">Transaction Information</Title>
                            <List>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-gray-500" />
                                        <span>Transaction ID</span>
                                    </div>
                                    <span className="font-mono text-xs">{selectedTransaction.id}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span>User</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">{selectedTransaction.all_users?.name || "Unknown"}</div>
                                      <div className="text-xs text-gray-500">{selectedTransaction.all_users?.email || selectedTransaction.user_uid}</div>
                                    </div>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <span>Reference ID</span>
                                    </div>
                                    <span className="font-mono text-xs">{selectedTransaction.reference_id || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span>Date & Time</span>
                                    </div>
                                    <span>{formatDate(selectedTransaction.created_at)}</span>
                                </ListItem>
                            </List>
                        </Card>

                        <Card>
                            <Title className="mb-2">Description</Title>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-md text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                {selectedTransaction.description || "No description provided."}
                            </div>
                        </Card>
                    </Grid>
                </div>
            )}
        </DialogPanel>
      </Dialog>
    </>
  );
}

