"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Package, 
  Wallet, 
  Key, 
  Settings, 
  TrendingUp,
  DollarSign,
  Activity,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminAPI } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPackages: 0,
    activeTokens: 0,
    totalConfigs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch basic stats - you can enhance this with actual API calls
      // For now, we'll just set placeholder values
      setStats({
        totalUsers: 0,
        totalPackages: 0,
        activeTokens: 0,
        totalConfigs: 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      link: "/admin/users",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Package Management",
      description: "Create and manage subscription packages",
      icon: Package,
      link: "/admin/packages",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Wallet Management",
      description: "Credit/debit user wallets",
      icon: Wallet,
      link: "/admin/wallet",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Token Management",
      description: "View and revoke active tokens",
      icon: Key,
      link: "/admin/tokens",
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Configurations",
      description: "Manage system configurations",
      icon: Settings,
      link: "/admin/configs",
      color: "from-indigo-500 to-blue-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to the admin control panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalPackages}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Active packages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeTokens}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Active sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configurations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalConfigs}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">System configs</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.link} href={action.link}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

