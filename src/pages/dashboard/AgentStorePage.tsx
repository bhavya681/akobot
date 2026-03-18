"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  MoreVertical,
  ExternalLink,
  Code,
  Bot,
  FileText,
  ArrowLeft,
  Phone,
  Pencil,
  Download,
  Paperclip,
  Send,
  Loader2,
  CheckCircle2,
  Globe,
  Database,
  Settings,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Star,
  Filter,
  Grid,
  List,
  ChevronRight,
  Users,
  Clock,
  Upload,
  Link,
  FileUp,
  BrainCircuit,
  PlayCircle,
  X,
  MessageSquare,
  Lightbulb,
  CheckCircle,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { customAgentAPI, type CustomAgent } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type IngestProgressState = { status?: string; progress?: number; message?: string } | null;
type IngestStatusState = { collection?: string; totalVectors?: number; documents?: number } | null;

/** Displays GET /ingest/status response as professional result text (stats + JSON). */
function IngestResultCard({
  loading,
  status,
  label,
  className,
}: {
  loading: boolean;
  status: IngestStatusState;
  label?: string;
  className?: string;
}) {
  if (!loading && !status) return null;
  const responseJson =
    status &&
    JSON.stringify(
      {
        collection: status.collection ?? null,
        documents: status.documents ?? null,
        total_vectors: status.totalVectors ?? null,
      },
      null,
      2
    );
  return (
    <div className={cn("rounded-xl border border-border/60 bg-card/40 dark:bg-card/30 overflow-hidden", className)}>
      <div className="px-3 py-2 border-b border-border/50 bg-muted/20 dark:bg-muted/10 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-foreground">Result — Vector store stats</span>
        {label && <span className="text-[10px] text-muted-foreground truncate">{label}</span>}
      </div>
      <div className="p-3 space-y-2">
        <p className="text-[10px] text-muted-foreground font-mono">GET /custom-agent/&#123;agentId&#125;/ingest/status</p>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Fetching response...</span>
          </div>
        ) : status ? (
          <>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              {status.collection != null && (
                <>
                  <span className="text-muted-foreground">collection</span>
                  <span className="font-mono text-foreground truncate" title={status.collection}>{status.collection}</span>
                </>
              )}
              {status.documents != null && (
                <>
                  <span className="text-muted-foreground">documents</span>
                  <span className="font-mono text-foreground">{status.documents}</span>
                </>
              )}
              {(status.totalVectors != null || (status as { total_vectors?: number }).total_vectors != null) && (
                <>
                  <span className="text-muted-foreground">total_vectors</span>
                  <span className="font-mono text-foreground">
                    {(status.totalVectors ?? (status as { total_vectors?: number }).total_vectors)?.toLocaleString() ?? "—"}
                  </span>
                </>
              )}
              {status.documents == null && status.totalVectors == null && !status.collection && (
                <span className="col-span-2 text-muted-foreground">No data yet</span>
              )}
            </div>
            {responseJson && (
              <pre className="mt-2 text-[11px] font-mono bg-muted/50 dark:bg-muted/30 rounded-lg p-2.5 overflow-auto max-h-32 border border-border/40 text-foreground/90">
                {responseJson}
              </pre>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function IngestProgressBlock({
  progress,
  title,
  className,
}: {
  progress: IngestProgressState;
  title: string;
  className?: string;
}) {
  if (!progress) return null;
  const status = (progress.status ?? "").toLowerCase();
  const isComplete = status === "completed" || status === "done" || status === "success";
  const isFailed = status === "failed" || status === "error";
  const progressValue =
    progress.progress != null
      ? Math.min(100, Math.max(0, progress.progress))
      : isComplete
        ? 100
        : isFailed
          ? 0
          : 0;
  return (
    <div className={cn("space-y-2 pt-2 border-t border-border", className)}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground truncate flex-1 min-w-0">
          {progress.message ?? (isComplete ? "Complete" : isFailed ? "Failed" : "Checking status...")}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {isComplete && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />}
          {isFailed && <X className="w-4 h-4 text-destructive" />}
          {!isComplete && !isFailed && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              Running
            </Badge>
          )}
          {isComplete && (
            <Badge variant="outline" className="text-[10px] font-normal border-green-500/50 text-green-700 dark:text-green-400">
              Completed
            </Badge>
          )}
          {isFailed && (
            <Badge variant="destructive" className="text-[10px] font-normal">
              Failed
            </Badge>
          )}
          {progress.progress != null && (
            <span className="text-xs font-medium tabular-nums">{Math.round(progressValue)}%</span>
          )}
        </div>
      </div>
      <Progress value={progressValue} className="h-2" />
      {(() => {
        const raw = progress as unknown as { chunks_added?: number; total_chunks?: number; logs?: unknown[] };
        const chunksAdded = typeof raw?.chunks_added === "number" ? raw.chunks_added : undefined;
        const totalChunks = typeof raw?.total_chunks === "number" ? raw.total_chunks : undefined;
        const logs = Array.isArray(raw?.logs) ? raw.logs : [];
        const lastLog = typeof logs[logs.length - 1] === "string" ? (logs[logs.length - 1] as string) : undefined;
        const statusLabel = progress.status ?? (isComplete ? "completed" : isFailed ? "failed" : "pending");
        return (
          <p className="text-[10px] font-mono text-muted-foreground pt-1">
            status: {statusLabel}
            {chunksAdded != null && `  |  chunks: ${chunksAdded}${totalChunks != null ? ` / ${totalChunks}` : ""}`}
            {progress.progress != null && `  |  progress: ${Math.round(progressValue)}%`}
            {lastLog && `  |  ${lastLog}`}
          </p>
        );
      })()}
    </div>
  );
}

// Map API CustomAgent to UI Agent for display
function toAgent(a: CustomAgent): Agent {
  return {
    ...a,
    id: a._id,
    description: a.systemPrompt || a.brandDetails || "Custom AI agent",
    status: "PUBLISHED",
    pricing: "FREE",
    tags: [],
    interactions: 0,
    lastActive: new Date(a.updatedAt || a.createdAt || Date.now()),
  };
}

interface Agent {
  _id: string;
  id: string;
  name: string;
  description: string;
  systemPrompt?: string;
  brandDetails?: string;
  welcomeMessage?: string;
  status: "UNPUBLISHED" | "PUBLISHED" | "DRAFT";
  pricing: "FREE" | "PAID" | "PREMIUM";
  tags: string[];
  interactions: number;
  lastActive: Date;
}

const AgentStorePage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [brandDetails, setBrandDetails] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [createStep, setCreateStep] = useState<"details" | "crawl" | "knowledge" | "integrations" | "create">("details");
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null);
  const [knowledgeTab, setKnowledgeTab] = useState<"website" | "files">("website");
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlDepth, setCrawlDepth] = useState(1);
  const [ingestMode, setIngestMode] = useState<"append" | "overwrite">("append");
  const [isCrawling, setIsCrawling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState<{ status?: string; progress?: number; message?: string } | null>(null);
  const [ingestProgress, setIngestProgress] = useState<{ status?: string; progress?: number; message?: string } | null>(null);
  const [knowledgeFiles, setKnowledgeFiles] = useState<File[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Edit Agent Modal State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAgentForEdit, setSelectedAgentForEdit] = useState<Agent | null>(null);
  const [editName, setEditName] = useState("");
  const [editSystemPrompt, setEditSystemPrompt] = useState("");
  const [editBrandDetails, setEditBrandDetails] = useState("");
  const [editWelcomeMessage, setEditWelcomeMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Agent Superpowers Modal State
  const [isSuperpowersModalOpen, setIsSuperpowersModalOpen] = useState(false);
  const [selectedAgentForCustomize, setSelectedAgentForCustomize] = useState<Agent | null>(null);
  const [superpowersTab, setSuperpowersTab] = useState<"website" | "files" | "integrations">("website");
  
  // Superpowers Website Knowledge State
  const [superpowersWebsiteUrl, setSuperpowersWebsiteUrl] = useState("");
  const [isSuperpowersCrawling, setIsSuperpowersCrawling] = useState(false);
  const [superpowersCrawledSite, setSuperpowersCrawledSite] = useState<{
    url: string;
    title: string;
    description: string;
    favicon: string | null;
    logo: string | null;
  } | null>(null);
  const [superpowersCrawledUrls, setSuperpowersCrawledUrls] = useState<Array<{url: string; title: string; isParent?: boolean}>>([]);
  const [superpowersSelectedUrls, setSuperpowersSelectedUrls] = useState<string[]>([]);
  const [superpowersUrlSearchQuery, setSuperpowersUrlSearchQuery] = useState("");
  
  // Superpowers Knowledge Files State
  const [superpowersUploadedFiles, setSuperpowersUploadedFiles] = useState<Array<{name: string; size: string; file: File}>>([]);
  const [isSuperpowersUploading, setIsSuperpowersUploading] = useState(false);
  
  // Superpowers Integrations State
  const [superpowersSelectedIntegrations, setSuperpowersSelectedIntegrations] = useState<string[]>([]);
  const [superpowersIntegrationSearchQuery, setSuperpowersIntegrationSearchQuery] = useState("");
  const [superpowersCrawlDepth, setSuperpowersCrawlDepth] = useState(1);
  const [superpowersIngestMode, setSuperpowersIngestMode] = useState<"append" | "overwrite">("append");
  const [superpowersCrawlProgress, setSuperpowersCrawlProgress] = useState<{ status?: string; progress?: number; message?: string } | null>(null);
  const [superpowersIngestProgress, setSuperpowersIngestProgress] = useState<{ status?: string; progress?: number; message?: string } | null>(null);
  const [ingestStatus, setIngestStatus] = useState<{ collection?: string; totalVectors?: number; documents?: number } | null>(null);
  const [ingestStatusLoading, setIngestStatusLoading] = useState(false);
  const [createFlowIngestStatus, setCreateFlowIngestStatus] = useState<{ collection?: string; totalVectors?: number; documents?: number } | null>(null);
  const [createFlowIngestStatusLoading, setCreateFlowIngestStatusLoading] = useState(false);
  const [superpowersMetrics, setSuperpowersMetrics] = useState<Record<string, unknown> | null>(null);
  const [superpowersMetricsLoading, setSuperpowersMetricsLoading] = useState(false);

  const fetchAgents = () => {
    setAgentsLoading(true);
    customAgentAPI
      .list()
      .then((list) => {
        const apiAgents = (Array.isArray(list) ? list : []).map(toAgent);
        setAgents(apiAgents);
      })
      .catch((err) => {
        setAgents([]);
        toast.error("Failed to load agents", { description: err instanceof Error ? err.message : "Connect to the backend to view your agents." });
      })
      .finally(() => setAgentsLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    setAgentsLoading(true);
    customAgentAPI
      .list()
      .then((list) => {
        if (!cancelled) {
          const apiAgents = (Array.isArray(list) ? list : []).map(toAgent);
          setAgents(apiAgents);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAgents([]);
          toast.error("Failed to load agents", { description: err instanceof Error ? err.message : "Connect to the backend to view your agents." });
        }
      })
      .finally(() => {
        if (!cancelled) setAgentsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const integrations = [
    {
      id: "fortinet-fortigate",
      name: "fortinet-fortigate",
      displayName: "FORTINET - MCP Enabled",
      category: "NETWORKING_FIREWALL",
      tools: 33,
      icon: "🔴",
    },
    {
      id: "proxmox-ve",
      name: "proxmox-ve",
      displayName: "PROXMOX - MCP Enabled",
      category: "VIRTUALIZATION",
      tools: 38,
      icon: "🟠",
    },
    {
      id: "nexus-epm",
      name: "nexus-epm",
      displayName: "NEXUS_EPM - MCP Enabled",
      category: "RMM",
      tools: 17,
      icon: "🔵",
    },
  ];


  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ).filter(agent => 
    selectedFilter === "all" || 
    agent.status.toLowerCase() === selectedFilter.toLowerCase() ||
    agent.pricing.toLowerCase() === selectedFilter.toLowerCase()
  );

  /** Step 1: Create agent via API, then proceed to Agent Superpowers */
  const handleProceedToSuperpowers = async () => {
    if (!agentName.trim()) {
      toast.error("Please enter an agent name");
      return;
    }
    setIsCreating(true);
    const payload = {
      name: agentName.trim(),
      systemPrompt: agentDescription.trim() || undefined,
      brandDetails: brandDetails.trim() || undefined,
      welcomeMessage: welcomeMessage.trim() || `Hello! I'm ${agentName}. How can I help you today?`,
    };
    try {
      const created = await customAgentAPI.create(payload);
      setCreatedAgentId(created._id);
      fetchAgents();
      setCreateStep("crawl");
      toast.success("Agent created!", { description: "Configure crawling and knowledge.", icon: "🎉" });
    } catch (err) {
      toast.error("Failed to create agent", { description: err instanceof Error ? err.message : "Please check your connection and try again." });
    } finally {
      setIsCreating(false);
    }
  };

  /** Final step: Run any pending crawl/files, then open chat (agent already created in step 1) */
  const handleFinalCreateAgent = async () => {
    const agentId = createdAgentId;
    if (!agentId) return;
    setIsCreating(true);
    try {
      if (crawlUrl.trim() && isValidUrl(crawlUrl)) {
        try {
          await customAgentAPI.ingestCrawler(agentId, {
            url: normalizeUrl(crawlUrl),
            max_depth: crawlDepth,
            mode: ingestMode,
          });
          toast.success("Crawl started", { description: "Website content is being ingested." });
        } catch (err) {
          toast.error("Crawl failed", { description: err instanceof Error ? err.message : "You can retry from Customize later." });
        }
      }
      if (knowledgeFiles.length > 0) {
        setIsUploading(true);
        try {
          await customAgentAPI.ingestFiles(agentId, { files: knowledgeFiles, mode: ingestMode });
          toast.success("Files uploaded", { description: "Documents are being processed." });
        } catch (err) {
          toast.error("File upload failed", { description: err instanceof Error ? err.message : "You can retry from Customize later." });
        } finally {
          setIsUploading(false);
        }
      }
      fetchAgents();
      setIsCreateDialogOpen(false);
      resetCreateForm();
      window.open(`/dashboard/agent-store/${agentId}/chat?widget=1`, "_blank");
    } finally {
      setIsCreating(false);
    }
  };

  const resetCreateForm = () => {
    setAgentName("");
    setAgentDescription("");
    setBrandDetails("");
    setWelcomeMessage("");
    setCreateStep("details");
    setCreatedAgentId(null);
    setKnowledgeTab("website");
    setCrawlUrl("");
    setCrawlDepth(1);
    setIngestMode("append");
    setKnowledgeFiles([]);
    setCrawlProgress(null);
    setIngestProgress(null);
    setCreateFlowIngestStatus(null);
    setCreateFlowIngestStatusLoading(false);
  };

  useEffect(() => {
    if (!isCreateDialogOpen) resetCreateForm();
  }, [isCreateDialogOpen]);

  /** Poll GET /custom-agent/{agentId}/progress/{jobId} until completed/failed; then run onComplete and keep final state in UI */
  const pollJobProgress = async (
    agentId: string,
    jobId: string,
    label: string,
    onProgress?: (p: { status?: string; progress?: number; message?: string } | null) => void,
    onComplete?: () => void
  ) => {
    const POLL_INTERVAL_MS = 2000;
    const FIRST_POLL_DELAY_MS = 1500;
    const MAX_ATTEMPTS = 90; // ~3 min
    await new Promise((r) => setTimeout(r, FIRST_POLL_DELAY_MS));
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      try {
        const p = await customAgentAPI.getProgress(agentId, jobId);
        const status = (p.status ?? "").toLowerCase();
        const progress = typeof p.progress === "number" ? Math.min(100, Math.max(0, p.progress)) : undefined;
        const message = p.message ?? undefined;
        onProgress?.({ status: p.status, progress, message });
        if (status === "completed" || status === "done" || status === "success") {
          toast.success(`${label} complete`, { description: message ?? "Processing finished." });
          onProgress?.({ status: "completed", progress: 100, message: message ?? "Complete" });
          onComplete?.();
          return;
        }
        if (status === "failed" || status === "error") {
          toast.error(`${label} failed`, { description: message ?? "Please try again." });
          onProgress?.({ status: "failed", progress: 0, message: message ?? "Failed" });
          return;
        }
      } catch {
        if (i >= MAX_ATTEMPTS - 1) {
          toast.info(`${label} in progress`, { description: "Check back later or retry from Customize." });
          onProgress?.(null);
        }
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  };

  const fetchIngestStatusForAgent = useCallback(async (agentId: string) => {
    setIngestStatusLoading(true);
    try {
      const status = await customAgentAPI.getIngestStatus(agentId);
      setIngestStatus({
        collection: status.collection,
        totalVectors: status.totalVectors ?? (status as { total_vectors?: number }).total_vectors,
        documents: status.documents ?? (status as { document_count?: number }).document_count,
      });
    } catch {
      setIngestStatus(null);
    } finally {
      setIngestStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSuperpowersModalOpen || !selectedAgentForCustomize) {
      setIngestStatus(null);
      return;
    }
    const agentId = selectedAgentForCustomize.id ?? selectedAgentForCustomize._id;
    if (agentId) fetchIngestStatusForAgent(agentId);
  }, [isSuperpowersModalOpen, selectedAgentForCustomize, fetchIngestStatusForAgent]);

  const fetchCreateFlowIngestStatus = useCallback(async () => {
    if (!createdAgentId) return;
    setCreateFlowIngestStatusLoading(true);
    try {
      const status = await customAgentAPI.getIngestStatus(createdAgentId);
      setCreateFlowIngestStatus({
        collection: status.collection,
        totalVectors: status.totalVectors ?? (status as { total_vectors?: number }).total_vectors,
        documents: status.documents ?? (status as { document_count?: number }).document_count,
      });
    } catch {
      setCreateFlowIngestStatus(null);
    } finally {
      setCreateFlowIngestStatusLoading(false);
    }
  }, [createdAgentId]);

  const handleCrawlWebsite = async () => {
    if (!createdAgentId || !crawlUrl.trim()) return;
    if (!isValidUrl(crawlUrl)) {
      toast.error("Please enter a valid URL");
      return;
    }
    setIsCrawling(true);
    const minLoadingMs = 1500;
    const start = Date.now();
    try {
      const res = await customAgentAPI.ingestCrawler(createdAgentId, {
        url: normalizeUrl(crawlUrl),
        max_depth: crawlDepth,
        mode: ingestMode,
      });
      toast.success("Crawl started", { description: "Website content is being ingested." });
      const jobId =
        (res as { jobId?: string }).jobId ??
        (res as { job_id?: string }).job_id ??
        (res as { id?: string }).id;
      if (jobId) {
        setCrawlProgress({ status: "running", progress: 0, message: "Starting crawl..." });
        // Use GET /progress/{jobId}, then GET /ingest/status in onComplete
        pollJobProgress(createdAgentId, jobId, "Crawl", setCrawlProgress, fetchCreateFlowIngestStatus);
      } else {
        // Backend didn't return a job id; fetch current ingest status once.
        fetchCreateFlowIngestStatus();
      }
    } catch (err: unknown) {
      toast.error("Crawl failed", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < minLoadingMs) {
        await new Promise((r) => setTimeout(r, minLoadingMs - elapsed));
      }
      setIsCrawling(false);
    }
  };

  const handleUploadFiles = async () => {
    if (!createdAgentId || knowledgeFiles.length === 0) return;
    setIsUploading(true);
    try {
      const res = await customAgentAPI.ingestFiles(createdAgentId, { files: knowledgeFiles, mode: ingestMode });
      toast.success("Files uploaded", { description: "Documents are being processed." });
      setKnowledgeFiles([]);
      const jobId =
        (res as { jobId?: string }).jobId ??
        (res as { job_id?: string }).job_id ??
        (res as { id?: string }).id;
      if (jobId) {
        setIngestProgress({ status: "running", progress: 0, message: "Processing files..." });
        // Use GET /progress/{jobId}, then GET /ingest/status in onComplete
        pollJobProgress(createdAgentId, jobId, "File ingest", setIngestProgress, fetchCreateFlowIngestStatus);
      } else {
        // No async job id; fetch a single ingest/status snapshot.
        fetchCreateFlowIngestStatus();
      }
    } catch (err: unknown) {
      toast.error("Upload failed", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleKnowledgeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) setKnowledgeFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeKnowledgeFile = (index: number) => {
    setKnowledgeFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openEditDialog = async (agent: Agent) => {
    const agentId = agent.id ?? agent._id;
    setSelectedAgentForEdit(agent);
    setIsEditDialogOpen(true);
    setEditName(agent.name);
    setEditSystemPrompt(agent.systemPrompt ?? agent.description ?? "");
    setEditBrandDetails(agent.brandDetails ?? "");
    setEditWelcomeMessage(agent.welcomeMessage ?? "");
    try {
      const fresh = await customAgentAPI.get(agentId);
      setEditName(fresh.name);
      setEditSystemPrompt(fresh.systemPrompt ?? "");
      setEditBrandDetails(fresh.brandDetails ?? "");
      setEditWelcomeMessage(fresh.welcomeMessage ?? "");
    } catch {
      toast.error("Failed to load agent", { description: "Using cached data." });
    }
  };

  const handleUpdateAgent = async () => {
    const agentId = selectedAgentForEdit?.id ?? selectedAgentForEdit?._id;
    if (!agentId) return;
    if (!editName.trim()) {
      toast.error("Agent name is required");
      return;
    }
    setIsUpdating(true);
    try {
      await customAgentAPI.update(agentId, {
        name: editName.trim(),
        systemPrompt: editSystemPrompt.trim() || undefined,
        brandDetails: editBrandDetails.trim() || undefined,
        welcomeMessage: editWelcomeMessage.trim() || undefined,
      });
      fetchAgents();
      toast.success("Agent updated", { description: "Changes have been saved." });
      setIsEditDialogOpen(false);
    } catch (err: unknown) {
      toast.error("Update failed", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  const normalizeUrl = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const isValidUrl = (url: string) => {
    const toTest = normalizeUrl(url);
    if (!toTest) return false;
    try {
      new URL(toTest);
      return true;
    } catch {
      return false;
    }
  };

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "PUBLISHED": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "DRAFT": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  const getPricingColor = (pricing: Agent["pricing"]) => {
    switch (pricing) {
      case "PREMIUM": return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      case "PAID": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      default: return "bg-green-500/20 text-green-500 border-green-500/30";
    }
  };

  // Superpowers Modal Handlers - uses custom-agent ingest/crawler API
  const handleSuperpowersCrawlWebsite = async () => {
    const agentId = selectedAgentForCustomize?.id ?? selectedAgentForCustomize?._id;
    if (!superpowersWebsiteUrl.trim() || !agentId) return;
    const urlToCrawl = normalizeUrl(superpowersWebsiteUrl);
    if (!isValidUrl(superpowersWebsiteUrl)) {
      toast.error("Please enter a valid URL");
      return;
    }
    setIsSuperpowersCrawling(true);
    const minLoadingMs = 1500;
    const start = Date.now();
    try {
      const res = await customAgentAPI.ingestCrawler(agentId, {
        url: urlToCrawl,
        max_depth: superpowersCrawlDepth,
        mode: superpowersIngestMode,
      });
      setSuperpowersCrawledSite({
        url: urlToCrawl,
        title: new URL(urlToCrawl).hostname,
        description: "Crawl job started — content is being ingested.",
        favicon: null,
        logo: null,
      });
      setSuperpowersCrawledUrls([{ url: urlToCrawl, title: "Homepage", isParent: true }]);
      setSuperpowersSelectedUrls([urlToCrawl]);
      toast.success("Crawl started", { description: "Website content is being ingested." });
      const jobId =
        (res as { jobId?: string }).jobId ??
        (res as { job_id?: string }).job_id ??
        (res as { id?: string }).id;
      if (jobId) {
        setSuperpowersCrawlProgress({ status: "running", progress: 0, message: "Starting crawl..." });
        pollJobProgress(agentId, jobId, "Crawl", setSuperpowersCrawlProgress, () => fetchIngestStatusForAgent(agentId));
      } else {
        // If backend doesn't return a job id, at least refresh ingest/status once.
        fetchIngestStatusForAgent(agentId);
      }
    } catch (err: unknown) {
      toast.error("Crawl failed", { description: err instanceof Error ? err.message : "Check URL and try again." });
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < minLoadingMs) {
        await new Promise((r) => setTimeout(r, minLoadingMs - elapsed));
      }
      setIsSuperpowersCrawling(false);
    }
  };
  
  const handleSuperpowersToggleUrl = (url: string) => {
    setSuperpowersSelectedUrls(prev => 
      prev.includes(url) 
        ? prev.filter(u => u !== url)
        : [...prev, url]
    );
  };
  
  const handleSuperpowersFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        file,
      }));
      setSuperpowersUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSuperpowersIngestFiles = async () => {
    const agentId = selectedAgentForCustomize?.id ?? selectedAgentForCustomize?._id;
    if (!agentId) return;
    if (superpowersUploadedFiles.length === 0) return;
    setIsSuperpowersUploading(true);
    try {
      const res = await customAgentAPI.ingestFiles(agentId, {
        files: superpowersUploadedFiles.map((f) => f.file),
        mode: superpowersIngestMode,
      });
      toast.success("Files uploaded", { description: "Documents are being processed." });
      setSuperpowersUploadedFiles([]);
      const jobId =
        (res as { jobId?: string }).jobId ??
        (res as { job_id?: string }).job_id ??
        (res as { id?: string }).id;
      if (jobId) {
        setSuperpowersIngestProgress({ status: "running", progress: 0, message: "Processing files..." });
        pollJobProgress(agentId, jobId, "File ingest", setSuperpowersIngestProgress, () => fetchIngestStatusForAgent(agentId));
      } else {
        // No job id returned; fetch one snapshot of ingest/status.
        fetchIngestStatusForAgent(agentId);
      }
    } catch (err: unknown) {
      toast.error("Upload failed", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setIsSuperpowersUploading(false);
    }
  };
  
  const handleSuperpowersToggleIntegration = (id: string) => {
    setSuperpowersSelectedIntegrations(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const fetchSuperpowersMetrics = async () => {
    const agentId = selectedAgentForCustomize?.id ?? selectedAgentForCustomize?._id;
    if (!agentId) return;
    setSuperpowersMetricsLoading(true);
    try {
      const m = await customAgentAPI.metrics(agentId);
      setSuperpowersMetrics(m);
    } catch {
      toast.error("Failed to load metrics");
      setSuperpowersMetrics(null);
    } finally {
      setSuperpowersMetricsLoading(false);
    }
  };

  const superpowersFilteredUrls = superpowersCrawledUrls.filter(url => 
    url.title.toLowerCase().includes(superpowersUrlSearchQuery.toLowerCase()) ||
    url.url.toLowerCase().includes(superpowersUrlSearchQuery.toLowerCase())
  );
  
  const superpowersFilteredIntegrations = integrations.filter(integration =>
    integration.name.toLowerCase().includes(superpowersIntegrationSearchQuery.toLowerCase()) ||
    integration.displayName.toLowerCase().includes(superpowersIntegrationSearchQuery.toLowerCase()) ||
    integration.category.toLowerCase().includes(superpowersIntegrationSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 via-muted/5 p-4 md:p-6 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center cursor-pointer"
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.img 
                src="/logo.webp" 
                alt="AKO.ai Logo" 
                className="h-auto w-full max-w-[120px] object-contain"
                animate={{
                  filter: [
                    "drop-shadow(0 0 8px rgba(255,255,255,0.4))",
                    "drop-shadow(0 0 15px rgba(255,255,255,0.7))",
                    "drop-shadow(0 0 8px rgba(255,255,255,0.4))"
                  ]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight truncate">
                Agent Store
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                Discover and manage your AI agents
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Added: Extra Create Agent Button */}
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-2 border-primary/20 hover:bg-primary/5 text-primary"
            >
              <Plus className="w-4 h-4" />
              New Agent
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Coming soon!")}
              className="gap-2 border-border/50 hover:border-primary/50"
            >
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            
            <div className="flex items-center border border-border/50 rounded-lg p-1 bg-card/50">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === "grid" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === "list" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25"
            >
              <Sparkles className="w-4 h-4" />
              Create Agent
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <span className="text-muted-foreground whitespace-nowrap">
              {agents.filter(a => a.status === "PUBLISHED").length} Active
            </span>
          </div>
          <div className="hidden sm:block text-muted-foreground">•</div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground whitespace-nowrap">
              {agents.reduce((acc, a) => acc + a.interactions, 0).toLocaleString()} Interactions
            </span>
          </div>
        </div>

        {/* Search and Quick Filters – single row, search beside Free */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="relative flex-1 min-w-[200px] sm:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents, tags, or descriptions..."
              className="w-full pl-9 pr-9 sm:pr-10 py-2.5 sm:py-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-sm sm:text-base shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Badge
            variant={selectedFilter === "all" ? "default" : "outline"}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => setSelectedFilter("all")}
          >
            All Agents
          </Badge>
          <Badge
            variant={selectedFilter === "published" ? "default" : "outline"}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => setSelectedFilter("published")}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
            Published
          </Badge>
          <Badge
            variant={selectedFilter === "premium" ? "default" : "outline"}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => setSelectedFilter("premium")}
          >
            <Star className="w-3 h-3 mr-1" />
            Premium
          </Badge>
          <Badge
            variant={selectedFilter === "free" ? "default" : "outline"}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => setSelectedFilter("free")}
          >
            Free
          </Badge>
        </div>
      </div>

      {/* Agent Grid/List */}
      {agentsLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading agents...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl border-2 border-dashed border-border/50 bg-card/30">
          <Bot className="w-16 h-16 text-muted-foreground/50" />
          <p className="text-lg font-medium text-foreground">No agents yet</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Create your first AI agent to get started. Paste a website URL to auto-fill details.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 mt-2">
            <Plus className="w-4 h-4" />
            Create Agent
          </Button>
        </div>
      ) : (
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
              : "space-y-3 sm:space-y-4"
          )}
        >
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={cn(
                viewMode === "grid" 
                  ? "h-full"
                  : "flex items-center p-4"
              )}
            >
              <Card className={cn(
                "group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 flex flex-col",
                viewMode === "grid" 
                  ? "hover:scale-[1.02]" 
                  : "flex-1"
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <CardHeader className="pb-2 pt-4 px-4 flex-shrink-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 flex items-center justify-center">
                          <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start gap-1.5">
                          <CardTitle className="text-sm sm:text-base font-bold truncate group-hover:text-primary transition-colors leading-tight">
                            {agent.name}
                          </CardTitle>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] sm:text-[10px] px-1 py-0 font-medium shrink-0",
                              getStatusColor(agent.status)
                            )}
                          >
                            {agent.status}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] sm:text-[10px] px-1 py-0 font-medium shrink-0",
                              getPricingColor(agent.pricing)
                            )}
                          >
                            {agent.pricing}
                          </Badge>
                          <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-muted-foreground shrink-0">
                            <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">
                              {Math.floor((Date.now() - agent.lastActive.getTime()) / 3600000)}h ago
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 hover:bg-muted relative z-10 flex-shrink-0"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 z-[100]">
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedAgentForCustomize(agent);
                            setSuperpowersTab("website");
                            setIsSuperpowersModalOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Customize
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => openEditDialog(agent)}
                          className="cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            toast.info("Share Agent feature coming soon!");
                          }}
                          className="cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Share Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            toast.info("View Code feature coming soon!");
                          }}
                          className="cursor-pointer"
                        >
                          <Code className="w-4 h-4 mr-2" />
                          View Code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={async () => {
                            const agentId = agent.id ?? agent._id;
                            if (!agentId) return;
                            try {
                              await customAgentAPI.delete(agentId);
                              if (selectedAgentForEdit?.id === agentId) setIsEditDialogOpen(false);
                              if (selectedAgentForCustomize?.id === agentId) setIsSuperpowersModalOpen(false);
                              fetchAgents();
                              toast.success("Agent deleted");
                            } catch (err) {
                              toast.error("Delete failed", { description: err instanceof Error ? err.message : "Please try again." });
                            }
                          }}
                          className="text-destructive cursor-pointer"
                        >
                          Delete Agent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {agent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 overflow-hidden">
                      {agent.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] bg-secondary/50 text-muted-foreground border border-border/50 font-medium truncate max-w-[100px] sm:max-w-[120px]"
                          title={tag}
                        >
                          {tag}
                        </span>
                      ))}
                      {agent.tags.length > 3 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] bg-secondary/50 text-muted-foreground border border-border/50 font-medium">
                          +{agent.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </CardHeader>

                <CardContent className={cn(
                  "flex-1 flex flex-col overflow-hidden px-4 pb-3",
                  viewMode === "list" ? "flex-1" : ""
                )}>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-snug mb-2 flex-shrink-0">
                    {agent.description}
                  </CardDescription>
                  
                  <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs min-w-0">
                      <div className="flex items-center gap-1 min-w-0">
                        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="font-semibold text-foreground truncate">
                          {agent.interactions.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground hidden sm:inline truncate">
                          interactions
                        </span>
                        <span className="text-muted-foreground sm:hidden truncate">
                          int.
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-primary/10 flex-shrink-0"
                        onClick={() => toast.info(`Sharing ${agent.name}`)}
                      >
                        <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1 text-[10px] sm:text-xs px-2 h-6 sm:h-7 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 flex-shrink-0"
                        onClick={() => window.open(`/dashboard/agent-store/${agent.id || agent._id}/chat?widget=1`, "_blank")}
                      >
                        <PlayCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">Interact</span>
                        <span className="sm:hidden">Chat</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>

                {viewMode === "grid" && (
                  <CardFooter className="pt-2 pb-3 px-4 flex-shrink-0">
                    <Progress value={Math.min(agent.interactions / 100, 100)} className="h-1" />
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      )}

      {/* Create Agent Dialog - Multi-step with fixed header/footer and scrollable body */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-background border border-border shadow-2xl dark:shadow-none dark:border-border/50 sm:rounded-2xl">
          {/* Fixed Header */}
          <div className="shrink-0 px-6 pr-12 py-4 border-b border-border bg-card/50 dark:bg-card/30">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => createStep === "details" ? setIsCreateDialogOpen(false) : setCreateStep(createStep === "crawl" ? "details" : createStep === "knowledge" ? "crawl" : createStep === "integrations" ? "knowledge" : "integrations")}
                className="rounded-xl shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant="secondary" className="text-xs font-medium">
                    Step {createStep === "details" ? 1 : createStep === "crawl" ? 2 : createStep === "knowledge" ? 3 : createStep === "integrations" ? 4 : 5} of 5
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-semibold text-foreground truncate">
                  {createStep === "details" && "Create New Agent"}
                  {createStep === "crawl" && "Agent Superpowers — Crawling"}
                  {createStep === "knowledge" && "Agent Superpowers — Knowledge Files"}
                  {createStep === "integrations" && "Agent Superpowers — Integrations"}
                  {createStep === "create" && "Create Your Agent"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {createStep === "details" && "Name and personality"}
                  {createStep === "crawl" && "Add a website URL to crawl when your agent is created"}
                  {createStep === "knowledge" && "Add documents to be ingested when your agent is created"}
                  {createStep === "integrations" && "Connect external tools and services"}
                  {createStep === "create" && "Review and create. Crawling and files will be processed."}
                </p>
              </div>
            </div>
            {/* Step progress bar */}
            <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${(createStep === "details" ? 1 : createStep === "crawl" ? 2 : createStep === "knowledge" ? 3 : createStep === "integrations" ? 4 : 5) * 20}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Scrollable Body - visible scrollbar when content overflows */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
            <div className="px-6 py-5 min-h-[240px]">
              <AnimatePresence mode="wait">
                {createStep === "details" ? (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Agent Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="e.g., My Support Bot"
                        className="h-11 rounded-xl bg-background border border-input focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">System Prompt (optional)</label>
                      <Textarea
                        value={agentDescription}
                        onChange={(e) => setAgentDescription(e.target.value)}
                        placeholder="You are a helpful customer support agent..."
                        rows={3}
                        className="rounded-xl bg-background border border-input focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">Brand Details (optional)</label>
                      <Textarea
                        value={brandDetails}
                        onChange={(e) => setBrandDetails(e.target.value)}
                        placeholder="Company info, products, tone of voice..."
                        rows={2}
                        className="rounded-xl bg-background border border-input focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">Welcome Message (optional)</label>
                      <Input
                        value={welcomeMessage}
                        onChange={(e) => setWelcomeMessage(e.target.value)}
                        placeholder="Leave empty for default greeting"
                        className="h-10 rounded-xl bg-background border border-input focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </motion.div>
              ) : (
                <motion.div
                  key="post-create"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Step 2: Crawling */}
                  {createStep === "crawl" && (
                    <div className="rounded-xl border border-border bg-card/50 dark:bg-card/30 p-4 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Crawl a website and ingest its content into your agent&apos;s knowledge base.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          value={crawlUrl}
                          onChange={(e) => setCrawlUrl(e.target.value)}
                          placeholder="https://docs.example.com"
                          className="h-11 rounded-xl bg-background border border-input flex-1"
                        />
                        <Button
                          onClick={handleCrawlWebsite}
                          disabled={!crawlUrl.trim() || !isValidUrl(crawlUrl) || isCrawling || !createdAgentId}
                          className="shrink-0"
                        >
                          {isCrawling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crawl"}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-muted-foreground">Depth</label>
                          <Select value={String(crawlDepth)} onValueChange={(v) => setCrawlDepth(Number(v))}>
                            <SelectTrigger className="h-9 w-24 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-muted-foreground">Mode</label>
                          <Select value={ingestMode} onValueChange={(v) => setIngestMode(v as typeof ingestMode)}>
                            <SelectTrigger className="h-9 w-28 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="append">Append — merge with existing</SelectItem>
                              <SelectItem value="overwrite">Overwrite — reset then ingest</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[11px] text-muted-foreground">
                            {ingestMode === "append" ? "Adds to current knowledge base." : "Clears vector DB first, then ingests."}
                          </p>
                        </div>
                      </div>
                      <IngestProgressBlock progress={crawlProgress} title="Crawl job" />
                      {createStep === "crawl" && (
                        <IngestResultCard
                          loading={createFlowIngestStatusLoading}
                          status={createFlowIngestStatus}
                          label="After crawl"
                        />
                      )}
                    </div>
                  )}

                  {/* Step 3: Knowledge Files */}
                  {createStep === "knowledge" && (
                    <div className="rounded-xl border border-border bg-card/50 dark:bg-card/30 p-4 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Upload PDF, DOCX, TXT, MD, CSV, TSV, or XLSX. Files are chunked and stored in your agent&apos;s vector store (per-tenant).
                      </p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-xs font-medium text-muted-foreground">Ingest mode:</span>
                        <Select value={ingestMode} onValueChange={(v) => setIngestMode(v as typeof ingestMode)}>
                          <SelectTrigger className="h-9 w-[180px] bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="append">Append — merge with existing</SelectItem>
                            <SelectItem value="overwrite">Overwrite — reset then ingest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium text-foreground">Drop files or click to browse</span>
                        <span className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, MD, CSV, XLSX</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.docx,.txt,.md,.csv,.xlsx,.tsv"
                          onChange={handleKnowledgeFileChange}
                          className="hidden"
                        />
                      </label>
                        {knowledgeFiles.length > 0 && (
                          <div className="space-y-2">
                            {knowledgeFiles.map((file, i) => (
                              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 dark:bg-muted/30">
                                <span className="text-sm truncate">{file.name}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeKnowledgeFile(i)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              onClick={handleUploadFiles}
                              disabled={isUploading || !createdAgentId}
                              className="w-full"
                            >
                              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload & Ingest"}
                            </Button>
                            <IngestProgressBlock progress={ingestProgress} title="File ingest" />
                            {createStep === "knowledge" && (
                              <IngestResultCard
                                loading={createFlowIngestStatusLoading}
                                status={createFlowIngestStatus}
                                label="After file upload"
                              />
                            )}
                          </div>
                        )}
                    </div>
                  )}

                  {/* Step 4: Integrations */}
                  {createStep === "integrations" && (
                    <div className="rounded-xl border border-border bg-muted/30 dark:bg-muted/20 p-6 text-center">
                      <p className="text-base font-semibold text-foreground">Coming soon</p>
                      <p className="text-sm text-muted-foreground mt-1">Integrations will be available in a future update.</p>
                    </div>
                  )}

                  {/* Step 5: Final — Create Agent */}
                  {createStep === "create" && (
                    <div className="rounded-xl border border-border bg-card/50 dark:bg-card/30 p-4 space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">Agent name</span>
                        <span className="font-medium text-foreground">{agentName}</span>
                      </div>
                      {crawlUrl.trim() && isValidUrl(crawlUrl) && (
                        <div className="flex items-center justify-between py-2 border-t border-border">
                          <span className="text-sm text-muted-foreground">Website crawl</span>
                          <span className="text-sm truncate max-w-[180px] text-foreground">{crawlUrl}</span>
                        </div>
                      )}
                      {knowledgeFiles.length > 0 && (
                        <div className="flex items-center justify-between py-2 border-t border-border">
                          <span className="text-sm text-muted-foreground">Knowledge files</span>
                          <span className="text-sm text-foreground">{knowledgeFiles.length} file(s)</span>
                        </div>
                      )}
                      {createFlowIngestStatus && (createFlowIngestStatus.documents != null || createFlowIngestStatus.totalVectors != null) && (
                        <div className="flex items-center justify-between py-2 border-t border-border">
                          <span className="text-sm text-muted-foreground">Vector store (result)</span>
                          <span className="text-sm text-foreground">
                            {createFlowIngestStatus.documents != null && `${createFlowIngestStatus.documents} doc${createFlowIngestStatus.documents !== 1 ? "s" : ""}`}
                            {createFlowIngestStatus.documents != null && createFlowIngestStatus.totalVectors != null && " · "}
                            {createFlowIngestStatus.totalVectors != null && `${createFlowIngestStatus.totalVectors.toLocaleString()} vectors`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="shrink-0 flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-card/50 dark:bg-card/30">
            <Button
              variant="outline"
              onClick={() => createStep === "details" ? setIsCreateDialogOpen(false) : setCreateStep(createStep === "crawl" ? "details" : createStep === "knowledge" ? "crawl" : createStep === "integrations" ? "knowledge" : "integrations")}
              className="rounded-xl"
            >
              {createStep === "details" ? "Cancel" : "Back"}
            </Button>
            {createStep === "details" && (
              <Button
                onClick={handleProceedToSuperpowers}
                disabled={!agentName.trim() || isCreating}
                className="rounded-xl px-6 gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Next: Agent Superpowers
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
            {createStep === "crawl" && (
              <Button onClick={() => setCreateStep("knowledge")} className="rounded-xl px-6 gap-2">
                Next: Knowledge Files
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {createStep === "knowledge" && (
              <Button onClick={() => setCreateStep("integrations")} className="rounded-xl px-6 gap-2">
                Next: Integrations
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {createStep === "integrations" && (
              <Button onClick={() => setCreateStep("create")} className="rounded-xl px-6 gap-2">
                Next: Create Agent
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {createStep === "create" && (
              <Button
                onClick={handleFinalCreateAgent}
                disabled={isCreating}
                className="rounded-xl px-6 gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Create Agent
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open) setIsEditDialogOpen(false); }}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-background border border-border shadow-2xl dark:shadow-none dark:border-border/50 sm:rounded-2xl">
          {/* Fixed Header */}
          <div className="shrink-0 px-6 py-4 border-b border-border bg-card/50 dark:bg-card/30">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-semibold text-foreground">Edit Agent</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Update name, system prompt, brand details, or welcome message.
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Body - smooth scrollbar when content overflows */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
            <div className="px-6 py-5 min-h-[200px]">
              {selectedAgentForEdit && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Agent Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g., My Support Bot"
                      className="h-11 rounded-xl bg-background border border-input focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">System Prompt</label>
                    <Textarea
                      value={editSystemPrompt}
                      onChange={(e) => setEditSystemPrompt(e.target.value)}
                      placeholder="You are a helpful customer support agent..."
                      rows={3}
                      className="rounded-xl bg-background border border-input focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Brand Details</label>
                    <Textarea
                      value={editBrandDetails}
                      onChange={(e) => setEditBrandDetails(e.target.value)}
                      placeholder="Company info, products, tone of voice..."
                      rows={2}
                      className="rounded-xl bg-background border border-input focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Welcome Message</label>
                    <Input
                      value={editWelcomeMessage}
                      onChange={(e) => setEditWelcomeMessage(e.target.value)}
                      placeholder="Leave empty for default greeting"
                      className="h-10 rounded-xl bg-background border border-input focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="shrink-0 flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-card/50 dark:bg-card/30">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            {selectedAgentForEdit && (
              <Button
                onClick={handleUpdateAgent}
                disabled={!editName.trim() || isUpdating}
                className="rounded-xl px-6 gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Superpowers Modal */}
      <Dialog open={isSuperpowersModalOpen} onOpenChange={(open) => {
          if (!open) {
            setSuperpowersMetrics(null);
            setSuperpowersCrawlProgress(null);
            setSuperpowersIngestProgress(null);
          }
          setIsSuperpowersModalOpen(open);
        }}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0 dark:bg-[#0a0a0a] bg-background border-border/50 rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Agent Superpowers
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Enhance your agent with additional capabilities
                </DialogDescription>
              </div>
              <Popover onOpenChange={(o) => { if (o) fetchSuperpowersMetrics(); }}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 shrink-0" disabled={!selectedAgentForCustomize}>
                    <BarChart3 className="w-4 h-4" />
                    Metrics
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-4" align="end">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Agent Metrics</h4>
                    <p className="text-xs text-muted-foreground">System metrics from the RAG server (scoped to this agent)</p>
                    {superpowersMetricsLoading ? (
                      <div className="flex items-center gap-2 py-6">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
                      </div>
                    ) : superpowersMetrics ? (
                      <pre className="text-xs bg-muted/50 rounded-lg p-3 overflow-auto max-h-64 font-mono">
                        {JSON.stringify(superpowersMetrics, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4">No metrics available.</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </DialogHeader>

          <Tabs value={superpowersTab} onValueChange={(v) => setSuperpowersTab(v as typeof superpowersTab)} className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="px-6 pt-4 border-b border-border/50 shrink-0">
              <TabsList className="grid w-full grid-cols-3 bg-transparent">
                <TabsTrigger 
                  value="website" 
                  className="data-[state=active]:bg-background/50 data-[state=active]:text-foreground"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Crawling
                </TabsTrigger>
                <TabsTrigger 
                  value="files"
                  className="data-[state=active]:bg-background/50 data-[state=active]:text-foreground"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Knowledge Files
                </TabsTrigger>
                <TabsTrigger 
                  value="integrations" 
                  className="data-[state=active]:bg-background/50 data-[state=active]:text-foreground"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Integrations
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
              {/* Vector store result — GET /ingest/status (shown when loading or after crawl/file ingest) */}
              {(ingestStatusLoading || ingestStatus) && (
                <div className="mb-4">
                  <IngestResultCard
                    loading={ingestStatusLoading}
                    status={ingestStatus}
                    label="This agent"
                  />
                </div>
              )}

              {/* Crawling Tab - First in Customize flow */}
              <TabsContent value="website" className="mt-0 space-y-4">
                <div className="rounded-xl border border-border/50 bg-card/30 p-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Crawl a URL with Playwright; content is embedded and stored in your agent&apos;s vector store (per-tenant). Choose depth and mode.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={superpowersWebsiteUrl}
                      onChange={(e) => setSuperpowersWebsiteUrl(e.target.value)}
                      placeholder="https://docs.example.com"
                      className="flex-1 h-10 rounded-lg"
                    />
                    <Button
                      onClick={handleSuperpowersCrawlWebsite}
                      disabled={!superpowersWebsiteUrl.trim() || isSuperpowersCrawling || !isValidUrl(superpowersWebsiteUrl)}
                      className="shrink-0 min-w-[100px]"
                    >
                      {isSuperpowersCrawling ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="ml-2">Crawling...</span>
                        </>
                      ) : (
                        "Crawl"
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-muted-foreground">Depth</label>
                      <Select value={String(superpowersCrawlDepth)} onValueChange={(v) => setSuperpowersCrawlDepth(Number(v))}>
                        <SelectTrigger className="h-9 w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">Link depth to follow</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-muted-foreground">Mode</label>
                      <Select value={superpowersIngestMode} onValueChange={(v) => setSuperpowersIngestMode(v as typeof superpowersIngestMode)}>
                        <SelectTrigger className="h-9 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="append">Append — merge with existing</SelectItem>
                          <SelectItem value="overwrite">Overwrite — reset then ingest</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">
                        {superpowersIngestMode === "append" ? "Adds to current knowledge." : "Clears vector DB first."}
                      </p>
                    </div>
                  </div>
                  {(superpowersCrawledSite || superpowersCrawledUrls.length > 0) && !superpowersCrawlProgress && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 pt-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {superpowersCrawledSite?.description || "Crawl job started."}
                    </div>
                  )}
                  <IngestProgressBlock progress={superpowersCrawlProgress} title="Crawl job" className="border-border/50" />
                </div>
              </TabsContent>

              {/* Knowledge Files Tab */}
              <TabsContent value="files" className="mt-0 space-y-4">
                <div className="rounded-xl border border-border/50 bg-card/30 p-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload PDF, DOCX, TXT, MD, CSV, TSV, or XLSX. Files are chunked and stored in your agent&apos;s vector store (same tenant as crawl).
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground">Ingest mode:</span>
                    <Select value={superpowersIngestMode} onValueChange={(v) => setSuperpowersIngestMode(v as typeof superpowersIngestMode)}>
                      <SelectTrigger className="h-9 w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="append">Append — merge with existing</SelectItem>
                        <SelectItem value="overwrite">Overwrite — reset then ingest</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      {superpowersIngestMode === "append" ? "Adds to current knowledge." : "Clears vector DB first."}
                    </p>
                  </div>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium text-foreground">Drop files or click to browse</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt,.md,.csv,.xlsx,.tsv"
                      onChange={handleSuperpowersFileUpload}
                      className="hidden"
                    />
                  </label>
                  {superpowersUploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {superpowersUploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setSuperpowersUploadedFiles(prev => prev.filter((_, i) => i !== index))}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button onClick={handleSuperpowersIngestFiles} disabled={isSuperpowersUploading} className="w-full">
                        {isSuperpowersUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload & Ingest"}
                      </Button>
                      <IngestProgressBlock progress={superpowersIngestProgress} title="File ingest" className="border-border/50" />
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Integrations Tab - Coming soon */}
              <TabsContent value="integrations" className="mt-0 space-y-4">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
                  <p className="text-lg font-semibold text-foreground">Coming soon</p>
                  <p className="text-sm text-muted-foreground mt-1">Integrations will be available in a future update.</p>
                </div>
              </TabsContent>

            </div>

            <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between shrink-0">
              <Button
                variant="outline"
                onClick={() => setIsSuperpowersModalOpen(false)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={() => {
                  toast.success("Agent superpowers updated!", {
                    description: "Your agent has been enhanced with the selected capabilities.",
                  });
                  setIsSuperpowersModalOpen(false);
                }}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentStorePage;