"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDailyUsage, getModelUsage, getUserUsageData } from "@/lib/actions";
import { format, parseISO } from "date-fns";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from "recharts";
import { models } from "@/lib/models";
import { Separator } from "../ui/separator";

type UsageData = {
  currentUsage: string;
  maxUsage: string;
  percentage: number;
};

type DailyUsage = {
  date: string;
  requests: number;
  tokens: number;
};

type ModelUsage = {
  model: string;
  requests: number;
};

function getModelInfo(modelId: string) {
  const model = models.find((m) => m.id === modelId);
  return {
    displayName: model?.name || modelId,
    color: model?.color || "hsl(var(--chart-3))",
  };
}

function getProgressColor(percentage: number): string {
  if (percentage <= 60) return "#4ade80"; // green
  if (percentage <= 75) return "#fbbf24"; // yellow
  if (percentage <= 90) return "#fb923c"; // orange
  return "#f87171"; // red
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function UsageTab() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usage, daily, models] = await Promise.all([
          getUserUsageData(),
          getDailyUsage(),
          getModelUsage(),
        ]);
        setUsageData(usage);
        setDailyUsage(daily);
        setModelUsage(models);
      } catch (error) {
        console.error("Failed to fetch usage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatePercentage = (current: string, max: string): number => {
    const currentVal = Number.parseFloat(current || "0");
    const maxVal = Number.parseFloat(max || "1");
    return Math.min((currentVal / maxVal) * 100, 100);
  };

  const { theme } = useTheme();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[160px] rounded-xl" />
          <Skeleton className="h-[160px] rounded-xl" />
          <Skeleton className="h-[160px] rounded-xl" />
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  const percentage = calculatePercentage(
    usageData?.currentUsage || "0",
    usageData?.maxUsage || "1"
  );

  const formattedModelUsage = modelUsage.map((usage) => {
    const { displayName, color } = getModelInfo(usage.model);
    return {
      ...usage,
      displayName,
      color,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="text-sm font-medium mb-1">
            {format(parseISO(label), "MMM d, yyyy")}
          </div>
          {payload.map((p: any, index: number) => (
            <div key={index} className="text-xs text-muted-foreground">
              {p.name}: {formatNumber(p.value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const ModelTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="text-sm font-medium mb-1">{label}</div>
          <div className="text-xs text-muted-foreground">
            Requests: {formatNumber(payload[0]?.value || 0)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Usage this month
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-4 w-full rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${percentage}%`,
                backgroundColor: getProgressColor(percentage),
              }}
            />
          </div>
          <div className="flex justify-end text-sm text-muted-foreground">
            <span className="text-sm text-muted-foreground">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
      <Separator />
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col h-full justify-between gap-8">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Requests Today
                </div>
                <div className="text-2xl font-semibold">
                  {formatNumber(
                    dailyUsage[dailyUsage.length - 1]?.requests || 0
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated{" "}
                {format(
                  parseISO(
                    dailyUsage[dailyUsage.length - 1]?.date ||
                      new Date().toISOString()
                  ),
                  "MMM d, yyyy"
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col h-full justify-between gap-8">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Total Tokens Today
                </div>
                <div className="text-2xl font-semibold">
                  {formatNumber(dailyUsage[dailyUsage.length - 1]?.tokens || 0)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated{" "}
                {format(
                  parseISO(
                    dailyUsage[dailyUsage.length - 1]?.date ||
                      new Date().toISOString()
                  ),
                  "MMM d, yyyy"
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Over Time */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium mb-6">Usage Over Time</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dailyUsage}
              margin={{ top: 10, right: 10, bottom: 20, left: 40 }}
            >
              <defs>
                <linearGradient
                  id="requestsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#818CF8" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.4}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tickFormatter={(value) => format(parseISO(value), "MMM d")}
                fontSize={12}
                stroke={theme === "dark" ? "white" : "black"}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tickFormatter={(value) => formatNumber(value)}
                fontSize={12}
                stroke={theme === "dark" ? "white" : "black"}
                width={40}
                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                ticks={(() => {
                  const maxValue = Math.max(
                    ...dailyUsage.map((d) => d.requests)
                  );
                  const step = Math.ceil(maxValue / 6);
                  return Array.from({ length: 7 }, (_, i) => i * step);
                })()}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--muted)", opacity: 0.1 }}
              />
              <Bar
                dataKey="requests"
                fill="url(#requestsGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Distribution */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium mb-6">Models</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={formattedModelUsage}
              layout="vertical"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="var(--border)"
                opacity={0.4}
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tickFormatter={(value) => formatNumber(value)}
                fontSize={12}
                stroke={theme === "dark" ? "white" : "black"}
                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                ticks={(() => {
                  const maxValue = Math.max(
                    ...formattedModelUsage.map((m) => m.requests)
                  );
                  const step = Math.ceil(maxValue / 6);
                  return Array.from({ length: 7 }, (_, i) => i * step);
                })()}
              />
              <YAxis
                dataKey="displayName"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                width={120}
                fontSize={12}
                stroke={theme === "dark" ? "white" : "black"}
              />
              <Tooltip
                content={<ModelTooltip />}
                cursor={{ fill: "var(--muted)", opacity: 0.1 }}
              />
              <Bar dataKey="requests" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {formattedModelUsage.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{ filter: "brightness(1.1)" }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
