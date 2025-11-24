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
} from "@tremor/react";
import { Search, Plus, Pencil, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

interface Category {
  id: number;
  name: string | null;
  job_count: number | null;
}

export default function CategoriesTable({ 
  data, 
  searchParams,
  totalCount,
  currentPage,
  itemsPerPage
}: { 
  data: Category[],
  searchParams: { q?: string; page?: string },
  totalCount: number,
  currentPage: number,
  itemsPerPage: number
}) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "" });
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
      const url = selectedCategory 
        ? `/api/admin/content/categories/${selectedCategory.id}`
        : "/api/admin/content/categories";
      
      const method = selectedCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Operation failed");

      router.refresh();
      setIsEditOpen(false);
      setFormData({ name: "" });
      setSelectedCategory(null);
    } catch (error) {
      console.error(error);
      alert("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content/categories/${selectedCategory.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      router.refresh();
      setIsDeleteOpen(false);
      setSelectedCategory(null);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({ name: category.name || "" });
    } else {
      setSelectedCategory(null);
      setFormData({ name: "" });
    }
    setIsEditOpen(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Title>Job Categories</Title>
          <Text>Manage job categories and classifications ({totalCount} total)</Text>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <TextInput
              icon={Search}
              placeholder="Search categories..."
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={searchParams.q}
            />
          </div>
          <Button icon={Plus} onClick={() => openEdit()}>
            Add Category
          </Button>
        </div>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>ID</TableHeaderCell>
            <TableHeaderCell>Category Name</TableHeaderCell>
            <TableHeaderCell>Jobs Count</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Text>{item.id}</Text>
              </TableCell>
              <TableCell>
                <Text className="font-medium">{item.name}</Text>
              </TableCell>
              <TableCell>
                <Text>{item.job_count || 0}</Text>
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
                      setSelectedCategory(item);
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
          <Title className="mb-3">{selectedCategory ? "Edit Category" : "Add Category"}</Title>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Category Name</label>
              <TextInput 
                placeholder="e.g. Software Engineering" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
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
            <Title color="red">Delete Category</Title>
          </div>
          <Text className="mb-4">
            Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?
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
