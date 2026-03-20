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
import { cn } from "@/lib/utils";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  kind: "MCP" | "Tool";
  status: "connected" | "available";
  color?: string;
  logoUrl?: string;
}

type IntegrationSeed = Omit<Integration, "kind">;

const integrations: IntegrationSeed[] = [
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
    description: "Fetch design files and sync components with your MCP.",
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

const toolIds = new Set([
  "slack",
  "gmail",
  "google-drive",
  "google-calendar",
  "discord",
  "teams",
  "trello",
  "figma",
  "zapier",
  "dropbox",
]);

const integrationsWithKind: Integration[] = integrations.map((item) => ({
  ...item,
  kind: toolIds.has(item.id) ? "Tool" : "MCP",
}));

export default function ToolUsecasePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"MCP" | "Tool">("MCP");
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});

  const filtered = integrationsWithKind.filter((i) => {
    const matchSearch =
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      i.kind.toLowerCase().includes(search.toLowerCase());
    return matchSearch && i.kind === category;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#05070d] dark:text-white transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header: title + subtitle left; search + category right */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8"
        >
          <div className="shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="text-slate-900 dark:text-white">MCP </span>
              <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Integrations
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1.5 text-sm sm:text-base">
              Connect your tools and automate your workflows
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:flex-1 lg:min-w-0 lg:max-w-2xl">
            <div
              className={cn(
                "relative flex-1 min-w-0 rounded-2xl transition-all duration-200",
                "bg-white dark:bg-[#0b0f18]",
                "border border-slate-200 dark:border-white/10",
                "shadow-sm dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)] hover:border-slate-300 dark:hover:border-white/20",
                "focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-400/50"
              )}
            >
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 pointer-events-none"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="Search integrations or categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "w-full h-12 pl-12 pr-5 rounded-2xl text-sm bg-transparent border-0",
                  "placeholder:text-slate-500 text-slate-900 dark:text-white",
                  "focus:outline-none focus:ring-0"
                )}
              />
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0f18] p-1.5 shadow-sm dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
              {(["MCP", "Tool"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCategory(tab)}
                  className={cn(
                    "h-9 min-w-[88px] rounded-xl px-4 text-sm font-semibold transition-all",
                    category === tab
                      ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-[0_8px_18px_rgba(79,70,229,0.32)]"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Integration cards grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4.5"
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
                    "h-[208px] overflow-hidden rounded-xl transition-all duration-200 group flex flex-col",
                    "border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111722] text-slate-900 dark:text-white",
                    "shadow-sm dark:shadow-[0_8px_20px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-400/45 hover:shadow-[0_10px_24px_rgba(79,70,229,0.14)] dark:hover:shadow-[0_14px_30px_rgba(37,99,235,0.22)]"
                  )}
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex items-center justify-center w-11 h-11 rounded-lg shrink-0 overflow-hidden",
                          "ring-1 ring-slate-200 dark:ring-white/15",
                          useLogo
                            ? "bg-white"
                            : "bg-slate-100 dark:bg-slate-800",
                          !useLogo && (integration.color || "bg-primary")
                        )}
                      >
                        {useLogo && integration.logoUrl ? (
                          <img
                            src={integration.logoUrl}
                            alt=""
                            className="w-7 h-7 object-contain"
                            loading="lazy"
                            onError={() =>
                              setLogoErrors((prev) => ({ ...prev, [integration.id]: true }))
                            }
                          />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-white">
                            <Icon className="w-6 h-6" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white truncate leading-tight">
                            {integration.name}
                          </h3>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                              isConnected
                                ? "bg-emerald-500/15 text-emerald-700 border border-emerald-400/40 dark:text-emerald-300 dark:border-emerald-400/30"
                                : "bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-500/15 dark:text-slate-300 dark:border-white/15"
                            )}
                          >
                            {isConnected ? "Connected" : "Available"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {integration.description}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-2 font-medium">
                          {integration.category}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-1 mt-auto">
                    {isConnected ? (
                      <div className="flex items-center gap-2">
                        <button
                          className={cn(
                            "flex-[1.15] inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg text-sm font-medium transition-colors border",
                            "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-white/15 dark:bg-[#262b34] dark:text-slate-200 dark:hover:bg-[#2b313d] dark:focus:ring-white/15"
                          )}
                        >
                          <Eye className="w-4 h-4 shrink-0" />
                          <span className="whitespace-nowrap">Manage Access</span>
                        </button>
                        <button
                          className={cn(
                            "flex-1 inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg text-sm font-medium transition-colors",
                            "border border-red-400/35 text-red-600 dark:text-red-300 bg-red-500/10",
                            "hover:bg-red-500/15 focus:outline-none focus:ring-2 focus:ring-red-400/25"
                          )}
                        >
                          <Unplug className="w-4 h-4 shrink-0" />
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          className={cn(
                            "flex-[1.1] inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg text-sm font-semibold transition-all",
                            "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-[0_8px_18px_rgba(79,70,229,0.38)]",
                            "hover:from-indigo-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/35"
                          )}
                        >
                          <Link2 className="w-4 h-4 shrink-0" />
                          Connect
                        </button>
                        <button
                          className={cn(
                            "flex-1 inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg text-sm font-medium transition-colors",
                            "border border-slate-300 bg-slate-100 text-slate-700 dark:border-white/15 dark:bg-[#262b34] dark:text-slate-100",
                            "hover:bg-slate-200 dark:hover:bg-[#2b313d] focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-white/15"
                          )}
                        >
                          View
                          <ArrowRight className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
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
              "border border-dashed border-slate-300 dark:border-white/15 bg-slate-100/70 dark:bg-white/[0.02]"
            )}
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-white/5 flex items-center justify-center mb-4">
              <Plug className="w-7 h-7 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">No integrations match</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Try a different search or category.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
