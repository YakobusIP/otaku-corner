"use client";

import { useEffect, useMemo, useState } from "react";

import HomeDistributionCarouselCard from "@/components/home/HomeDistributionCarouselCard";
import HomeRecentReviewsCarouselCard from "@/components/home/HomeRecentReviewsCarouselCard";

import { useHomeStatistics } from "@/hooks/useHomeStatistics";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { Loader2Icon } from "lucide-react";

const SLIDE_GAP_PX = 16;

const readSlidesVisible = () => {
  if (typeof window === "undefined") {
    return 3;
  }
  if (window.matchMedia("(min-width: 1024px)").matches) {
    return 3;
  }
  if (window.matchMedia("(min-width: 640px)").matches) {
    return 2;
  }
  return 1;
};

export default function HomeInsightsCarousel() {
  const { tasteProfileQuery, recentReviewsQuery } = useHomeStatistics();

  const [slidesVisible, setSlidesVisible] = useState(3);

  useEffect(() => {
    const update = () => {
      setSlidesVisible(readSlidesVisible());
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const autoplayPlugin = useMemo(() => {
    return Autoplay({ delay: 5000, stopOnInteraction: false });
  }, []);

  const [viewportRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      containScroll: false,
      slidesToScroll: 1
    },
    [autoplayPlugin]
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    emblaApi.reInit();
  }, [emblaApi, slidesVisible]);

  const taste = tasteProfileQuery.data;

  const authorRows = (taste?.authors ?? []).map((row) => {
    return {
      label: row.name,
      count: row.totalCount,
      percentage: row.percentage
    };
  });

  const genreRows = (taste?.genres ?? []).map((row) => {
    return {
      label: row.name,
      count: row.totalCount,
      percentage: row.percentage
    };
  });

  const studioRows = (taste?.studios ?? []).map((row) => {
    return {
      label: row.name,
      count: row.totalCount,
      percentage: row.percentage
    };
  });

  const themeRows = (taste?.themes ?? []).map((row) => {
    return {
      label: row.name,
      count: row.totalCount,
      percentage: row.percentage
    };
  });

  const slideBasis =
    slidesVisible > 0
      ? `calc((100% - ${(slidesVisible - 1) * SLIDE_GAP_PX}px) / ${slidesVisible})`
      : "100%";

  const isLoading = tasteProfileQuery.isLoading || recentReviewsQuery.isLoading;

  return (
    <section className="relative z-10 bg-transparent pb-0 pt-2 lg:pt-3">
      <div className="mx-auto box-border w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center gap-2 text-[#6b5b6b]">
            <Loader2Icon className="h-5 w-5 animate-spin" />
            Loading insights...
          </div>
        ) : (
          <div className="overflow-hidden pb-1" ref={viewportRef}>
            <div className="flex touch-pan-y" style={{ gap: SLIDE_GAP_PX }}>
              <div
                className="min-w-0 shrink-0 grow-0"
                style={{ flex: `0 0 ${slideBasis}` }}
              >
                <HomeDistributionCarouselCard
                  title="Genre Distribution"
                  rows={genreRows}
                  barClass="from-pink-400 to-rose-500"
                  accentClass="bg-rose-100 text-rose-500"
                />
              </div>
              <div
                className="min-w-0 shrink-0 grow-0"
                style={{ flex: `0 0 ${slideBasis}` }}
              >
                <HomeDistributionCarouselCard
                  title="Author Distribution"
                  rows={authorRows}
                  barClass="from-violet-400 to-fuchsia-500"
                  accentClass="bg-violet-100 text-violet-500"
                />
              </div>
              <div
                className="min-w-0 shrink-0 grow-0"
                style={{ flex: `0 0 ${slideBasis}` }}
              >
                <HomeDistributionCarouselCard
                  title="Studio Distribution"
                  rows={studioRows}
                  barClass="from-sky-400 to-indigo-500"
                  accentClass="bg-sky-100 text-sky-600"
                />
              </div>
              <div
                className="min-w-0 shrink-0 grow-0"
                style={{ flex: `0 0 ${slideBasis}` }}
              >
                <HomeDistributionCarouselCard
                  title="Theme Distribution"
                  rows={themeRows}
                  barClass="from-amber-400 to-orange-500"
                  accentClass="bg-orange-100 text-orange-600"
                />
              </div>
              <div
                className="min-w-0 shrink-0 grow-0"
                style={{ flex: `0 0 ${slideBasis}` }}
              >
                <HomeRecentReviewsCarouselCard
                  items={recentReviewsQuery.data}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
