"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDailyUsage, getModelUsage, getUserUsageData } from "@/lib/actions";
import { format, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "../ui/separator";
import { models } from "@/lib/models";

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

const requestsConfig = {
  requests: {
    label: "Requests",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const tokensConfig = {
  tokens: {
    label: "Tokens",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const modelsConfig = {
  requests: {
    label: "Requests",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

function getProgressColor(percentage: number): string {
  if (percentage <= 60) return "hsl(142.1 76.2% 36.3%)"; // green-500
  if (percentage <= 75) return "hsl(47.9 95.8% 53.1%)"; // yellow-500
  if (percentage <= 90) return "hsl(20.5 90.2% 48.2%)"; // orange-500
  return "hsl(0 84.2% 60.2%)"; // red-500
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[240px] w-full" />
          <Skeleton className="h-[240px] w-full" />
        </div>

        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  const formattedModelUsage = modelUsage.map((usage) => {
    const { displayName, color } = getModelInfo(usage.model);
    return {
      ...usage,
      displayName,
      color,
    };
  });

  return (
    <div>
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
                width: `${usageData?.percentage ?? 0}%`,
                backgroundColor: usageData?.percentage
                  ? getProgressColor(usageData.percentage)
                  : undefined,
              }}
            />
          </div>
          <div className="flex justify-end text-sm text-muted-foreground">
            <span>{usageData?.percentage.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-none border-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Requests per day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={requestsConfig}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyUsage}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => format(parseISO(value), "MMM d")}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          format(parseISO(value), "MMM d, yyyy")
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="requests"
                    fill="#35D0DA"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none border-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Tokens per day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={tokensConfig}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyUsage}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => format(parseISO(value), "MMM d")}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          format(parseISO(value), "MMM d, yyyy")
                        }
                      />
                    }
                  />
                  <Bar dataKey="tokens" fill="#715FDE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Separator />
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Model usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={modelsConfig}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={formattedModelUsage} layout="vertical">
                <CartesianGrid horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  dataKey="displayName"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={120}
                  style={{
                    fontSize: "12px",
                  }}
                  tickFormatter={(value) => {
                    return value.length > 20
                      ? value.split(" ").join("\n")
                      : value;
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        getModelInfo(value).displayName
                      }
                    />
                  }
                />
                <Bar
                  dataKey="requests"
                  radius={[0, 4, 4, 0]}
                  fill="currentColor"
                >
                  {formattedModelUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
