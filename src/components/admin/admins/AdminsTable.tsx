"use client";

import { useState, useTransition } from "react";
import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
  Badge,
  Button,
  TextInput,
  Dialog,
  DialogPanel,
  Title,
  Select,
  SelectItem,
  Switch,
} from "@tremor/react";
import { Search, Plus, Edit, Trash2, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import {
  createAdmin,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin,
} from "@/app/actions/admin-management";

interface Admin {
  id: number;
  uid: string;
  email: string;
  full_name: string;
  role: string;
  permissions: any;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  created_by: string | null;
}

export function AdminsTable({ admins }: { admins: Admin[] }) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    role: "moderator",
    permissions: {},
  });

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.full_name.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase()) ||
      admin.role.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "super_admin":
        return "red";
      case "admin":
        return "blue";
      case "moderator":
        return "purple";
      case "support":
        return "emerald";
      default:
        return "gray";
    }
  };

  const handleAdd = () => {
    setFormData({
      email: "",
      full_name: "",
      role: "moderator",
      permissions: {},
    });
    setResult(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      permissions: admin.permissions || {},
    });
    setResult(null);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (admin: Admin) => {
    setSelectedAdmin(admin);
    setResult(null);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = async () => {
    setResult(null);

    startTransition(async () => {
      const response = await createAdmin({
        uid: `admin_${Date.now()}`, // Generate UID
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        permissions: formData.permissions,
        created_by: "Admin User", // TODO: Get from auth context
      });

      if (response.success) {
        setResult({
          success: true,
          message: "Admin created successfully!",
        });
        setTimeout(() => {
          setIsAddDialogOpen(false);
          window.location.reload();
        }, 1500);
      } else {
        setResult({
          success: false,
          message: response.error || "Failed to create admin",
        });
      }
    });
  };

  const handleSubmitEdit = async () => {
    if (!selectedAdmin) return;
    setResult(null);

    startTransition(async () => {
      const response = await updateAdmin(selectedAdmin.id, {
        full_name: formData.full_name,
        role: formData.role,
        permissions: formData.permissions,
      });

      if (response.success) {
        setResult({
          success: true,
          message: "Admin updated successfully!",
        });
        setTimeout(() => {
          setIsEditDialogOpen(false);
          window.location.reload();
        }, 1500);
      } else {
        setResult({
          success: false,
          message: response.error || "Failed to update admin",
        });
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedAdmin) return;
    setResult(null);

    startTransition(async () => {
      const response = await deleteAdmin(selectedAdmin.id);

      if (response.success) {
        setResult({
          success: true,
          message: "Admin deleted successfully!",
        });
        setTimeout(() => {
          setIsDeleteDialogOpen(false);
          window.location.reload();
        }, 1500);
      } else {
        setResult({
          success: false,
          message: response.error || "Failed to delete admin",
        });
      }
    });
  };

  const handleToggleStatus = async (admin: Admin) => {
    startTransition(async () => {
      await toggleAdminStatus(admin.id, !admin.is_active);
      window.location.reload();
    });
  };

  return (
    <>
      <Card>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <TextInput
            icon={Search}
            placeholder="Search admins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button icon={Plus} onClick={handleAdd}>
            Add Admin
          </Button>
        </div>

        {/* Table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Last Login</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAdmins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <Text className="font-medium">{admin.full_name}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Text className="text-sm">{admin.email}</Text>
                </TableCell>
                <TableCell>
                  <Badge color={getRoleBadgeColor(admin.role)} size="sm">
                    {admin.role.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={admin.is_active}
                      onChange={() => handleToggleStatus(admin)}
                      disabled={isPending}
                    />
                    <Badge color={admin.is_active ? "emerald" : "red"} size="xs">
                      {admin.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {admin.last_login ? (
                    <Text className="text-sm">
                      {format(new Date(admin.last_login), "MMM dd, yyyy")}
                    </Text>
                  ) : (
                    <Text className="text-sm text-gray-400">Never</Text>
                  )}
                </TableCell>
                <TableCell>
                  <Text className="text-sm">
                    {format(new Date(admin.created_at), "MMM dd, yyyy")}
                  </Text>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="secondary"
                      icon={Edit}
                      onClick={() => handleEdit(admin)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="secondary"
                      icon={Trash2}
                      color="red"
                      onClick={() => handleDelete(admin)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredAdmins.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <Text className="text-gray-500">
              {search ? "No admins found matching your search" : "No administrators yet"}
            </Text>
          </div>
        )}
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogPanel className="max-w-lg">
          <Title>Add New Administrator</Title>
          <Text className="mt-2 mb-6">Create a new admin account</Text>

          <div className="space-y-4">
            <div>
              <label className="block mb-2">
                <Text className="font-medium">Full Name *</Text>
              </label>
              <TextInput
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block mb-2">
                <Text className="font-medium">Email *</Text>
              </label>
              <TextInput
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block mb-2">
                <Text className="font-medium">Role *</Text>
              </label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={isPending}
              >
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </Select>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200"
              }`}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <Text className={result.success ? "text-emerald-900" : "text-red-900"}>
                    {result.message}
                  </Text>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAdd}
                disabled={isPending || !formData.email || !formData.full_name}
                loading={isPending}
              >
                Create Admin
              </Button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogPanel className="max-w-lg">
          <Title>Edit Administrator</Title>
          <Text className="mt-2 mb-6">Update admin information</Text>

          <div className="space-y-4">
            <div>
              <label className="block mb-2">
                <Text className="font-medium">Full Name *</Text>
              </label>
              <TextInput
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block mb-2">
                <Text className="font-medium">Email</Text>
              </label>
              <TextInput
                type="email"
                value={formData.email}
                disabled
              />
              <Text className="text-xs text-gray-500 mt-1">Email cannot be changed</Text>
            </div>

            <div>
              <label className="block mb-2">
                <Text className="font-medium">Role *</Text>
              </label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={isPending}
              >
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </Select>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200"
              }`}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <Text className={result.success ? "text-emerald-900" : "text-red-900"}>
                    {result.message}
                  </Text>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitEdit}
                disabled={isPending || !formData.full_name}
                loading={isPending}
              >
                Update Admin
              </Button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogPanel className="max-w-md">
          <Title>Delete Administrator</Title>
          <Text className="mt-2 mb-6">
            Are you sure you want to delete {selectedAdmin?.full_name}? This action cannot be undone.
          </Text>

          {result && (
            <div className={`p-4 rounded-lg border mb-4 ${
              result.success 
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200"
                : "bg-red-50 dark:bg-red-900/20 border-red-200"
            }`}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                )}
                <Text className={result.success ? "text-emerald-900" : "text-red-900"}>
                  {result.message}
                </Text>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleConfirmDelete}
              disabled={isPending}
              loading={isPending}
            >
              Delete Admin
            </Button>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}

