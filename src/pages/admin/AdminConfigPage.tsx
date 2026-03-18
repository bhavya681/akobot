"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Plus, Edit, Trash2, Loader2, Search, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Config {
  key: string;
  value: any;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

const AdminConfigPage = () => {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getConfigs();
      setConfigs(Array.isArray(data) ? data : (data.configs || []));
    } catch (error: any) {
      toast.error(error.message || "Failed to load configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKey || !newValue) {
      toast.error("Please fill in both key and value");
      return;
    }

    try {
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(newValue);
      } catch {
        parsedValue = newValue;
      }

      await adminAPI.createConfig(newKey, parsedValue);
      toast.success("Configuration created successfully!");
      setIsCreateDialogOpen(false);
      setNewKey("");
      setNewValue("");
      fetchConfigs();
    } catch (error: any) {
      toast.error(error.message || "Failed to create configuration");
    }
  };

  const handleEdit = (config: Config) => {
    setEditingConfig(config);
    setEditValue(typeof config.value === 'object' ? JSON.stringify(config.value, null, 2) : String(config.value));
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingConfig || !editValue) {
      toast.error("Please provide a value");
      return;
    }

    try {
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(editValue);
      } catch {
        parsedValue = editValue;
      }

      await adminAPI.updateConfig(editingConfig.key, parsedValue);
      toast.success("Configuration updated successfully!");
      setIsEditDialogOpen(false);
      setEditingConfig(null);
      setEditValue("");
      fetchConfigs();
    } catch (error: any) {
      toast.error(error.message || "Failed to update configuration");
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete configuration "${key}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteConfig(key);
      toast.success("Configuration deleted successfully!");
      fetchConfigs();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete configuration");
    }
  };

  const filteredConfigs = configs.filter((config) =>
    config.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 max-w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configuration Management
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage system configurations
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Config
        </Button>
      </motion.div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search configurations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Configs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-4 sm:p-6"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No configurations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfigs.map((config) => (
                  <TableRow key={config.key}>
                    <TableCell className="font-mono text-sm">{config.key}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate font-mono text-xs">
                        {typeof config.value === 'object'
                          ? JSON.stringify(config.value)
                          : String(config.value)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(config)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(config.key)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Configuration</DialogTitle>
            <DialogDescription>
              Add a new system configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Key</label>
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="config.key.name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Value (JSON or string)</label>
              <textarea
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder='{"key": "value"} or "string value"'
                className="w-full px-3 py-2 rounded-lg bg-background border border-border min-h-[100px] font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                <Save className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Configuration</DialogTitle>
            <DialogDescription>
              Update configuration: {editingConfig?.key}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Key (read-only)</label>
              <Input value={editingConfig?.key || ''} disabled className="bg-secondary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Value (JSON or string)</label>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border min-h-[100px] font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleUpdate}>
                <Save className="w-4 h-4 mr-2" />
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminConfigPage;

