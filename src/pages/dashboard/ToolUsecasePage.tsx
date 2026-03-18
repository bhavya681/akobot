"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Slack,
  Github,
  FileText,
  Cloud,
  Trello,
  Figma,
  Zap,
  Mail,
  Calendar,
  Database,
  Webhook,
  Plug,
  Link2,
  Unplug,
  Eye,
  ArrowRight,
  MessageCircle,
  LayoutGrid,
  ListOrdered,
  CheckSquare,
  Table,
  CreditCard,
  Building2,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  status: "connected" | "available";
  color?: string;
  logoUrl?: string;
}

const integrations: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Team communication and workflow automation.",
    icon: Slack,
    category: "Communication",
    status: "available",
    color: "bg-[#4A154B]",
    logoUrl: "https://cdn.simpleicons.org/slack/4A154B",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Create issues, PRs, and manage repositories via natural language.",
    icon: Github,
    category: "Development",
    status: "connected",
    color: "bg-gray-900 dark:bg-gray-100",
    logoUrl: "https://cdn.simpleicons.org/github/181717",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Query databases, create pages, and sync content with Notion workspaces.",
    icon: FileText,
    category: "Productivity",
    status: "available",
    color: "bg-gray-900 dark:bg-gray-100",
    logoUrl: "https://cdn.simpleicons.org/notion/000000",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Search, upload, and organize files across your Drive.",
    icon: Cloud,
    category: "Storage",
    status: "available",
    color: "bg-[#4285F4]",
    logoUrl: "https://cdn.simpleicons.org/googledrive/4285F4",
  },
  {
    id: "trello",
    name: "Trello",
    description: "Manage boards, lists, and cards for project tracking.",
    icon: Trello,
    category: "Project Management",
    status: "available",
    color: "bg-[#0079BF]",
    logoUrl: "https://cdn.simpleicons.org/trello/0052CC",
  },
  {
    id: "figma",
    name: "Figma",
    description: "Fetch design files and sync components with your agent.",
    icon: Figma,
    category: "Design",
    status: "available",
    color: "bg-[#F24E1E]",
    logoUrl: "https://cdn.simpleicons.org/figma/F24E1E",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect to 5,000+ apps through Zapier automation.",
    icon: Zap,
    category: "Automation",
    status: "available",
    color: "bg-[#FF4A00]",
    logoUrl: "https://cdn.simpleicons.org/zapier/FF4A00",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Read, send, and manage emails with natural language.",
    icon: Mail,
    category: "Communication",
    status: "available",
    color: "bg-[#EA4335]",
    logoUrl: "https://cdn.simpleicons.org/gmail/EA4335",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Create events, check availability, and manage schedules.",
    icon: Calendar,
    category: "Productivity",
    status: "available",
    color: "bg-[#4285F4]",
    logoUrl: "https://cdn.simpleicons.org/googlecalendar/4285F4",
  },
  {
    id: "database",
    name: "Custom Database",
    description: "Connect PostgreSQL, MySQL, or MongoDB for data queries.",
    icon: Database,
    category: "Data",
    status: "available",
    color: "bg-emerald-600",
  },
  {
    id: "webhook",
    name: "Webhooks",
    description: "Trigger and receive HTTP callbacks for custom integrations.",
    icon: Webhook,
    category: "Developer",
    status: "available",
    color: "bg-violet-600",
  },
  {
    id: "discord",
    name: "Discord",
    description: "Connect servers, send messages, and manage communities.",
    icon: MessageCircle,
    category: "Communication",
    status: "available",
    color: "bg-[#5865F2]",
    logoUrl: "https://cdn.simpleicons.org/discord/5865F2",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Project and issue tracking with boards and sprints.",
    icon: LayoutGrid,
    category: "Project Management",
    status: "available",
    color: "bg-[#0052CC]",
    logoUrl: "https://cdn.simpleicons.org/jira/0052CC",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Issue tracking and product workflows for modern teams.",
    icon: ListOrdered,
    category: "Project Management",
    status: "available",
    color: "bg-[#5E6AD2]",
    logoUrl: "https://cdn.simpleicons.org/linear/5E6AD2",
  },
  {
    id: "asana",
    name: "Asana",
    description: "Tasks, projects, and goals in one place.",
    icon: CheckSquare,
    category: "Project Management",
    status: "available",
    color: "bg-[#F06A6A]",
    logoUrl: "https://cdn.simpleicons.org/asana/F06A6A",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Store, sync, and share files across devices.",
    icon: Cloud,
    category: "Storage",
    status: "available",
    color: "bg-[#0061FF]",
    logoUrl: "https://cdn.simpleicons.org/dropbox/0061FF",
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Spreadsheet-database hybrid for workflows and data.",
    icon: Table,
    category: "Productivity",
    status: "available",
    color: "bg-[#18BFFF]",
    logoUrl: "https://cdn.simpleicons.org/airtable/18BFFF",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payments, billing, and financial infrastructure.",
    icon: CreditCard,
    category: "Developer",
    status: "available",
    color: "bg-[#635BFF]",
    logoUrl: "https://cdn.simpleicons.org/stripe/635BFF",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "CRM, marketing, sales, and service in one platform.",
    icon: Building2,
    category: "Data",
    status: "available",
    color: "bg-[#FF7A59]",
    logoUrl: "https://cdn.simpleicons.org/hubspot/FF7A59",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Chat, meetings, and collaboration for organizations.",
    icon: Users,
    category: "Communication",
    status: "available",
    color: "bg-[#6264A7]",
    logoUrl: "https://cdn.simpleicons.org/microsoftteams/6264A7",
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Documentation, wikis, and knowledge base.",
    icon: FileText,
    category: "Productivity",
    status: "available",
    color: "bg-[#172B4D]",
    logoUrl: "https://cdn.simpleicons.org/confluence/172B4D",
  },
];

const categoryList = Array.from(new Set(integrations.map((i) => i.category)));
const categoryOptions = ["All Categories", "Connected", ...categoryList];

export default function ToolUsecasePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});

  const filtered = integrations.filter((i) => {
    const matchSearch =
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase());
    if (category === "Connected") return matchSearch && i.status === "connected";
    if (category === "All Categories") return matchSearch;
    return matchSearch && i.category === category;
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header: title + subtitle left; search + category right */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8"
        >
          <div className="shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="text-foreground">MCP </span>
              <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 bg-clip-text text-transparent">
                Integrations
              </span>
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
              Connect your tools and automate your workflows
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:flex-1 lg:min-w-0 lg:max-w-2xl">
            <div
              className={cn(
                "relative flex-1 min-w-0 rounded-2xl transition-all duration-200",
                "bg-white dark:bg-white/5",
                "border border-slate-200/80 dark:border-border",
                "shadow-sm hover:shadow-md dark:shadow-none",
                "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 dark:focus-within:border-primary/30"
              )}
            >
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground pointer-events-none"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="Search integrations or categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "w-full h-12 pl-12 pr-5 rounded-2xl text-sm bg-transparent border-0",
                  "placeholder:text-muted-foreground text-foreground",
                  "focus:outline-none focus:ring-0"
                )}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                className={cn(
                  "h-12 w-full sm:w-[180px] shrink-0 rounded-2xl text-sm font-medium",
                  "bg-white dark:bg-white/5 border border-slate-200/80 dark:border-border",
                  "shadow-sm hover:shadow-md dark:shadow-none text-foreground",
                  "focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                )}
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Integration cards grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
        >
          {filtered.map((integration, index) => {
            const Icon = integration.icon;
            const isConnected = integration.status === "connected";
            const useLogo = Boolean(integration.logoUrl) && !logoErrors[integration.id];
            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 * Math.min(index, 12) }}
              >
                <Card
                  className={cn(
                    "h-full overflow-hidden rounded-2xl transition-all duration-200 group",
                    "border border-border bg-card text-card-foreground",
                    "hover:shadow-lg hover:border-muted-foreground/20 dark:hover:bg-white/[0.06]"
                  )}
                >
                  <CardHeader className="pb-2 pt-5 px-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex items-center justify-center w-14 h-14 rounded-xl shrink-0 overflow-hidden",
                          "ring-1 ring-border/80",
                          useLogo
                            ? "bg-white dark:bg-white"
                            : "bg-muted/50 dark:bg-white/5",
                          !useLogo && (integration.color || "bg-primary")
                        )}
                      >
                        {useLogo && integration.logoUrl ? (
                          <img
                            src={integration.logoUrl}
                            alt=""
                            className="w-8 h-8 object-contain"
                            loading="lazy"
                            onError={() =>
                              setLogoErrors((prev) => ({ ...prev, [integration.id]: true }))
                            }
                          />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-white">
                            <Icon className="w-7 h-7" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h3 className="text-base font-semibold text-foreground truncate">
                          {integration.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0 flex items-center gap-2">
                    {isConnected ? (
                      <>
                        <button
                          className={cn(
                            "flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-colors border border-border bg-muted/40 dark:bg-white/5 text-foreground hover:bg-muted/60 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                          )}
                        >
                          <Eye className="w-4 h-4 shrink-0" />
                          <span className="whitespace-nowrap">Manage Access</span>
                        </button>
                        <button
                          className={cn(
                            "flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-colors",
                            "border border-destructive/40 text-destructive bg-destructive/5",
                            "hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:ring-offset-2 focus:ring-offset-background"
                          )}
                        >
                          <Unplug className="w-4 h-4 shrink-0" />
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={cn(
                            "flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-all",
                            "bg-primary text-primary-foreground shadow-sm",
                            "hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background"
                          )}
                        >
                          <Link2 className="w-4 h-4 shrink-0" />
                          Connect
                        </button>
                        <button
                          className={cn(
                            "flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-colors",
                            "border border-border bg-muted/30 dark:bg-white/5 text-foreground",
                            "hover:bg-muted/50 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                          )}
                        >
                          View
                          <ArrowRight className="w-4 h-4 shrink-0" />
                        </button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "flex flex-col items-center justify-center py-20 px-6 rounded-2xl",
              "border border-dashed border-border bg-muted/30 dark:bg-white/[0.02]"
            )}
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Plug className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No integrations match</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search or category.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
