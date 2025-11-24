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
  Button,
  TextInput,
  Dialog,
  DialogPanel,
  TabGroup,
  TabList,
  Tab,
  Select,
  SelectItem,
} from "@tremor/react";
import { Search, Plus, Pencil, Trash2, AlertTriangle, Map, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Region {
  id: number;
  name: string;
  code: string | null;
}

interface District {
  id: number;
  name: string;
  code: string | null;
  region_id: number;
}

export default function LocationsTable({ 
  regions, 
  districts,
  searchParams,
  totalCount,
  currentPage,
  itemsPerPage
}: { 
  regions: Region[];
  districts: District[];
  searchParams: { q?: string; page?: string; tab?: string };
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}) {
  const router = useRouter();
  const initialTab = searchParams.tab === 'districts' ? 1 : 0;
  const [activeTab, setActiveTab] = useState(initialTab); // 0 = Regions, 1 = Districts
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", region_id: "" });
  const [loading, setLoading] = useState(false);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", index === 0 ? "regions" : "districts");
    params.set("page", "1"); // Reset pagination on tab switch
    params.delete("q"); // Clear search on tab switch
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(window.location.search);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    if (activeTab === 1) params.set("tab", "districts");
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    if (activeTab === 1) params.set("tab", "districts");
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  // Helper to get region name for district (using the full list passed as prop, assuming regions list is small enough or pre-fetched)
  // Note: In a real server-paginated scenario for districts, we might need to join regions in the query or fetch needed regions.
  // For now, we assume 'regions' prop contains all regions since there are few (~30).
  const getRegionName = (id: number) => regions.find(r => r.id === id)?.name || "Unknown";

  const handleSave = async () => {
    setLoading(true);
    try {
      const type = activeTab === 0 ? "region" : "district";
      const url = selectedItem 
        ? `/api/admin/content/locations/${selectedItem.id}`
        : "/api/admin/content/locations";
      
      const method = selectedItem ? "PUT" : "POST";

      const payload = {
        ...formData,
        type,
        region_id: activeTab === 1 ? parseInt(formData.region_id) : undefined
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Operation failed");
      }

      router.refresh();
      setIsEditOpen(false);
      resetForm();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      const type = activeTab === 0 ? "region" : "district";
      const res = await fetch(`/api/admin/content/locations/${selectedItem.id}?type=${type}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      router.refresh();
      setIsDeleteOpen(false);
      resetForm();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormData({ name: "", code: "", region_id: "" });
  };

  const openEdit = (item?: any) => {
    if (item) {
      setSelectedItem(item);
      setFormData({ 
        name: item.name, 
        code: item.code || "", 
        region_id: item.region_id ? item.region_id.toString() : "" 
      });
    } else {
      resetForm();
    }
    setIsEditOpen(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Title>Locations Management</Title>
          <Text>Manage regions and districts for Tanzania ({totalCount} records)</Text>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <Button icon={Plus} onClick={() => openEdit()}>
            Add {activeTab === 0 ? "Region" : "District"}
          </Button>
        </div>
      </div>

      <TabGroup index={activeTab} onIndexChange={handleTabChange}>
        <TabList className="mb-4">
          <Tab icon={Map}>Regions</Tab>
          <Tab icon={MapPin}>Districts</Tab>
        </TabList>
        
        {/* Shared Search Bar */}
        <div className="mb-4">
            <TextInput
              icon={Search}
              placeholder={`Search ${activeTab === 0 ? 'regions' : 'districts'}...`}
              defaultValue={searchParams.q}
              onChange={(e) => handleSearch(e.target.value)}
            />
        </div>

        {/* Regions Table */}
        {activeTab === 0 && (
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Code</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {regions.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell><Text>{region.id}</Text></TableCell>
                    <TableCell><Text className="font-medium">{region.name}</Text></TableCell>
                    <TableCell><Text>{region.code || '-'}</Text></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="xs" variant="secondary" icon={Pencil} onClick={() => openEdit(region)}>Edit</Button>
                        <Button size="xs" variant="secondary" color="red" icon={Trash2} onClick={() => { setSelectedItem(region); setIsDeleteOpen(true); }}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Districts Table */}
        {activeTab === 1 && (
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Region</TableHeaderCell>
                  <TableHeaderCell>Code</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {districts.map((district) => (
                  <TableRow key={district.id}>
                    <TableCell><Text>{district.id}</Text></TableCell>
                    <TableCell><Text className="font-medium">{district.name}</Text></TableCell>
                    <TableCell><Text>{getRegionName(district.region_id)}</Text></TableCell>
                    <TableCell><Text>{district.code || '-'}</Text></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="xs" variant="secondary" icon={Pencil} onClick={() => openEdit(district)}>Edit</Button>
                        <Button size="xs" variant="secondary" color="red" icon={Trash2} onClick={() => { setSelectedItem(district); setIsDeleteOpen(true); }}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
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
      </TabGroup>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} static={true}>
        <DialogPanel>
          <Title className="mb-3">
            {selectedItem ? "Edit" : "Add"} {activeTab === 0 ? "Region" : "District"}
          </Title>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Name</label>
              <TextInput 
                placeholder={`e.g. ${activeTab === 0 ? 'Dar es Salaam' : 'Ilala'}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Code (Optional)</label>
              <TextInput 
                placeholder="e.g. DSM" 
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            {activeTab === 1 && (
               <div>
                <label className="text-sm text-gray-500 mb-1 block">Region</label>
                <Select 
                  value={formData.region_id} 
                  onValueChange={(val) => setFormData({ ...formData, region_id: val })}
                  placeholder="Select Region"
                >
                  {regions.map(r => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                loading={loading}
                onClick={handleSave}
                disabled={!formData.name || (activeTab === 1 && !formData.region_id)}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} static={true}>
        <DialogPanel>
          <div className="flex items-center gap-2 mb-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <Title color="red">Delete Location</Title>
          </div>
          <Text className="mb-4">
            Are you sure you want to delete <strong>{selectedItem?.name}</strong>?
            This action cannot be undone.
          </Text>
          
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              color="red"
              loading={loading}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
