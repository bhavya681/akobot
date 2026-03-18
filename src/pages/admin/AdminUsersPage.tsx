"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Edit, Trash2, Loader2, Search, Save, X, Ban, UserCheck, Shield, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { adminUsersAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  _id?: string;
  email?: string;
  username?: string;
  role?: string;
  isBanned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserResponse {
  users?: User[];
  data?: User[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [isBannedFilter, setIsBannedFilter] = useState<boolean | undefined>(undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    role: "user",
  });
  const [newPassword, setNewPassword] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, usernameFilter, emailFilter, isActiveFilter, isBannedFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUsersAPI.getAll({
        page,
        limit,
        username: usernameFilter || undefined,
        email: emailFilter || undefined,
        isActive: isActiveFilter,
        isBanned: isBannedFilter,
      }) as UserResponse;
      
      const usersList = Array.isArray(data) ? data : (data.users || data.data || []);
      setUsers(usersList);
      setTotal(data.total || usersList.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || usersList.length) / limit));
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSearch = async () => {
    if (!emailSearch.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setLoading(true);
      const user = await adminUsersAPI.search(emailSearch.trim());
      if (user) {
        setUsers([user]);
        setTotal(1);
        setTotalPages(1);
      } else {
        toast.error("User not found");
        setUsers([]);
      }
    } catch (error: any) {
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        toast.error("User not found");
      } else {
        toast.error(error.message || "Failed to search user");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setUsernameFilter("");
    setEmailFilter("");
    setEmailSearch("");
    setIsActiveFilter(undefined);
    setIsBannedFilter(undefined);
    setPage(1);
  };

  const handleCreate = () => {
    setFormData({ email: "", username: "", password: "", role: "user" });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email || "",
      username: user.username || "",
      password: "",
      role: user.role || "user",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await adminUsersAPI.delete(id);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handleBan = async (id: string) => {
    try {
      await adminUsersAPI.ban(id);
      toast.success("User banned successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to ban user");
    }
  };

  const handleUnban = async (id: string) => {
    try {
      await adminUsersAPI.unban(id);
      toast.success("User unbanned successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to unban user");
    }
  };

  const handleMakeAdmin = async (id: string) => {
    try {
      await adminUsersAPI.makeAdmin(id);
      toast.success("User promoted to admin");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to promote user");
    }
  };

  const handleResetPassword = async () => {
    if (!editingUser?._id || !newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    try {
      await adminUsersAPI.resetPassword(editingUser._id, newPassword);
      toast.success("Password reset successfully");
      setIsPasswordDialogOpen(false);
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    }
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.username || (!editingUser && !formData.password)) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingUser?._id) {
        await adminUsersAPI.update(editingUser._id, {
          email: formData.email,
          username: formData.username,
          role: formData.role,
        });
        toast.success("User updated successfully");
      } else {
        await adminUsersAPI.create(formData);
        toast.success("User created successfully");
      }
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to save user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-8 h-8" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Create User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        {/* Email Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleEmailSearch();
                }
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={handleEmailSearch} variant="outline" size="sm">
            Search Email
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Filter by username..."
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Filter by email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
            />
          </div>
          <Select
            value={isActiveFilter === undefined ? "all" : isActiveFilter.toString()}
            onValueChange={(value) => setIsActiveFilter(value === "all" ? undefined : value === "true")}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Active Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={isBannedFilter === undefined ? "all" : isBannedFilter.toString()}
            onValueChange={(value) => setIsBannedFilter(value === "all" ? undefined : value === "true")}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Ban Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="true">Banned</SelectItem>
              <SelectItem value="false">Not Banned</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleClearFilters} variant="outline" size="sm">
            Clear Filters
          </Button>
        </div>

        {/* Pagination Info */}
        {total > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} users
          </div>
        )}
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.username || "N/A"}</TableCell>
                    <TableCell>{user.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role || "user"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isBanned ? "destructive" : "default"}>
                        {user.isBanned ? "Banned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {user.role !== "admin" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMakeAdmin(user._id!)}
                            title="Make Admin"
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                        )}
                        {user.isBanned ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUnban(user._id!)}
                            title="Unban"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleBan(user._id!)}
                            title="Ban"
                            className="text-destructive hover:text-destructive"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingUser(user);
                            setIsPasswordDialogOpen(true);
                          }}
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => user._id && handleDelete(user._id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingUser(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user details" : "Create a new user account"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Username *</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="username"
                className="mt-1"
              />
            </div>
            {!editingUser && (
              <div>
                <label className="text-sm font-medium">Password *</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="gap-2">
                <Save className="w-4 h-4" />
                {editingUser ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter a new password for {editingUser?.username || editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Password *</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleResetPassword} className="gap-2">
                <Save className="w-4 h-4" />
                Reset Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;

