"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

import HomeDistributionCarouselCard from "@/components/home/HomeDistributionCarouselCard";
import HomeRecentReviewsCarouselCard from "@/components/home/HomeRecentReviewsCarouselCard";
import {
  DISTRIBUTION_INSIGHT_CARDS,
  type DistributionRow,
  mapTasteProfileRows
} from "@/components/home/home-insight-slides";
import SlideUpInView from "@/components/motion/SlideUpInView";

import { useHomeInsightsStatistics } from "@/hooks/useHomeStatistics";

import type { RecentReviewItem } from "@/types/statistic.type";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { Loader2Icon } from "lucide-react";

const SLIDE_GAP_PX = 16;
const WIDE_GRID_MEDIA = "(min-width: 1536px)";

type InsightSlideDeckProps = {
  authorRows: DistributionRow[];
  genreRows: DistributionRow[];
  recentItems: RecentReviewItem[];
  studioRows: DistributionRow[];
  themeRows: DistributionRow[];
  cellClassName?: string;
  slideWidthCss?: string;
};

const InsightSlideDeck = (props: InsightSlideDeckProps) => {
  const {
    authorRows,
    genreRows,
    recentItems,
    slideWidthCss,
    studioRows,
    themeRows,
    cellClassName = "min-w-0 shrink-0 grow-0"
  } = props;

  const distributionRowsByKey = {
    genres: genreRows,
    authors: authorRows,
    studios: studioRows,
    themes: themeRows
  };

  const slideStyle = slideWidthCss
    ? { flex: `0 0 ${slideWidthCss}` as const }
    : undefined;

  return (
    <Fragment>
      {DISTRIBUTION_INSIGHT_CARDS.map((card) => {
        return (
          <div key={card.title} className={cellClassName} style={slideStyle}>
            <HomeDistributionCarouselCard
              title={card.title}
              rows={distributionRowsByKey[card.tasteKey]}
              barClass={card.barClass}
            />
          </div>
        );
      })}
      <div className={cellClassName} style={slideStyle}>
        <HomeRecentReviewsCarouselCard items={recentItems} />
      </div>
    </Fragment>
  );
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

type HomeInsightsEmblaTrackProps = InsightSlideDeckProps & {
  slideWidthCss: string;
};

const HomeInsightsEmblaTrack = (props: HomeInsightsEmblaTrackProps) => {
  const { slideWidthCss, ...deckProps } = props;

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

  const gapStyle = {
    gap: SLIDE_GAP_PX,
    paddingLeft: SLIDE_GAP_PX,
    paddingRight: SLIDE_GAP_PX
  };

  return (
    <div className="overflow-hidden pb-1" ref={viewportRef}>
      <div className="flex touch-pan-y" style={gapStyle}>
        <InsightSlideDeck {...deckProps} slideWidthCss={slideWidthCss} />
      </div>
    </div>
  );
};

export default function HomeInsightsCarousel() {
  const { tasteProfileQuery, recentReviewsQuery } = useHomeInsightsStatistics();

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
    if (isWideGrid) {
      return;
    }
    const update = () => {
      setSlidesVisible(readSlidesVisible());
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isWideGrid]);

  const taste = tasteProfileQuery.data;

  const deckProps = useMemo(() => {
    return {
      authorRows: mapTasteProfileRows(taste?.authors),
      genreRows: mapTasteProfileRows(taste?.genres),
      studioRows: mapTasteProfileRows(taste?.studios),
      themeRows: mapTasteProfileRows(taste?.themes),
      recentItems: recentReviewsQuery.data ?? []
    };
  }, [taste, recentReviewsQuery.data]);

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

  return (
    <SlideUpInView
      as="section"
      className="relative z-20 bg-transparent pb-0 mt-8"
    >
      <div className="mx-auto box-border w-full max-w-[1540px] px-4 sm:px-8 lg:px-12">
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center gap-2 text-[#6b5b6b]">
            <Loader2Icon className="h-5 w-5 animate-spin" />
            Loading insights...
          </div>
        ) : isWideGrid ? (
          <div className="flex w-full" style={{ gap: SLIDE_GAP_PX }}>
            <InsightSlideDeck
              {...deckProps}
              cellClassName="min-w-0 flex-1 basis-0"
            />
          </div>
        ) : (
          <HomeInsightsEmblaTrack
            {...deckProps}
            slideWidthCss={slideWidthCss}
          />
        )}
      </div>
    </SlideUpInView>
  );
}
