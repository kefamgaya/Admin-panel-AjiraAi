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
  Switch,
  Flex,
  Textarea,
} from "@tremor/react";
import { Search, MoreHorizontal, CheckCircle, XCircle, Star, MapPin, Briefcase, Building, Calendar, DollarSign, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { format } from "date-fns";
import { approveJob, rejectJob, unrejectJob, toggleFeatureJob } from "@/app/actions/job-management";

interface Job {
  id: number;
  job_name: string | null;
  company: string | null;
  location: string | null;
  type: string | null;
  category: string | null;
  created_at: string | null;
  Time: string | null; // Legacy timestamp field
  deadline: string | null;
  salary_min: string | null;
  salary_max: string | null;
  currency: string | null;
  approved: string | null;
  pending: string | null;
  rejected: string | null;
  rejection_reason: string | null;
  is_featured: boolean;
  description: string | null;
  apply_link: string | null;
  email: string | null;
}

export default function JobsTable({ 
  data, 
  searchParams,
  totalCount,
  currentPage,
  itemsPerPage
}: { 
  data: Job[],
  searchParams: { q?: string; page?: string },
  totalCount: number,
  currentPage: number,
  itemsPerPage: number
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

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

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDialogOpen(true);
    setShowRejectInput(false);
    setRejectReason("");
  };

  const handleApprove = () => {
    if (!selectedJob) return;
    startTransition(async () => {
        await approveJob(selectedJob.id);
        setSelectedJob(prev => prev ? { ...prev, approved: "yes", pending: "no", rejected: "no" } : null);
        setIsDialogOpen(false);
    });
  };

  const handleReject = () => {
    if (!selectedJob) return;
    if (!showRejectInput) {
        setShowRejectInput(true);
        return;
    }
    startTransition(async () => {
        await rejectJob(selectedJob.id, rejectReason);
        setSelectedJob(prev => prev ? { ...prev, approved: "no", pending: "no", rejected: "yes" } : null);
        setIsDialogOpen(false);
    });
  };

  const handleUnreject = () => {
    if (!selectedJob) return;
    startTransition(async () => {
        await unrejectJob(selectedJob.id);
        setSelectedJob(prev => prev ? { ...prev, rejected: "no", pending: "yes", rejection_reason: null } : null);
        setIsDialogOpen(false);
    });
  };

  const handleFeatureToggle = (isFeatured: boolean) => {
      if (!selectedJob) return;
      startTransition(async () => {
          await toggleFeatureJob(selectedJob.id, isFeatured);
          setSelectedJob(prev => prev ? { ...prev, is_featured: isFeatured } : null);
      });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Title>Job Listings</Title>
            <Text>Manage all job posts ({totalCount} total)</Text>
          </div>
          <div className="w-full sm:w-64">
            <TextInput
              icon={Search}
              placeholder="Search jobs..."
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
              <TableHeaderCell>Job Title</TableHeaderCell>
              <TableHeaderCell>Company</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Posted</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <Text className="font-medium truncate max-w-[200px]" title={job.job_name || ""}>{job.job_name || "Untitled"}</Text>
                    {job.is_featured && (
                        <Badge size="xs" color="purple" icon={Star} className="w-fit mt-1">Featured</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Text>{job.company || "N/A"}</Text>
                </TableCell>
                <TableCell>
                  <Text>{job.location || "N/A"}</Text>
                </TableCell>
                <TableCell>
                  <Badge size="xs" color="blue">{job.type || "N/A"}</Badge>
                </TableCell>
                <TableCell>
                  <Text>{formatDate(job.Time || job.created_at)}</Text>
                </TableCell>
                <TableCell>
                    <div className="flex gap-1">
                        {job.approved === "yes" && <Badge size="xs" color="emerald" icon={CheckCircle}>Active</Badge>}
                        {job.pending === "yes" && <Badge size="xs" color="amber">Pending</Badge>}
                        {(job.rejected === "yes" || job.rejection_reason) && <Badge size="xs" color="red" icon={XCircle}>Rejected</Badge>}
                    </div>
                </TableCell>
                <TableCell>
                  <Button 
                      size="xs" 
                      variant="secondary" 
                      icon={MoreHorizontal}
                      onClick={() => handleViewDetails(job)}
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
            <Text>No jobs found matching your criteria.</Text>
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
            {selectedJob && (
                <div className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <Title className="text-2xl font-bold">{selectedJob.job_name || "Untitled Job"}</Title>
                            <Text className="mt-1 text-lg text-gray-600 dark:text-gray-400">{selectedJob.company}</Text>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedJob.approved === "yes" && <Badge color="emerald" icon={CheckCircle}>Approved</Badge>}
                                {selectedJob.pending === "yes" && <Badge color="amber">Pending Approval</Badge>}
                                {(selectedJob.rejected === "yes" || selectedJob.rejection_reason) && <Badge color="red" icon={XCircle}>Rejected</Badge>}
                                {selectedJob.is_featured && <Badge color="purple" icon={Star}>Featured</Badge>}
                                <Badge color="blue">{selectedJob.type || "Full Time"}</Badge>
                                <Badge color="slate">{selectedJob.category || "General"}</Badge>
                            </div>
                            {selectedJob.rejection_reason && (
                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <Text className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">Rejection Reason:</Text>
                                    <Text className="text-sm text-red-700 dark:text-red-300">{selectedJob.rejection_reason}</Text>
                                </div>
                            )}
                        </div>
                        <Button variant="light" color="slate" icon={X} onClick={() => setIsDialogOpen(false)} className="shrink-0" />
                    </div>

                    {/* Admin Actions */}
                    <Card className="bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800">
                        <Title className="mb-4">Admin Actions</Title>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-3">
                                {selectedJob.pending === "yes" || selectedJob.rejected === "yes" || selectedJob.rejection_reason ? (
                                    <Button 
                                        color="emerald" 
                                        icon={CheckCircle} 
                                        onClick={handleApprove}
                                        loading={isPending}
                                    >
                                        Approve Job
                                    </Button>
                                ) : null}
                                
                                {(selectedJob.rejected === "yes" || selectedJob.rejection_reason) ? (
                                    <Button 
                                        color="blue" 
                                        variant="secondary"
                                        icon={CheckCircle} 
                                        onClick={handleUnreject}
                                        loading={isPending}
                                    >
                                        Unreject Job
                                    </Button>
                                ) : null}
                                
                                {selectedJob.approved === "yes" || selectedJob.pending === "yes" ? (
                                    <div className="flex items-center gap-2">
                                        {!showRejectInput && (
                                            <Button 
                                                color="red" 
                                                variant="secondary"
                                                icon={XCircle} 
                                                onClick={() => setShowRejectInput(true)}
                                                loading={isPending}
                                            >
                                                Reject Job
                                            </Button>
                                        )}
                                    </div>
                                ) : null}

                                <div className="flex items-center gap-2 ml-auto border-l pl-4 border-gray-300 dark:border-gray-700">
                                    <Switch 
                                        checked={selectedJob.is_featured} 
                                        onChange={handleFeatureToggle}
                                        disabled={isPending}
                                        color="purple"
                                    />
                                    <Text className="font-medium text-purple-700 dark:text-purple-400">Feature Job</Text>
                                </div>
                            </div>

                            {showRejectInput && (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                                    <TextInput 
                                        placeholder="Reason for rejection..." 
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                    <Button color="red" onClick={handleReject} loading={isPending}>Confirm Reject</Button>
                                    <Button variant="light" onClick={() => setShowRejectInput(false)}>Cancel</Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Grid numItems={1} numItemsMd={2} className="gap-6">
                         {/* Job Details */}
                        <Card>
                            <Title className="mb-4">Job Details</Title>
                            <List>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>Location</span>
                                    </div>
                                    <span>{selectedJob.location || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-gray-500" />
                                        <span>Salary</span>
                                    </div>
                                    <span>
                                        {selectedJob.salary_min && selectedJob.salary_max 
                                            ? `${parseInt(selectedJob.salary_min).toLocaleString()} - ${parseInt(selectedJob.salary_max).toLocaleString()} ${selectedJob.currency || 'TZS'}`
                                            : "Not specified"}
                                    </span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-gray-500" />
                                        <span>Type</span>
                                    </div>
                                    <span>{selectedJob.type || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-gray-500" />
                                        <span>Category</span>
                                    </div>
                                    <span>{selectedJob.category || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span>Deadline</span>
                                    </div>
                                    <span>{formatDate(selectedJob.deadline)}</span>
                                </ListItem>
                            </List>
                        </Card>

                         {/* Description */}
                        <Card>
                            <Title className="mb-4">Description</Title>
                            <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 max-h-64 overflow-y-auto whitespace-pre-wrap">
                                {selectedJob.description || "No description provided."}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                                <Text className="font-medium mb-2">Application Link</Text>
                                {selectedJob.apply_link ? (
                                    <a href={selectedJob.apply_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">
                                        {selectedJob.apply_link}
                                    </a>
                                ) : (
                                    <Text className="text-gray-500">No external link provided</Text>
                                )}
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
