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
  Badge,
  Dialog,
  DialogPanel,
  TextInput,
  Select,
  SelectItem,
} from "@tremor/react";
import { Plus, Pencil, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
}

export default function AdminsTable({ data }: { data: AdminUser[] }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ 
    email: "", 
    full_name: "", 
    role: "moderator",
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  const openEdit = (admin?: AdminUser) => {
    if (admin) {
      setSelectedAdmin(admin);
      setFormData({ 
        email: admin.email, 
        full_name: admin.full_name, 
        role: admin.role,
        is_active: admin.is_active
      });
    } else {
      setSelectedAdmin(null);
      setFormData({ 
        email: "", 
        full_name: "", 
        role: "moderator",
        is_active: true
      });
    }
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const url = selectedAdmin 
        ? `/api/admin/settings/admins/${selectedAdmin.id}`
        : "/api/admin/settings/admins";
      
      const method = selectedAdmin ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Operation failed");

      router.refresh();
      setIsEditOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save admin user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;
    try {
      await fetch(`/api/admin/settings/admins/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to delete");
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title>Admin Users</Title>
          <Text>Manage team members with access to the admin panel</Text>
        </div>
        <Button icon={UserPlus} onClick={() => openEdit()}>Add Admin</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Last Login</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.id}>
              <TableCell><Text className="font-medium">{user.full_name}</Text></TableCell>
              <TableCell><Text>{user.email}</Text></TableCell>
              <TableCell>
                <Badge color="blue" size="xs">{user.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge color={user.is_active ? "emerald" : "gray"} size="xs">
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <Text>{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</Text>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="xs" variant="secondary" icon={Pencil} onClick={() => openEdit(user)}>Edit</Button>
                  <Button size="xs" variant="secondary" color="red" icon={Trash2} onClick={() => handleDelete(user.id)}>Remove</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} static={true}>
        <DialogPanel>
          <Title className="mb-4">{selectedAdmin ? "Edit Admin" : "Add New Admin"}</Title>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Full Name</label>
              <TextInput 
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <TextInput 
                value={formData.email}
                disabled={!!selectedAdmin}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Role</label>
              <Select 
                value={formData.role} 
                onValueChange={val => setFormData({...formData, role: val})}
              >
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </Select>
            </div>
            {selectedAdmin && (
               <div>
               <label className="text-sm text-gray-500 mb-1 block">Status</label>
               <Select 
                 value={formData.is_active ? "active" : "inactive"} 
                 onValueChange={val => setFormData({...formData, is_active: val === "active"})}
               >
                 <SelectItem value="active">Active</SelectItem>
                 <SelectItem value="inactive">Inactive</SelectItem>
               </Select>
             </div>
            )}
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} loading={loading}>Save</Button>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </Card>
  );
}

