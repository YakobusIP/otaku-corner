import type { DistributionRow } from "@/components/home/home-insight-slides";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/shared/utils";

import { FlowerIcon } from "lucide-react";

type HomeDistributionCarouselCardProps = {
  title: string;
  rows: DistributionRow[];
  barClass: string;
};

const clampPercentage = (value: number) => {
  return Math.min(Math.max(Math.round(value), 0), 100);
};

export default function HomeDistributionCarouselCard(
  props: HomeDistributionCarouselCardProps
) {
  const { title, rows, barClass } = props;

  return (
    <Card className="relative z-10 flex h-full min-h-[320px] flex-col border-white/90 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-[#4a1630]">
          {title}
          <FlowerIcon className="h-4 w-4 text-rose-300" aria-hidden />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-0">
        {rows.length === 0 ? (
          <p className="text-sm text-[#6b5b6b]">No data yet.</p>
        ) : (
          rows.map((row) => {
            const percentage = clampPercentage(row.percentage);
            return (
              <div key={row.label} className="min-w-0 space-y-1">
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
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
