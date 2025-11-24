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
import { Search, MoreHorizontal, User, Users, Calendar, Gift, Hash, CheckCircle, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { format } from "date-fns";

interface Referral {
  id: number;
  referrer_uid: string;
  referee_uid: string;
  referral_code: string;
  status: string;
  referrer_credits_awarded: number;
  referee_credits_awarded: number;
  created_at: string;
  completed_at: string | null;
  referrer?: {
    name: string | null;
    email: string | null;
  } | null;
  referee?: {
    name: string | null;
    email: string | null;
  } | null;
}

export default function ReferralsTable({ 
  data, 
  searchParams,
  totalCount,
  currentPage,
  itemsPerPage
}: { 
  data: Referral[],
  searchParams: { q?: string; page?: string },
  totalCount: number,
  currentPage: number,
  itemsPerPage: number
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
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

  const handleViewDetails = (referral: Referral) => {
    setSelectedReferral(referral);
    setIsDialogOpen(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Title>Referral Transactions</Title>
            <Text>Track all referral activities and rewards ({totalCount} total)</Text>
          </div>
          <div className="w-full sm:w-64">
            <TextInput
              icon={Search}
              placeholder="Search referrals..."
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
              <TableHeaderCell>Referrer</TableHeaderCell>
              <TableHeaderCell>Referee</TableHeaderCell>
              <TableHeaderCell>Code</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Credits</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <Text className="font-medium">{item.referrer?.name || "Unknown"}</Text>
                    <Text className="text-xs text-gray-500">{item.referrer?.email || item.referrer_uid}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <Text className="font-medium">{item.referee?.name || "Unknown"}</Text>
                    <Text className="text-xs text-gray-500">{item.referee?.email || item.referee_uid}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge size="xs" color="slate">{item.referral_code}</Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    size="xs" 
                    color={
                      item.status === 'rewarded' ? 'emerald' : 
                      item.status === 'pending' ? 'amber' :
                      item.status === 'expired' ? 'rose' : 'slate'
                    }
                    icon={item.status === 'rewarded' ? CheckCircle : Clock}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs">
                    <Text className="text-emerald-600 font-semibold">+{item.referrer_credits_awarded} (referrer)</Text>
                    <Text className="text-blue-600 font-semibold">+{item.referee_credits_awarded} (referee)</Text>
                  </div>
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
            <Text>No referrals found matching your criteria.</Text>
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
            {selectedReferral && (
                <div className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <Title className="text-xl font-bold">Referral Details</Title>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                color={
                                  selectedReferral.status === 'rewarded' ? 'emerald' : 
                                  selectedReferral.status === 'pending' ? 'amber' :
                                  selectedReferral.status === 'expired' ? 'rose' : 'slate'
                                }
                                icon={selectedReferral.status === 'rewarded' ? CheckCircle : Clock}
                              >
                                {selectedReferral.status}
                              </Badge>
                              <Badge color="slate">
                                Code: {selectedReferral.referral_code}
                              </Badge>
                            </div>
                        </div>
                        <Button variant="light" color="slate" icon={X} onClick={() => setIsDialogOpen(false)} className="shrink-0" />
                    </div>

                    <Grid numItems={1} numItemsMd={2} className="gap-6">
                        <Card>
                            <Title className="mb-4 flex items-center gap-2">
                              <User className="w-4 h-4" /> Referrer
                            </Title>
                            <List>
                                <ListItem>
                                    <span>Name</span>
                                    <span className="font-medium">{selectedReferral.referrer?.name || "Unknown"}</span>
                                </ListItem>
                                <ListItem>
                                    <span>Email</span>
                                    <span className="text-xs">{selectedReferral.referrer?.email || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <span>UID</span>
                                    <span className="font-mono text-xs">{selectedReferral.referrer_uid}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Gift className="w-4 h-4 text-emerald-500" />
                                        <span>Credits Earned</span>
                                    </div>
                                    <Badge color="emerald">+{selectedReferral.referrer_credits_awarded}</Badge>
                                </ListItem>
                            </List>
                        </Card>

                        <Card>
                            <Title className="mb-4 flex items-center gap-2">
                              <Users className="w-4 h-4" /> Referee
                            </Title>
                            <List>
                                <ListItem>
                                    <span>Name</span>
                                    <span className="font-medium">{selectedReferral.referee?.name || "Unknown"}</span>
                                </ListItem>
                                <ListItem>
                                    <span>Email</span>
                                    <span className="text-xs">{selectedReferral.referee?.email || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <span>UID</span>
                                    <span className="font-mono text-xs">{selectedReferral.referee_uid}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Gift className="w-4 h-4 text-blue-500" />
                                        <span>Credits Received</span>
                                    </div>
                                    <Badge color="blue">+{selectedReferral.referee_credits_awarded}</Badge>
                                </ListItem>
                            </List>
                        </Card>
                    </Grid>

                    <Card>
                        <Title className="mb-4">Timeline</Title>
                        <List>
                            <ListItem>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>Created</span>
                                </div>
                                <span>{formatDate(selectedReferral.created_at)}</span>
                            </ListItem>
                            <ListItem>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-gray-500" />
                                    <span>Completed</span>
                                </div>
                                <span>{formatDate(selectedReferral.completed_at)}</span>
                            </ListItem>
                            <ListItem>
                                <div className="flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-gray-500" />
                                    <span>Transaction ID</span>
                                </div>
                                <span className="font-mono text-xs">{selectedReferral.id}</span>
                            </ListItem>
                        </List>
                    </Card>
                </div>
            )}
        </DialogPanel>
      </Dialog>
    </>
  );
}
