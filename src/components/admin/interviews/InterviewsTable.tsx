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
import { Search, MoreHorizontal, Calendar, Clock, MapPin, Video, Link as LinkIcon, FileText, User, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { format } from "date-fns";

interface Interview {
  id: number;
  applicant_email: string;
  interview_type: string;
  interview_date: string;
  interview_time: string;
  status: string;
  meeting_link: string | null;
  location: string | null;
  notes: string | null;
  duration_minutes: number | null;
  company_uid: string;
}

export default function InterviewsTable({ 
  data, 
  searchParams,
  totalCount,
  currentPage,
  itemsPerPage
}: { 
  data: Interview[],
  searchParams: { q?: string; page?: string },
  totalCount: number,
  currentPage: number,
  itemsPerPage: number
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
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
        return format(new Date(dateString), "MMM d, yyyy");
    } catch {
        return "N/A";
    }
  };

  const handleViewDetails = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsDialogOpen(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Title>Scheduled Interviews</Title>
            <Text>Manage interview schedules and status ({totalCount} total)</Text>
          </div>
          <div className="w-full sm:w-64">
            <TextInput
              icon={Search}
              placeholder="Search interviews..."
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
              <TableHeaderCell>Applicant</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Date & Time</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <Text>{item.applicant_email}</Text>
                    </div>
                </TableCell>
                <TableCell><Badge size="xs" color="blue">{item.interview_type}</Badge></TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <Text>{formatDate(item.interview_date)}</Text>
                    <Text className="text-xs text-gray-500">{item.interview_time} ({item.duration_minutes}m)</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Text className="truncate max-w-[150px]" title={item.location || "N/A"}>
                    {item.location || "N/A"}
                  </Text>
                </TableCell>
                <TableCell>
                  <Badge 
                    size="xs" 
                    color={item.status === 'scheduled' ? 'emerald' : item.status === 'completed' ? 'gray' : 'yellow'}
                  >
                    {item.status}
                  </Badge>
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
            <Text>No interviews found matching your criteria.</Text>
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
            {selectedInterview && (
                <div className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <Title className="text-xl font-bold">Interview Details</Title>
                            <Text className="mt-1">Scheduled with {selectedInterview.applicant_email}</Text>
                        </div>
                        <Button variant="light" color="slate" icon={X} onClick={() => setIsDialogOpen(false)} className="shrink-0" />
                    </div>

                    <Grid numItems={1} className="gap-6">
                        <Card>
                            <List>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span>Date</span>
                                    </div>
                                    <span>{formatDate(selectedInterview.interview_date)}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span>Time</span>
                                    </div>
                                    <span>{selectedInterview.interview_time} ({selectedInterview.duration_minutes} mins)</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Video className="w-4 h-4 text-gray-500" />
                                        <span>Type</span>
                                    </div>
                                    <Badge color="blue">{selectedInterview.interview_type}</Badge>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>Location</span>
                                    </div>
                                    <span>{selectedInterview.location || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4 text-gray-500" />
                                        <span>Meeting Link</span>
                                    </div>
                                    {selectedInterview.meeting_link ? (
                                        <Text className="text-gray-600 dark:text-gray-400 truncate max-w-[200px]" title={selectedInterview.meeting_link}>
                                            {selectedInterview.meeting_link}
                                        </Text>
                                    ) : "N/A"}
                                </ListItem>
                            </List>
                        </Card>

                        <Card>
                            <Title className="mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Notes
                            </Title>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-md text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                {selectedInterview.notes || "No notes added."}
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
