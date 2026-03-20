"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Image,
  Video,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
  Image as ImageIcon,
  Bot,
  Heart,
  Bookmark,
  Share2,
  Grid3x3,
  List,
  Loader2,
  Lock,
  Globe,
  Eye,
  Music,
  Headset,
  Search,
  Database,
  BarChart3,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import ImageDetailModal from "@/components/feed/ImageDetailModal";
import { FeedItem } from "@/components/feed/FeedCard";
import { galleryAPI, authAPI, modelRegistryAPI, customAgentAPI } from "@/lib/api";
import { galleryItemToFeedItem, galleryItemToAgentItem, type AgentItemFromGallery } from "@/lib/galleryUtils";

const quickActions = [
  {
    icon: MessageSquare,
    label: "Chat Agent",
    path: "/dashboard/tools-old/agent",
    color: "from-blue-600 to-cyan-500",
    subtitle: "Start a new conversation with your AI agent.",
    cta: "Get started",
  },
  {
    icon: Image,
    label: "Generate Image",
    path: "/dashboard/tools-old/image",
    color: "from-purple-600 to-pink-500",
    subtitle: "Create marketing visuals, thumbnails, and more.",
    cta: "Get started",
  },
];

interface AgentItem {
  id: number | string;
  name: string;
  description: string;
  avatar: string;
  model: string;
  createdAt: string;
  interactions: number;
  status: "active" | "inactive";
}

const defaultStats = [
  { label: "Generations Today", value: "24", change: "+12%", icon: Sparkles },
  { label: "Credits Used", value: "2,549", change: "51%", icon: Zap },
];

// Shared class for top summary cards (actions, stats, dashboards)
const summaryCardBase =
  "glass-card rounded-2xl p-5 flex flex-col h-full border border-border/60 bg-gradient-to-b from-background/80 to-background/60 shadow-sm transition-all duration-200 hover:shadow-xl hover:border-primary/60 hover:-translate-y-0.5";

type VisibilityFilter = "all" | "public" | "private";

const DashboardHome = () => {
  const [activeTab, setActiveTab] = useState<"images" | "videos" | "agents" | "audio">("images");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<FeedItem[]>([]);
  const [galleryStats, setGalleryStats] = useState<{ totalItems?: number; byContentType?: Record<string, number> } | null>(null);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [galleryAgents, setGalleryAgents] = useState<AgentItemFromGallery[]>([]);
  const [customAgents, setCustomAgents] = useState<AgentItem[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [modelFilter, setModelFilter] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<{ modelId: string; displayName: string }[]>([]);
  const nextPageRef = useRef(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"createdAt" | "rating">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    modelRegistryAPI.getModels().then((data) => {
      const image = data.image ?? [];
      const video = data.video ?? [];
      const combined = [...image, ...video.filter((v) => !image.some((i) => i.modelId === v.modelId))];
      setAvailableModels(combined.map((m) => ({ modelId: m.modelId, displayName: m.displayName || m.modelId })));
    }).catch(() => {});
  }, []);

  const fetchGallery = useCallback(async (append = false) => {
    if (!append) {
      setIsLoadingGallery(true);
      setGalleryError(null);
      nextPageRef.current = 1;
    } else {
      setLoadMoreLoading(true);
    }
    const pageToFetch = append ? nextPageRef.current : 1;
    try {
      const isAuth = authAPI.isAuthenticated();
      const baseParams = {
        page: pageToFetch,
        limit: 20,
        sortBy,
        sortOrder,
        ...(modelFilter && { modelId: modelFilter }),
      };
      const contentTypeMap = {
        images: undefined,
        videos: "video" as const,
        agents: "llm" as const,
        audio: "audio" as const,
      };
      const galleryParams = {
        ...baseParams,
        ...(isAuth && visibilityFilter !== "all" && { isPrivate: visibilityFilter === "private" }),
        ...(contentTypeMap[activeTab] && { contentType: contentTypeMap[activeTab] }),
      };
      const publicParams = {
        ...baseParams,
        ...(contentTypeMap[activeTab] && { contentType: contentTypeMap[activeTab] }),
      };
      const [res, statsRes] = await Promise.all([
        isAuth
          ? galleryAPI.getMyGallery(galleryParams)
          : galleryAPI.getPublicGallery(publicParams),
        isAuth && !append ? galleryAPI.getMyStats().catch(() => null) : Promise.resolve(null),
      ]);
      const allItems = res.items || [];
      const feedItems = allItems
        .map(galleryItemToFeedItem)
        .filter((x): x is FeedItem => x !== null);
      const agentItems = allItems
        .map(galleryItemToAgentItem)
        .filter((x): x is AgentItemFromGallery => x !== null);
      if (append) {
        setGalleryItems((prev) => [...prev, ...feedItems]);
        setGalleryAgents((prev) => [...prev, ...agentItems]);
      } else {
        setGalleryItems(feedItems);
        setGalleryAgents(agentItems);
      }
      setTotalPages(res.totalPages ?? 1);
      setHasMore((res.page ?? 1) < (res.totalPages ?? 1));
      nextPageRef.current = pageToFetch + 1;
      if (!append && statsRes) setGalleryStats(statsRes);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load gallery";
      setGalleryError(msg);
      if (!append) {
        setGalleryItems([]);
        setGalleryAgents([]);
        setGalleryStats(null);
      }
      if (msg.includes("sign in")) {
        toast.error("Please sign in to view your gallery");
      }
    } finally {
      setIsLoadingGallery(false);
      setLoadMoreLoading(false);
    }
  }, [visibilityFilter, modelFilter, activeTab, sortBy, sortOrder]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    if (activeTab !== "agents") return;
    setIsLoadingAgents(true);
    customAgentAPI
      .list()
      .then((list) => {
        const agents = (Array.isArray(list) ? list : []).map((a) => ({
          id: a._id,
          name: a.name,
          description: a.systemPrompt || a.brandDetails || "Custom AI agent",
          avatar: "",
          model: "RAG",
          createdAt: a.createdAt || new Date().toISOString(),
          interactions: 0,
          status: "active" as const,
        }));
        setCustomAgents(agents);
      })
      .catch(() => {
        setCustomAgents([]);
      })
      .finally(() => setIsLoadingAgents(false));
  }, [activeTab]);

  const handleToggleVisibility = async (item: FeedItem) => {
    if (!item.galleryId || togglingId) return;
    setTogglingId(item.galleryId);
    const newIsPrivate = !item.isPrivate;

    // Optimistic update: flip visibility in local state immediately
    setGalleryItems((prev) => {
      const updated = prev.map((i) =>
        i.galleryId === item.galleryId ? { ...i, isPrivate: newIsPrivate } : i
      );
      // If viewing filtered tab, remove item that no longer matches
      if (visibilityFilter === "public" && newIsPrivate) {
        return updated.filter((i) => i.galleryId !== item.galleryId);
      }
      if (visibilityFilter === "private" && !newIsPrivate) {
        return updated.filter((i) => i.galleryId !== item.galleryId);
      }
      return updated;
    });
    // Update modal item if it's the one being toggled
    if (selectedItem?.galleryId === item.galleryId) {
      setSelectedItem({ ...selectedItem, isPrivate: newIsPrivate });
    }

    try {
      await galleryAPI.updateGalleryItem(item.galleryId, { isPrivate: newIsPrivate });
      toast.success(item.isPrivate ? "Now visible to everyone" : "Now private");
      fetchGallery();
    } catch {
      toast.error("Failed to update visibility");
      // Revert: refetch to restore correct state
      fetchGallery();
    } finally {
      setTogglingId(null);
    }
  };

  // Deduplicate before creating display arrays. The API can return items with identical mediaUrls but different IDs.
  const uniqueItems = Array.from(new Map(galleryItems.map(item => [item.mediaUrl, item])).values());
  const galleryImages = uniqueItems.filter((i: FeedItem) => i.type === "image");
  const galleryVideos = uniqueItems.filter((i: FeedItem) => i.type === "video");
  const galleryAudios = uniqueItems.filter((i: FeedItem) => i.type === "audio");
  
  const displayImages = galleryImages;
  const displayVideos = galleryVideos;
  const displayAudios = galleryAudios;
  const displayAgents: AgentItem[] = activeTab === "agents" ? customAgents : galleryAgents.map((a) => ({ ...a, id: a.id, interactions: a.interactions }));

  // Use galleryStats for tab counts when available (real totals), else fall back to displayed items
  const imagesCount = authAPI.isAuthenticated() && galleryStats?.byContentType
    ? (galleryStats.byContentType.image ?? 0) + (galleryStats.byContentType.image_to_image ?? 0)
    : displayImages.length;
  const videosCount = authAPI.isAuthenticated() && galleryStats?.byContentType
    ? (galleryStats.byContentType.video ?? 0)
    : displayVideos.length;
  const audioCount = authAPI.isAuthenticated() && galleryStats?.byContentType
    ? (galleryStats.byContentType.audio ?? 0)
    : displayAudios.length;
  const agentsCount = activeTab === "agents" ? customAgents.length : (authAPI.isAuthenticated() && galleryStats?.byContentType
    ? (galleryStats.byContentType.llm ?? displayAgents.length)
    : displayAgents.length);

  const handleLike = (id: number | string) => {
    toast.success("Liked!");
  };

  const handleSave = (id: number | string) => {
    toast.success("Saved!");
  };

  const handleShare = (id: number | string) => {
    toast.success("Shared!");
  };

  const handleOpenComments = (id: number | string) => {
    toast.info("Comments feature coming soon!");
  };

  const handleOpenDetail = (id: number | string) => {
    const item =
      activeTab === "images"
        ? displayImages.find((i) => i.id === id)
        : displayVideos.find((i) => i.id === id);
    if (item) {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  const getCurrentItems = () => {
    if (activeTab === "images") return displayImages;
    if (activeTab === "videos") return displayVideos;
    if (activeTab === "audio") return displayAudios;
    return [];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    // UPDATED: Removed max-w-6xl and mx-auto, changed to w-full and h-full with adjusted padding
    <div className="space-y-8 w-full h-full px-4 md:px-8 py-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back! <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            What would you like to create today?
          </p>
        </div>
        <Link href="/dashboard/tools">
          <Button
            variant="hero"
            size="lg"
            className="gap-2 shadow-md px-6 py-3 text-base font-medium transition-transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            New Creation
          </Button>
        </Link>
      </motion.div>

      {/* Top summary grid: left 2x2 (actions+stats), right 2x2 (dashboards) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)] gap-6"
      >
        {/* Left column: Chat Agent, Generate Image, Generations Today, Credits Used */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Chat Agent + Generate Image */}
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.path} tabIndex={-1}>
                <div
                  className={`${summaryCardBase} py-6 flex flex-col group cursor-pointer`}
                  tabIndex={0}
                  role="button"
                  aria-label={action.label}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1.5">
                    {action.label}
                  </h3>
                  {action.subtitle && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {action.subtitle}
                    </p>
                  )}
                  <div className="mt-auto flex items-center gap-1 text-sm text-primary group-hover:text-primary/90 transition-colors">
                    <span>{action.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Generations Today */}
          <div className={summaryCardBase}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Generations Today
              </span>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">24</span>
              <span className="text-sm font-medium text-emerald-500 mb-1">+12%</span>
            </div>
          </div>

          {/* Credits Used */}
          <div className={summaryCardBase}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Credits Used
              </span>
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">2,549</span>
              <span className="text-sm font-medium text-muted-foreground mb-1">51%</span>
            </div>
          </div>
        </div>

        {/* Right column: Enhanced dashboard cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Support Agent Dashboard */}
          <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/30 dark:to-card border border-border/50 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Headset className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Support Agent</h3>
            <p className="text-xs text-muted-foreground mb-4">Ticket management & SLA tracking</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Open Tickets</span>
                <span className="text-sm font-semibold text-foreground">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">SLA Compliance</span>
                <span className="text-sm font-semibold text-emerald-600">94.2%</span>
              </div>
            </div>
          </div>

          {/* SEO Engine Dashboard */}
          <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 to-white dark:from-sky-950/30 dark:to-card border border-border/50 hover:border-sky-200 dark:hover:border-sky-800 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
                Optimizing
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">SEO Engine</h3>
            <p className="text-xs text-muted-foreground mb-4">Rankings & keyword tracking</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Keywords</span>
                <span className="text-sm font-semibold text-foreground">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Growth</span>
                <span className="text-sm font-semibold text-sky-600">+18%</span>
              </div>
            </div>
          </div>

          {/* Data Analysis Dashboard */}
          <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/30 dark:to-card border border-border/50 hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Database className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Active
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Data Analysis</h3>
            <p className="text-xs text-muted-foreground mb-4">Insights & report generation</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Reports</span>
                <span className="text-sm font-semibold text-foreground">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Last Run</span>
                <span className="text-sm font-semibold text-foreground">2h ago</span>
              </div>
            </div>
          </div>

          {/* MoM Master Dashboard */}
          <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-violet-50/80 to-white dark:from-violet-950/30 dark:to-card border border-border/50 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                Updated
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">MoM Master</h3>
            <p className="text-xs text-muted-foreground mb-4">Meeting notes & follow-ups</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Meetings</span>
                <span className="text-sm font-semibold text-foreground">9</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pending</span>
                <span className="text-sm font-semibold text-violet-600">3</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Creation History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        {/* Main content type tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-2">
          <button
            onClick={() => setActiveTab("images")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "images"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Images ({imagesCount})
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "videos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video className="w-4 h-4" />
            Videos ({videosCount})
          </button>
          <button
            onClick={() => setActiveTab("agents")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "agents"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bot className="w-4 h-4" />
            Agents ({agentsCount})
          </button>
          <button
            onClick={() => setActiveTab("audio")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "audio"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Music className="w-4 h-4" />
            Audio ({audioCount})
          </button>
          {activeTab !== "agents" && availableModels.length > 0 && (
            <div className="flex items-center gap-2 ml-2">
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary/30 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All models</option>
                {availableModels.map((m) => (
                  <option key={m.modelId} value={m.modelId}>{m.displayName}</option>
                ))}
              </select>
            </div>
          )}
          {activeTab !== "agents" && (
            <div className="flex items-center gap-1 ml-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [s, o] = e.target.value.split("-") as ["createdAt" | "rating", "asc" | "desc"];
                  setSortBy(s);
                  setSortOrder(o);
                }}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary/30 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="createdAt-desc">Newest first</option>
                <option value="createdAt-asc">Oldest first</option>
                <option value="rating-desc">Highest rated</option>
                <option value="rating-asc">Lowest rated</option>
              </select>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1 p-1 rounded-lg bg-secondary/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Public/Private sub-tabs + Create button - inside Images, Videos, Audio */}
        {activeTab !== "agents" && (
          <div className="flex flex-wrap items-center gap-4">
            {authAPI.isAuthenticated() && (
              <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border/50 w-fit">
                <button
                  onClick={() => setVisibilityFilter("all")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    visibilityFilter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="All"
                >
                  <Eye className="w-4 h-4" />
                  All
                </button>
                <button
                  onClick={() => setVisibilityFilter("public")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    visibilityFilter === "public" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Public only"
                >
                  <Globe className="w-4 h-4" />
                  Public
                </button>
                <button
                  onClick={() => setVisibilityFilter("private")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    visibilityFilter === "private" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Private only"
                >
                  <Lock className="w-4 h-4" />
                  Private
                </button>
              </div>
            )}
            {activeTab === "images" && (
              <Link href="/dashboard/tools-old/image">
                <Button variant="default" size="sm" className="gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Create Image
                </Button>
              </Link>
            )}
          </div>
        )}
        {activeTab === "agents" && (
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard/agent-store">
              <Button variant="default" size="sm" className="gap-2">
                <Bot className="w-4 h-4" />
                Create Agent
              </Button>
            </Link>
          </div>
        )}

        {/* Content Display */}
        {galleryError && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-4">
            <span>{galleryError}</span>
            {galleryError.includes("sign in") && (
              <Link href="/auth/sign-in">
                <Button variant="outline" size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        )}
        {activeTab === "agents" ? (
          isLoadingAgents ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">
                {authAPI.isAuthenticated() ? "Loading your agents..." : "Loading agents..."}
              </p>
            </div>
          ) : displayAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
                <Bot className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                No agents yet. Create one to get started.
              </p>
              <Link href="/dashboard/agent-store">
                <Button variant="default" size="sm" className="gap-2">
                  <Bot className="w-4 h-4" />
                  Create Agent
                </Button>
              </Link>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayAgents.map((agent) => (
              <Link key={agent.id} href={`/dashboard/agent-store/${agent.id}/chat`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{agent.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          agent.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{agent.model}</span>
                      <span>Chat →</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              </Link>
            ))}
          </div>
          )
        ) : (
          <div>
            {isLoadingGallery ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">
                  {authAPI.isAuthenticated() ? "Loading your creations..." : "Loading gallery..."}
                </p>
              </div>
            ) : getCurrentItems().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
                  {activeTab === "images" ? (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  ) : activeTab === "videos" ? (
                    <Video className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Music className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {authAPI.isAuthenticated()
                    ? activeTab === "images"
                      ? "No images yet. Create your first image."
                      : activeTab === "videos"
                        ? "No videos yet. Create your first video."
                        : "No audio yet. Start generating to see them here."
                    : "Sign in to view your gallery."}
                </p>
                {authAPI.isAuthenticated() && (
                  <Link href={activeTab === "images" ? "/dashboard/tools-old/image" : activeTab === "videos" ? "/dashboard/tools-old/video" : "/dashboard/tools"}>
                    <Button variant="default" size="sm" className="gap-2">
                      {activeTab === "images" && <ImageIcon className="w-4 h-4" />}
                      {activeTab === "videos" && <Video className="w-4 h-4" />}
                      {activeTab === "audio" && <Music className="w-4 h-4" />}
                      {activeTab === "images" ? "Create Image" : activeTab === "videos" ? "Create Video" : "Create something"}
                    </Button>
                  </Link>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {getCurrentItems().map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-secondary/20 cursor-pointer"
                    onClick={() => handleOpenDetail(item.id)}
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                    ) : item.type === "audio" ? (
                      <div className="w-full h-full bg-secondary/50 flex flex-col items-center justify-center p-4">
                        <Music className="w-8 h-8 text-primary/50 mb-4" />
                        <audio
                          src={item.mediaUrl}
                          controls
                          className="w-[90%] h-10 relative z-20"
                          onClick={(e) => e.stopPropagation()}
                          controlsList="nodownload"
                        />
                      </div>
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.prompt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        {authAPI.isAuthenticated() && item.galleryId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white hover:text-white hover:bg-white/20"
                            onClick={(e) => { e.stopPropagation(); handleToggleVisibility(item); }}
                            disabled={togglingId === item.galleryId}
                            title={item.isPrivate ? "Make public" : "Make private"}
                          >
                            {togglingId === item.galleryId ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : item.isPrivate ? (
                              <Lock className="w-3 h-3" />
                            ) : (
                              <Globe className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                        <div className="bg-black/50 p-1 rounded-lg backdrop-blur-md ml-auto">
                          {item.type === 'video' ? <Video className="w-3 h-3 text-white" /> : item.type === 'audio' ? <Music className="w-3 h-3 text-white" /> : <ImageIcon className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white text-xs line-clamp-2 font-medium drop-shadow-md">{item.prompt}</p>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleLike(item.id); }}>
                            <Heart className={`w-3 h-3 ${item.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleSave(item.id); }}>
                            <Bookmark className={`w-3 h-3 ${item.isSaved ? 'fill-white' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleShare(item.id); }}>
                            <Share2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {getCurrentItems().map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 p-4 rounded-xl glass-card hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleOpenDetail(item.id)}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary/50 flex-shrink-0">
                      {item.type === "video" ? (
                        <video
                          src={item.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : item.type === "audio" ? (
                        <div 
                          className="w-full h-full flex items-center justify-center text-muted-foreground relative z-20" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <audio 
                            src={item.mediaUrl} 
                            controls 
                            className="w-[90%] h-10 mt-2"
                            controlsList="nodownload"
                          />
                        </div>
                      ) : (
                        <img
                          src={item.mediaUrl}
                          alt={item.prompt}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-1 line-clamp-2">
                        {item.prompt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <span>{item.model}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.createdAt)}
                        </span>
                        {authAPI.isAuthenticated() && item.galleryId && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleVisibility(item); }}
                            disabled={togglingId === item.galleryId}
                            className="flex items-center gap-1 hover:text-foreground"
                            title={item.isPrivate ? "Make public" : "Make private"}
                          >
                            {togglingId === item.galleryId ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : item.isPrivate ? (
                              <Lock className="w-3 h-3" />
                            ) : (
                              <Globe className="w-3 h-3" />
                            )}
                            {item.isPrivate ? "Private" : "Public"}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-foreground">
                          <Heart className="w-3 h-3" />
                          {item.likes}
                        </span>
                        <span className="text-muted-foreground">
                          {item.comments} comments
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {hasMore && !isLoadingGallery && getCurrentItems().length > 0 && (
              <div className="flex justify-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => fetchGallery(true)}
                  disabled={loadMoreLoading}
                  className="gap-2"
                >
                  {loadMoreLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* View All Link */}
        <div className="flex justify-center pt-4">
          <Link
            href="/dashboard/feed"
            className="text-sm text-primary hover:underline outline-none focus:underline flex items-center gap-2"
          >
            View all creations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Image/Video Detail Modal */}
      <ImageDetailModal
        isOpen={isModalOpen}
        item={selectedItem}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onLike={handleLike}
        onSave={handleSave}
        onShare={handleShare}
        onOpenComments={handleOpenComments}
        onToggleVisibility={handleToggleVisibility}
        togglingId={togglingId}
      />
    </div>
  );
};

export default DashboardHome;