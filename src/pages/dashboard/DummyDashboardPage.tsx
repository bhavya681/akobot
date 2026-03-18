"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  LayoutDashboard,
  Image,
  MessageSquare,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const timeRanges = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const statCards = [
  {
    label: "Total Generations",
    value: "2,847",
    change: "+12.4%",
    trend: "up",
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
  },
  {
    label: "Images Created",
    value: "1,923",
    change: "+8.2%",
    trend: "up",
    icon: Image,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
  },
  {
    label: "Agent Chats",
    value: "892",
    change: "+24.1%",
    trend: "up",
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
  },
  {
    label: "Credits Used",
    value: "12,450",
    change: "-3.2%",
    trend: "down",
    icon: TrendingUp,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
];

const usageData = [
  { time: "00:00", generations: 42, chats: 18 },
  { time: "04:00", generations: 28, chats: 12 },
  { time: "08:00", generations: 156, chats: 89 },
  { time: "12:00", generations: 234, chats: 145 },
  { time: "16:00", generations: 198, chats: 112 },
  { time: "20:00", generations: 167, chats: 78 },
  { time: "24:00", generations: 89, chats: 34 },
];

const contentTypeData = [
  { type: "Images", count: 1923 },
  { type: "Videos", count: 412 },
  { type: "Audio", count: 287 },
  { type: "Agents", count: 225 },
];

const trendData = [
  { day: "Mon", value: 320 },
  { day: "Tue", value: 410 },
  { day: "Wed", value: 380 },
  { day: "Thu", value: 520 },
  { day: "Fri", value: 480 },
  { day: "Sat", value: 390 },
  { day: "Sun", value: 450 },
];

const usageChartConfig = {
  generations: {
    label: "Generations",
    color: "hsl(var(--primary))",
  },
  chats: {
    label: "Chats",
    color: "hsl(199 95% 48%)",
  },
} satisfies ChartConfig;

const trendChartConfig = {
  value: {
    label: "Activity",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function DummyDashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Grafana-style */}
      <div className="border-b border-border bg-card/50 dark:bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 lg:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Overview of your AI usage and activity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Time range</span>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px] h-9 border-border bg-background/80 dark:bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 lg:p-6 space-y-6">
        {/* Stat cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={cn(
                  "rounded-lg border border-border bg-card dark:bg-card/80",
                  "p-4 shadow-sm hover:shadow-md transition-shadow",
                  "dark:border-border/80"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <p
                      className={cn(
                        "text-xs font-medium mt-1",
                        stat.trend === "up"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {stat.change} from previous period
                    </p>
                  </div>
                  <div
                    className={cn(
                      "p-2.5 rounded-lg",
                      stat.bgColor,
                      stat.color
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts grid - Grafana panel style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usage over time - Line chart */}
          <div
            className={cn(
              "rounded-lg border border-border bg-card dark:bg-card/80",
              "overflow-hidden shadow-sm",
              "dark:border-border/80"
            )}
          >
            <div className="px-4 py-3 border-b border-border bg-muted/30 dark:bg-muted/10">
              <h3 className="text-sm font-semibold text-foreground">
                Usage Over Time
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generations and chats per time period
              </p>
            </div>
            <div className="p-4 h-[280px]">
              <ChartContainer config={usageChartConfig} className="h-full w-full">
                <LineChart data={usageData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/50"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <ChartTooltip />
                  <Line
                    type="monotone"
                    dataKey="generations"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="chats"
                    stroke="hsl(199 95% 48%)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>

          {/* Activity trend - Area chart */}
          <div
            className={cn(
              "rounded-lg border border-border bg-card dark:bg-card/80",
              "overflow-hidden shadow-sm",
              "dark:border-border/80"
            )}
          >
            <div className="px-4 py-3 border-b border-border bg-muted/30 dark:bg-muted/10">
              <h3 className="text-sm font-semibold text-foreground">
                Weekly Activity
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Daily generation activity
              </p>
            </div>
            <div className="p-4 h-[280px]">
              <ChartContainer config={trendChartConfig} className="h-full w-full">
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient
                      id="fillValue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/50"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <ChartTooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#fillValue)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>
        </div>

        {/* Content by type - Bar chart (full width) */}
        <div
          className={cn(
            "rounded-lg border border-border bg-card dark:bg-card/80",
            "overflow-hidden shadow-sm",
            "dark:border-border/80"
          )}
        >
          <div className="px-4 py-3 border-b border-border bg-muted/30 dark:bg-muted/10">
            <h3 className="text-sm font-semibold text-foreground">
              Content by Type
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generations breakdown by content type
            </p>
          </div>
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contentTypeData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/50"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="type"
                  tickLine={false}
                  axisLine={false}
                  width={70}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number | undefined) => [(value ?? 0).toLocaleString(), "Count"]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground py-4">
          Demo dashboard · Data shown is placeholder for illustration
        </p>
      </div>
    </div>
  );
}
