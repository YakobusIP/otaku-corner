"use client";

import { useState } from "react";

import GeneralFooter from "@/components/GeneralFooter";
import SpoilerWarningModal from "@/components/SpoilerWarningModal";
import AnimeDetailReviewTab from "@/components/anime/AnimeDetailReviewTab";
import AnimeDetailScoresCard from "@/components/anime/AnimeDetailScoresCard";
import AnimeDetailSynopsisCard from "@/components/anime/AnimeDetailSynopsisCard";
import AnimeDetailTopSection from "@/components/anime/AnimeDetailTopSection";
import HomePublicNavbar from "@/components/home/HomePublicNavbar";
import HeroWallpaper from "@/components/layout/HeroWallpaper";
import SlideUpInView from "@/components/motion/SlideUpInView";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAnimeDetailPage } from "@/hooks/useAnimeDetailPage";

import { motion } from "framer-motion";
import { ListIcon, NotepadTextIcon } from "lucide-react";
import { notFound } from "next/navigation";

const slidingTabHighlightTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34
};

const animeDetailTabTriggerClassName =
  "relative z-10 inline-flex items-center gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-sm font-medium text-slate-600 shadow-none data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none";

type Props = {
  id: number;
};

export default function AnimeDetail({ id }: Props) {
  const {
    animeDetail,
    embedURL,
    showSpoilerWarning,
    setShowSpoilerWarning,
    spoilersRevealed,
    setSpoilersRevealed,
    handleRevealSpoilers
  } = useAnimeDetailPage(id);
  const [activeTab, setActiveTab] = useState("episodes");

  if (!animeDetail) {
    notFound();
  }

  const reviewObject = animeDetail.review;

  const detailTabs = [
    {
      value: "episodes",
      label: `Episodes (${animeDetail.episodesCount})`,
      Icon: ListIcon
    },
    {
      value: "review",
      label: "My Review",
      Icon: NotepadTextIcon
    }
  ] as const;

  return (
    <HeroWallpaper>
      <HomePublicNavbar />
      <div className="container mx-auto pb-24 sm:pb-28 md:pb-32 lg:pb-36">
        <div className="mb-10 mt-8 flex flex-col gap-6">
          <SlideUpInView className="hidden lg:block">
            <AnimeDetailTopSection
              animeDetail={animeDetail}
              embedUrl={embedURL}
              showScoresInGrid
            />
          </SlideUpInView>

          <SlideUpInView className="lg:hidden">
            <AnimeDetailTopSection
              animeDetail={animeDetail}
              embedUrl={embedURL}
            />
          </SlideUpInView>

          <SlideUpInView className="lg:hidden">
            <AnimeDetailScoresCard animeDetail={animeDetail} />
          </SlideUpInView>

          <SlideUpInView>
            <AnimeDetailSynopsisCard synopsis={animeDetail.synopsis} />
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
                        className={animeDetailTabTriggerClassName}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="anime-detail-tab-highlight"
                            initial={false}
                            aria-hidden
                            className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-0.5 rounded-full bg-[#ff6b8b]"
                            transition={slidingTabHighlightTransition}
                          />
                        ) : null}
                        <Icon className="relative z-10 size-4 shrink-0" aria-hidden />
                        <span className="relative z-10">{label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </CardHeader>

              <TabsContent value="episodes" className="mt-0">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {animeDetail.episodes.map((episode) => {
                      return (
                        <div
                          key={episode.id}
                          className="rounded-lg border border-white/40 bg-white/30 p-4 backdrop-blur-sm transition-colors hover:bg-white/40"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="w-8 rounded bg-white/40 px-2 py-1 text-center font-mono text-sm text-slate-700">
                                {episode.number.toString().padStart(2, "0")}
                              </span>
                              <div>
                                <h3 className="font-medium text-slate-800">
                                  {episode.title}
                                </h3>

                                <div className="flex flex-col gap-2 text-sm text-slate-600 lg:flex-row lg:gap-4">
                                  {episode.titleRomaji && (
                                    <span>
                                      {episode.titleRomaji}{" "}
                                      {episode.titleJapanese &&
                                        `(${episode.titleJapanese})`}
                                    </span>
                                  )}
                                  <span>{episode.aired}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="review" className="mt-0">
                <AnimeDetailReviewTab
                  review={reviewObject}
                  spoilersRevealed={spoilersRevealed}
                  onRevealSpoilers={handleRevealSpoilers}
                />
              </TabsContent>
            </Card>
          </Tabs>
        </SlideUpInView>
      </div>

      <GeneralFooter />
      <SpoilerWarningModal
        showSpoilerWarning={showSpoilerWarning}
        setShowSpoilerWarning={setShowSpoilerWarning}
        setSpoilersRevealed={setSpoilersRevealed}
      />
    </HeroWallpaper>
  );
}
