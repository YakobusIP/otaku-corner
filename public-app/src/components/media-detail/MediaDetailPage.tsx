"use client";

import { useMemo, useState } from "react";

import GeneralFooter from "@/components/GeneralFooter";
import SpoilerWarningModal from "@/components/SpoilerWarningModal";
import HomePublicNavbar from "@/components/home/HomePublicNavbar";
import HeroWallpaper from "@/components/layout/HeroWallpaper";
import MediaDetailSynopsisCard from "@/components/media-detail/MediaDetailSynopsisCard";
import MediaDetailTopSection from "@/components/media-detail/MediaDetailTopSection";
import SlideUpInView from "@/components/motion/SlideUpInView";
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  type MediaDetailClientConfig,
  type MediaDetailSpoilerState
} from "@/types/media-detail.type";

import { motion } from "framer-motion";
import { notFound } from "next/navigation";

const slidingTabHighlightTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34
};

const mediaDetailTabTriggerClassName =
  "relative z-10 inline-flex items-center gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-sm font-medium text-slate-600 shadow-none data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none";

type MediaDetailPageProps<
  TDetail,
  TPageState extends MediaDetailSpoilerState
> = {
  id: number;
  config: MediaDetailClientConfig<TDetail, TPageState>;
};

export default function MediaDetailPage<
  TDetail,
  TPageState extends MediaDetailSpoilerState
>({
  id,
  config
}: MediaDetailPageProps<TDetail, TPageState>) {
  const pageState = config.useDetailPage(id);
  const detail = config.selectDetail(pageState);
  const [activeTab, setActiveTab] = useState(config.defaultTab);

  const synopsis = useMemo(
    () => (detail ? config.selectSynopsis(detail) : ""),
    [config, detail]
  );

  const topContent = useMemo(
    () => (detail ? config.buildTopContent(detail, pageState) : null),
    [config, detail, pageState]
  );

  const scoresCard = useMemo(
    () => (detail ? config.renderScoresCard(detail) : null),
    [config, detail]
  );

  const detailTabs = useMemo(
    () => (detail ? config.buildTabs(detail, pageState) : []),
    [config, detail, pageState]
  );

  if (!detail || !topContent) {
    notFound();
  }

  return (
    <HeroWallpaper>
      <HomePublicNavbar />
      <div className="container mx-auto pb-24 sm:pb-28 md:pb-32 lg:pb-36">
        <div className="mb-10 mt-8 flex flex-col gap-6">
          <SlideUpInView>
            <MediaDetailTopSection
              content={topContent}
              scoresCard={scoresCard}
            />
          </SlideUpInView>

          <SlideUpInView>
            <MediaDetailSynopsisCard synopsis={synopsis} />
          </SlideUpInView>
        </div>

        <SlideUpInView className="mt-10" eager>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <Card className="rounded-2xl border border-white/50 bg-white/45 shadow-md shadow-rose-100/30 backdrop-blur-md">
              <CardHeader className="border-b border-white/50 pb-0">
                <TabsList className="relative inline-flex h-auto w-fit gap-8 rounded-none border-0 bg-transparent p-0">
                  {detailTabs.map(({ value, label, Icon }) => {
                    const isActive = activeTab === value;

                    return (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className={mediaDetailTabTriggerClassName}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId={config.tabHighlightLayoutId}
                            initial={false}
                            aria-hidden
                            className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-0.5 rounded-full bg-[#ff6b8b]"
                            transition={slidingTabHighlightTransition}
                          />
                        ) : null}
                        <Icon
                          className="relative z-10 size-4 shrink-0"
                          aria-hidden
                        />
                        <span className="relative z-10">{label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </CardHeader>

              {detailTabs.map(({ value, content }) => (
                <TabsContent key={value} value={value} className="mt-0">
                  {content}
                </TabsContent>
              ))}
            </Card>
          </Tabs>
        </SlideUpInView>
      </div>

      <GeneralFooter />
      <SpoilerWarningModal
        showSpoilerWarning={pageState.showSpoilerWarning}
        setShowSpoilerWarning={pageState.setShowSpoilerWarning}
        setSpoilersRevealed={pageState.setSpoilersRevealed}
      />
    </HeroWallpaper>
  );
}
