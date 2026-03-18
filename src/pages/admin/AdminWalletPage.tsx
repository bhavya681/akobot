"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Plus, Search, Loader2, ArrowUp, ArrowDown, History, DollarSign } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const AdminWalletPage = () => {
  const [userId, setUserId] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  
  // Wallet action form state
  const [actionAmount, setActionAmount] = useState("");
  const [actionType, setActionType] = useState<"credit" | "debit">("credit");
  const [actionRemark, setActionRemark] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  const handleSearchUser = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a user ID");
      return;
    }

    try {
      setLoadingBalance(true);
      const data = await adminAPI.getWalletBalance(userId);
      setBalance(data.balance || data.credits || 0);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch wallet balance");
      setBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleFetchHistory = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a user ID first");
      return;
    }

    try {
      setLoadingHistory(true);
      const data = await adminAPI.getWalletHistory(userId, { page: 1, limit: 50, sortOrder: 'desc' });
      setHistory(Array.isArray(data) ? data : (data.transactions || data.history || []));
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch transaction history");
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleWalletAction = async () => {
    if (!userId.trim() || !actionAmount || !actionRemark.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const amount = parseFloat(actionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setProcessingAction(true);
      await adminAPI.walletAction({
        userId,
        amount,
        action: actionType,
        remark: actionRemark,
      });
      toast.success(`Successfully ${actionType === 'credit' ? 'credited' : 'debited'} ${amount} credits`);
      setIsActionDialogOpen(false);
      setActionAmount("");
      setActionRemark("");
      // Refresh balance and history
      handleSearchUser();
      handleFetchHistory();
    } catch (error: any) {
      toast.error(error.message || "Failed to perform wallet action");
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <div className="w-full space-y-6 max-w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          Wallet Management
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage user wallet balances and transactions
        </p>
      </motion.div>

      {/* User Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">User ID</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearchUser} disabled={loadingBalance}>
                {loadingBalance ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          {balance !== null && (
            <div className="flex items-end">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Current Balance</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {balance.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      {userId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4"
        >
          <Button onClick={() => setIsActionDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Credit/Debit Wallet
          </Button>
          <Button variant="outline" onClick={handleFetchHistory} disabled={loadingHistory}>
            <History className="w-4 h-4 mr-2" />
            {loadingHistory ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "View History"
            )}
          </Button>
        </motion.div>
      )}

      {/* Transaction History */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-4 sm:p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((transaction: any, idx: number) => {
                  const date = transaction.createdAt 
                    ? new Date(transaction.createdAt).toLocaleString()
                    : transaction.date || 'N/A';
                  const amount = transaction.amount || transaction.credits || 0;
                  const type = transaction.type || transaction.action || 'transaction';
                  const isCredit = type.includes('credit') || amount > 0;
                  
                  return (
                    <TableRow key={transaction.id || transaction._id || idx}>
                      <TableCell className="text-sm">{date}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          isCredit 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {type}
                        </span>
                      </TableCell>
                      <TableCell className={`font-medium ${
                        isCredit ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isCredit ? '+' : '-'}{Math.abs(amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {transaction.remark || transaction.description || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}

      {/* Wallet Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credit/Debit Wallet</DialogTitle>
            <DialogDescription>
              Perform wallet action for user: {userId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Action Type</label>
              <Select value={actionType} onValueChange={(value: "credit" | "debit") => setActionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="w-4 h-4 text-green-400" />
                      Credit (Add)
                    </div>
                  </SelectItem>
                  <SelectItem value="debit">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="w-4 h-4 text-red-400" />
                      Debit (Subtract)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={actionAmount}
                onChange={(e) => setActionAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Remark</label>
              <Textarea
                placeholder="Enter transaction remark"
                value={actionRemark}
                onChange={(e) => setActionRemark(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleWalletAction} disabled={processingAction}>
                {processingAction ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {actionType === 'credit' ? (
                      <ArrowUp className="w-4 h-4 mr-2" />
                    ) : (
                      <ArrowDown className="w-4 h-4 mr-2" />
                    )}
                    {actionType === 'credit' ? 'Credit' : 'Debit'} Wallet
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWalletPage;

