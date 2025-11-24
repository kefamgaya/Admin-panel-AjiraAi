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
  Metric,
} from "@tremor/react";
import { Search, MoreHorizontal, CheckCircle, XCircle, FileText, User, Mail, Phone, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { format } from "date-fns";

interface Application {
  id: number;
  applicant_name: string | null;
  applicant_email: string | null;
  applicant_phone: string | null;
  status: string | null;
  ai_rating: number | null;
  resume_url: string | null;
  applied_at: string | null;
  latest_jobs: {
    job_name: string | null;
    company: string | null;
  } | null;
  cover_letter: string | null;
}

export default function ApplicationsTable({ 
  data, 
  searchParams,
  totalCount,
  currentPage,
  itemsPerPage
}: { 
  data: Application[],
  searchParams: { q?: string; page?: string },
  totalCount: number,
  currentPage: number,
  itemsPerPage: number
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
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
        const date = new Date(dateString);
        if(isNaN(date.getTime())) return "N/A";
        return format(date, "PP");
    } catch {
        return "N/A";
    }
  };

  const handleViewDetails = (app: Application) => {
    setSelectedApp(app);
    setIsDialogOpen(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Title>Applications</Title>
            <Text>Review incoming job applications ({totalCount} total)</Text>
          </div>
          <div className="w-full sm:w-64">
            <TextInput
              icon={Search}
              placeholder="Search applicants..."
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
              <TableHeaderCell>Job Title</TableHeaderCell>
              <TableHeaderCell>AI Rating</TableHeaderCell>
              <TableHeaderCell>Applied Date</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Resume</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <Text className="font-medium">{app.applicant_name || "N/A"}</Text>
                    <Text className="text-xs text-gray-500">{app.applicant_email}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <Text className="font-medium truncate max-w-[150px]" title={app.latest_jobs?.job_name || ""}>
                      {app.latest_jobs?.job_name || "N/A"}
                    </Text>
                    <Text className="text-xs text-gray-500">{app.latest_jobs?.company}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  {app.ai_rating ? (
                    <Badge size="xs" color={Number(app.ai_rating) >= 7 ? "emerald" : Number(app.ai_rating) >= 5 ? "amber" : "red"}>
                      {Number(app.ai_rating).toFixed(1)}/10
                    </Badge>
                  ) : (
                    <Text>N/A</Text>
                  )}
                </TableCell>
                <TableCell>
                  <Text>{formatDate(app.applied_at)}</Text>
                </TableCell>
                <TableCell>
                  <Badge size="xs" color={app.status === 'shortlisted' ? 'emerald' : app.status === 'rejected' ? 'red' : 'gray'}>
                    {app.status || 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {app.resume_url ? (
                    <a 
                      href={app.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                      <FileText className="w-4 h-4" /> View
                    </a>
                  ) : (
                    <Text className="text-gray-400">None</Text>
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                      size="xs" 
                      variant="secondary" 
                      icon={MoreHorizontal}
                      onClick={() => handleViewDetails(app)}
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
            <Text>No applications found matching your criteria.</Text>
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
        <DialogPanel className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {selectedApp && (
                <div className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <Title className="text-2xl font-bold">Application Details</Title>
                            <Text className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                                for {selectedApp.latest_jobs?.job_name} at {selectedApp.latest_jobs?.company}
                            </Text>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Badge color={selectedApp.status === 'shortlisted' ? 'emerald' : selectedApp.status === 'rejected' ? 'red' : 'gray'}>
                                    {selectedApp.status || 'Pending Review'}
                                </Badge>
                                {selectedApp.ai_rating && (
                                    <Badge color="indigo">AI Score: {selectedApp.ai_rating}/10</Badge>
                                )}
                            </div>
                        </div>
                        <Button variant="light" color="slate" icon={X} onClick={() => setIsDialogOpen(false)} className="shrink-0" />
                    </div>

                    <Grid numItems={1} numItemsMd={2} className="gap-6">
                         {/* Applicant Info */}
                        <Card>
                            <Title className="mb-4">Applicant Information</Title>
                            <List>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span>Name</span>
                                    </div>
                                    <span>{selectedApp.applicant_name || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span>Email</span>
                                    </div>
                                    <span>{selectedApp.applicant_email || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span>Phone</span>
                                    </div>
                                    <span>{selectedApp.applicant_phone || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span>Applied Date</span>
                                    </div>
                                    <span>{formatDate(selectedApp.applied_at)}</span>
                                </ListItem>
                            </List>
                        </Card>

                         {/* Documents */}
                        <Card>
                            <Title className="mb-4">Documents & Content</Title>
                            <div className="space-y-4">
                                <div>
                                    <Text className="font-medium mb-2">Resume</Text>
                                    {selectedApp.resume_url ? (
                                        <a 
                                            href={selectedApp.resume_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 transition-colors"
                                        >
                                            <FileText className="w-4 h-4" /> View Resume
                                        </a>
                                    ) : (
                                        <Text className="text-gray-500">No resume attached.</Text>
                                    )}
                                </div>
                                <div>
                                    <Text className="font-medium mb-2">Cover Letter</Text>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-md text-sm text-gray-600 dark:text-gray-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                                        {selectedApp.cover_letter || "No cover letter provided."}
                                    </div>
                                </div>
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
