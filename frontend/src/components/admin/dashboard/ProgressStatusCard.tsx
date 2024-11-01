import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import { fetchMediaProgressService } from "@/services/statistic.service";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AllowedMedia, MediaProgress } from "@/types/statistic.type";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { PieChart, Pie, PieLabelRenderProps } from "recharts";
import { Loader2Icon } from "lucide-react";
import { MEDIA_TYPE } from "@/lib/enums";

const chartConfig = {
  count: {
    label: "Count"
  },
  PLANNED: {
    label: "Planned",
    color: "hsl(var(--chart-1))"
  },
  ON_HOLD: {
    label: "On Hold",
    color: "hsl(var(--chart-2))"
  },
  ON_PROGRESS: {
    label: "On Progress",
    color: "hsl(var(--chart-3))"
  },
  COMPLETED: {
    label: "Completed",
    color: "hsl(var(--chart-4))"
  },
  DROPPED: {
    label: "Dropped",
    color: "hsl(var(--chart-5))"
  }
} satisfies ChartConfig;

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value
}: PieLabelRenderProps) => {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof innerRadius !== "number" ||
    typeof outerRadius !== "number" ||
    value === 0
  ) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
    >
      {value}
    </text>
  );
};

export default function ProgressStatusCard() {
  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const [mediaType, setMediaType] = useState<AllowedMedia>("anime");
  const [mediaProgress, setMediaProgress] = useState<MediaProgress[]>([]);
  const [isLoadingMediaProgress, setIsLoadingMediaProgress] = useState(false);

  const fetchMediaProgressData = useCallback(async () => {
    setIsLoadingMediaProgress(true);
    const response = await fetchMediaProgressService(mediaType);
    if (response.success) {
      const availableColors = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))"
      ];
      const coloredMediaProgress = response.data.map((item, index) => ({
        ...item,
        fill: availableColors[index]
      }));
      setMediaProgress(coloredMediaProgress);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingMediaProgress(false);
  }, [mediaType]);

  useEffect(() => {
    fetchMediaProgressData();
  }, [fetchMediaProgressData]);

  return (
    <Card className="w-full xl:w-2/5 2xl:w-1/5">
      <CardHeader className="flex flex-col items-stretch justify-between space-y-0 p-0">
        <div className="flex flex-col justify-center gap-1 px-6 py-5">
          <CardTitle>Progress Status</CardTitle>
          <CardDescription>
            Currently added media progress statuses
          </CardDescription>
        </div>
        <div className="flex flex-col xl:flex-row items-center justify-center gap-4 px-6 py-2">
          <div className="flex items-center justify-center gap-4">
            <Label>Media Type</Label>
            <Select
              value={mediaType}
              onValueChange={(value) => setMediaType(value as AllowedMedia)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anime">{MEDIA_TYPE.ANIME}</SelectItem>
                <SelectItem value="manga">{MEDIA_TYPE.MANGA}</SelectItem>
                <SelectItem value="lightNovel">
                  {MEDIA_TYPE.LIGHT_NOVEL}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingMediaProgress ? (
          <div className="flex items-center justify-center h-[350px] gap-2">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Loading chart...
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[350px] w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
                className="flex-wrap"
              />
              <Pie
                data={mediaProgress}
                dataKey="count"
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                nameKey="status"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
