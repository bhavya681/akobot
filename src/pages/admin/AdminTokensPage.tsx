"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { adminTokensAPI } from "@/lib/api";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Token {
  tokenId?: string;
  _id?: string; // Fallback for compatibility
  token?: string;
  userId?: string;
  username?: string;
  email?: string;
  user?: {
    email?: string;
    username?: string;
  };
  createdAt?: string;
  expiresAt?: string;
  lastUsedAt?: string;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    lastUsed?: string;
  };
  deviceInfoString?: string; // Legacy support
  ipAddress?: string; // Legacy support
}

const AdminTokensPage = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingTokenId, setRevokingTokenId] = useState<string | null>(null);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminTokensAPI.getAll();
      // Handle different response formats
      let tokensList: Token[] = [];
      if (Array.isArray(data)) {
        tokensList = data;
      } else if (data && typeof data === 'object') {
        tokensList = data.tokens || data.data || data.results || [];
      }
      setTokens(tokensList);
    } catch (error: any) {
      console.error("Error fetching tokens:", error);
      const errorMessage = error?.message || "Failed to fetch tokens";
      setError(errorMessage);
      toast.error(errorMessage);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (tokenId: string) => {
    try {
      await adminTokensAPI.revoke(tokenId);
      toast.success("Token revoked successfully");
      fetchTokens();
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke token");
    } finally {
      setIsRevokeDialogOpen(false);
      setRevokingTokenId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const maskToken = (tokenId?: string) => {
    if (!tokenId) return "N/A";
    if (tokenId.length <= 20) return tokenId;
    return `${tokenId.substring(0, 8)}...${tokenId.substring(tokenId.length - 8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Key className="w-8 h-8" />
            Token Management
          </h1>
          <p className="text-muted-foreground mt-1">View and manage active authentication tokens</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTokens}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Info Alert */}
      {!error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> Revoking a token will immediately log out the user from that session.
              Use this feature carefully.
            </p>
          </div>
        </div>
      )}

      {/* Tokens Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Device/IP</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No active tokens found
                  </TableCell>
                </TableRow>
              ) : (
                tokens.map((token, index) => {
                  const tokenId = token.tokenId || token._id;
                  const username = token.username || token.user?.username || "Unknown";
                  const email = token.email || token.user?.email;
                  const lastUsed = token.lastUsedAt || token.deviceInfo?.lastUsed;
                  const ipAddress = token.deviceInfo?.ipAddress || token.ipAddress;
                  const userAgent = token.deviceInfo?.userAgent;
                  
                  return (
                    <TableRow key={tokenId || `token-${index}`}>
                      <TableCell>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">
                          {maskToken(tokenId)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{username}</div>
                          {email && (
                            <div className="text-xs text-muted-foreground">{email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(token.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(lastUsed)}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          {userAgent && (
                            <div className="text-muted-foreground truncate max-w-[200px]" title={userAgent}>
                              {userAgent || "N/A"}
                            </div>
                          )}
                          {ipAddress && (
                            <Badge variant="outline" className="text-xs">
                              {ipAddress}
                            </Badge>
                          )}
                          {!userAgent && !ipAddress && (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (tokenId) {
                              setRevokingTokenId(tokenId);
                              setIsRevokeDialogOpen(true);
                            } else {
                              toast.error("Token ID is missing. Cannot revoke this token.");
                            }
                          }}
                          disabled={!tokenId}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Token?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this token? This will immediately log out the user
              from this session. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsRevokeDialogOpen(false);
              setRevokingTokenId(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (revokingTokenId) {
                  handleRevoke(revokingTokenId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke Token
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTokensPage;

