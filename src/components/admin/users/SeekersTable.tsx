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
  Select,
  SelectItem,
  Switch,
} from "@tremor/react";
import { Search, MoreHorizontal, Ban, CheckCircle, Mail, MapPin, Calendar, Shield, Globe, Linkedin, Github, Twitter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { format } from "date-fns";
import { updateUserAccountType, toggleUserBlockStatus } from "@/app/actions/user-management";

interface Seeker {
  uid: string;
  name: string | null;
  full_name: string | null;
  email: string | null;
  location: string | null;
  registration_date: string | null;
  is_blocked: boolean;
  accounttype: string | null;
  // Profile fields
  bio?: string | null;
  about?: string | null;
  role?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  website?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  github?: string | null;
  total_rewards?: number | null;
  points?: number | null;
  reward_streak?: number | null;
  credits?: number | null;
  skills?: any;
}

export default function SeekersTable({ 
  data, 
  searchParams,
  totalCount,
  currentPage,
  itemsPerPage
}: { 
  data: Seeker[],
  searchParams: { q?: string; page?: string },
  totalCount: number,
  currentPage: number,
  itemsPerPage: number
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Seeker | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(window.location.search);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // Reset to page 1 on search
    router.replace(`${pathname}?${params.toString()}`);
    setIsSearching(false);
  }, 300);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const formatDate = (dateString: string | null, formatStr: string = "PPP") => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if(isNaN(date.getTime())) return "N/A";
        return format(date, formatStr);
    } catch {
        return "N/A";
    }
  };

  const handleViewDetails = (user: Seeker) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleAccountTypeChange = (value: string) => {
    if (!selectedUser) return;
    startTransition(async () => {
        await updateUserAccountType(selectedUser.uid, value);
        setSelectedUser(prev => prev ? { ...prev, accounttype: value } : null);
    });
  };

  const handleBlockStatusChange = (isBlocked: boolean) => {
      if (!selectedUser) return;
      startTransition(async () => {
          await toggleUserBlockStatus(selectedUser.uid, isBlocked);
          setSelectedUser(prev => prev ? { ...prev, is_blocked: isBlocked } : null);
      });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Title>Job Seekers</Title>
            <Text>List of all registered job seekers ({totalCount} total)</Text>
          </div>
          <div className="w-full sm:w-64">
            <TextInput
              icon={Search}
              placeholder="Search by name or email..."
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
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Joined</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.uid}>
                <TableCell>
                  <Text className="font-medium">{user.full_name || user.name || "N/A"}</Text>
                </TableCell>
                <TableCell>
                  <Text>{user.email || "N/A"}</Text>
                </TableCell>
                <TableCell>
                  <Text>{user.location || "N/A"}</Text>
                </TableCell>
                <TableCell>
                  <Text>{formatDate(user.registration_date, "P")}</Text>
                </TableCell>
                <TableCell>
                  <Badge color={user.is_blocked ? "red" : "emerald"} icon={user.is_blocked ? Ban : CheckCircle}>
                    {user.is_blocked ? "Blocked" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                      size="xs" 
                      variant="secondary" 
                      icon={MoreHorizontal}
                      onClick={() => handleViewDetails(user)}
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
            <Text>No seekers found matching your criteria.</Text>
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
            {selectedUser && (
                <div className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <Title className="text-2xl font-bold">{selectedUser.full_name || selectedUser.name || "Unknown Name"}</Title>
                            <Text className="mt-1">{selectedUser.bio || selectedUser.about || "No bio available"}</Text>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Badge color={selectedUser.is_blocked ? "red" : "emerald"} icon={selectedUser.is_blocked ? Ban : CheckCircle}>
                                    {selectedUser.is_blocked ? "Blocked" : "Active Account"}
                                </Badge>
                                <Badge color="blue">{selectedUser.role || "Job Seeker"}</Badge>
                                {selectedUser.accounttype === "verified" && <Badge color="green">Verified</Badge>}
                            </div>
                        </div>
                        <Button variant="light" color="slate" icon={X} onClick={() => setIsDialogOpen(false)} className="shrink-0" />
                    </div>
                    
                    {/* Admin Actions Section */}
                    <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                        <Title className="text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" /> Admin Actions
                        </Title>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <Text className="mb-2 font-medium text-blue-900 dark:text-blue-100">Account Type</Text>
                                <Select 
                                    value={selectedUser.accounttype || "regular"} 
                                    onValueChange={handleAccountTypeChange}
                                    disabled={isPending}
                                >
                                    <SelectItem value="regular">Regular</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                </Select>
                                <Text className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Change the user's verified status and privileges.
                                </Text>
                            </div>
                            <div className="flex flex-col justify-center">
                                <Text className="mb-2 font-medium text-blue-900 dark:text-blue-100">Block User</Text>
                                <div className="flex items-center gap-3">
                                    <Switch 
                                        checked={selectedUser.is_blocked} 
                                        onChange={handleBlockStatusChange}
                                        disabled={isPending}
                                        color="red"
                                    />
                                    <Text className={selectedUser.is_blocked ? "text-red-600 font-medium" : "text-gray-600"}>
                                        {selectedUser.is_blocked ? "User is Blocked" : "User is Active"}
                                    </Text>
                                </div>
                                <Text className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Prevent this user from logging in or accessing the platform.
                                </Text>
                            </div>
                        </div>
                    </Card>

                    <Grid numItems={1} numItemsMd={2} className="gap-6">
                         {/* Contact Info */}
                        <Card>
                            <Title className="mb-4">Contact Information</Title>
                            <List>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span>Email</span>
                                    </div>
                                    <span>{selectedUser.email || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>Location</span>
                                    </div>
                                    <span>{selectedUser.location || "N/A"}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span>Joined</span>
                                    </div>
                                    <span>{formatDate(selectedUser.registration_date)}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span>Birth Date</span>
                                    </div>
                                    <span>{formatDate(selectedUser.birth_date)}</span>
                                </ListItem>
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-gray-500" />
                                        <span>Gender</span>
                                    </div>
                                    <span>{selectedUser.gender || "N/A"}</span>
                                </ListItem>
                            </List>
                        </Card>

                         {/* Social & Stats */}
                        <div className="space-y-6">
                            <Card>
                                <Title className="mb-4">Online Presence</Title>
                                <List>
                                    {selectedUser.website && (
                                        <ListItem>
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-gray-500" />
                                                <span>Website</span>
                                            </div>
                                            <a href={selectedUser.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[150px]">
                                                {selectedUser.website}
                                            </a>
                                        </ListItem>
                                    )}
                                    {selectedUser.linkedin && (
                                        <ListItem>
                                            <div className="flex items-center gap-2">
                                                <Linkedin className="w-4 h-4 text-gray-500" />
                                                <span>LinkedIn</span>
                                            </div>
                                            <a href={selectedUser.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[150px]">
                                                Profile
                                            </a>
                                        </ListItem>
                                    )}
                                    {selectedUser.github && (
                                        <ListItem>
                                            <div className="flex items-center gap-2">
                                                <Github className="w-4 h-4 text-gray-500" />
                                                <span>GitHub</span>
                                            </div>
                                            <a href={selectedUser.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[150px]">
                                                Profile
                                            </a>
                                        </ListItem>
                                    )}
                                    {selectedUser.twitter && (
                                        <ListItem>
                                            <div className="flex items-center gap-2">
                                                <Twitter className="w-4 h-4 text-gray-500" />
                                                <span>Twitter</span>
                                            </div>
                                            <a href={selectedUser.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[150px]">
                                                Profile
                                            </a>
                                        </ListItem>
                                    )}
                                    {!selectedUser.website && !selectedUser.linkedin && !selectedUser.github && !selectedUser.twitter && (
                                        <Text>No social profiles linked.</Text>
                                    )}
                                </List>
                            </Card>

                            <Card>
                                <Title className="mb-2">Platform Stats</Title>
                                <Grid numItems={2} className="gap-4">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <Text className="text-xs">Total Rewards</Text>
                                        <Metric className="text-lg">{selectedUser.total_rewards || 0}</Metric>
                                    </div>
                                    <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <Text className="text-xs">Points</Text>
                                        <Metric className="text-lg">{selectedUser.points || 0}</Metric>
                                    </div>
                                    <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <Text className="text-xs">Streak</Text>
                                        <Metric className="text-lg">{selectedUser.reward_streak || 0}</Metric>
                                    </div>
                                    <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <Text className="text-xs">Credits</Text>
                                        <Metric className="text-lg">{selectedUser.credits || 0}</Metric>
                                    </div>
                                </Grid>
                            </Card>
                        </div>
                    </Grid>

                    {/* Skills */}
                    {selectedUser.skills && (
                        <Card>
                            <Title>Skills</Title>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {typeof selectedUser.skills === 'object' && selectedUser.skills !== null ? (
                                    Object.values(selectedUser.skills).map((skill: any, index: number) => (
                                        <Badge key={index} size="sm" color="slate">
                                            {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                                        </Badge>
                                    ))
                                ) : (
                                    <Text>No skills listed</Text>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </DialogPanel>
      </Dialog>
    </>
  );
}
