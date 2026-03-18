"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Key,
  CreditCard,
  Shield,
  Bell,
  Download,
  Copy,
  Eye,
  EyeOff,
  Check,
  Loader2,
  Wallet,
  History,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import UserAvatar from "@/components/UserAvatar";
import { profileAPI, authAPI, type AuthSession } from "@/lib/api";

// Use more granular breakpoints for responsiveness
const ACCOUNT_INPUT =
  "w-full px-4 py-2.5 rounded-lg sm:rounded-xl bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground text-sm sm:text-base";

const AccountPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Fetch profile data
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchWalletBalance();
      fetchWalletHistory();
      fetchSessions();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileAPI.getProfile();
      setProfile(data);
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      // Don't show error toast for profile, just use context user
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      setWalletLoading(true);
      const data = await profileAPI.getWalletBalance();
      setWalletBalance(data.balance || data.credits || 0);
    } catch (error: any) {
      console.error("Failed to fetch wallet balance:", error);
      toast.error("Failed to load wallet balance");
    } finally {
      setWalletLoading(false);
    }
  };

  const fetchWalletHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await profileAPI.getWalletHistory({ page: 1, limit: 10, sortOrder: 'desc' });
      setWalletHistory(Array.isArray(data) ? data : (data.transactions || data.history || []));
    } catch (error: any) {
      console.error("Failed to fetch wallet history:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const data = await authAPI.getSessions();
      setSessions(data);
    } catch (error: any) {
      console.error("Failed to fetch sessions:", error);
      toast.error("Failed to load active sessions");
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);
      await profileAPI.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText("ak_live_xxxxxxxxxxxxxxxxxxxx");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoogleSignIn = () => {
    // Placeholder for Google OAuth integration
    toast.info(
      "Google sign-in will be available soon. For now, use your email account.",
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full space-y-6 max-w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Please sign in to view your account
          </h1>
          <p className="text-muted-foreground">
            You need to be logged in to access account settings.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Account Settings
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your profile, subscription, and preferences
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Left Column - Profile & Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile / Sign-in Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Profile
            </h2>

            {/* Google sign-in */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Sign in with your Google account
                </p>
                <p className="text-xs text-muted-foreground">
                  Quickly connect using your Gmail – no separate password needed.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 rounded-full border border-border/70 bg-background hover:bg-secondary/60 focus:ring-2 focus:ring-primary/60"
                onClick={handleGoogleSignIn}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
                  <span className="text-[12px] font-bold text-[#4285F4]">G</span>
                </span>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  Continue with Google
                </span>
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-row md:flex-col gap-3 items-center">
                <UserAvatar user={user} size="xl" />
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>

              {/* Form */}
              <form
                className="flex-1 space-y-4"
                autoComplete="off"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user?.username || 'Not set'}
                      readOnly
                      className={`${ACCOUNT_INPUT} bg-secondary/20 cursor-not-allowed`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || 'Not set'}
                      readOnly
                      className={`${ACCOUNT_INPUT} bg-secondary/20 cursor-not-allowed`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role || 'User'}
                    readOnly
                    className={`${ACCOUNT_INPUT} capitalize bg-secondary/20 cursor-not-allowed`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Account Status
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg sm:rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Active</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Bio
                  </label>
                  <textarea
                    defaultValue="Creative professional exploring AI-powered content generation"
                    rows={3}
                    className={`${ACCOUNT_INPUT} resize-none`}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      defaultValue="San Francisco, CA"
                      className={ACCOUNT_INPUT}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      defaultValue="https://alexcreator.com"
                      className={ACCOUNT_INPUT}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="hero" size="sm" type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Subscription Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Subscription
            </h2>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-primary/10 border border-primary/30 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-base md:text-lg font-semibold text-foreground">
                    Standard Plan
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                    Active
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  $45/month&nbsp;&#8226;&nbsp;Renews on Jan 15, 2025
                </p>
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                Manage Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-secondary/30 text-center">
                {walletLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-foreground">
                      {walletBalance !== null ? walletBalance.toLocaleString() : '0'}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Wallet className="w-3 h-3" />
                      Credits Remaining
                    </div>
                  </>
                )}
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 text-center">
                <div className="text-2xl font-bold text-foreground">87,432</div>
                <div className="text-sm text-muted-foreground">
                  LLM Questions Left
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 text-center">
                <div className="text-2xl font-bold text-foreground">156</div>
                <div className="text-sm text-muted-foreground">
                  Generations This Month
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Usage This Month
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Images Generated</span>
                  <span className="font-medium text-foreground">89 / 500</span>
                </div>
                <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: "17.8%" }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Videos Generated</span>
                  <span className="font-medium text-foreground">12 / 50</span>
                </div>
                <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: "24%" }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API Calls</span>
                  <span className="font-medium text-foreground">
                    1,234 / 10,000
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full"
                    style={{ width: "12.34%" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Wallet Transaction History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchWalletHistory}
                disabled={historyLoading}
              >
                {historyLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
            {historyLoading && walletHistory.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : walletHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {walletHistory.map((transaction: any, idx: number) => {
                  const date = transaction.createdAt 
                    ? new Date(transaction.createdAt).toLocaleDateString()
                    : transaction.date || 'N/A';
                  const amount = transaction.amount || transaction.credits || 0;
                  const type = transaction.type || transaction.action || 'transaction';
                  const isCredit = type.includes('credit') || amount > 0;
                  
                  return (
                    <div
                      key={transaction.id || transaction._id || idx}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/40 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCredit ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {isCredit ? (
                            <CreditCard className="w-5 h-5 text-green-400" />
                          ) : (
                            <CreditCard className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {transaction.remark || transaction.description || type}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:mt-0 mt-2">
                        <span className={`text-sm font-medium ${
                          isCredit ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {isCredit ? '+' : '-'}{Math.abs(amount).toLocaleString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          isCredit 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - Security & API */}
        <div className="space-y-6">
          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-4 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security
            </h2>
            <form
              className="space-y-4"
              autoComplete="off"
              onSubmit={handleChangePassword}
            >
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Current Password
                </label>
                <input 
                  type="password" 
                  className={ACCOUNT_INPUT}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  New Password
                </label>
                <input 
                  type="password" 
                  className={ACCOUNT_INPUT}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Confirm New Password
                </label>
                <input 
                  type="password" 
                  className={ACCOUNT_INPUT}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                type="submit"
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
            <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <button
                  className="w-10 h-6 rounded-full bg-secondary relative focus:outline-none"
                  aria-label="Enable 2FA"
                >
                  <div className="w-4 h-4 rounded-full bg-primary absolute top-1 left-1 transition-transform" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Login Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get notified of new logins
                  </p>
                </div>
                <button
                  className="w-10 h-6 rounded-full bg-primary relative focus:outline-none"
                  aria-label="Enable login notifications"
                >
                  <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Active Sessions / Devices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                Active Sessions
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSessions}
                disabled={sessionsLoading}
              >
                {sessionsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Devices where you are currently signed in. Users can only view their own sessions.
            </p>
            {sessionsLoading && sessions.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Smartphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active sessions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session, idx) => {
                  const device = session.deviceInfo as Record<string, string> | undefined;
                  const deviceName = device?.name || device?.device || device?.userAgent || `Session ${idx + 1}`;
                  const createdAt = session.createdAt
                    ? new Date(session.createdAt).toLocaleString()
                    : "Unknown";
                  const expiresAt = session.expiresAt
                    ? new Date(session.expiresAt).toLocaleString()
                    : "—";
                  return (
                    <div
                      key={session.token || idx}
                      className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/40 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Monitor className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {deviceName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Created: {createdAt}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {expiresAt}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* API Keys Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-4 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              API Keys
            </h2>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-secondary/30 flex-wrap">
                <Key className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 font-mono text-xs sm:text-sm text-foreground overflow-hidden truncate">
                  {showApiKey
                    ? "ak_live_xxxxxxxxxxxxxxxxxxxx"
                    : "ak_live_••••••••••••••••••••"}
                </div>
                <button
                  onClick={() => setShowApiKey((show) => !show)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showApiKey ? "Hide API Key" : "Show API Key"}
                  type="button"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={copyApiKey}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Copy API Key"
                  type="button"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full mb-4">
              Generate New Key
            </Button>

            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-3">API Usage</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Requests Today</span>
                  <span className="font-medium text-foreground">1,234</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Rate Limit</span>
                  <span className="font-medium text-foreground">10,000/day</span>
                </div>
                <div className="w-full h-1.5 bg-secondary/30 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: "12.34%" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-2xl p-4 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Email Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <button
                  className="w-10 h-6 rounded-full bg-primary relative focus:outline-none"
                  aria-label="Enable email notifications"
                >
                  <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1 transition-transform" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Credit Alerts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get notified when credits are low
                  </p>
                </div>
                <button
                  className="w-10 h-6 rounded-full bg-primary relative focus:outline-none"
                  aria-label="Enable credit alerts"
                >
                  <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1 transition-transform" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Product Updates
                  </p>
                  <p className="text-xs text-muted-foreground">
                    News about new features
                  </p>
                </div>
                <button
                  className="w-10 h-6 rounded-full bg-secondary relative focus:outline-none"
                  aria-label="Enable product update notifications"
                >
                  <div className="w-4 h-4 rounded-full bg-primary absolute top-1 left-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

