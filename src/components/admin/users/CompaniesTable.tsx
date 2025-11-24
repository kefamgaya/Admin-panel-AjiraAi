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
} from "@tremor/react";
import { Search, MoreHorizontal, Ban, CheckCircle, Mail, MapPin, Calendar, Shield, Globe, Phone, Building, Briefcase, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { format } from "date-fns";
import { toggleCompanyVerification, toggleCompanyBlockStatus } from "@/app/actions/company-management";

interface Company {
  id: number;
  uid: string;
  company_name: string | null;
  email: string | null;
  location: string | null;
  industry: string | null;
  company_size: string | null;
  created_at: string | null;
  is_verified: boolean;
  is_blocked: boolean;
  subscription_plan: string | null;
  jobs_posted: number | null;
  website: string | null;
  phone: string | null;
  description: string | null;
  total_applications: number | null;
}

export default function CompaniesTable({ 
  data, 
  searchParams,
  totalCount,
  currentPage,
  itemsPerPage
}: { 
  data: Company[],
  searchParams: { q?: string; page?: string },
  totalCount: number,
  currentPage: number,
  itemsPerPage: number
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        return format(date, "PPP");
    } catch {
        return "N/A";
    }
  };

  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
    setIsDialogOpen(true);
  };

  const handleVerificationChange = (isVerified: boolean) => {
    if (!selectedCompany) return;
    startTransition(async () => {
        await toggleCompanyVerification(selectedCompany.uid, isVerified);
        setSelectedCompany(prev => prev ? { ...prev, is_verified: isVerified } : null);
    });
  };

  const handleBlockStatusChange = (isBlocked: boolean) => {
      if (!selectedCompany) return;
      startTransition(async () => {
          await toggleCompanyBlockStatus(selectedCompany.uid, isBlocked);
          setSelectedCompany(prev => prev ? { ...prev, is_blocked: isBlocked } : null);
      });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Title>Registered Companies</Title>
            <Text>List of all company profiles ({totalCount} total)</Text>
          </div>
          <div className="w-full sm:w-64">
            <TextInput
              icon={Search}
              placeholder="Search companies..."
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
              <TableHeaderCell>Company Name</TableHeaderCell>
              <TableHeaderCell>Industry</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Joined</TableHeaderCell>
              <TableHeaderCell>Subscription</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <Text className="font-medium">{company.company_name || "N/A"}</Text>
                    <Text className="text-xs text-gray-500">{company.email}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Text>{company.industry || "N/A"}</Text>
                </TableCell>
                <TableCell>
                  <Text>{company.location || "N/A"}</Text>
                </TableCell>
                <TableCell>
                  <Text>{formatDate(company.created_at)}</Text>
                </TableCell>
                <TableCell>
                  <Badge size="xs" color="blue">{company.subscription_plan || "Free"}</Badge>
                </TableCell>
                <TableCell>
                    <div className="flex gap-1">
                        {company.is_verified && (
                            <Badge size="xs" color="emerald" icon={CheckCircle}>Verified</Badge>
                        )}
                        {company.is_blocked && (
                             <Badge size="xs" color="red" icon={Ban}>Blocked</Badge>
                        )}
                        {!company.is_verified && !company.is_blocked && (
                             <Badge size="xs" color="gray">Pending</Badge>
                        )}
                    </div>
                </TableCell>
                <TableCell>
                  <Button 
                      size="xs" 
                      variant="secondary" 
                      icon={MoreHorizontal}
                      onClick={() => handleViewDetails(company)}
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
            <Text>No companies found matching your criteria.</Text>
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
            {selectedCompany && (
                <div className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <Title className="text-2xl font-bold">{selectedCompany.company_name || "Unnamed Company"}</Title>
                            <Text className="mt-1 max-w-2xl">{selectedCompany.description || "No description provided."}</Text>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedCompany.is_verified && <Badge color="emerald" icon={CheckCircle}>Verified Business</Badge>}
                                {selectedCompany.is_blocked && <Badge color="red" icon={Ban}>Blocked</Badge>}
                                <Badge color="blue">{selectedCompany.subscription_plan || "Free Plan"}</Badge>
                                <Badge color="slate">{selectedCompany.company_size || "Unknown Size"}</Badge>
                            </div>
                        </div>
                        <Button variant="light" color="slate" icon={X} onClick={() => setIsDialogOpen(false)} className="shrink-0" />
                    </div>

                    {/* Admin Actions */}
                    <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                        <Title className="text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" /> Admin Actions
                        </Title>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col justify-center">
                                <Text className="mb-2 font-medium text-blue-900 dark:text-blue-100">Verification Status</Text>
                                <div className="flex items-center gap-3">
                                    <Switch 
                                        checked={selectedCompany.is_verified} 
                                        onChange={handleVerificationChange}
                                        disabled={isPending}
                                        color="emerald"
                                    />
                                    <Text className={selectedCompany.is_verified ? "text-emerald-600 font-medium" : "text-gray-600"}>
                                        {selectedCompany.is_verified ? "Company is Verified" : "Not Verified"}
                                    </Text>
                                </div>
                                <Text className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Grant verified badge and trusted status.
                                </Text>
                            </div>
                            <div className="flex flex-col justify-center">
                                <Text className="mb-2 font-medium text-blue-900 dark:text-blue-100">Block Company</Text>
                                <div className="flex items-center gap-3">
                                    <Switch 
                                        checked={selectedCompany.is_blocked} 
                                        onChange={handleBlockStatusChange}
                                        disabled={isPending}
                                        color="red"
                                    />
                                    <Text className={selectedCompany.is_blocked ? "text-red-600 font-medium" : "text-gray-600"}>
                                        {selectedCompany.is_blocked ? "Access Restricted" : "Active Access"}
                                    </Text>
                                </div>
                                <Text className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Suspend all company activities and job posts.
                                </Text>
                            </div>
                        </div>
                    </Card>

                    <Grid numItems={1} numItemsMd={2} className="gap-6">
                         {/* Contact Info */}
                        <Card>
                            <Title className="mb-4">Company Details</Title>
                            <List>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-gray-500" />
                                        <span>Industry</span>
                                    </div>
                                    <span>{selectedCompany.industry || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span>Email</span>
                                    </div>
                                    <span>{selectedCompany.email || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span>Phone</span>
                                    </div>
                                    <span>{selectedCompany.phone || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>Location</span>
                                    </div>
                                    <span>{selectedCompany.location || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span>Joined</span>
                                    </div>
                                    <span>{formatDate(selectedCompany.created_at)}</span>
                                </ListItem>
                            </List>
                        </Card>

                         {/* Social & Stats */}
                        <div className="space-y-6">
                            <Card>
                                <Title className="mb-4">Online Presence</Title>
                                <List>
                                    {selectedCompany.website && (
                                        <ListItem>
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-gray-500" />
                                                <span>Website</span>
                                            </div>
                                            <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">
                                                {selectedCompany.website}
                                            </a>
                                        </ListItem>
                                    )}
                                     {!selectedCompany.website && (
                                        <Text>No website provided.</Text>
                                    )}
                                </List>
                            </Card>

                            <Card>
                                <Title className="mb-2">Recruitment Stats</Title>
                                <Grid numItems={2} className="gap-4">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <Text className="text-xs">Jobs Posted</Text>
                                        <Metric className="text-lg">{selectedCompany.jobs_posted || 0}</Metric>
                                    </div>
                                    <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <Text className="text-xs">Applications</Text>
                                        <Metric className="text-lg">{selectedCompany.total_applications || 0}</Metric>
                                    </div>
                                </Grid>
                            </Card>
                        </div>
                    </Grid>
                </div>
            )}
        </DialogPanel>
      </Dialog>
    </>
  );
}
