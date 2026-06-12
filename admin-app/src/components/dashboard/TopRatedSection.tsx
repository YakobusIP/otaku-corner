import { useMemo } from "react";

import QueryErrorState from "@/components/dashboard/QueryErrorState";
import TopRatedSlot from "@/components/dashboard/TopRatedSlot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

import type { TopRatedThisYear } from "@/types/statistic.type";

import { MEDIA_TYPE } from "@/lib/enums";

import Autoplay from "embla-carousel-autoplay";

type TopRatedSectionProps = {
  data: TopRatedThisYear | undefined;
  isLoading: boolean;
  error: unknown | null;
  allTime?: boolean;
};

const DESKTOP_GRID =
  "hidden min-h-0 flex-1 px-6 pb-6 sm:grid sm:grid-cols-3 sm:gap-4";

export default function TopRatedSection(props: TopRatedSectionProps) {
  const { data, isLoading, error, allTime = false } = props;

  const carouselPlugins = useMemo(
    () => [Autoplay({ delay: 4500, stopOnInteraction: false })],
    []
  );

  if (error) {
    return (
      <Card className="flex h-full w-full min-h-0 flex-col border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            {allTime ? "Top Rated" : "Top Rated This Year"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <QueryErrorState error={error} />
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <Card className="flex h-full w-full min-h-0 flex-col border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <div className="px-6 pb-6 pt-0 sm:hidden">
          <Carousel
            opts={{ loop: true, align: "start" }}
            plugins={carouselPlugins}
          >
            <CarouselContent>
              {Array.from({ length: 3 }).map((_, index) => (
                <CarouselItem key={index}>
                  <Skeleton className="h-64 w-full rounded-xl" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        <CardContent className={DESKTOP_GRID}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const slots = [
    {
      label: MEDIA_TYPE.ANIME,
      labelClassName: "text-sky-400",
      row: data.anime,
      mediaType: "anime" as const
    },
    {
      label: MEDIA_TYPE.MANGA,
      labelClassName: "text-emerald-400",
      row: data.manga,
      mediaType: "manga" as const
    },
    {
      label: MEDIA_TYPE.LIGHT_NOVEL,
      labelClassName: "text-violet-400",
      row: data.lightNovel,
      mediaType: "lightNovel" as const
    }
  ];

  return (
    <Card className="flex h-full w-full min-h-0 flex-col border-border/60 bg-card/80 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">
          {allTime ? "Top Rated" : "Top Rated This Year"}
        </CardTitle>
      </CardHeader>
      <div className="px-6 pb-6 pt-0 sm:hidden">
        <Carousel
          opts={{ loop: true, align: "start" }}
          plugins={carouselPlugins}
        >
          <CarouselContent>
            {slots.map((slot) => (
              <CarouselItem key={slot.mediaType}>
                <TopRatedSlot {...slot} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <CardContent className={DESKTOP_GRID}>
        {slots.map((slot) => (
          <TopRatedSlot key={slot.mediaType} {...slot} />
        ))}
      </CardContent>
    </Card>
  );
}
