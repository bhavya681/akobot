"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Edit, Trash2, Loader2, Search, Save, X, DollarSign, CreditCard, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";
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
import { Switch } from "@/components/ui/switch";

interface PackageData {
  _id?: string;
  name: string;
  description?: string;
  includedCredits: number;
  actualPrice?: number;
  currentPrice: number;
  offer?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

const AdminPackagesPage = () => {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [formData, setFormData] = useState<PackageData>({
    name: "",
    description: "",
    includedCredits: 0,
    actualPrice: undefined,
    currentPrice: 0,
    offer: null,
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllPackages();
      setPackages(Array.isArray(data) ? data : (data.packages || []));
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch packages");
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      includedCredits: 0,
      actualPrice: undefined,
      currentPrice: 0,
      offer: null,
      isActive: true,
      sortOrder: 0,
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (pkg: PackageData) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      includedCredits: pkg.includedCredits || 0,
      actualPrice: pkg.actualPrice,
      currentPrice: pkg.currentPrice || 0,
      offer: pkg.offer || null,
      isActive: pkg.isActive !== false,
      sortOrder: pkg.sortOrder || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      await adminAPI.deletePackage(id);
      toast.success("Package deleted successfully");
      fetchPackages();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete package");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.currentPrice <= 0 || formData.includedCredits < 1) {
      toast.error("Please fill in all required fields. Credits must be at least 1 and price must be greater than 0.");
      return;
    }
    
    // Ensure includedCredits is an integer
    if (!Number.isInteger(formData.includedCredits)) {
      toast.error("Credits must be a whole number");
      return;
    }

    try {
      if (editingPackage?._id) {
        await adminAPI.updatePackage(editingPackage._id, formData);
        toast.success("Package updated successfully");
      } else {
        await adminAPI.createPackage(formData);
        toast.success("Package created successfully");
      }
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingPackage(null);
      fetchPackages();
    } catch (error: any) {
      toast.error(error.message || "Failed to save package");
    }
  };


  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-8 h-8" />
            Package Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage subscription packages and pricing</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Package
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Packages Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Actual Price</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Offer</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No packages found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPackages.map((pkg) => (
                  <TableRow key={pkg._id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ₹{pkg.currentPrice?.toLocaleString('en-IN') || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {pkg.actualPrice ? (
                        <div className="flex items-center gap-1 text-muted-foreground line-through">
                          ₹{pkg.actualPrice.toLocaleString('en-IN')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {pkg.includedCredits?.toLocaleString('en-IN') || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {pkg.offer ? (
                        <Badge variant="secondary" className="text-xs">
                          {pkg.offer}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{pkg.sortOrder ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(pkg)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => pkg._id && handleDelete(pkg._id)}
                          className="text-destructive hover:text-destructive"
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

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingPackage(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Package" : "Create New Package"}
            </DialogTitle>
            <DialogDescription>
              {editingPackage
                ? "Update package details"
                : "Create a new subscription package"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Package name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Package description"
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Current Price (₹) *</label>
                <Input
                  type="number"
                  value={formData.currentPrice || ""}
                  onChange={(e) => setFormData({ ...formData, currentPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="mt-1"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Actual Price (₹)</label>
                <Input
                  type="number"
                  value={formData.actualPrice || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      actualPrice: value === "" ? undefined : parseFloat(value) || 0 
                    });
                  }}
                  placeholder="Optional (for discounts)"
                  className="mt-1"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty if no discount
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Included Credits *</label>
                <Input
                  type="number"
                  value={formData.includedCredits || ""}
                  onChange={(e) => setFormData({ ...formData, includedCredits: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="mt-1"
                  min="1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 1
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Sort Order</label>
                <Input
                  type="number"
                  value={formData.sortOrder || ""}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="mt-1"
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Offer Badge</label>
              <Input
                value={formData.offer || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ 
                    ...formData, 
                    offer: value === "" ? null : value 
                  });
                }}
                placeholder="e.g., 'New Year Offer', 'Best Value' (optional)"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to hide offer badge
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setEditingPackage(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="gap-2">
                <Save className="w-4 h-4" />
                {editingPackage ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPackagesPage;

