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
  Badge,
  Select,
  SelectItem,
} from "@tremor/react";
import { Search, Plus, Pencil, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

interface Skill {
  id: number;
  name: string | null;
  category: string | null;
}

interface Category {
  id: number;
  name: string | null;
}

export default function SkillsTable({ 
  data, 
  categories,
  searchParams,
  totalCount,
  currentPage,
  itemsPerPage
}: { 
  data: Skill[], 
  categories: Category[],
  searchParams: { q?: string; page?: string },
  totalCount: number,
  currentPage: number,
  itemsPerPage: number
}) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({ name: "", category: "" });
  const [loading, setLoading] = useState(false);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(window.location.search);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.replace(`${window.location.pathname}?${params.toString()}`);
  }, 300);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const url = selectedSkill 
        ? `/api/admin/content/skills/${selectedSkill.id}`
        : "/api/admin/content/skills";
      
      const method = selectedSkill ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Operation failed");

      router.refresh();
      setIsEditOpen(false);
      setFormData({ name: "", category: "" });
      setSelectedSkill(null);
    } catch (error) {
      console.error(error);
      alert("Failed to save skill");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSkill) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content/skills/${selectedSkill.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      router.refresh();
      setIsDeleteOpen(false);
      setSelectedSkill(null);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (skill?: Skill) => {
    if (skill) {
      setSelectedSkill(skill);
      setFormData({ name: skill.name || "", category: skill.category || "" });
    } else {
      setSelectedSkill(null);
      setFormData({ name: "", category: "" });
    }
    setIsEditOpen(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title>Skills Database</Title>
          <Text>Manage skills and their categories ({totalCount} total)</Text>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <TextInput
              icon={Search}
              placeholder="Search skills..."
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={searchParams.q}
            />
          </div>
          <Button icon={Plus} onClick={() => openEdit()}>
            Add Skill
          </Button>
        </div>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Skill Name</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Text className="font-medium">{item.name}</Text>
              </TableCell>
              <TableCell>
                {item.category ? (
                  <Badge color="blue" size="xs">{item.category}</Badge>
                ) : (
                  <Text className="text-gray-400 italic">Uncategorized</Text>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    size="xs" 
                    variant="secondary" 
                    icon={Pencil}
                    onClick={() => openEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="xs" 
                    variant="secondary" 
                    color="red"
                    icon={Trash2}
                    onClick={() => {
                      setSelectedSkill(item);
                      setIsDeleteOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} static={true}>
        <DialogPanel>
          <Title className="mb-3">{selectedSkill ? "Edit Skill" : "Add Skill"}</Title>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Skill Name</label>
              <TextInput 
                placeholder="e.g. React.js" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Category</label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData({ ...formData, category: val })}
                placeholder="Select Category"
              >
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name || ""}>
                    {cat.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                loading={loading}
                onClick={handleSave}
                disabled={!formData.name}
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
            <Title color="red">Delete Skill</Title>
          </div>
          <Text className="mb-4">
            Are you sure you want to delete <strong>{selectedSkill?.name}</strong>?
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
    </Card>
  );
}
