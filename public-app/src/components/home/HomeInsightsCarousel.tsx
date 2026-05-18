"use client";

import { useEffect, useMemo, useState } from "react";

import HomeDistributionCarouselCard from "@/components/home/HomeDistributionCarouselCard";
import HomeRecentReviewsCarouselCard from "@/components/home/HomeRecentReviewsCarouselCard";

import { useHomeStatistics } from "@/hooks/useHomeStatistics";

import type { RecentReviewItem } from "@/types/statistic.type";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { Loader2Icon } from "lucide-react";

const SLIDE_GAP_PX = 16;
const WIDE_GRID_MEDIA = "(min-width: 1536px)";

type DistributionRow = {
  label: string;
  count: number;
  percentage: number;
};

type InsightsSlidesProps = {
  authorRows: DistributionRow[];
  genreRows: DistributionRow[];
  recentItems: RecentReviewItem[] | undefined;
  studioRows: DistributionRow[];
  themeRows: DistributionRow[];
};

const readSlidesVisible = () => {
  if (typeof window === "undefined") {
    return 3;
  }
  if (window.matchMedia("(min-width: 1024px)").matches) {
    return 4;
  }
  if (window.matchMedia("(min-width: 640px)").matches) {
    return 2;
  }
  return 1;
};

type HomeInsightsEmblaTrackProps = InsightsSlidesProps & {
  slideWidthCss: string;
};

const HomeInsightsEmblaTrack = (props: HomeInsightsEmblaTrackProps) => {
  const {
    authorRows,
    genreRows,
    recentItems,
    slideWidthCss,
    studioRows,
    themeRows
  } = props;

  const autoplayPlugin = useMemo(() => {
    return Autoplay({ delay: 5000, stopOnInteraction: false });
  }, []);

  const [viewportRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
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
  }, [emblaApi, slideWidthCss]);

  const gapStyle = { gap: SLIDE_GAP_PX, paddingLeft: SLIDE_GAP_PX, paddingRight: SLIDE_GAP_PX };

  return (
    <div className="overflow-hidden pb-1" ref={viewportRef}>
      <div className="flex touch-pan-y" style={gapStyle}>
        <div
          className="min-w-0 shrink-0 grow-0"
          style={{ flex: `0 0 ${slideWidthCss}` }}
        >
          <HomeDistributionCarouselCard
            title="Genre Distribution"
            rows={genreRows}
            barClass="from-pink-400 to-rose-500"
          />
        </div>
        <div
          className="min-w-0 shrink-0 grow-0"
          style={{ flex: `0 0 ${slideWidthCss}` }}
        >
          <HomeDistributionCarouselCard
            title="Author Distribution"
            rows={authorRows}
            barClass="from-violet-400 to-fuchsia-500"
          />
        </div>
        <div
          className="min-w-0 shrink-0 grow-0"
          style={{ flex: `0 0 ${slideWidthCss}` }}
        >
          <HomeDistributionCarouselCard
            title="Studio Distribution"
            rows={studioRows}
            barClass="from-sky-400 to-indigo-500"
          />
        </div>
        <div
          className="min-w-0 shrink-0 grow-0"
          style={{ flex: `0 0 ${slideWidthCss}` }}
        >
          <HomeDistributionCarouselCard
            title="Theme Distribution"
            rows={themeRows}
            barClass="from-amber-400 to-orange-500"
          />
        </div>
        <div
          className="min-w-0 shrink-0 grow-0"
          style={{ flex: `0 0 ${slideWidthCss}` }}
        >
          <HomeRecentReviewsCarouselCard items={recentItems} />
        </div>
      </div>
    </div>
  );
};

const HomeInsightsWideGrid = (props: InsightsSlidesProps) => {
  const {
    authorRows,
    genreRows,
    recentItems,
    studioRows,
    themeRows
  } = props;

  const cellClass = "min-w-0 flex-1 basis-0";

  const gapStyle = { gap: SLIDE_GAP_PX };

  return (
    <div className="flex w-full" style={gapStyle}>
      <div className={cellClass}>
        <HomeDistributionCarouselCard
          title="Genre Distribution"
          rows={genreRows}
          barClass="from-pink-400 to-rose-500"
        />
      </div>
      <div className={cellClass}>
        <HomeDistributionCarouselCard
          title="Author Distribution"
          rows={authorRows}
          barClass="from-violet-400 to-fuchsia-500"
        />
      </div>
      <div className={cellClass}>
        <HomeDistributionCarouselCard
          title="Studio Distribution"
          rows={studioRows}
          barClass="from-sky-400 to-indigo-500"
        />
      </div>
      <div className={cellClass}>
        <HomeDistributionCarouselCard
          title="Theme Distribution"
          rows={themeRows}
          barClass="from-amber-400 to-orange-500"
        />
      </div>
      <div className={cellClass}>
        <HomeRecentReviewsCarouselCard items={recentItems} />
      </div>
    </div>
  );
};

export default function HomeInsightsCarousel() {
  const { tasteProfileQuery, recentReviewsQuery } = useHomeStatistics();

  const [isWideGrid, setIsWideGrid] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(WIDE_GRID_MEDIA);
    const updateWide = () => {
      setIsWideGrid(mediaQueryList.matches);
    };
    updateWide();
    mediaQueryList.addEventListener("change", updateWide);
    return () => mediaQueryList.removeEventListener("change", updateWide);
  }, []);

  const [slidesVisible, setSlidesVisible] = useState(3);

  useEffect(() => {
    const update = () => {
      setSlidesVisible(readSlidesVisible());
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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

  const slideWidthCss = useMemo(() => {
    if (slidesVisible >= 3) {
      return "min(32vw, 360px)";
    }
    if (slidesVisible === 2) {
      return "min(42vw, 380px)";
    }
    return "min(70vw, 340px)";
  }, [slidesVisible]);

  const isLoading = tasteProfileQuery.isLoading || recentReviewsQuery.isLoading;

  const slideProps: InsightsSlidesProps = {
    authorRows,
    genreRows,
    recentItems: recentReviewsQuery.data,
    studioRows,
    themeRows
  };

  return (
    <section className="relative z-20 bg-transparent pb-0 pt-2 lg:pt-3">
      <div className="mx-auto box-border w-full max-w-[1540px] px-4 sm:px-8 lg:px-12">
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center gap-2 text-[#6b5b6b]">
            <Loader2Icon className="h-5 w-5 animate-spin" />
            Loading insights...
          </div>
        ) : isWideGrid ? (
          <HomeInsightsWideGrid {...slideProps} />
        ) : (
          <HomeInsightsEmblaTrack {...slideProps} slideWidthCss={slideWidthCss} />
        )}
      </div>
    </section>
  );
}
