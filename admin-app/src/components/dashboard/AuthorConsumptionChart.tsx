import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

import { AuthorConsumption } from "@/types/statistic.type";

import { Loader2Icon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis
} from "recharts";

const chartConfig = {
  mangaCount: {
    label: "Manga",
    color: "hsl(var(--chart-2))"
  },
  lightNovelCount: {
    label: "Light Novel",
    color: "hsl(var(--chart-3))"
  }
} satisfies ChartConfig;

type Props = {
  isLoading: boolean;
  data: AuthorConsumption[];
};

export default function AuthorConsumptionChart({ isLoading, data }: Props) {
  return isLoading ? (
    <div className="flex items-center justify-center h-[250px] xl:h-[350px] gap-2">
      <Loader2Icon className="h-4 w-4 animate-spin" />
      Loading chart...
    </div>
  ) : (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[250px] xl:h-[350px] w-full"
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 40 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="mangaCount" fill="var(--color-mangaCount)" radius={4}>
          <LabelList dataKey="mangaCount" position="right" />
        </Bar>
        <Bar
          dataKey="lightNovelCount"
          fill="var(--color-lightNovelCount)"
          radius={4}
        >
          <LabelList dataKey="lightNovelCount" position="right" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
