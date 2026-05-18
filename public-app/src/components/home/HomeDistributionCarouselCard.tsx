import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";

import { Flower2Icon } from "lucide-react";

type DistributionRow = {
  label: string;
  count: number;
  percentage: number;
};

type HomeDistributionCarouselCardProps = {
  title: string;
  rows: DistributionRow[];
  barClass: string;
  accentClass?: string;
};

const clampPercentage = (value: number) => {
  return Math.min(Math.max(Math.round(value), 0), 100);
};

export default function HomeDistributionCarouselCard(
  props: HomeDistributionCarouselCardProps
) {
  const {
    title,
    rows,
    barClass,
    accentClass = "bg-rose-100 text-rose-500"
  } = props;

  return (
    <Card className="flex h-full min-h-[320px] flex-col border-white/80 bg-white/85 shadow-[0_18px_60px_rgba(244,114,182,0.16)] backdrop-blur-xl">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-[#4a1630]">
          {title}
          <Flower2Icon className="h-4 w-4 text-rose-300" aria-hidden />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-0">
        {rows.length === 0 ? (
          <p className="text-sm text-[#6b5b6b]">No data yet.</p>
        ) : (
          rows.map((row) => {
            const percentage = clampPercentage(row.percentage);
            return (
              <div key={row.label} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    accentClass
                  )}
                >
                  <span className="h-3 w-3 rounded-full bg-current" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-[#3f2b40]">
                      {row.label}
                    </span>
                    <span className="shrink-0 tabular-nums text-[#4b3a4c]">
                      {percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-rose-100/70">
                    <div
                      className={cn(
                        "h-full rounded-full bg-linear-to-r transition-[width] duration-500",
                        barClass
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
