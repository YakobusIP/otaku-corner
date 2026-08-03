import QueryErrorState from "@/features/dashboard/components/QueryErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useImageVaultR2Analytics } from "@/features/image-vault/hooks/useImageVaultQueries";

import type { ImageVaultR2Analytics } from "@/types/image-vault.type";

import {
  DatabaseIcon,
  DownloadIcon,
  HardDriveIcon,
  type LucideIcon,
  UploadIcon
} from "lucide-react";

const formatInt = (value: number) =>
  Math.round(value).toLocaleString(undefined, { maximumFractionDigits: 0 });

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const digits = value >= 100 || unitIndex === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
};

type AnalyticsItem = {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  circleClass: string;
  iconClass: string;
};

const buildItems = (data: ImageVaultR2Analytics): AnalyticsItem[] => {
  const averageObjectSizeBytes =
    data.objectCount > 0 ? data.totalPayloadSizeBytes / data.objectCount : 0;
  return [
    {
      title: "Total objects",
      value: formatInt(data.objectCount),
      subtitle: "Private R2 bucket",
      icon: DatabaseIcon,
      circleClass: "border-violet-500/45 bg-violet-950/50",
      iconClass: "text-violet-400"
    },
    {
      title: "Class A operations",
      value: formatInt(data.classAOperations),
      subtitle: "Last 30 days",
      icon: UploadIcon,
      circleClass: "border-sky-500/45 bg-sky-950/50",
      iconClass: "text-sky-400"
    },
    {
      title: "Class B operations",
      value: formatInt(data.classBOperations),
      subtitle: "Last 30 days",
      icon: DownloadIcon,
      circleClass: "border-amber-500/45 bg-amber-950/50",
      iconClass: "text-amber-400"
    },
    {
      title: "Average file size",
      value: formatBytes(averageObjectSizeBytes),
      subtitle: `${formatBytes(data.totalPayloadSizeBytes)} total`,
      icon: HardDriveIcon,
      circleClass: "border-emerald-500/45 bg-emerald-950/50",
      iconClass: "text-emerald-400"
    }
  ];
};

export default function ImageVaultR2AnalyticsCards() {
  const { data, isLoading, error } = useImageVaultR2Analytics();

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-4">
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl xl:col-span-4">
          <CardContent className="p-4 sm:p-5">
            <QueryErrorState error={error} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="border-border/60 bg-card/80 backdrop-blur-xl"
          >
            <CardContent className="flex flex-col gap-2 p-4 sm:p-5 xl:flex-row xl:items-center xl:gap-4">
              <div className="flex items-center gap-3 xl:hidden">
                <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="hidden h-14 w-14 shrink-0 rounded-full xl:block" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="hidden h-4 w-28 xl:block" />
                <Skeleton className="h-8 w-20 sm:h-9 sm:w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items = buildItems(data);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.title}
            className="border-border/60 bg-card/80 backdrop-blur-xl"
          >
            <CardContent className="flex flex-col gap-2 p-4 sm:p-5 xl:flex-row xl:items-center xl:gap-4">
              <div
                className={`hidden shrink-0 items-center justify-center rounded-full border xl:flex xl:h-14 xl:w-14 ${item.circleClass}`}
              >
                <Icon className={`h-7 w-7 ${item.iconClass}`} aria-hidden />
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 xl:hidden">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${item.circleClass}`}
                >
                  <Icon className={`h-2.5 w-2.5 ${item.iconClass}`} aria-hidden />
                </div>
                <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
                  {item.title}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="hidden text-sm font-medium text-muted-foreground xl:block">
                  {item.title}
                </p>
                <p className="truncate text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl xl:mt-0.5">
                  {item.value}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
                  {item.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
